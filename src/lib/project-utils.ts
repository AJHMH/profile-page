import { sanitizeUrl } from '$lib/url';

const projectCategoryColors = {
	frontend: '#00694b',
	backend: '#3d5c52',
	fullstack: '#0a8060'
} as const;

const projectCategoryIcons = {
	frontend: 'window',
	backend: 'database',
	fullstack: 'layers'
} as const;

const DEFAULT_PROJECT_CATEGORY_COLOR = '#655d58';
const DEFAULT_PROJECT_CATEGORY_ICON = 'cube';

export function getProjectCategoryColor(category: string): string {
	if (category === 'frontend' || category === 'backend' || category === 'fullstack') {
		return projectCategoryColors[category];
	}
	return DEFAULT_PROJECT_CATEGORY_COLOR;
}

export function getProjectCategoryIconKey(category: string): string {
	if (category === 'frontend' || category === 'backend' || category === 'fullstack') {
		return projectCategoryIcons[category];
	}
	return DEFAULT_PROJECT_CATEGORY_ICON;
}

/** Returns a safe external URL or empty string when invalid / missing */
export function safeProjectUrl(url: string | null | undefined): string {
	if (!url) return '';
	return sanitizeUrl(url);
}
