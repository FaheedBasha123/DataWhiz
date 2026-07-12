"""Detached local HTTP server for DataWhiz (multi-threaded)."""
import http.server
import socketserver
import os
from pathlib import Path

PORT = 8766
DIR = Path(__file__).parent


class ThreadedServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(DIR), **kw)

    def log_message(self, *a, **kw):
        pass


os.chdir(DIR)
with ThreadedServer(("", PORT), Handler) as httpd:
    print(f"[OK] serving {DIR} at http://localhost:{PORT}")
    httpd.serve_forever()