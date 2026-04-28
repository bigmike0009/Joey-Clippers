#Requires -Version 7.0
<#
.SYNOPSIS
    Start the Claude Code pipeline headlessly from the command line.

.PARAMETER Prompt
    Override the default pipeline prompt.
    Default: "Follow PIPELINE.md to build the app from IDEA.md"

.PARAMETER Model
    Claude model to use. Default: claude-opus-4-5-20251101

.EXAMPLE
    .\run.ps1
    .\run.ps1 -Prompt "Follow PIPELINE.md — skip generation, start at Phase 4"
    .\run.ps1 -Prompt "Follow PIPELINE.md — only implement features 2 and 4"
    .\run.ps1 -Prompt "Resume the pipeline — check IMPLEMENTATION_TRACKER.md for where we left off"
#>

param(
    [string]$Prompt = "Follow PIPELINE.md to build the app from IDEA.md",
    [string]$Model  = "claude-opus-4-5-20251101"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
    throw "'claude' not found. Install it with: npm install -g @anthropic-ai/claude-code"
}

if (-not (Test-Path "IDEA.md")) {
    throw "IDEA.md not found. Run this script from the project root."
}

if (-not (Test-Path "PIPELINE.md")) {
    throw "PIPELINE.md not found. Run this script from the project root."
}

Write-Host ""
Write-Host "Starting pipeline..." -ForegroundColor Cyan
Write-Host "  Prompt : $Prompt" -ForegroundColor DarkGray
Write-Host "  Model  : $Model" -ForegroundColor DarkGray
Write-Host ""

claude --dangerously-skip-permissions --model $Model -p $Prompt
