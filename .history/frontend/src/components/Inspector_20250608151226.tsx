"use client";

import React from 'react';

export function Inspector() {
  return (
    <div className="h-full p-4 bg-muted/40 border-l">
      <h3 className="text-lg font-semibold mb-4">Properties</h3>
      <div className="text-sm text-muted-foreground">
        Select a node to view and edit its properties.
      </div>
    </div>
  );
} 