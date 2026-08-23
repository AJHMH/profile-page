import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

interface OtlpHeaders {
	[name: string]: string;
}

export interface ProfilePageSdkOptions {
	resource: ReturnType<typeof resourceFromAttributes>;
	serviceName: string;
	instrumentations: ReturnType<typeof getNodeAutoInstrumentations>[];
	traceExporter?: OTLPTraceExporter;
	metricReaders?: PeriodicExportingMetricReader[];
}

function parseOtlpHeaders(headerEnv: string | undefined): OtlpHeaders {
	if (!headerEnv) {
		return {};
	}

	const headers: OtlpHeaders = {};

	for (const part of headerEnv.split(',')) {
		const separator = part.indexOf('=');
		if (separator === -1) {
			continue;
		}

		const key = part.slice(0, separator).trim();
		const value = part
			.slice(separator + 1)
			.trim()
			.replace(/^["']|["']$/g, '');
		headers[key] = decodeURIComponent(value);
	}

	return headers;
}

export function isOtelEnabled(): boolean {
	return Boolean(
		process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
		process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT
	);
}

export function createSdkOptions(): ProfilePageSdkOptions {
	const options: ProfilePageSdkOptions = {
		resource: resourceFromAttributes({
			'service.name': 'profile-page',
			'service.version': process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
			'deployment.environment': process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development'
		}),
		serviceName: 'profile-page',
		instrumentations: [getNodeAutoInstrumentations()]
	};

	if (process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT) {
		options.traceExporter = new OTLPTraceExporter({
			url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
			headers: parseOtlpHeaders(process.env.OTEL_EXPORTER_OTLP_TRACES_HEADERS)
		});
	}

	if (process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT) {
		options.metricReaders = [
			new PeriodicExportingMetricReader({
				exportIntervalMillis: process.env.VERCEL ? 5_000 : 60_000,
				exporter: new OTLPMetricExporter({
					url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT,
					headers: parseOtlpHeaders(process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS)
				})
			})
		];
	}

	return options;
}
