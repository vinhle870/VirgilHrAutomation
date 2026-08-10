# start-playwright-mcp.ps1 — Start the user-playwright SSE MCP server (Windows / PowerShell)
# Run from the project root: .\.agents\skills\stlc-manual-executor\scripts\start-playwright-mcp.ps1
# Keep this terminal open for the duration of the test execution session.

$outputDir = "qa-artifacts\4-execution-results\screenshots"

# Ensure output directory exists
if (-not (Test-Path $outputDir)) {
  New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
  Write-Host "  Created : $outputDir"
}

Write-Host "Starting user-playwright MCP server on port 8931..."
Write-Host "Screenshots will be saved to: $outputDir"
Write-Host "Press Ctrl+C to stop."
Write-Host ""

npx @playwright/mcp --port 8931 --output-dir $outputDir
