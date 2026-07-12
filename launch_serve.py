"""Detached subprocess launcher for serve.py."""
import subprocess
import sys
from pathlib import Path

DETACHED_PROCESS = 0x00000008
CREATE_NEW_PROCESS_GROUP = 0x00000200

log_path = Path(__file__).parent / "serve.log"
log = open(log_path, "wb")

subprocess.Popen(
    [sys.executable, "serve.py"],
    cwd=str(Path(__file__).parent),
    stdout=log,
    stderr=log,
    stdin=subprocess.DEVNULL,
    creationflags=DETACHED_PROCESS | CREATE_NEW_PROCESS_GROUP,
    close_fds=True,
)

log.close()
print("[OK] launched serve.py on port 8766")