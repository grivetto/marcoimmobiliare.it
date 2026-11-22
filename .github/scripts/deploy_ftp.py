#!/usr/bin/env python3
"""
Automated FTP publisher for marcoimmobiliare.it (TB-Hosting /www/).
Uploads changed static site files on push (or full site on workflow_dispatch/fallback),
verifies exact byte sizes via FTP SIZE, and runs live HTTPS health checks.
"""

import ftplib
import os
import subprocess
import sys
import urllib.request

SKIP_ROOT_FILES = {
    "Dockerfile",
    ".dockerignore",
    "nginx.conf",
    "metadata.json",
    "README.md",
    "LICENSE",
}


def is_publishable(rel_path: str) -> bool:
    norm = rel_path.replace("\\", "/").lstrip("./")
    parts = norm.split("/")
    if not parts or any(p.startswith(".") for p in parts):
        return False
    if parts[0] in {".git", ".github"}:
        return False
    if norm in SKIP_ROOT_FILES or parts[-1] in SKIP_ROOT_FILES:
        return False
    return os.path.isfile(norm)


def collect_all_publishable() -> list[str]:
    out = []
    for dirpath, dirnames, filenames in os.walk("."):
        dirnames[:] = sorted(d for d in dirnames if not d.startswith("."))
        for fn in sorted(filenames):
            if fn.startswith("."):
                continue
            rel = os.path.relpath(os.path.join(dirpath, fn), ".").replace("\\", "/")
            if is_publishable(rel):
                out.append(rel)
    return out


def commit_exists(sha: str) -> bool:
    if not sha or set(sha) == {"0"}:
        return False
    res = subprocess.run(
        ["git", "cat-file", "-e", f"{sha}^{{commit}}"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return res.returncode == 0


def collect_changed_publishable(before_sha: str, current_sha: str) -> list[str]:
    res = subprocess.run(
        ["git", "diff", "--name-only", "--diff-filter=ACMR", before_sha, current_sha],
        capture_output=True,
        text=True,
        check=True,
    )
    changed = [line.strip() for line in res.stdout.splitlines() if line.strip()]
    return sorted(p for p in changed if is_publishable(p))


def connect_ftp(host: str, user: str, password: str) -> ftplib.FTP:
    ftp = ftplib.FTP(timeout=60)
    ftp.connect(host, 21)
    ftp.login(user, password)
    ftp.set_pasv(True)
    ftp.voidcmd("TYPE I")
    return ftp


def ensure_remote_dir(ftp: ftplib.FTP, remote_dir: str) -> None:
    parts = [p for p in remote_dir.split("/") if p]
    cur = ""
    for part in parts:
        cur += "/" + part
        try:
            ftp.mkd(cur)
        except ftplib.error_perm:
            pass


def main() -> int:
    host = os.environ["FTP_SERVER"]
    user = os.environ["FTP_USERNAME"]
    password = os.environ["FTP_PASSWORD"]
    remote_root = os.environ.get("REMOTE_ROOT", "/www").rstrip("/")
    before_sha = os.environ.get("BEFORE_SHA", "").strip()
    current_sha = os.environ.get("CURRENT_SHA", "HEAD").strip() or "HEAD"
    full_sync = os.environ.get("FULL_SYNC", "false").lower() == "true"

    if full_sync or not commit_exists(before_sha):
        print("Mode: FULL_SYNC (uploading all publishable site files)")
        targets = collect_all_publishable()
    else:
        print(f"Mode: INCREMENTAL ({before_sha[:8]}..{current_sha[:8]})")
        targets = collect_changed_publishable(before_sha, current_sha)

    if not targets:
        print("No publishable static files changed in this commit. Skipping FTP transfer.")
    else:
        print(f"Publishing {len(targets)} file(s) to {host}:{remote_root}/ ...")
        ftp = connect_ftp(host, user, password)
        created_dirs: set[str] = set()

        for idx, rel in enumerate(targets, 1):
            remote_path = f"{remote_root}/{rel}"
            remote_dir = os.path.dirname(remote_path)
            if remote_dir not in created_dirs:
                ensure_remote_dir(ftp, remote_dir)
                created_dirs.add(remote_dir)

            local_size = os.path.getsize(rel)
            uploaded = False
            last_err = None
            for attempt in range(1, 4):
                try:
                    with open(rel, "rb") as fp:
                        ftp.storbinary(f"STOR {remote_path}", fp, blocksize=65536)
                    remote_size = ftp.size(remote_path)
                    if remote_size != local_size:
                        raise RuntimeError(
                            f"Byte-size mismatch for {rel}: local={local_size} remote={remote_size}"
                        )
                    print(f"  [{idx}/{len(targets)}] {rel} ({remote_size} B) OK")
                    uploaded = True
                    break
                except Exception as exc:
                    last_err = exc
                    print(f"  Retry {attempt}/3 for {rel}: {exc}")
                    try:
                        ftp.quit()
                    except Exception:
                        pass
                    ftp = connect_ftp(host, user, password)
                    ensure_remote_dir(ftp, remote_dir)

            if not uploaded:
                raise RuntimeError(f"Failed to upload {rel}: {last_err}")

        ftp.quit()

    for url in ("https://www.marcoimmobiliare.it/", "https://www.marcoimmobiliare.it/v2/"):
        req = urllib.request.Request(url, headers={"User-Agent": "marcoimmobiliare-ci/1.0"})
        with urllib.request.urlopen(req, timeout=20) as resp:
            print(f"Post-deploy check: HTTP {resp.status} -> {url}")
            if resp.status != 200:
                raise RuntimeError(f"Unexpected HTTP {resp.status} for {url}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
