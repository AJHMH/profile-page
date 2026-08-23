import { metrics, trace } from '@opentelemetry/api';
import type { MeterProvider, TracerProvider } from '@opentelemetry/api';

interface FlushableProvider {
	forceFlush: () => Promise<void>;
}

function asFlushableProvider(provider: TracerProvider | MeterProvider): FlushableProvider | null {
	if (!('forceFlush' in provider)) {
		return null;
	}
	const candidate = provider.forceFlush;
	if (!(candidate instanceof Function)) {
		return null;
	}
	// SAFETY: `in` plus Function confirmed forceFlush exists on this OTEL provider instance.
	return provider as FlushableProvider;
}

/** Flush pending traces and metrics before a serverless function freezes. */
export async function flushOtel(): Promise<void> {
	const tracerProvider = asFlushableProvider(trace.getTracerProvider());
	if (tracerProvider) {
		await tracerProvider.forceFlush();
	}

	const meterProvider = asFlushableProvider(metrics.getMeterProvider());
	if (meterProvider) {
		await meterProvider.forceFlush();
	}
}
