# AI Agent Implementation Notes

This document provides a quick reference to the locations of key features in the frontend application for easier maintenance and future development by AI agents.

## Core Feature: React Flow

The main flowchart functionality is implemented using React Flow.

- **Main Canvas Component**: `frontend/src/components/Flowchart.tsx`
  - This component wraps the React Flow instance and handles overall layout and providers.
  - It defines the `nodeTypes` and `edgeTypes` used in the application.

- **State Management**: `frontend/src/hooks/useFlowStore.ts`
  - A Zustand store that manages the state of nodes, edges, and other flow-related configurations like the active edge type.

- **Main Page Layout**: `frontend/src/app/page.tsx`
  - This is the main entry point page that renders the `Sidebar` and the `Flowchart` components.

## UI Components

- **Sidebar**: `frontend/src/components/Sidebar.tsx`
  - Contains the draggable node shapes palette and the edge type selection radio group.
  - Handles drag-and-drop initiation for creating new nodes.

- **Custom Nodes**: `frontend/src/components/nodes/`
  - `RectangleNode.tsx`
  - `DiamondNode.tsx`
  - `ParallelogramNode.tsx`
  - `StartEndNode.tsx`
  - Each file defines a specific shape for the flowchart.

- **Custom Edges**: `frontend/src/components/edges/`
  - `DashedEdge.tsx`: A custom edge component for a dashed line without an arrowhead.

## Project Documentation

- **README.md**: `README.md`
  - Contains a user-facing description of the different edge types available. 