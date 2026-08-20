"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export type DesignConfig = {
  branches?: Record<number, {
    mapPosition?: { x: number; y: number };
    appearance?: {
      color?: string;
      size?: number;
      glow?: number;
      opacity?: number;
    };
  }>;
};

type EditorContextType = {
  isEditMode: boolean;
  setIsEditMode: (v: boolean) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  config: DesignConfig;
  updateConfig: (updater: (prev: DesignConfig) => DesignConfig) => void;
  saveConfig: () => Promise<void>;
  resetConfig: () => void;
  importConfig: (jsonString: string) => void;
  hasUnsavedChanges: boolean;
  saveStatus: "idle" | "saving" | "success" | "error";
};

const EditorContext = createContext<EditorContextType | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [config, setConfig] = useState<DesignConfig>({});
  const [lastSavedConfig, setLastSavedConfig] = useState<DesignConfig>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load config on mount
  useEffect(() => {
    // Check localStorage for any unsaved changes that didn't make it to source yet
    const local = localStorage.getItem("design_editor_config");
    let initialConfig = {};
    if (local) {
      try {
        initialConfig = JSON.parse(local);
      } catch (e) {}
    }
    
    // We intentionally do NOT load from design-config.json anymore.
    // The source code (branches.ts) is the single source of truth now.
    // If there is no local storage override, the config is empty, 
    // causing components to use their default source values.
    setConfig(initialConfig);
    setLastSavedConfig({}); // Start fresh so it knows there's unsaved changes if local storage differs from source
    setIsLoaded(true);
  }, []);

  const hasUnsavedChanges = isLoaded && JSON.stringify(config) !== JSON.stringify(lastSavedConfig);

  // Warn on unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Listen for activation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "e") {
        setIsEditMode((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Check URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get("edit") === "true") {
      setIsEditMode(true);
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const saveConfig = useCallback(async () => {
    setSaveStatus("saving");
    try {
      // 1. Save directly to source code (branches.ts)
      const res = await fetch("/api/save-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      
      if (!res.ok && res.status !== 403) throw new Error("API Save Failed");
      
      // 2. Clear local storage because source is now the truth
      if (res.ok) {
        localStorage.removeItem("design_editor_config");
        // We can optionally clear the config context to force reading from source again, 
        // but keeping it ensures the UI doesn't flicker before Next.js HMR reloads the page.
      } else {
        // Fallback: save to LocalStorage if we are in production and can't write to source
        localStorage.setItem("design_editor_config", JSON.stringify(config));
      }
      
      setLastSavedConfig(config);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error("Failed to save config", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 4000);
    }
  }, [config]);

  const resetConfig = useCallback(() => {
    setConfig(lastSavedConfig);
  }, [lastSavedConfig]);

  const importConfig = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      setConfig(parsed);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error("Invalid JSON import", err);
      setSaveStatus("error");
    }
  }, []);

  const updateConfig = useCallback((updater: (prev: DesignConfig) => DesignConfig) => {
    setConfig((prev) => updater(prev));
  }, []);

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <EditorContext.Provider
      value={{
        isEditMode,
        setIsEditMode,
        selectedId,
        setSelectedId,
        config,
        updateConfig,
        saveConfig,
        resetConfig,
        importConfig,
        hasUnsavedChanges,
        saveStatus,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within EditorProvider");
  return ctx;
}
