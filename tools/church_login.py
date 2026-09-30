#!/usr/bin/env python3
"""Create / reset church logins on the live One Day Offering site.

Talks to the site's admin API (/api/admin/*), authenticated with ADMIN_SECRET.
Reads ADMIN_SECRET and SITE_URL from .env (SITE_URL defaults to production).

Usage:
  python3 tools/church_login.py list
      Show every campaign: slug, church, owner login.

  python3 tools/church_login.py create <login> <slug> [<slug> ...] [--password PW]
      Create the login (or reset its password) and give it edit access to the
      listed campaign slugs. Prints the credentials. A strong password is
      generated when --password is omitted.
"""
import argparse
import json
import os
import secrets
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_env():
    env = {}
    path = os.path.join(ROOT, ".env")
    if os.path.exists(path):
        for line in open(path):
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    env.update({k: v for k, v in os.environ.items() if k in ("ADMIN_SECRET", "SITE_URL")})
    if not env.get("ADMIN_SECRET"):
        sys.exit("ADMIN_SECRET missing from .env")
    env.setdefault("SITE_URL", "https://www.onedayoffering.com")
    return env


def call(env, method, path, body=None):
    req = urllib.request.Request(
        env["SITE_URL"].rstrip("/") + path,
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"x-admin-secret": env["ADMIN_SECRET"], "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as res:
            return json.load(res)
    except urllib.error.HTTPError as e:
        sys.exit(f"{method} {path} failed: HTTP {e.code} {e.read().decode()[:300]}")


def generate_password():
    # Readable: no 0/O/1/l/I. ~71 bits of entropy.
    alphabet = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "-".join("".join(secrets.choice(alphabet) for _ in range(4)) for _ in range(3))


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="cmd", required=True)
    sub.add_parser("list")
    create = sub.add_parser("create")
    create.add_argument("login", help="email or username the church signs in with")
    create.add_argument("slugs", nargs="*", help="campaign slugs this login can edit")
    create.add_argument("--password")
    args = parser.parse_args()
    env = load_env()

    if args.cmd == "list":
        rows = call(env, "GET", "/api/admin/campaigns")
        for c in sorted(rows, key=lambda c: c["createdAt"]):
            print(f'{c["slug"]:50} {c["orgName"][:32]:32} owner={c["ownerId"] or "-":28} '
                  f'logo={c["logoKB"]}KB created={c["createdAt"][:10]}')
        print(f"{len(rows)} campaigns")
        return

    password = args.password or generate_password()
    result = call(env, "POST", "/api/admin/accounts",
                  {"id": args.login, "password": password, "slugs": args.slugs})
    print(f'Login:    {result["id"]}')
    print(f"Password: {password}")
    print(f'Sign in:  {env["SITE_URL"].rstrip("/")}/login')
    if result["assigned"]:
        print("Can edit: " + ", ".join(result["assigned"]))
    if result["missing"]:
        print("NOT FOUND (check slug): " + ", ".join(result["missing"]))


if __name__ == "__main__":
    main()
