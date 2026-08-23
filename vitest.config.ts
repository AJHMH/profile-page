import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

export default defineConfig({
	plugins: [svelte()],
	test: {
		globals: true,
		environment: 'happy-dom',
		setupFiles: ['./src/tests/setup.ts'],
		include: ['src/**/*.{test,spec}.{ts,js}'],
		exclude: ['node_modules', '.svelte-kit', 'build'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			include: ['src/lib/**/*.ts'],
			exclude: [
				'src/lib/types.ts',
				'src/lib/observability/**',
				'src/lib/server/db/index.ts',
				'src/lib/server/email.ts',
				'src/**/*.d.ts'
			],
			thresholds: { lines: 80, functions: 80, branches: 75, statements: 80 }
		}
	},
	resolve: {
		alias: {
			'$app/environment': resolve('./src/tests/mocks/app-environment.ts'),
			'$app/paths': resolve('./src/tests/mocks/app-paths.ts'),
			'$app/stores': resolve('./src/tests/mocks/app-stores.ts'),
			'$app/navigation': resolve('./src/tests/mocks/app-navigation.ts'),
			'$env/dynamic/private': resolve('./src/tests/mocks/env-dynamic-private.ts'),
			'$env/dynamic/public': resolve('./src/tests/mocks/env-dynamic-public.ts'),
			$lib: resolve('./src/lib'),
			'$lib/server/db': resolve('./src/tests/mocks/db.ts'),
			'superforms-zod4-adapter': resolve(
				'./node_modules/sveltekit-superforms/dist/adapters/zod4.js'
			)
		}
	}
});
