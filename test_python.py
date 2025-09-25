import sys
import os
import json

# Add the python directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'python'))

from sas_reader import SASReader

# Create a simple test to verify the Python backend works
def test_sas_reader():
    print("Testing SAS Reader Module...")

    # Test basic import and class creation
    try:
        reader = SASReader("dummy_path.sas7bdat")
        print("[OK] SASReader class created successfully")
    except Exception as e:
        print(f"[FAIL] Failed to create SASReader: {e}")
        return False

    # Test that required methods exist
    required_methods = ['load_file', 'get_metadata', 'get_data', 'parse_where_condition']
    for method in required_methods:
        if hasattr(reader, method):
            print(f"[OK] Method '{method}' exists")
        else:
            print(f"[FAIL] Method '{method}' missing")
            return False

    print("[OK] All basic tests passed!")
    return True

if __name__ == "__main__":
    success = test_sas_reader()
    sys.exit(0 if success else 1)