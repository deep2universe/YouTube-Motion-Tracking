# Implementation Plan: Logging System Refactor

## Overview

This implementation plan breaks down the logging system refactor into discrete, manageable coding tasks. Each task builds incrementally on previous tasks and focuses on specific files or groups of files.

---

## Phase 1: Core Files Refactoring

### Task 1: Refactor src/content.js

- [ ] 1.1 Add DEBUG constant after imports
  - Add `const DEBUG = false;` after all import statements
  - Add JSDoc comment explaining the DEBUG flag usage
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 1.2 Wrap all console.log statements with DEBUG checks
  - Search for all `console.log` statements in the file
  - Wrap each with `if (DEBUG)` conditional
  - Maintain original indentation and formatting
  - Preserve all arguments and string interpolation
  - Handle multi-line console statements correctly
  - _Requirements: 3.1, 3.4, 3.5_

- [ ] 1.3 Wrap all console.warn statements with DEBUG checks
  - Search for all `console.warn` statements in the file
  - Wrap each with `if (DEBUG)` conditional
  - Maintain original indentation and formatting
  - _Requirements: 3.2, 3.4, 3.5_

- [ ] 1.4 Verify console.error statements remain unwrapped
  - Identify all `console.error` statements
  - Ensure they are NOT wrapped with DEBUG checks
  - Verify they will always execute
  - _Requirements: 3.3_

- [ ] 1.5 Translate any German text to English
  - Search for German strings in console messages
  - Translate to English equivalents
  - Verify technical accuracy
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

### Task 2: Refactor src/gameMode.js

- [ ] 2.1 Add DEBUG constant after imports
  - Add `const DEBUG = false;` after all import statements
  - Add JSDoc comment explaining the DEBUG flag usage
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 2.2 Wrap console.log statements with DEBUG checks
  - Wrap all `console.log` statements with `if (DEBUG)`
  - Preserve [GAME MODE] prefixes in log messages
  - Maintain indentation and formatting
  - _Requirements: 3.1, 3.4, 3.5_

- [ ] 2.3 Wrap console.warn statements with DEBUG checks
  - Wrap all `console.warn` statements with `if (DEBUG)`
  - Preserve [GAME MODE] prefixes in warning messages
  - _Requirements: 3.2, 3.4, 3.5_

- [ ] 2.4 Verify console.error statements remain unwrapped
  - Ensure `console.error` statements are NOT wrapped
  - Verify error logging always executes
  - _Requirements: 3.3_

### Task 3: Refactor src/motionDetector.js

- [ ] 3.1 Add DEBUG constant after imports
  - Add `const DEBUG = false;` after all import statements
  - Add JSDoc comment explaining the DEBUG flag usage
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3.2 Wrap console.log statements with DEBUG checks
  - Wrap all `console.log` statements with `if (DEBUG)`
  - Preserve [MOTION DETECTOR] prefixes
  - Handle pattern detection logs correctly
  - _Requirements: 3.1, 3.4, 3.5_

- [ ] 3.3 Wrap console.warn statements with DEBUG checks
  - Wrap all `console.warn` statements with `if (DEBUG)`
  - Preserve validation warning messages
  - _Requirements: 3.2, 3.4, 3.5_

### Task 4: Refactor src/background.js

- [ ] 4.1 Add DEBUG constant after imports
  - Add `const DEBUG = false;` at the top of the file
  - Add JSDoc comment explaining the DEBUG flag usage
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 4.2 Wrap console.log statements with DEBUG checks
  - Wrap all `console.log` statements with `if (DEBUG)`
  - Preserve "YouTube Motion Tracking:" prefixes
  - Handle service worker context correctly
  - _Requirements: 3.1, 3.4, 3.5_

### Task 5: Refactor src/anim.js

- [ ] 5.1 Add DEBUG constant after imports
  - Add `const DEBUG = false;` after all import statements
  - Add JSDoc comment explaining the DEBUG flag usage
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 5.2 Wrap console.log statements with DEBUG checks
  - Wrap the Halloween Edition animation log with `if (DEBUG)`
  - Wrap the WebGL fallback log with `if (DEBUG)`
  - Maintain formatting and context
  - _Requirements: 3.1, 3.4, 3.5_

---

## Phase 2: Supporting Files Verification

### Task 6: Verify and refactor remaining source files

