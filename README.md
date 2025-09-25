# SAS Dataset Viewer - VS Code Extension

A powerful VS Code extension for viewing and analyzing SAS7BDAT dataset files with an interactive, paginated interface.

## ✨ Features

### 📊 **Data Viewing**
- **Paginated display** - Navigate through large datasets with 50/100/200/500 rows per page
- **Professional interface** - Clean, responsive design with sidebar and main content area
- **Dataset information** - Shows dataset label, row count, and variable statistics

### 🔍 **Advanced Filtering**
- **WHERE clause filtering** - Use SAS-style conditions to filter the complete dataset
- **Real-time filtering** - Apply filters to all rows, then paginate the filtered results
- **Filter status** - Shows current filter and matching row count

### 📋 **Variable Management**
- **Variable selection** - Choose which columns to display using checkboxes
- **Display modes** - Toggle between variable names, labels, or both
- **Rich tooltips** - Hover over variables to see detailed metadata
- **Variable types** - Visual indicators for character (C) and numeric (N) variables
- **Smart icons** - Different icons for text 📝, numbers 🔢, dates 📅, currency 💰

### 🎯 **User Experience**
- **Reliable performance** - Handles datasets with thousands of rows efficiently
- **Intuitive navigation** - First/Previous/Next/Last buttons plus direct page input
- **Responsive design** - Works well with different screen sizes
- **Error handling** - Clear error messages and graceful failure handling

## 🚀 Quick Start

### Prerequisites
- **Python 3.7+** with pip
- **VS Code 1.74.0+**
- **Node.js** (for development only)

### Installation

1. **Install Python dependencies:**
   ```bash
   cd C:\Python\SAS_EXT
   py -m pip install pandas pyreadstat
   ```

2. **Build the extension:**
   ```bash
   npm install
   npm run compile
   ```

3. **Launch in VS Code:**
   - Press `F5` to open Extension Development Host
   - Or install as VSIX package

## 📖 Usage Guide

### Opening SAS Files

**Method 1 - File Explorer:**
1. Right-click on a `.sas7bdat` file in VS Code Explorer
2. Select **"Open With" → "SAS Dataset Viewer"**

**Method 2 - Command Palette:**
1. Press `Ctrl+Shift+P`
2. Type "SAS: Open Dataset"
3. Select your `.sas7bdat` file

### Interface Overview

#### 🏠 **Header Section**
- **Dataset info**: Filename, total rows, variable count
- **Current view**: Shows which rows are currently displayed

#### 📋 **Left Sidebar**
- **Dataset label**: Shows the dataset title (e.g., "BIG TEST DATASET")
- **Variable list**: All variables with checkboxes for selection
- **Display mode**: Toggle between Names/Labels/Both
- **Selection controls**: Select All and Clear All buttons
- **Variable details**: Hover for tooltips with metadata

#### 📊 **Main Content Area**
- **WHERE filter**: Enter SAS-style filter conditions
- **Data table**: Shows selected variables for current page
- **Pagination controls**: Navigate through pages of data

### Filtering Examples

#### WHERE Clause Syntax
```sas
# Numeric comparisons
AGE > 30
INCOME >= 50000
VISITNUM = 1

# String comparisons  
COUNTRY = 'USA'
STATUS = 'Active'

# Combined conditions
AGE > 30 AND COUNTRY = 'USA'
INCOME < 50000 OR STATUS = 'Student'
```

#### Workflow
1. **Enter filter**: Type `AGE > 30` in the WHERE field
2. **Apply filter**: Click "Apply Filter" button
3. **View results**: See "Filter: AGE > 30 (X,XXX rows match)"
4. **Navigate**: Use pagination to browse filtered results
5. **Clear filter**: Click "Clear" to return to full dataset

### Variable Selection

