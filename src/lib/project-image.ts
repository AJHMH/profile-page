/**
 * Normalize project image paths for `<img src>`.
 * Files in `static/projects/` are served at `/projects/...`, not `/static/projects/...`.
 */
export function projectImageSrc(path: string | null | undefined): string | null {
	if (path == null) return null;
	const trimmed = String(path).trim();
	if (trimmed === '') return null;

	if (/^https?:\/\//i.test(trimmed)) return trimmed;

	let p = trimmed.replace(/\\/g, '/');
	if (p.startsWith('static/')) p = p.slice('static/'.length);
	if (!p.startsWith('/')) p = `/${p}`;

	// File was renamed; older DB rows may still reference the typo
	if (p === '/projects/service-certifiy.jpg') {
		p = '/projects/service-certify.jpg';
	}

	const segments = p
		.split('/')
		.filter(Boolean)
		.map((seg) => encodeURIComponent(seg));
	const encoded = `/${segments.join('/')}`;

	return encoded;
}

/** WebP twin path for local `/projects/*.jpg` assets (after `npm run assets:project-images`). */
export function projectWebpSrc(path: string | null | undefined): string | null {
	const trimmed = path == null ? '' : String(path).trim();
	if (trimmed === '' || /^https?:\/\//i.test(trimmed)) return null;
	if (!/\.jpe?g$/i.test(trimmed)) return null;
	const jpg = projectImageSrc(path);
	if (!jpg) return null;
	return jpg.replace(/\.jpe?g$/i, '.webp');
}
