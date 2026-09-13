#!/bin/sh
set -eu

echo "==> Building Go engine..."
go build -o bin/openreview ./cmd/openreview

echo "==> Building Astro frontend..."
cd web && pnpm build

echo "==> Done. Binary: bin/openreview | Frontend: web/dist/"
