## 1. Verification

- [ ] 1.1 Verify `astro.config.mjs` contains all five collection definitions (clubs, entrainements, evenements, actualites, cartes)
- [ ] 1.2 Verify all schema files exist in `.astro/collections/` for each collection
- [ ] 1.3 Verify content files exist in `src/content/{collection}/` directories

## 2. Code Search

- [ ] 2.1 Search codebase for any imports from `src/content.config.ts`
- [ ] 2.2 Search codebase for any references to the `blog` collection
- [ ] 2.3 Search codebase for any imports using `from 'astro:content'` patterns

## 3. Cleanup Conflicting Configuration

- [ ] 3.1 Delete `src/content.config.ts` file
- [ ] 3.2 Verify no other conflicting content configuration files exist

## 4. Testing

- [ ] 4.1 Run `npm run build` and verify no glob-loader warnings
- [ ] 4.2 Run `npm run build` and verify no "collection does not exist" errors
- [ ] 4.3 Test all collection listing pages to ensure they display content correctly
- [ ] 4.4 Test that `getCollection()` works for each collection in at least one page

## 5. Verification of Specs

- [ ] 5.1 Verify all scenarios in content-configuration-unified spec pass
- [ ] 5.2 Verify all scenarios in content-collections delta spec pass
