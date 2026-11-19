import type { Handle, HandleServerError } from '@sveltejs/kit/hooks';
import { SpanStatusCode, trace } from '@opentelemetry/api';
import {
	recordHttpRequest,
	recordRateLimitExceeded,
	recordUnhandledError
} from '$lib/observability/app-metrics';
import { flushOtel } from '$lib/observability/flush';
import { startInstrumentation } from '$lib/observability/instrumentation';
import { isOtelEnabled } from '$lib/observability/otel-enabled';
import { tracer } from '$lib/observability/tracer';
import { checkRateLimit } from '$lib/server/rate-limit';

startInstrumentation();

function applySecurityHeaders(response: Response): Response {
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
	return response;
}

export const handle: Handle = async ({ event, resolve }) => {
	const routeId = event.route.id ?? event.url.pathname;
	return tracer.startActiveSpan(`route ${routeId}`, async (span) => {
		span.setAttribute('route.id', routeId);
		span.setAttribute('http.method', event.request.method);
		span.setAttribute('http.target', event.url.pathname);

		try {
			if (event.request.method === 'POST' && event.url.pathname === '/contact') {
				const clientAddress = event.getClientAddress();
				const limit = checkRateLimit(`contact:${clientAddress}`);
				if (!limit.allowed) {
					recordRateLimitExceeded(routeId);
					span.setAttribute('http.status_code', 429);
					span.setStatus({ code: SpanStatusCode.ERROR, message: 'rate limited' });
					return applySecurityHeaders(
						new Response('Too many requests. Please try again later.', {
							status: 429,
							headers: { 'Retry-After': String(limit.retryAfterSeconds) }
						})
					);
				}
			}

			const response = await resolve(event);
			span.setAttribute('http.status_code', response.status);
			if (response.status >= 500) {
				span.setStatus({ code: SpanStatusCode.ERROR, message: `HTTP ${response.status}` });
			}
			recordHttpRequest(event.request.method, routeId, response.status);
			return applySecurityHeaders(response);
		} catch (error) {
			span.recordException(error instanceof Error ? error : new Error(String(error)));
			span.setStatus({ code: SpanStatusCode.ERROR });
			throw error;
		} finally {
			span.end();
			if (isOtelEnabled()) {
				await flushOtel();
			}
		}
	});
};

/** Logs unexpected errors (e.g. Prisma/DB). Check Vercel function logs when debugging 500s. */
export const handleError: HandleServerError = ({ error, event }) => {
	const err = error instanceof Error ? error : new Error(String(error));
	const routeId = event.route.id ?? event.url.pathname;

	trace.getActiveSpan()?.recordException(err);
	recordUnhandledError(routeId);
	console.error(`[handleError] ${event.url.pathname}`, err);

	return { message: 'Internal server error' };
};
