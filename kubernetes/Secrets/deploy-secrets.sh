#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for file in "$SCRIPT_DIR"/*.yaml "$SCRIPT_DIR"/*.yml; do
  if [[ -f "$file" ]]; then
    echo "Applying $file"
    kubectl apply -f "$file"
  fi
done
