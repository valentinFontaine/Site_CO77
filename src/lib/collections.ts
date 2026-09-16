import { getCollection, type CollectionKey } from 'astro:content';

/**
 * Les contenus marqués `draft: true` sont visibles en développement (`npm run dev`)
 * mais jamais publiés en production. Cela permet de préparer une actualité ou un
 * événement dans le CMS sans qu'il apparaisse sur le site tant qu'il n'est pas prêt.
 */
export const showDrafts = !import.meta.env.PROD;

/** Comme `getCollection`, mais sans les brouillons en production. */
export async function getPublished<C extends CollectionKey>(collection: C) {
	return getCollection(collection, ({ data }) => showDrafts || (data as { draft?: boolean }).draft !== true);
}
