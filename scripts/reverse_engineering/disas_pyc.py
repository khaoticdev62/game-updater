import xdis.load
import dis
import sys

def disassemble_pyc(pyc_path):
    try:
        res = xdis.load.load_module(pyc_path)
        print(f"Returned {len(res)} values: {res[:3]} ...")
        code = res[3]
        dis.dis(code)
    except Exception as e:
        print(f"Failed to disassemble: {e}")

if __name__ == "__main__":
    disassemble_pyc(sys.argv[1])
