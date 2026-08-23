const blogCategoryColors = {
	Development: '#00694b',
	Technology: '#3d5c52',
	Backend: '#0a8060',
	CSS: '#655d58',
	DevOps: '#3d5c52'
} as const;

const blogCategoryIcons = {
	Development: 'code',
	Technology: 'chip',
	Backend: 'database',
	CSS: 'palette',
	DevOps: 'deploy'
} as const;

const DEFAULT_BLOG_CATEGORY_COLOR = '#655d58';
const DEFAULT_BLOG_CATEGORY_ICON = 'document';

export function getBlogCategoryColor(category: string): string {
	if (
		category === 'Development' ||
		category === 'Technology' ||
		category === 'Backend' ||
		category === 'CSS' ||
		category === 'DevOps'
	) {
		return blogCategoryColors[category];
	}
	return DEFAULT_BLOG_CATEGORY_COLOR;
}

export function getBlogCategoryIconKey(category: string): string {
	if (
		category === 'Development' ||
		category === 'Technology' ||
		category === 'Backend' ||
		category === 'CSS' ||
		category === 'DevOps'
	) {
		return blogCategoryIcons[category];
	}
	return DEFAULT_BLOG_CATEGORY_ICON;
}

export function formatBlogDate(date: string | Date): string {
	try {
		const dateObj = date instanceof Date ? date : new Date(date);
		if (Number.isNaN(dateObj.getTime())) return 'Invalid date';
		return dateObj.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	} catch {
		return 'Invalid date';
	}
}

export function getAuthorInitials(author: string | null | undefined): string {
	if (!author) return '?';
	const parts = author.trim().split(' ').filter(Boolean);
	if (parts.length === 0) return '?';
	return parts
		.map((part) => part[0]?.toUpperCase() || '')
		.join('')
		.slice(0, 2);
}
