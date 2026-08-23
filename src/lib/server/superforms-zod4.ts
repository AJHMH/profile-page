/**
 * Zod 4 adapter without the Superforms adapters barrel (pulls optional deps into SSR).
 * Aliased in vite.config.ts to the package's zod4 module so Vite bundles it for serverless.
 */
export { zod as zod4 } from 'superforms-zod4-adapter';
