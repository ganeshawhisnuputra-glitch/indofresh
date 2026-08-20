"use client";

import { ReactNode } from "react";
import { EditorProvider } from "./EditorContext";
import { EditorSidebar } from "./EditorSidebar";

export function EditorShell({ children }: { children: ReactNode }) {
  return (
    <EditorProvider>
      {children}
      <EditorSidebar />
    </EditorProvider>
  );
}
