import json
import sys
import os
import re
import pandas as pd
import pyreadstat
from typing import Dict, List, Any, Optional, Tuple

class SASReader:
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.df = None
        self.meta = None
        self.column_names = []
        self.column_labels = {}
        self.column_formats = {}
        self.variable_types = {}

    def load_file(self):
        """Load SAS file and metadata"""
        try:
            self.df, self.meta = pyreadstat.read_sas7bdat(self.file_path)
            self.column_names = list(self.df.columns)

            # Extract metadata
            if self.meta:
                self.column_labels = self.meta.column_names_to_labels or {}
                self.column_formats = self.meta.original_variable_types or {}
                # Create variable types mapping
                for col in self.df.columns:
                    if self.df[col].dtype == 'object':
                        self.variable_types[col] = 'character'
                    else:
                        self.variable_types[col] = 'numeric'

            return True
        except Exception as e:
            return f"Error loading file: {str(e)}"

    def get_metadata(self) -> Dict[str, Any]:
        """Get dataset metadata"""
        if self.df is None:
            return {"error": "File not loaded"}

        variables = []
        for col in self.column_names:
            # Get column info from DataFrame
            col_dtype = self.df[col].dtype
            col_length = None

            # Calculate length for string columns
            if col_dtype == 'object':
                max_len = self.df[col].astype(str).str.len().max()
                col_length = int(max_len) if pd.notna(max_len) else None

            var_info = {
                "name": col,
                "type": self.variable_types.get(col, "unknown"),
                "label": self.column_labels.get(col, ""),
                "format": self.column_formats.get(col, ""),
                "length": col_length,
                "dtype": str(col_dtype)  # pandas dtype info
            }
            variables.append(var_info)

        # Get dataset label if available
        dataset_label = None
        if self.meta:
            # Check various possible metadata attributes for dataset label
            possible_attrs = ['table_name', 'file_label', 'name', 'label']
            for attr in possible_attrs:
                if hasattr(self.meta, attr):
                    label_value = getattr(self.meta, attr, '')
                    if label_value and label_value.strip():
                        dataset_label = label_value.strip()
                        break

            # If no specific label found, use filename without extension as fallback
            if not dataset_label:
                import os
                filename_base = os.path.splitext(os.path.basename(self.file_path))[0]
                dataset_label = f"Dataset: {filename_base}"

        return {
            "total_rows": len(self.df),
            "total_variables": len(self.column_names),
            "variables": variables,
            "file_path": self.file_path,
            "dataset_label": dataset_label
        }

    def parse_where_condition(self, where_clause: str) -> Optional[pd.Series]:
        """Parse and apply WHERE condition to dataframe"""
        if not where_clause or not where_clause.strip():
            return None

        try:
            # Clean up the where clause
            where_clause = where_clause.strip()

            # Replace SAS operators with pandas equivalents
            # Handle basic operators
            where_clause = re.sub(r'\bEQ\b', '==', where_clause, flags=re.IGNORECASE)
            where_clause = re.sub(r'\bNE\b', '!=', where_clause, flags=re.IGNORECASE)
            where_clause = re.sub(r'\bGT\b', '>', where_clause, flags=re.IGNORECASE)
            where_clause = re.sub(r'\bLT\b', '<', where_clause, flags=re.IGNORECASE)
            where_clause = re.sub(r'\bGE\b', '>=', where_clause, flags=re.IGNORECASE)
            where_clause = re.sub(r'\bLE\b', '<=', where_clause, flags=re.IGNORECASE)
            where_clause = re.sub(r'\bAND\b', '&', where_clause, flags=re.IGNORECASE)
            where_clause = re.sub(r'\bOR\b', '|', where_clause, flags=re.IGNORECASE)

            # Handle string comparisons - wrap column references
            # This is a simplified approach - in production you'd want more robust parsing
            for col in self.column_names:
                # Replace column names with df['column_name'] references
                pattern = r'\b' + re.escape(col) + r'\b'
                where_clause = re.sub(pattern, f"df['{col}']", where_clause)

            # Evaluate the condition
            condition = eval(where_clause)
            return condition

        except Exception as e:
            raise ValueError(f"Invalid WHERE clause: {str(e)}")

    def get_data(self, start_row: int = 0, num_rows: int = 100,
                 selected_vars: List[str] = None, where_clause: str = None) -> Dict[str, Any]:
        """Get data with pagination, variable selection, and filtering"""
        if self.df is None:
            return {"error": "File not loaded"}

        try:
            # Start with original dataframe
            working_df = self.df.copy()

            # Apply WHERE condition if provided
            filtered_rows = len(working_df)
            if where_clause:
                condition = self.parse_where_condition(where_clause)
                if condition is not None:
                    working_df = working_df[condition]
                    filtered_rows = len(working_df)

            # Select variables if specified
            if selected_vars:
                # Filter out any variables that don't exist
                valid_vars = [var for var in selected_vars if var in working_df.columns]
                if valid_vars:
                    working_df = working_df[valid_vars]

            # Apply pagination
            end_row = min(start_row + num_rows, len(working_df))
            page_df = working_df.iloc[start_row:end_row]

            # Convert to JSON-serializable format
            data = []
            for _, row in page_df.iterrows():
                row_data = {}
                for col in page_df.columns:
                    value = row[col]
                    # Handle NaN and other special values
                    if pd.isna(value):
                        row_data[col] = None
                    elif isinstance(value, (pd.Timestamp, pd.Period)):
                        row_data[col] = str(value)
                    elif hasattr(value, 'isoformat'):  # datetime, date, time objects
                        row_data[col] = value.isoformat()
                    elif isinstance(value, bytes):
                        row_data[col] = value.decode('utf-8', errors='ignore')
                    else:
                        # Convert to standard Python types for JSON serialization
                        if hasattr(value, 'item'):  # numpy types
                            row_data[col] = value.item()
                        else:
                            row_data[col] = value
                data.append(row_data)

            return {
                "data": data,
                "total_rows": len(self.df),
                "filtered_rows": filtered_rows,
                "start_row": start_row,
                "returned_rows": len(data),
                "columns": list(page_df.columns)
            }

        except Exception as e:
            return {"error": f"Error retrieving data: {str(e)}"}

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No command provided"}))
        return

    command = sys.argv[1]

    try:
        if command == "load":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "File path required"}))
                return

            file_path = sys.argv[2]
            reader = SASReader(file_path)
            result = reader.load_file()

            if result is True:
                metadata = reader.get_metadata()
                print(json.dumps({"success": True, "metadata": metadata}))
            else:
                print(json.dumps({"error": result}))

        elif command == "data":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "File path required"}))
                return

            file_path = sys.argv[2]
            start_row = int(sys.argv[3]) if len(sys.argv) > 3 else 0
            num_rows = int(sys.argv[4]) if len(sys.argv) > 4 else 100
            selected_vars = sys.argv[5].split(',') if len(sys.argv) > 5 and sys.argv[5] else None
            where_clause = sys.argv[6] if len(sys.argv) > 6 else None

            reader = SASReader(file_path)
            load_result = reader.load_file()

            if load_result is not True:
                print(json.dumps({"error": load_result}))
                return

            data_result = reader.get_data(start_row, num_rows, selected_vars, where_clause)
            print(json.dumps(data_result))

        elif command == "metadata":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "File path required"}))
                return

            file_path = sys.argv[2]
            reader = SASReader(file_path)
            load_result = reader.load_file()

            if load_result is not True:
                print(json.dumps({"error": load_result}))
                return

            metadata = reader.get_metadata()
            print(json.dumps(metadata))

        else:
            print(json.dumps({"error": f"Unknown command: {command}"}))

    except Exception as e:
        print(json.dumps({"error": f"Unexpected error: {str(e)}"}))

if __name__ == "__main__":
    main()