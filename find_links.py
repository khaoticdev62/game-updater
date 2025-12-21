import xdis.load
import sys

def find_strings(code_obj):
    strings = []
    if hasattr(code_obj, 'co_consts'):
        for const in code_obj.co_consts:
            if isinstance(const, str):
                strings.append(const)
            elif str(type(const)) == "<class 'code'>" or hasattr(const, 'co_consts'):
                strings.extend(find_strings(const))
    return strings

def main(pyc_path):
    try:
        res = xdis.load.load_module(pyc_path)
        code = res[3]
        all_strings = find_strings(code)
        print(f"Total strings found: {len(all_strings)}")
        for s in all_strings:
            print(s)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main(sys.argv[1])