- [ ] 6.1 Check src/detectUtils.js for console statements
  - Search for any console.log, console.warn, console.error
  - If found, add DEBUG constant and wrap appropriately
  - If none found, document and skip
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 6.2 Check src/ghostCharacter.js for console statements
  - Search for any console.log, console.warn, console.error
  - If found, add DEBUG constant and wrap appropriately
  - If none found, document and skip
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 6.3 Check src/jumpMarkers.js for console statements
  - Search for any console.log, console.warn, console.error
  - If found, add DEBUG constant and wrap appropriately
  - If none found, document and skip
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 6.4 Check src/filterEnum.js for console statements
  - Search for any console.log, console.warn, console.error
  - If found, add DEBUG constant and wrap appropriately
  - If none found, document and skip
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 6.5 Check src/animEnum.js for console statements
  - Search for any console.log, console.warn, console.error
  - If found, add DEBUG constant and wrap appropriately
  - If none found, document and skip
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 6.6 Check src/motionEnum.js for console statements
  - Search for any console.log, console.warn, console.error
  - If found, add DEBUG constant and wrap appropriately
  - If none found, document and skip
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 6.7 Check src/gameConfig.js for console statements
  - Search for any console.log, console.warn, console.error
  - If found, add DEBUG constant and wrap appropriately
  - If none found, document and skip
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 6.8 Check src/gameModeEnum.js for console statements
  - Search for any console.log, console.warn, console.error
  - If found, add DEBUG constant and wrap appropriately
  - If none found, document and skip
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 6.9 Check src/motionDetectors.js for console statements
  - Search for any console.log, console.warn, console.error
  - If found, add DEBUG constant and wrap appropriately
  - If none found, document and skip
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 6.10 Check src/motionPatterns.js for console statements
  - Search for any console.log, console.warn, console.error
  - If found, add DEBUG constant and wrap appropriately
  - If none found, document and skip
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

---

## Phase 3: Validation and Testing

### Task 7: Syntax and build verification

- [ ] 7.1 Run syntax validation on all modified files
  - Use getDiagnostics tool to check for syntax errors
  - Verify proper bracket matching and indentation
  - Fix any syntax issues found
  - _Requirements: 7.2, 7.4_

- [ ] 7.2 Build the extension
  - Run `npm run build:parcel`
  - Verify build completes without errors
  - Check that dist/ directory is created successfully
  - _Requirements: 7.2, 7.5_

- [ ] 7.3 Verify all DEBUG flags are set to false
  - Review each modified file
  - Confirm `const DEBUG = false;` in all files
  - Document any exceptions
  - _Requirements: 2.3, 5.1, 5.2_

### Task 8: Functional testing

- [ ] 8.1 Test with DEBUG = false (production mode)
  - Load extension in Chrome with all DEBUG flags false
  - Navigate to YouTube video
  - Verify no console.log or console.warn output appears
  - Verify extension functions normally
  - _Requirements: 5.1, 6.4_

- [ ] 8.2 Test with DEBUG = true (development mode)
  - Set DEBUG = true in src/content.js
  - Rebuild extension
  - Load in Chrome
  - Verify console.log messages appear for content.js
  - Verify other files still have no output (their DEBUG is false)
  - _Requirements: 5.2, 5.3_

- [ ] 8.3 Test error logging
  - Trigger error conditions in the extension
  - Verify console.error messages still appear regardless of DEBUG flag
  - Confirm error handling is not affected
  - _Requirements: 3.3_

- [ ] 8.4 Test all major features
  - Test pose detection initialization
  - Test animation switching
  - Test game mode activation
  - Test filter application
  - Test theme changes
  - Verify all features work correctly after refactoring
  - _Requirements: 7.1, 7.5_

---

## Phase 4: Documentation and Cleanup

### Task 9: Update documentation

- [ ] 9.1 Add debug logging section to README
  - Document how to enable DEBUG flags
  - Explain the per-file debug flag pattern
  - Provide examples of enabling logging for specific files
  - Warn about setting DEBUG back to false before production
  - _Requirements: 5.4_

- [ ] 9.2 Create developer guide for logging
  - Document best practices for adding new console statements
  - Explain when to use console.log vs console.error
  - Provide code examples
  - _Requirements: 5.4_

### Task 10: Final verification and cleanup

- [ ] 10.1 Create comprehensive test report
  - Document all files modified
  - List total number of console statements wrapped
  - Verify no unwrapped console.log or console.warn remain
  - Confirm all console.error statements are unwrapped
  - _Requirements: 6.4, 6.5_

- [ ] 10.2 Code review checklist
  - Verify consistent DEBUG flag placement in all files
  - Check JSDoc comments are present and accurate
  - Verify indentation and formatting is preserved
  - Confirm no functionality changes
  - _Requirements: 7.3, 7.4, 7.5_

- [ ] 10.3 Final build and validation
  - Clean build: `npm run build:clean`
  - Fresh build: `npm run build:parcel`
  - Load extension in Chrome
  - Perform smoke test of all major features
  - Verify no console output with DEBUG = false
  - _Requirements: 7.1, 7.2, 7.5_

---

## Notes

- **Testing**: Focus on core functionality validation rather than extensive unit tests
- **Optional Tasks**: None - all tasks are required for complete refactoring
- **Dependencies**: Tasks should be completed in order within each phase
- **Verification**: Use getDiagnostics tool instead of bash commands for syntax checking
- **Build**: Use npm commands as specified in tech.md steering document

## Success Criteria

✅ All console.log statements wrapped with DEBUG checks  
✅ All console.warn statements wrapped with DEBUG checks  
✅ All console.error statements remain unwrapped  
✅ All DEBUG flags default to false  
✅ No German text in source code  
✅ Extension builds without errors  
✅ Extension functions normally with DEBUG = false  
✅ Logging works when DEBUG = true  
✅ No external dependencies added  
✅ Documentation updated
