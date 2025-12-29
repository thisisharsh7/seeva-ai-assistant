# Changelog

All notable changes to Seeva AI Assistant will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.2] - 2025-12-29

### Fixed
- **Version Display Bug**: Fixed issue where settings showed v0.2.0 instead of actual installed version
  - Replaced hardcoded `APP_VERSION` constant with dynamic `getAppVersion()` function
  - Version now automatically syncs with `tauri.conf.json` and always displays correctly
  - Eliminates need to manually update version in multiple places during releases

### Improved
- **Update Error Messages**: Enhanced auto-updater error reporting
  - Now shows detailed error messages instead of generic "Failed to install update"
  - Increased error display timeout from 5s to 8s for better readability
  - Helps users troubleshoot update issues more effectively

## [0.2.1] - 2025-12-09

### Added
- Window resizability from edges with `NSWindowStyleMask::Resizable` flag
- Users can now resize the window by dragging any edge, not just corners
- Resize handles work on all window edges while maintaining NonactivatingPanel behavior

### Changed
- **UI Reorganization**: Moved drag handle from left side to right side with window controls
- Improved visual hierarchy with drag handle positioned alongside theme toggle and minimize button
- Better discoverability of window controls and drag functionality
- Cleaner header layout with more intuitive button grouping

### Removed
- Removed `skipTaskbar: false` configuration for cleaner setup
- Cleaned up redundant drag region attributes from header components

### Fixed
- Window controls now properly grouped for better UX
- Drag handle more visible and accessible in new position

## [0.1.7] - 2025-11-15

### Added

#### OpenAI Provider
- Added support for newest OpenAI GPT-5 models:
  - `gpt-5-mini` (400K context window, vision support)
  - `gpt-5-nano` (400K context window, vision support)
- Updated default OpenAI model to `gpt-5-mini`
- Increased default max tokens to 32,000 for OpenAI

#### OpenRouter Provider
- Added support for latest models via OpenRouter:
  - `openai/gpt-5.1` (200K context, vision support)
  - `nvidia/nemotron-nano-12b-v2-vl:free` (32K context, vision support, free tier)
  - `google/gemini-2.5-flash-lite-preview-09-2025` (1M context, vision support)
  - `qwen/qwen3-vl-235b-a22b-thinking` (235B parameters, vision support)
  - `anthropic/claude-sonnet-4` (200K context, vision support)
  - `anthropic/claude-3.7-sonnet` (200K context, vision support)
  - `google/gemini-2.0-flash-exp` (1M context, vision support)
  - `meta-llama/llama-3.2-90b-vision-instruct` (128K context, vision support)
  - `x-ai/grok-2-vision-1212` (128K context, vision support)
- Updated default OpenRouter model to `openai/gpt-5.1`
- Increased default max tokens to 32,000 for OpenRouter
- Added OpenRouter API endpoint to constants

### Changed

#### OpenAI Provider
- **Breaking**: Changed request parameter from `max_tokens` to `max_completion_tokens` to align with OpenAI's latest API
- Removed temperature parameter support (GPT-5 models only support default value of 1)
- Improved streaming implementation with buffering to handle partial chunks more reliably
- Updated model validation to use `gpt-5-nano` for API key testing

#### Settings
- Increased default max tokens across all providers:
  - Anthropic: 64,000
  - OpenAI: 32,000
  - OpenRouter: 32,000
  - Gemini: 32,000
  - Ollama: 16,000

### Fixed
- Improved streaming chunk processing in OpenAI provider to handle incomplete data chunks
- Added buffer management to prevent data loss during streaming responses

### Tested
- Verified image support (vision) with:
  - OpenAI `gpt-5-mini` - working correctly
  - OpenRouter `nvidia/nemotron-nano-12b-v2-vl:free` - working correctly
- Note: Current streaming implementation may show incomplete intermediate updates, but final messages are delivered correctly

### Known Issues
- Streaming responses may appear choppy during generation due to buffer handling, but complete messages are received successfully
- This is a display issue only and does not affect the quality or completeness of AI responses

## [0.1.6] - 2025-11-14

### Added
- Auto-updater functionality with cryptographic signing
- Version display in application
- Missing permissions for updater

### Fixed
- Cleanup of unused files
- Auto-check for updates on launch

## [0.1.5] - 2025-11-13

### Added
- Version display feature
- Multi-provider support (OpenAI, OpenRouter, Gemini, Ollama)
- Comprehensive development documentation (CLAUDE.md)

### Fixed
- External URL handling
- Updater plugin initialization

## Earlier Versions

See git history for changes in versions 0.1.4 and earlier.
