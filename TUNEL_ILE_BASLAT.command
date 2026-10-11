#!/bin/bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd -P)"
LUMA_TUNNEL=1 bash "$ROOT/BASLAT.command"
