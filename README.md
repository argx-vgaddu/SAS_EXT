# SAS Dataset Viewer for VS Code

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![VS Code](https://img.shields.io/badge/VS%20Code-^1.74.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A powerful VS Code extension for viewing and analyzing SAS7BDAT dataset files directly in your editor. No SAS installation required!

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
- **Metadata View**: See all variable details in a popup
- **Variable Icons**: Visual indicators for data types
  - 📝 Character variables
  - \# Numeric variables
  - 📅 Date variables
  - 🕐 DateTime variables
  - 💰 Currency variables
  - % Percentage variables

### 🚀 **Performance**
- Optimized pagination (50, 100, 200, 500 rows per page)
- Efficient Python backend using pandas and pyreadstat
- Smart data caching for smooth navigation
- Professional logging system with debug mode

## 📋 Requirements

### Python Requirements
- Python 3.x installed and accessible as `py` command
- Required Python packages:
  ```bash
  pip install pandas pyreadstat
  ```

### VS Code Requirements
- VS Code version 1.74.0 or higher

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

* `sasDatasetViewer.enableDebugLogging`: Enable debug logging output (default: false)

## 🐛 Known Issues

- Virtual scrolling mode has limitations with very large datasets (use pagination mode)
- Some complex WHERE clauses may require specific formatting

## 📝 Release Notes

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