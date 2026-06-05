---
name: CollegeCompass auth import path
description: setAuthTokenGetter must be imported from the package barrel, not a subpath
---

**Rule:** In the frontend (`artifacts/college-compass`), import `setAuthTokenGetter` from `@workspace/api-client-react`, NOT from `@workspace/api-client-react/custom-fetch`.

**Why:** The `custom-fetch` subpath is not listed in the package's `exports` map, so TypeScript cannot resolve it as a module. The barrel `index.ts` re-exports `setAuthTokenGetter` explicitly, making it the correct import target.

**How to apply:** Any time auth token injection or `setBaseUrl` is wired into a consuming app, use the barrel import:
```ts
import { setAuthTokenGetter } from "@workspace/api-client-react";
```
