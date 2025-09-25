# SAS Dataset Viewer - VS Code Extension

A VS Code extension for viewing and filtering SAS7BDAT dataset files with an interactive interface.

## Features

- **Open SAS7BDAT files** directly in VS Code with a custom editor
- **View data** with virtual scrolling for performance (loads 100 rows at a time)
- **Variable selection** - select/deselect columns, reorder variables, search by name
- **WHERE clause filtering** - use SAS-style WHERE conditions to filter data
- **Metadata display** - view variable types, labels, formats, and dataset statistics
- **Read-only viewing** - secure viewing without data modification

## Prerequisites

1. **Python 3.7+** with pip
2. **Node.js** (for development only)
3. **VS Code 1.74.0+**

## Installation

### 1. Install Python Dependencies

```bash
cd C:\Python\SAS_EXT
py -m pip install -r python/requirements.txt
```

This installs:
- `pyreadstat` - for reading SAS7BDAT files
- `pandas` - for data manipulation
- `numpy` - for numerical operations

### 2. Build the Extension

```bash
# Install Node.js dependencies
npm install

# Compile TypeScript
npm run compile
```

### 3. Install in VS Code

1. Open VS Code
2. Press `Ctrl+Shift+P` to open command palette
3. Type "Extensions: Install from VSIX"
4. Navigate to the extension folder and select the .vsix file (if packaged)
5. Or use "Developer: Reload Window" if developing

## Usage

### Opening SAS Files

1. **Right-click** on a `.sas7bdat` file in VS Code Explorer
2. Select **"Open With" > "SAS Dataset Viewer"**

Or:

1. Press `Ctrl+Shift+P`
2. Type "SAS: Open Dataset" and select the command
3. Choose your `.sas7bdat` file

### Interface Overview

The extension opens with three main areas:

#### 1. Header Controls
- **File information** - displays filename and dataset statistics
- **WHERE clause input** - enter SAS-style filtering conditions

#### 2. Sidebar (Left Panel)
- **Variable list** with checkboxes for selection
- **Variable search** to filter the variable list
- **Select All/Deselect All** buttons
- **Drag and drop** variables to reorder columns
- **Metadata panel** showing dataset information

#### 3. Data View (Right Panel)
- **Data table** with virtual scrolling
- **Row information** showing current view status
- **Loading indicator** for data operations

### Filtering Data

#### WHERE Clause Examples

```sas
age > 30
gender = 'M'
age > 18 AND income < 50000
status IN ('Active', 'Pending')
name LIKE '%Smith%'
```

**Supported operators:**
- Comparison: `=`, `!=`, `>`, `<`, `>=`, `<=`, `NE`, `EQ`, `GT`, `LT`, `GE`, `LE`
- Logical: `AND`, `OR`
- String operations: `LIKE`, `IN`

#### Variable Selection
- **Check/uncheck** variables in the sidebar to show/hide columns
- **Drag variables** up/down to reorder columns
- **Search variables** using the search box
- Use **Select All/Deselect All** for bulk operations

### Performance Notes

- Data loads **100 rows at a time** for optimal performance
- **Virtual scrolling** automatically loads more data as you scroll
- **Large datasets** are handled efficiently with pagination
- **Filtering and variable selection** trigger new data requests

## Development

### Project Structure

```
SAS_EXT/
├── src/                    # TypeScript source code
│   ├── extension.ts        # Main extension entry point
│   ├── SasDataProvider.ts  # Data provider and document handling
│   ├── WebviewPanel.ts     # Webview management and messaging
│   └── types.ts           # TypeScript type definitions
├── webview/               # Webview HTML/CSS/JS
│   ├── index.html         # (Generated) HTML template
│   ├── styles.css         # Webview styling
│   └── script.js          # Frontend JavaScript
├── python/                # Python backend
│   ├── sas_reader.py      # SAS file reading and processing
│   └── requirements.txt   # Python dependencies
├── out/                   # Compiled JavaScript output
└── package.json           # Extension manifest
```

### Building

```bash
# Install dependencies
npm install
py -m pip install -r python/requirements.txt

# Compile TypeScript
npm run compile

# Or watch for changes
npm run watch
```

### Testing

```bash
# Test Python backend
py test_python.py

# Test in VS Code
F5 (in VS Code) to launch Extension Development Host
```

## Troubleshooting

### Python Issues
- Ensure Python is in your system PATH
- Verify all dependencies are installed: `py -m pip list`
- Check Python version: `py --version` (3.7+ required)

### Extension Issues
- Reload VS Code window: `Ctrl+Shift+P` > "Developer: Reload Window"
- Check VS Code developer console: `Help` > `Toggle Developer Tools`
- Verify compiled files exist in `out/` directory

### Data Loading Issues
- Check file permissions on the .sas7bdat file
- Verify the file isn't corrupted
- Large files may take longer to load initially

## Known Limitations

1. **Read-only** - no data editing capabilities
2. **WHERE clause parsing** is simplified (complex expressions may not work)
3. **Large string values** may be truncated in display
4. **Date/time formatting** uses default Python string representation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Submit a pull request

## License

MIT License - see LICENSE file for details.