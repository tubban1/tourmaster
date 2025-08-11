#!/bin/bash

# Vercel build script for Prisma
echo "Installing dependencies..."
npm install

echo "Generating Prisma client..."
npx prisma generate --no-engine

echo "Building Next.js application..."
npm run build 