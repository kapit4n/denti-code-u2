#!/bin/bash
set -e

cd /home/larce/Documents/proj/gi/denti-code-u2

# Kill any existing server on port 3000
lsof -ti :3000 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1

# Start dev server
npx next dev &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for server
for i in $(seq 1 30); do
  if curl -s -o /dev/null -w "" http://localhost:3000 2>/dev/null; then
    echo "Server ready after ${i}s"
    break
  fi
  if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "Server died!"
    exit 1
  fi
  sleep 1
done

# Run screenshots
node mockup/screenshots.mjs

# Cleanup
kill $SERVER_PID 2>/dev/null || true
echo "All done"
