# Dm0nk

- [ ] Notes
    - Memorise
    - Ai Notes
    - Tasks
    - Inventory
    - Checklist (Nesting)
    - Trip
    - Collection(Law Acts)
    - Feeds(BlueSky, HackerNews, LokSatta, The Hindu)
    - Weblinks
    - Pinned
    - Double Entry ledger 
    - Workout | Diet
- History, offline first 
- Mobile | SQLite first -> change sync agent
- Web | Pure web only

### Focus on OSS

> dm0nk.app

> Pure client side solution
> Files+SQlite sync with Google Cloud Storage

## [Drizzle](https://orm.drizzle.team/docs/get-started/expo-new)

```
npm i -D babel-plugin-inline-import
npx expo customize | metro.config.js, babel.config.js
db.ts, drizzle.config.ts, schema.ts
npx drizzle-kit generate
```

### Inventory

- Opens up a checklist of items
- Search, check, uncheck, add, remove, edit | Persistance

```
npx esbuild src/worker.ts --bundle --outfile=public/worker-1.js --platform=browser --format=esm --target=es2020

npx esbuild src/worker.ts \
  --bundle \
  --outfile=public/worker-1.js \
  --platform=browser \
  --format=esm \
  --target=es2020 \
  --loader:.sql=text

drizzle-orm SQLite Migrations
```
https://glitch.com/edit/#!/sqlite-wasm-opfs?path=public%2Findex.html%3A38%3A59
https://sqlite.org/wasm/file/demo-123.js?txt
https://github.com/sqlite/sqlite-wasm/tree/main