# AI Agent Guidelines

## Design decisions

- Prefer root-cause fixes over workarounds (retry buttons, caches)
- Avoid triggering mutating HTTP requests (POST/PUT/DELETE) in useEffect — prefer user-initiated actions to prevent React StrictMode double-mount issues. Read-only queries are fine.
- Test files must use the `.spec.ts` / `.spec.tsx` extension (not `.test.ts`) for consistency.
