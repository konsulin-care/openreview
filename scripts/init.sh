#!/bin/sh
set -eu

echo "==> Installing pnpm dependencies..."
pnpm install -r

echo "==> Downloading Go modules..."
go mod download

echo "==> Done."
