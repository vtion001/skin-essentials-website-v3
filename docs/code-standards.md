# Code Standards

## Naming Conventions
- Use `camelCase` for variables and functions; `PascalCase` for React components and types.
- File names match their default export; hooks start with `use-`.
- Keep event handlers prefixed with `handle` and pure helpers with verbs.

## Directory Structure
- `app/` for Next.js routes and pages using app router.
- `components/` for presentational and small container components.
- `lib/` for domain services, API helpers, validation, and utilities.
- `app/api/` for route handlers; each uses centralized response and logging.
- `tests/` for unit tests; colocate integration tests by feature when needed.

## Separation of Concerns
- UI components avoid business logic; move data manipulation into `lib/`.
- Handlers in pages delegate to small helpers for parsing, validation, and payload building.

## Error Handling
- Use `jsonOk/jsonError/jsonCreated` for API responses.
- Log errors via `logError(context, error, meta)` for observability.
- Validate requests with `zod` schemas in `lib/validation.ts`.

## Principles
- Apply SOLID by keeping functions single-purpose and modules focused.
- DRY: centralize repeated logic (responses, validation, fetch helpers).
- Prefer composition over inheritance for UI and services.

## Testing
- `vitest` with `jsdom` for unit tests.
- Cover critical paths: encryption utils, data services, and pure helpers.
- Add tests alongside new logic; update tests with refactors.

## Performance
- Avoid unnecessary re-renders; memoize expensive UI calculations.
- Use lazy fetch/hydration where possible for large datasets.

