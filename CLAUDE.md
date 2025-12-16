# CLAUDE.md - AI Assistant Guide

This document provides guidance for AI assistants (like Claude) working with this codebase. It explains the project structure, development workflows, coding conventions, and key context needed to effectively assist with development tasks.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [Technology Stack](#technology-stack)
4. [Development Workflow](#development-workflow)
5. [Code Conventions](#code-conventions)
6. [Testing Guidelines](#testing-guidelines)
7. [Documentation Standards](#documentation-standards)
8. [Common Tasks](#common-tasks)
9. [Troubleshooting](#troubleshooting)
10. [AI Assistant Guidelines](#ai-assistant-guidelines)

---

## Project Overview

**Status:** New Repository - To be configured

**Purpose:** [Describe the main purpose and goals of this project]

**Key Features:**
- [Feature 1]
- [Feature 2]
- [Feature 3]

**Primary Maintainers:** [List maintainers or teams]

---

## Repository Structure

```
.
├── src/                    # Source code
│   ├── components/         # Reusable components
│   ├── services/          # Business logic and services
│   ├── utils/             # Utility functions
│   ├── types/             # Type definitions
│   └── config/            # Configuration files
├── tests/                 # Test files
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── e2e/               # End-to-end tests
├── docs/                  # Documentation
├── scripts/               # Build and deployment scripts
├── public/                # Static assets
└── .github/               # GitHub workflows and templates
```

**Note:** This structure is a template. Update as the project evolves.

---

## Technology Stack

### Core Technologies
- **Runtime:** [e.g., Node.js, Python, Go]
- **Framework:** [e.g., React, Express, Django]
- **Language:** [e.g., TypeScript, JavaScript, Python]
- **Build Tool:** [e.g., Vite, Webpack, Cargo]

### Development Tools
- **Package Manager:** [e.g., npm, yarn, pnpm, pip]
- **Linter:** [e.g., ESLint, Pylint, Clippy]
- **Formatter:** [e.g., Prettier, Black, rustfmt]
- **Testing Framework:** [e.g., Jest, pytest, cargo test]
- **Version Control:** Git

### Infrastructure
- **CI/CD:** [e.g., GitHub Actions, Jenkins]
- **Deployment:** [e.g., Vercel, AWS, Docker]
- **Database:** [e.g., PostgreSQL, MongoDB, Redis]

---

## Development Workflow

### Getting Started

```bash
# Clone the repository
git clone [repository-url]
cd workspace

# Install dependencies
[package-manager install command]

# Set up environment variables
cp .env.example .env
# Edit .env with appropriate values

# Run development server
[start command]
```

### Branch Strategy

- **Main Branch:** `main` or `master` - Production-ready code
- **Development Branch:** `develop` - Integration branch for features
- **Feature Branches:** `feature/[name]` - New features
- **Bugfix Branches:** `bugfix/[name]` - Bug fixes
- **Hotfix Branches:** `hotfix/[name]` - Urgent production fixes
- **Claude Branches:** `claude/[session-id]` - AI-assisted development

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

**Example:**
```
feat(auth): add OAuth2 authentication

Implement OAuth2 flow with Google and GitHub providers.
Includes token refresh and session management.

Closes #123
```

### Pull Request Process

1. Create feature branch from appropriate base branch
2. Implement changes with clear, focused commits
3. Write/update tests for new functionality
4. Update documentation as needed
5. Ensure all tests pass and linter is satisfied
6. Create PR with descriptive title and summary
7. Request review from appropriate team members
8. Address review feedback
9. Merge after approval (squash or merge commits as per project policy)

---

## Code Conventions

### General Principles

1. **DRY (Don't Repeat Yourself):** Extract common logic into reusable functions/components
2. **KISS (Keep It Simple, Stupid):** Prefer simple, readable solutions over clever code
3. **YAGNI (You Aren't Gonna Need It):** Don't add functionality until it's needed
4. **Single Responsibility:** Each function/class should have one clear purpose
5. **Separation of Concerns:** Keep different aspects of the application separate

### Naming Conventions

- **Files:** `kebab-case.ts` or `snake_case.py` (depending on language conventions)
- **Directories:** `kebab-case/` or `snake_case/`
- **Variables/Functions:** `camelCase` or `snake_case`
- **Classes/Types:** `PascalCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **Private members:** `_privateMethod` or `#privateField`

### Code Style

```typescript
// Example TypeScript conventions
// Use meaningful names
function calculateUserAge(birthDate: Date): number {
  // Implementation
}

// Prefer explicit types
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// Use async/await over callbacks
async function fetchUserData(userId: string): Promise<User> {
  // Implementation
}

// Handle errors appropriately
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', { error });
  throw new AppError('Failed to process request', error);
}
```

### File Organization

- **Imports:** Group and order logically (external, internal, types, styles)
- **Exports:** Use named exports unless there's a clear default
- **Constants:** Define at the top of the file or in a separate constants file
- **Main logic:** Keep files focused and under 300-400 lines when possible

---

## Testing Guidelines

### Test Coverage Goals

- **Unit Tests:** Aim for 80%+ coverage of business logic
- **Integration Tests:** Cover critical user flows
- **E2E Tests:** Cover main user journeys

### Writing Tests

```typescript
// Example test structure
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      // Arrange
      const userData = { name: 'John', email: 'john@example.com' };

      // Act
      const user = await userService.createUser(userData);

      // Assert
      expect(user).toHaveProperty('id');
      expect(user.name).toBe(userData.name);
    });

    it('should throw error for duplicate email', async () => {
      // Arrange
      const userData = { name: 'John', email: 'existing@example.com' };

      // Act & Assert
      await expect(userService.createUser(userData))
        .rejects.toThrow('Email already exists');
    });
  });
});
```

### Test Organization

- Mirror source directory structure in test directory
- Name test files: `[filename].test.ts` or `[filename].spec.ts`
- Use descriptive test names that explain the scenario and expectation
- Group related tests with `describe` blocks
- Use setup/teardown hooks appropriately (`beforeEach`, `afterEach`, etc.)

---

## Documentation Standards

### Code Comments

- **When to comment:**
  - Complex algorithms or business logic
  - Non-obvious decisions or workarounds
  - Public APIs and interfaces
  - TODOs and FIXMEs with context

- **When NOT to comment:**
  - Obvious code (the code should be self-documenting)
  - Redundant information already in the code
  - Outdated information (remove stale comments)

### JSDoc/Docstrings

```typescript
/**
 * Calculates the total price including tax and discounts
 *
 * @param basePrice - The base price before any calculations
 * @param taxRate - Tax rate as a decimal (e.g., 0.08 for 8%)
 * @param discountCode - Optional discount code to apply
 * @returns The final price after tax and discounts
 * @throws {InvalidDiscountError} If discount code is invalid
 *
 * @example
 * const price = calculateTotalPrice(100, 0.08, 'SAVE10');
 * // Returns 97.2 (100 - 10% discount + 8% tax)
 */
function calculateTotalPrice(
  basePrice: number,
  taxRate: number,
  discountCode?: string
): number {
  // Implementation
}
```

### README Files

- Each major directory should have a README explaining its purpose
- Include setup instructions, usage examples, and key concepts
- Keep READMEs up to date with code changes

---

## Common Tasks

### Adding a New Feature

1. Create feature branch: `git checkout -b feature/feature-name`
2. Implement the feature with tests
3. Update documentation
4. Run tests: `[test command]`
5. Run linter: `[lint command]`
6. Commit with conventional commit message
7. Push and create PR

### Fixing a Bug

1. Create bugfix branch: `git checkout -b bugfix/bug-description`
2. Write a failing test that reproduces the bug
3. Fix the bug
4. Verify the test now passes
5. Run full test suite
6. Commit and create PR

### Updating Dependencies

```bash
# Check for outdated dependencies
[check outdated command]

# Update dependencies
[update command]

# Run tests to verify nothing broke
[test command]

# Commit the updates
git add [dependency files]
git commit -m "chore: update dependencies"
```

### Running Checks Locally

```bash
# Run all tests
[test command]

# Run linter
[lint command]

# Run type checker
[type check command]

# Run formatter
[format command]

# Run full CI pipeline locally
[ci command]
```

---

## Troubleshooting

### Common Issues

**Issue:** [Common problem]
**Solution:** [How to fix it]

**Issue:** [Another common problem]
**Solution:** [How to fix it]

### Debug Commands

```bash
# View application logs
[log command]

# Run in debug mode
[debug command]

# Check build output
[build command]
```

### Getting Help

- Check existing issues in the repository
- Review documentation in `/docs`
- Ask in team communication channels
- Create a detailed issue with reproduction steps

---

## AI Assistant Guidelines

### Understanding the Codebase

1. **Always read before modifying:** Use the Read tool to examine files before suggesting changes
2. **Explore systematically:** Start with key files (package.json, main entry points, config files)
3. **Follow the dependency tree:** Understand how components/modules relate to each other
4. **Check tests:** Tests often reveal intended behavior and usage patterns
5. **Review recent commits:** `git log` shows recent changes and development patterns

### Making Changes

1. **Stay focused:** Only change what's necessary to complete the task
2. **Maintain consistency:** Follow existing patterns and conventions in the codebase
3. **Avoid over-engineering:** Don't add features or abstractions that weren't requested
4. **Preserve formatting:** Match the existing code style (indentation, line breaks, etc.)
5. **Update tests:** Modify or add tests for any functional changes
6. **Document when necessary:** Add comments for complex logic, update READMEs for significant changes

### Security Considerations

1. **Never commit secrets:** API keys, passwords, tokens should be in environment variables
2. **Validate input:** Always sanitize and validate user input
3. **Avoid common vulnerabilities:** Watch for SQL injection, XSS, CSRF, etc.
4. **Use secure dependencies:** Check for known vulnerabilities in packages
5. **Follow principle of least privilege:** Grant minimal necessary permissions

### Git Workflow for AI

1. **Work on designated branches:** Always use the specified branch (usually starts with `claude/`)
2. **Commit early and often:** Make logical, focused commits
3. **Write clear commit messages:** Follow the conventional commits format
4. **Push to correct branch:** Use `git push -u origin <branch-name>`
5. **Don't force push:** Unless explicitly requested by the user

### Best Practices

1. **Ask when uncertain:** If requirements are ambiguous, ask clarifying questions
2. **Explain your approach:** Briefly describe what you're doing and why
3. **Show what changed:** Summarize modifications after completing a task
4. **Consider edge cases:** Think about error handling and boundary conditions
5. **Test your changes:** Run tests if possible before committing
6. **Keep context:** Reference file paths and line numbers when discussing code

### What to Avoid

1. **Don't add unsolicited features:** Only implement what was requested
2. **Don't refactor unnecessarily:** Bug fixes don't need surrounding cleanup
3. **Don't add excessive comments:** Code should be self-documenting when possible
4. **Don't use placeholders:** Implement complete, working solutions
5. **Don't ignore errors:** Handle errors appropriately or ask how to proceed
6. **Don't create unnecessary abstractions:** Three similar lines are better than premature abstraction

### Handling Different Request Types

**Bug Fixes:**
- Understand the bug by reading related code and tests
- Create a minimal reproduction if possible
- Fix the root cause, not just symptoms
- Add tests to prevent regression

**New Features:**
- Understand where the feature fits in the architecture
- Follow existing patterns for similar functionality
- Implement with appropriate error handling
- Add comprehensive tests
- Update relevant documentation

**Refactoring:**
- Ensure tests pass before and after
- Make changes incrementally
- Preserve external behavior
- Don't mix refactoring with feature additions

**Questions/Analysis:**
- Thoroughly explore relevant parts of the codebase
- Provide specific file paths and line numbers in answers
- Explain the "why" behind architectural decisions
- Suggest alternatives when appropriate

---

## Project-Specific Notes

### Architecture Decisions

[Document key architectural decisions, patterns, and rationale]

### Known Limitations

[List any known limitations, technical debt, or areas for improvement]

### Future Roadmap

[Outline planned features or improvements]

### External Dependencies

[List important external services, APIs, or systems this project integrates with]

---

## Changelog

Keep track of major updates to this document:

- **2025-12-16:** Initial CLAUDE.md created for new repository
- [Future updates will be listed here]

---

## Additional Resources

- [Link to main project documentation]
- [Link to API documentation]
- [Link to team wiki or knowledge base]
- [Link to design system or style guide]

---

**Last Updated:** 2025-12-16
**Maintained By:** Project Team

*This document should be updated as the project evolves to remain a helpful reference for AI assistants and human developers alike.*
