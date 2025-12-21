# Sims 4 Updater Research

## Manifest Format (Inferred)
The manifest is a JSON file with the following structure:
- `news`: Latest updates/news messages.
- `links`: Key-value pairs of DLC/Update identifiers to download URLs.
- `patch`: Contains the patching logic.
    - `files`: List of files to be updated.
    - `version`: Target version.
    - `version_from`: Source version (for deltas).
    - `MD5_to`: Target file MD5 hash.
    - `MD5_from`: Source file MD5 hash (for deltas).
- Types of patches: `full`, `delta`, `crack`, `languages`, `optional`, `deleted`.

## Network Endpoints
- **Info Manifest:** `https://gist.githubusercontent.com/anadius/b6c97f1adfa05b656469eda79a6487d8/raw/master.json`
- **Secondary Manifest:** `https://rentry.org/BcXS8ldD5RE1Bj9WslN31a_YWrjw1B01KRJruvkQrhL-nl6i_P-yzvKxUMsqN8sFDyGbCJm91BLKG4Y5KitprRyXuf0Fcr5wMUtF/raw`
- **Download Hosts:** Uses `mediafire.com` and others, often mediated via `get_download_url` logic which handles Cloudflare and redirects.

## Technology Used in Original Tool
- **Downloader:** `aria2c`
- **Patcher:** `xdelta3`
- **Verification:** `MD5`
- **UI:** Python with `tkinter` (observed `pyi_rth__tkinter` and `gui` directory).
- **Communication:** `curl_cffi` for impersonating browsers to bypass protection.
