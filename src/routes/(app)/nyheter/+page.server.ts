import { publishedPosts } from '#lib/server/posts.ts';
import { postKindKeys, type PostKind } from '#lib/post-kinds.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const kind = postKindKeys.find((k) => k === url.searchParams.get('type'));
	return {
		kind: kind ?? 'all',
		posts: await publishedPosts({ kinds: kind ? [kind as PostKind] : undefined })
	};
};
