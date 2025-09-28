# SAS Dataset Viewer for VS Code

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![VS Code](https://img.shields.io/badge/VS%20Code-^1.74.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A powerful VS Code extension for viewing and analyzing SAS7BDAT dataset files directly in your editor. Features TypeScript-first architecture with 600x performance improvement and enhanced filtering capabilities. No SAS installation required!

## ✨ Features

### 📊 **Dataset Viewing**

- Open and view SAS7BDAT files directly in VS Code
- Professional tabular display with pagination
- Support for large datasets (tested with 12,000+ rows)
- Real-time data loading with visual feedback

### 🔍 **Advanced Filtering**

- **WHERE Clause Filtering**: Use SAS-style WHERE conditions
  - Case-insensitive variable names
  - Support for operators: `=`, `>`, `<`, `>=`, `<=`, `!=`
  - Logical operators: `AND`, `OR`, `&`, `|`
  - Example: `AGE > 30 AND COUNTRY = 'USA'`

### 📝 **Variable Management**

- **KEEP/DROP Variables**: Quick variable selection by typing
  - KEEP: Specify variables to include (comma-separated)
  - DROP: Specify variables to exclude (comma-separated)
- **Checkbox Selection**: Click to select/deselect individual variables
- **Select All/Clear All**: Quick selection buttons
- **Display Modes**: Show variable names, labels, or both

### 🎯 **Smart Features**

- **Unique Values Extraction**: Get unique values for categorical variables with counts
- **Multi-column Unique**: NODUPKEY equivalent for multiple variables
- **Enhanced WHERE Filtering**:
  - Case-insensitive string comparisons
  - Compound conditions with AND/OR
  - SAS-style operators (EQ, NE, GT, LT, GE, LE)

### 🎨 **Modern UI Design**

- **Clean Interface**: Streamlined layout with no redundant information
- **Dataset Metadata Modal**: Quick access to dataset information
- **Variable Metadata Modal**: Detailed variable properties in a popup
- **Three-Column Control Layout**: Organized controls for filtering, unique values, and display options
- **Variable Icons**: Visual indicators for data types
  - 📝 Character variables
  - 🔢 Numeric variables
  - 📅 Date variables
  - 🕐 DateTime variables
  - 💰 Currency variables
  - 📊 Percentage variables

### 🚀 **Performance**

- **600-700x faster** than v1.0 with TypeScript-first architecture
- Native TypeScript reader using js-stream-sas7bdat library
- Metadata extraction in ~1ms (vs 730ms in v1.0)
- Data reading in <1ms (vs 605ms in v1.0)
- Smart caching for filtered results
- Automatic Python fallback for edge cases
- Optimized pagination (50, 100, 200, 500 rows per page)
- Professional logging system with debug mode

## 📋 Requirements

### VS Code Requirements

- VS Code version 1.74.0 or higher
- Node.js runtime (included with VS Code)

### Optional Python Fallback

- Python 3.x installed and accessible as `py` command (optional)
- Required Python packages for fallback mode:

  ```bash
  pip install pandas pyreadstat
  ```

> **Note**: Version 2.0.0 uses a native TypeScript reader by default. Python is only required as a fallback for edge cases.

## 🎮 Usage

### Opening SAS Datasets

1. **File Explorer**: Simply click on any `.sas7bdat` file
2. **Command Palette**: Use `SAS: Open SAS Dataset` command
3. **File Menu**: File → Open → Select .sas7bdat file

### Filtering Data

1. **WHERE Clause**: Enter conditions in the WHERE input box

   ```sql
   AGE > 30 AND GENDER = 'M'
   VISITNUM >= 5 OR COUNTRY = 'USA'
   ```

2. **KEEP Variables**: Type variable names to keep

   ```
   USUBJID, AGE, WEIGHT, HEIGHT
   ```

3. **DROP Variables**: Type variable names to exclude

   ```
   DESC_LONG, NOTE, CHAR_MIXED
   ```

### Keyboard Shortcuts

- `Enter` in WHERE field: Apply filter
- `Enter` in KEEP/DROP fields: Apply selection
- Click variable checkboxes: Toggle selection

## ⚙️ Extension Settings

This extension contributes the following settings:

- `sasDatasetViewer.enableDebugLogging`: Enable debug logging output (default: false)

## 📊 Commands

This extension contributes the following commands:

- `SAS: Open SAS Dataset`: Open a SAS dataset file
- `SAS Dataset Viewer: Show Output`: Display the output channel for debugging

## 🐛 Known Issues

- Virtual scrolling mode has limitations with very large datasets (use pagination mode)
- Some complex WHERE clauses may require specific formatting

## 📝 Release Notes

### 2.0.1 (Current)

- **UI Redesign**: Cleaner interface with improved layout
  - Removed redundant dataset name displays
  - Added Dataset Metadata button for on-demand information
  - Organized controls into three equal sections
  - Streamlined filter info display
- **Major Performance Upgrade**: 600-700x faster with TypeScript-first architecture
- **Enhanced WHERE Filtering**: Case-insensitive comparisons, better AND/OR support
- **New Feature**: Unique values extraction for categorical variables
- **New Feature**: Multi-column unique combinations (NODUPKEY equivalent)
- **Improved Architecture**: TypeScript reader with automatic Python fallback
- **Better Logging**: Show output command for debugging (`SAS Dataset Viewer: Show Output`)

### 1.0.0

- Initial release
- Full dataset viewing and filtering capabilities
- KEEP/DROP variable selection
- Professional logging system
- Comprehensive WHERE clause support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Uses [pyreadstat](https://github.com/Roche/pyreadstat) for reading SAS files
- Built with the VS Code Extension API

---

**Enjoy viewing your SAS datasets in VS Code!** 🎉
