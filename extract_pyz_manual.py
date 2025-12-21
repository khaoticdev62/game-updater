import zlib
import marshal
import os
import sys
import struct

try:
    import xdis.marshal as xmarshal
except ImportError:
    xmarshal = marshal

def extract_pyz(pyz_path, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    with open(pyz_path, 'rb') as f:
        pyz_magic = f.read(4)
        if pyz_magic != b'PYZ\0':
            print(f"Not a PYZ archive, found {pyz_magic}")
            return
        
        py_magic = f.read(4)
        print(f"Python magic: {py_magic}")
        
        (toc_position, ) = struct.unpack('!i', f.read(4))
        f.seek(toc_position, os.SEEK_SET)
        
        try:
            toc = xmarshal.load(f)
        except Exception as e:
            print(f"Failed to load TOC: {e}")
            return
            
        print(f"Found {len(toc)} files in PYZ archive")
        
        if isinstance(toc, list):
            toc = dict(toc)

        for name in toc:
            is_pkg, offset, length = toc[name]
            f.seek(offset)
            compressed_data = f.read(length)
            try:
                data = zlib.decompress(compressed_data)
            except Exception as e:
                print(f"Failed to decompress {name}: {e}")
                continue
            
            if isinstance(name, bytes):
                name = name.decode('utf-8')
            
            file_name = name.replace('.', os.sep)
            if is_pkg:
                file_path = os.path.join(output_dir, file_name, '__init__.pyc')
            else:
                file_path = os.path.join(output_dir, file_name + '.pyc')
                
            file_dir = os.path.dirname(file_path)
            if not os.path.exists(file_dir):
                os.makedirs(file_dir)
                
            with open(file_path, 'wb') as out:
                out.write(py_magic)
                out.write(b'\0' * 12)
                out.write(data)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: extract_pyz_manual.py <pyz_path> <output_dir>")
    else:
        extract_pyz(sys.argv[1], sys.argv[2])