#### Selecting Columns
1. **Individual selection**: Check/uncheck variables in sidebar
2. **Bulk operations**: Use "Select All" or "Clear All" buttons
3. **Display modes**: 
   - **Names**: Shows variable names (e.g., "USUBJID")
   - **Labels**: Shows descriptive labels (e.g., "Unique Subject Identifier")  
   - **Both**: Shows both (e.g., "USUBJID (Unique Subject Identifier)")

#### Variable Information
- **Hover tooltips**: Detailed metadata including type, format, length
- **Type indicators**: C (Character) or N (Numeric) badges
- **Format icons**: 💰 Currency, 📅 Dates, 📊 Percentages, etc.

## 🛠️ Technical Details

### Architecture
- **Frontend**: TypeScript + HTML/CSS webview interface
- **Backend**: Python with pandas and pyreadstat for SAS file processing
- **Communication**: VS Code webview messaging API

### Performance
- **Pagination**: Loads only 100 rows at a time by default
- **Efficient filtering**: WHERE clauses applied at the pandas level
- **Smart caching**: Reduces redundant data requests
- **Memory management**: Handles large datasets without memory issues

### File Support
- **Format**: SAS7BDAT files (SAS version 7 and later)
- **Size**: Tested with datasets up to 12,000+ rows
- **Variables**: Supports both character and numeric variables
- **Metadata**: Preserves variable labels, formats, and types

## 🔧 Development

### Project Structure
```
SAS_EXT/
├── src/                      # TypeScript source
│   ├── extension.ts          # Extension entry point
│   ├── SasDataProvider.ts    # SAS file document provider
│   ├── WebviewPanel.ts       # Main webview management
│   ├── PaginationWebview.ts  # Pagination interface (current)
│   ├── VirtualScrollingWebview*.ts # Legacy virtual scrolling
│   └── types.ts              # Type definitions
├── python/                   # Python backend
│   └── sas_reader.py         # SAS file processing
├── out/                      # Compiled JavaScript
└── package.json              # Extension manifest
```

### Building
```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes during development
npm run watch
```

### Testing
```bash
# Test Python backend
py test_python.py

# Test with sample data
# Use files in C:\sas\Test_Ext\*.sas7bdat

# Launch extension development
# Press F5 in VS Code
```

## 🐛 Troubleshooting

### Common Issues

**"Python not found" error:**
- Ensure Python is installed and in system PATH
- Try using full Python path: `C:\Python39\python.exe`

**"Module not found" error:**
- Install required packages: `py -m pip install pandas pyreadstat`
- Check virtual environment if using one

**"File not loading" error:**
- Verify file permissions on .sas7bdat file
- Check file isn't corrupted or locked by another application
- Try with a smaller test file first

**Interface not responding:**
- Reload VS Code window: `Ctrl+Shift+P` → "Developer: Reload Window"
- Check Developer Tools console for JavaScript errors
- Verify all TypeScript files compiled successfully

### Performance Tips

**For large datasets:**
- Use WHERE filters to reduce data before viewing
- Select only needed variables to improve loading speed
- Use smaller page sizes (50 rows) for faster navigation

**For complex filters:**
- Test simple conditions first (e.g., `AGE > 30`)
- Use parentheses for complex logic: `(AGE > 30) AND (STATUS = 'Active')`
- Check variable names match exactly (case sensitive)

## 📝 Version History

### v0.2.0 (Current)
- ✅ **Pagination interface** - Reliable page-by-page navigation
- ✅ **Enhanced filtering** - Robust WHERE clause parsing
- ✅ **Variable selection** - Interactive column choosing
- ✅ **Rich tooltips** - Comprehensive variable metadata
- ✅ **Professional UI** - Sidebar layout with controls
- ✅ **Performance improvements** - Handles large datasets efficiently

### v0.1.0 (Legacy)
- Virtual scrolling interface (deprecated due to reliability issues)
- Basic data viewing and filtering

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add comprehensive error handling
- Test with various SAS file formats
- Update documentation for new features

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **pyreadstat** library for SAS file reading capabilities
- **pandas** for efficient data manipulation
- **VS Code Extension API** for the development framework

---

**Happy data exploring! 📊✨**