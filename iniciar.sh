#!/usr/bin/env sh
set -e
cd "$(dirname "$0")"
[ -d node_modules/pdf-lib ] || npm ci
node server.js
