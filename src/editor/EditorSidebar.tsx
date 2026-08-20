"use client";

import { useEditor } from "./EditorContext";
import { useRef } from "react";
import { BRANCHES } from "@/data/branches";

export function EditorSidebar() {
  const { 
    isEditMode, config, updateConfig, saveConfig, 
    saveStatus, hasUnsavedChanges, resetConfig, importConfig, selectedId 
  } = useEditor();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isEditMode) return null;

  // For Phase 1, we focus on Map Editor. If selectedId starts with "marker-", it's a map marker.
  const isMarkerSelected = selectedId?.startsWith("marker-");
  const markerId = isMarkerSelected ? parseInt(selectedId!.split("-")[1], 10) : null;
  const markerConfig = markerId ? config.branches?.[markerId]?.mapPosition : null;
  const markerAppearance = markerId ? config.branches?.[markerId]?.appearance : null;
  const originalBranch = markerId ? BRANCHES.find(b => b.id === markerId) : null;

  return (
    <div
      className="fixed top-0 right-0 h-[100dvh] w-full max-w-[340px] z-[99999] flex flex-col font-sans text-[13px] shadow-2xl"
      style={{
        background: "#111111",
        borderLeft: "1px solid #2A2A2A",
        color: "#EEEEEE",
      }}
    >
      {/* Header */}
      <div className="flex flex-col p-4 border-b border-[#2A2A2A] bg-[#111111] z-10">
        <div className="flex items-center justify-between">
          <div className="font-semibold tracking-wide flex items-center gap-2 text-sm text-white">
            Design Inspector
            {hasUnsavedChanges && (
              <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" title="Unsaved changes"></span>
            )}
          </div>
        </div>
        
        {/* Status Text (Toast-like) */}
        <div className="text-[11px] h-4 mt-1 font-medium">
          {saveStatus === "success" && <span className="text-green-400">Successfully saved to source</span>}
          {saveStatus === "error" && <span className="text-red-400">Failed to save (check console)</span>}
          {saveStatus === "saving" && <span className="text-blue-400 animate-pulse">Saving changes...</span>}
          {saveStatus === "idle" && hasUnsavedChanges && <span className="text-amber-400">Unsaved changes pending</span>}
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-8 custom-scrollbar">
        {!isMarkerSelected && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-60">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-sm">Select a map marker on the canvas to inspect and edit its properties.</p>
          </div>
        )}

        {isMarkerSelected && markerId && (
          <>
            {/* Marker Information Section */}
            <section className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Marker Info</h3>
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-md p-3 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">ID</span>
                  <span className="font-mono text-gray-200">{markerId}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-400">Name</span>
                  <span className="text-gray-200 truncate ml-4" title={originalBranch?.name}>{originalBranch?.name || "Unknown"}</span>
                </div>
              </div>
            </section>

            {/* Position Section */}
            <section className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Position</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-gray-400 flex justify-between">
                    <span>X (Left)</span>
                    <span className="opacity-50">%</span>
                  </label>
                  <input
                    type="number"
                    value={markerConfig?.x?.toFixed(2) ?? ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (isNaN(val)) return;
                      updateConfig((prev) => ({
                        ...prev,
                        branches: {
                          ...(prev.branches || {}),
                          [markerId]: {
                            ...(prev.branches?.[markerId] || {}),
                            mapPosition: { x: val, y: prev.branches?.[markerId]?.mapPosition?.y ?? 50 },
                          },
                        },
                      }));
                    }}
                    className="bg-[#1A1A1A] border border-[#2A2A2A] rounded px-2.5 py-1.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 w-full transition-all text-white font-mono text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-gray-400 flex justify-between">
                    <span>Y (Top)</span>
                    <span className="opacity-50">%</span>
                  </label>
                  <input
                    type="number"
                    value={markerConfig?.y?.toFixed(2) ?? ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (isNaN(val)) return;
                      updateConfig((prev) => ({
                        ...prev,
                        branches: {
                          ...(prev.branches || {}),
                          [markerId]: {
                            ...(prev.branches?.[markerId] || {}),
                            mapPosition: { x: prev.branches?.[markerId]?.mapPosition?.x ?? 50, y: val },
                          },
                        },
                      }));
                    }}
                    className="bg-[#1A1A1A] border border-[#2A2A2A] rounded px-2.5 py-1.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 w-full transition-all text-white font-mono text-xs"
                  />
                </div>
              </div>
            </section>

            {/* Appearance Section */}
            <section className="flex flex-col gap-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Appearance (Overrides)</h3>
              
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-gray-400">Marker Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={markerAppearance?.color ?? "#DF2028"}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateConfig((prev) => ({
                          ...prev,
                          branches: {
                            ...(prev.branches || {}),
                            [markerId]: {
                              ...(prev.branches?.[markerId] || {}),
                              appearance: { ...(prev.branches?.[markerId]?.appearance || {}), color: val },
                            },
                          },
                        }));
                      }}
                      className="w-8 h-8 rounded cursor-pointer bg-[#1A1A1A] border border-[#2A2A2A] p-0.5"
                    />
                    <input
                      type="text"
                      value={markerAppearance?.color ?? ""}
                      placeholder="#DF2028 (Default)"
                      onChange={(e) => {
                        const val = e.target.value;
                        updateConfig((prev) => ({
                          ...prev,
                          branches: {
                            ...(prev.branches || {}),
                            [markerId]: {
                              ...(prev.branches?.[markerId] || {}),
                              appearance: { ...(prev.branches?.[markerId]?.appearance || {}), color: val },
                            },
                          },
                        }));
                      }}
                      className="flex-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded px-2.5 py-1.5 outline-none focus:border-blue-500 text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] text-gray-400 flex justify-between">
                    <span>Base Size</span>
                    <span className="opacity-50">px</span>
                  </label>
                  <input
                    type="number"
                    value={markerAppearance?.size ?? ""}
                    placeholder="11 (Default)"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      updateConfig((prev) => ({
                        ...prev,
                        branches: {
                          ...(prev.branches || {}),
                          [markerId]: {
                            ...(prev.branches?.[markerId] || {}),
                            appearance: { ...(prev.branches?.[markerId]?.appearance || {}), size: isNaN(val) ? undefined : val },
                          },
                        },
                      }));
                    }}
                    className="bg-[#1A1A1A] border border-[#2A2A2A] rounded px-2.5 py-1.5 outline-none focus:border-blue-500 text-white font-mono text-xs w-full"
                  />
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Sticky Footer / Actions */}
      <div className="p-4 border-t border-[#2A2A2A] bg-[#111111] z-10 flex flex-col gap-3 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
        {/* Main Save Action */}
        <button
          onClick={saveConfig}
          disabled={!hasUnsavedChanges || saveStatus === "saving"}
          className={`w-full py-2.5 rounded font-semibold transition-all flex items-center justify-center gap-2 ${
            hasUnsavedChanges && saveStatus !== "saving"
              ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
              : "bg-[#222222] text-gray-500 cursor-not-allowed"
          }`}
        >
          {saveStatus === "saving" ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <button 
            onClick={() => {
              const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "design-config.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="w-full py-1.5 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] rounded text-[11px] font-medium transition-colors text-gray-300"
          >
            Export
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-1.5 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] rounded text-[11px] font-medium transition-colors text-gray-300"
          >
            Import
          </button>
        </div>
        
        {hasUnsavedChanges && (
          <button 
            onClick={resetConfig}
            className="w-full py-1.5 mt-1 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 text-red-400 rounded text-[11px] font-medium transition-colors"
          >
            Discard Unsaved Changes
          </button>
        )}
        
        <input 
          type="file" 
          accept="application/json" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
              if (ev.target?.result) importConfig(ev.target.result as string);
            };
            reader.readAsText(file);
            e.target.value = ""; // Reset so same file can be imported again
          }}
        />
      </div>
    </div>
  );
}
