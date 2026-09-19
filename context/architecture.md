# Architecture

- Path alias: `@/*` → `./src/*`
- API layer: `lib/api-client.ts` — shared `apiFetch` wrapper (TanStack Query's `queryFn`/`mutationFn` call through it), 2min timeout, bearer injection, mutex-protected `/auth/refresh` re-auth + replay
- Client auth/token state: `features/auth/store.ts` — Zustand store (`useAuthStore`), persisted to `localStorage`. No Redux in this project — all client state lives in Zustand.
- Route protection: `proxy.ts` (middleware), route lists in `routes/index.ts`
    - unauth on `/` or protected route → `/auth/sign-in?callbackUrl=`
    - auth but unverified → `/auth/verify-email`

## Feature folder (`src/features/<feature>/`)

```
actions.ts    server actions (if needed)
api.ts        TanStack Query hooks (useX / useXMutation) + query-key factory, built on lib/api-client.ts
schemas.ts    zod schemas
store.ts      Zustand store + actions (client state, if needed)
types.ts      feature types/enums
components/   feature UI
hooks/        feature hooks
lib/          feature helpers
```

## Rules

- File names: kebab-case
- API calls: hooks in `features/<feature>/api.ts` call `apiFetch` from `lib/api-client.ts` — never call `fetch` directly from a component
- Query keys: per-feature factory colocated in that feature's `api.ts` (e.g. `authKeys.user()`); invalidate by key directly, no central tag registry
- Hook naming: `useX` for queries, `useXMutation` for mutations
- Client state → Zustand store in the owning feature (`features/<feature>/store.ts`)
- Cross-feature UI → `components/shared/`; generic helpers → `lib/utils.ts`; cross-feature hooks → `hooks/`

- List endpoints: arg `QueryParams`, return `PaginatedResponse<X>` as-is, no reshaping in the `queryFn`.
- No global error toast for query/mutation failures (except session-expiry on refresh failure, handled in `lib/api-client.ts`) — each feature/component decides how to surface errors, per ui-rules.
- No SSR prefetch/hydration (`HydrationBoundary`) scaffolding yet — add it when a feature first needs server-fetched, hydrated data.

- follow Component Decomposition convention.
