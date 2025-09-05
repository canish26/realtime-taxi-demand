#!/usr/bin/env bash
set -e
cp -n .env.example .env 2>/dev/null || true
npm install
npm run -w server dev &
sleep 1
npm run -w frontend dev &
wait