#!/usr/bin/env bash
# Build the site and publish dist/ to the gh-pages branch, which GitHub Pages
# serves at www.palashawasthi.com. Pages rebuilds automatically on push.
#
#   bun run deploy
#
# (Source lives on main; only build output goes to gh-pages.)
set -euo pipefail

cd "$(dirname "$0")/.."
REPO_URL="https://github.com/PalashAwasthi05/PalashAwasthi.git"
BUN="${BUN:-$(command -v bun || echo "$HOME/Library/Application Support/reflex/bun/bin/bun")}"

echo "→ building"
"$BUN" --bun run build

# dist/ must carry .nojekyll (so Pages doesn't strip _astro/) and CNAME (custom
# domain). Both come from public/ — fail loudly rather than deploy a broken site.
for required in .nojekyll CNAME index.html; do
  if [ ! -e "dist/$required" ]; then
    echo "✗ dist/$required is missing — aborting deploy" >&2
    exit 1
  fi
done

SHA="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cp -R dist/. "$TMP"/
cd "$TMP"
git init -q
git config user.name "$(cd - >/dev/null && git config user.name || echo 'Palash Awasthi')"
git config user.email "$(cd - >/dev/null && git config user.email || echo 'palash@reflex.dev')"
git checkout -q -b gh-pages
git add -A
git commit -q -m "Deploy site — built from main@${SHA}"

echo "→ pushing gh-pages"
git push -f -q "$REPO_URL" gh-pages

echo "✓ deployed. Pages will rebuild in ~a minute: https://www.palashawasthi.com/"
