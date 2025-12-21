import xdis.load
import sys

def dump_consts(code_obj, indent=0):
    if hasattr(code_obj, 'co_consts'):
        for i, const in enumerate(code_obj.co_consts):
            print("  " * indent + f"Const[{i}]: {const} ({type(const)})")
            if str(type(const)) == "<class 'code'>" or hasattr(const, 'co_consts'):
                dump_consts(const, indent + 1)

def main(pyc_path):
    try:
        res = xdis.load.load_module(pyc_path)
        code = res[3]
        dump_consts(code)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main(sys.argv[1])
