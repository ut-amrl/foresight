#!/usr/bin/env python3
"""Local preview server for the project page.

`python3 -m http.server` ignores the Range header, so every <video> with
preload="metadata" ends up streaming its whole file instead of just the moov
header. Four such downloads saturate the browser's per-origin connection limit
and the figures below them stall for tens of seconds -- a problem that does not
exist on GitHub Pages. This server answers ranged requests the way a real host
does, so local previews reflect production timing.

Usage:
    python3 serve.py [port]
"""

import mimetypes
import os
import re
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

mimetypes.add_type("image/webp", ".webp")
mimetypes.add_type("video/mp4", ".mp4")

ROOT = os.path.dirname(os.path.abspath(__file__))


class RangeHandler(SimpleHTTPRequestHandler):
    # Keep-alive matters too: HTTP/1.0 forces a new connection per asset.
    protocol_version = "HTTP/1.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        # Always serve the file on disk, so edits show up on reload.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            path = os.path.join(path, "index.html")
        if not os.path.isfile(path):
            self.send_error(404, "Not found")
            return None

        size = os.path.getsize(path)
        ctype = self.guess_type(path)
        rng = self.headers.get("Range")
        f = open(path, "rb")

        if not rng:
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(size))
            self.send_header("Accept-Ranges", "bytes")
            self.end_headers()
            return f

        match = re.match(r"bytes=(\d*)-(\d*)\s*$", rng)
        if not match:
            f.close()
            self.send_error(400, "Malformed Range header")
            return None

        start, end = match.group(1), match.group(2)
        if start:
            start = int(start)
            end = int(end) if end else size - 1
        else:
            # A suffix range ("bytes=-500") asks for the final N bytes.
            start, end = max(0, size - int(end)), size - 1
        end = min(end, size - 1)

        if start > end or start >= size:
            f.close()
            self.send_response(416)
            self.send_header("Content-Range", f"bytes */{size}")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return None

        f.seek(start)
        self.send_response(206)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(end - start + 1))
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()
        return _Slice(f, end - start + 1)

    def handle_one_request(self):
        # Media elements abort requests routinely; that is not worth a traceback.
        try:
            super().handle_one_request()
        except (BrokenPipeError, ConnectionResetError):
            self.close_connection = True

    def log_message(self, fmt, *args):
        sys.stderr.write("%s %s\n" % (self.log_date_time_string(), fmt % args))


class _Slice:
    """Read-only view of the first `remaining` bytes, for 206 responses."""

    def __init__(self, f, remaining):
        self.f = f
        self.remaining = remaining

    def read(self, n=-1):
        if self.remaining <= 0:
            return b""
        if n < 0 or n > self.remaining:
            n = self.remaining
        chunk = self.f.read(n)
        self.remaining -= len(chunk)
        return chunk

    def close(self):
        self.f.close()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    server = ThreadingHTTPServer(("127.0.0.1", port), RangeHandler)
    server.daemon_threads = True
    print(f"Serving {ROOT} at http://localhost:{port} (Ctrl-C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
        server.server_close()


if __name__ == "__main__":
    main()
