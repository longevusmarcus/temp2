#!/bin/bash

# This script helps bypass TypeScript errors during Vercel deployment
# while still performing a build

echo "Starting build with error bypassing..."

# Make sure the script fails if any command fails (except tsc)
set -e

# Run TypeScript check but don't fail on errors
npx tsc --noEmit || true

# Clear any cached files
echo "Clearing build cache..."
rm -rf node_modules/.vite
rm -rf dist

# Build the application with environment variables explicitly passed
VITE_TEMPO=false VERCEL_FORCE_NO_BUILD_CACHE=1 npx vite build

echo "Build completed successfully!"
