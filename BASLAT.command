#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd -P)"
cd "$ROOT"
if ! command -v node >/dev/null 2>&1 || ! command -v npx >/dev/null 2>&1; then
  echo "Node.js / npx bulunamadı. Önce Node.js LTS kurulumu gerekli."; exit 1
fi
printf '\nLumaRaf 0.1.0 · İlk odalar\nAyrı bir proje klasörüdür; LumaNote klasörüne dokunmaz.\n\n'
exec npx --yes --package=node@24 --call 'node tools/setup.cjs'
