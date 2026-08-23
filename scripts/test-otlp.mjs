/**
 * Verify OTLP connectivity to Grafana Cloud (traces + metrics).
 * Reads OTEL_* vars from .env and .env.local (same as local dev).
 *
 * Usage: npm run otel:verify
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();

function loadEnvFile(filename) {
	const path = resolve(root, filename);
	if (!existsSync(path)) return;

	for (const line of readFileSync(path, 'utf8').split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;
		const match = trimmed.match(/^([^=]+)=(.*)$/);
		if (!match) continue;
		const key = match[1].trim();
		let value = match[2].trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		if (process.env[key] === undefined) {
			process.env[key] = value;
		}
	}
}

loadEnvFile('.env');
loadEnvFile('.env.local');

function parseAuth(headersEnv) {
	if (!headersEnv) return '';
	const eq = headersEnv.indexOf('=');
	if (eq === -1) return '';
	return decodeURIComponent(
		headersEnv
			.slice(eq + 1)
			.trim()
			.replace(/^["']|["']$/g, '')
	);
}

async function postOtlp(url, auth, body) {
	const headers = {
		'Content-Type': 'application/json'
	};
	if (auth) {
		headers.Authorization = auth;
	}
	const response = await fetch(url, {
		method: 'POST',
		headers,
		body: JSON.stringify(body)
	});
	const text = await response.text();
	return { status: response.status, statusText: response.statusText, body: text };
}

const tracesUrl = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
const metricsUrl = process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT;
const tracesAuth = parseAuth(process.env.OTEL_EXPORTER_OTLP_TRACES_HEADERS);
const metricsAuth = parseAuth(process.env.OTEL_EXPORTER_OTLP_METRICS_HEADERS);

if (!tracesUrl && !metricsUrl) {
	console.error(
		'Set OTEL_EXPORTER_OTLP_TRACES_ENDPOINT and/or OTEL_EXPORTER_OTLP_METRICS_ENDPOINT in .env.local'
	);
	process.exit(1);
}

const now = Date.now();
const tracePayload = {
	resourceSpans: [
		{
			resource: {
				attributes: [{ key: 'service.name', value: { stringValue: 'profile-page-verify' } }]
			},
			scopeSpans: [
				{
					scope: { name: 'verify-script', version: '1.0.0' },
					spans: [
						{
							traceId: '5B8EFFF7A039173D269B63381E532F41',
							spanId: 'EEE19B7EC3C1B174',
							name: 'verify-span',
							startTimeUnixNano: String(now * 1_000_000),
							endTimeUnixNano: String((now + 1000) * 1_000_000),
							kind: 1
						}
					]
				}
			]
		}
	]
};

const metricPayload = {
	resourceMetrics: [
		{
			resource: {
				attributes: [{ key: 'service.name', value: { stringValue: 'profile-page-verify' } }]
			},
			scopeMetrics: [
				{
					scope: { name: 'verify-script', version: '1.0.0' },
					metrics: [
						{
							name: 'verify.check',
							sum: {
								dataPoints: [
									{
										asInt: 1,
										startTimeUnixNano: String(now * 1_000_000),
										timeUnixNano: String(now * 1_000_000)
									}
								],
								aggregationTemporality: 2,
								isMonotonic: true
							}
						}
					]
				}
			]
		}
	]
};

async function verifyEndpoint(label, url, auth, payload) {
	console.log(`${label}: ${url}`);
	try {
		const result = await postOtlp(url, auth, payload);
		console.log(`  -> ${result.status} ${result.statusText}`);
		if (result.body && result.body.length < 200) console.log(`  -> ${result.body}`);
		return result.status < 200 || result.status >= 300;
	} catch (error) {
		console.log(`  -> ERROR ${error.message}`);
		return true;
	}
}

let failed = false;

if (tracesUrl) {
	failed = (await verifyEndpoint('Traces', tracesUrl, tracesAuth, tracePayload)) || failed;
}

if (metricsUrl) {
	failed = (await verifyEndpoint('Metrics', metricsUrl, metricsAuth, metricPayload)) || failed;
}

process.exit(failed ? 1 : 0);
