#!/usr/bin/env bash
# start-playwright-mcp.sh — Start the user-playwright SSE MCP server (macOS / Linux)
# Run from the project root: bash .agents/skills/stlc-manual-executor/scripts/start-playwright-mcp.sh
# Keep this terminal open for the duration of the test execution session.

OUTPUT_DIR="qa-artifacts/4-execution-results/screenshots"

mkdir -p "$OUTPUT_DIR"

echo "Starting user-playwright MCP server on port 8931..."
echo "Screenshots will be saved to: $OUTPUT_DIR"
echo "Press Ctrl+C to stop."
echo ""

npx @playwright/mcp --port 8931 --output-dir "$OUTPUT_DIR"
