# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

### Python Setup
```bash
py -m pip install -r python/requirements.txt
```

### TypeScript Compilation
```bash
# Full Node.js path required on Windows
"C:\nodejs\node-v22.19.0-win-x64\node.exe" node_modules/typescript/lib/tsc.js -p .

# Or use npm script (may require Node.js in PATH)
npm run compile
npm run watch
```

### Testing
```bash
# Test Python backend
py python/sas_reader.py load "path/to/test.sas7bdat"
py test_python.py

# VS Code Extension Testing
# Use F5 in VS Code to launch Extension Development Host
```

## Architecture Overview

This is a **VS Code extension for viewing SAS7BDAT datasets** using a hybrid TypeScript/Python architecture:

### Core Components

**1. VS Code Extension Layer (TypeScript)**
- `src/extension.ts` - Extension entry point, registers custom editor for `.sas7bdat` files
- `src/SasDataProvider.ts` - Custom editor provider, manages document lifecycle and Python subprocess communication
- `src/WebviewPanel.ts` - Webview management, handles UI rendering and user interactions
- `src/types.ts` - TypeScript interfaces for data structures

**2. Python Backend (`python/sas_reader.py`)**
- Handles SAS file reading using `pyreadstat` library
- Provides CLI interface with commands: `load`, `data`, `metadata`
- Supports pagination, variable selection, and WHERE clause filtering
- Returns JSON responses for frontend consumption

**3. Frontend (Embedded in WebviewPanel.ts)**
- Single HTML page with embedded CSS/JavaScript
- No separate webview files - everything is generated as template literals
- Implements virtual scrolling, variable selection, and filtering UI

### Data Flow

1. **File Opening**: VS Code detects `.sas7bdat` extension → triggers custom editor
2. **Metadata Loading**: `SASDatasetDocument` spawns Python process to load file metadata
3. **UI Rendering**: `SASWebviewPanel` generates HTML with embedded data and creates webview
4. **User Interactions**: All filtering/selection happens client-side for performance
5. **Data Refresh**: New Python subprocess calls only when filters/selections change

### Key Technical Details

**Python Communication**: Uses `spawn('py', args)` to execute Python commands, with full file paths and JSON response parsing.

**Client-Side Processing**: WHERE clause filtering and virtual scrolling implemented in JavaScript to avoid constant Python calls for better performance.

**SAS Compatibility**: Supports SAS-style operators (`EQ`, `NE`, `AND`, `OR`) and case-insensitive variable names.

**UI Layout**: Header with controls (top-right), sidebar with variable selection (left), main data table (right) with sticky headers.

## Windows-Specific Notes

- Python command is `py` (not `python`)
- Node.js requires full path: `"C:\nodejs\node-v22.19.0-win-x64\node.exe"`
- Use `.cmd` extensions for npm scripts in some cases

## Extension Development

The extension uses VS Code's Custom Editor API with `vscode.CustomReadonlyEditorProvider`. Each `.sas7bdat` file creates a `SASDatasetDocument` that manages the Python backend connection and a `SASWebviewPanel` that handles the UI.

Variable display supports three modes: name only, label only, or both (affects both sidebar and table headers).

All data operations (filtering, column selection) maintain state in the webview JavaScript and trigger Python calls only when necessary for new data.