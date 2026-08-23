import { z } from 'zod';
import type { Prisma } from '@prisma/client';

const siteMetadataSchema = z.object({
	email: z.string().email().optional(),
	phone: z.string().max(50).optional(),
	github: z.string().url().optional(),
	linkedin: z.string().url().optional(),
	bluesky: z.string().url().optional(),
	availability: z.string().max(500).optional(),
	responseTime: z.string().max(200).optional()
});

export type SiteMetadata = z.infer<typeof siteMetadataSchema>;

export const defaultSiteMetadata: SiteMetadata = {
	email: 'mr.aaronjhoward@outlook.com',
	phone: '+1 (459) 964-2476',
	github: 'https://github.com/aaron-howard',
	linkedin: 'https://www.linkedin.com/in/aaronjhoward/',
	bluesky: 'https://bsky.app/profile/aaron-howard.bsky.social',
	availability: "I'm currently available for freelance work opportunities.",
	responseTime: 'I typically respond within 24 hours.'
};

export function parseSiteMetadata(raw: Prisma.JsonValue | null | undefined): SiteMetadata {
	const parsed = siteMetadataSchema.safeParse(raw);
	if (parsed.success) {
		return { ...defaultSiteMetadata, ...parsed.data };
	}
	return defaultSiteMetadata;
}
