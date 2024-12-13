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
  --outfile=public/worker.js \
  --platform=browser \
  --format=esm \
  --target=es2020 \
  --loader:.sql=text

drizzle-orm SQLite Migrations
```
https://glitch.com/edit/#!/sqlite-wasm-opfs?path=public%2Findex.html%3A38%3A59
https://sqlite.org/wasm/file/demo-123.js?txt
https://github.com/sqlite/sqlite-wasm/tree/main

- create worker.js based on latest migrations data
- Deploy the app to dm0nk.app to test it out in production as PWA
- Iterate on Notes

### Deployment

```
docker build -t ghcr.io/ajaymore/dm0nk:1.0.0 .
docker push ghcr.io/ajaymore/dm0nk:1.0.0


docker run -p 3000:3000 --name dm0nk \
  ghcr.io/ajaymore/dm0nk:1.0.0

ssh -i ~/.ssh/ajaymore_rsa ajay@206.189.132.156

docker pull ghcr.io/ajaymore/dm0nk:1.0.0

docker run -d --net reverse-proxy -p 3000:3000 \
 --name dm0nk \
 --restart always \
 -e 'TZ=Asia/Kolkata' \
 -e 'LETSENCRYPT_EMAIL=mail@ajaymore.in' \
 -e 'LETSENCRYPT_HOST=dm0nk.app' \
 -e 'VIRTUAL_HOST=dm0nk.app' \
 -e 'VIRTUAL_PORT=3000' \
 ghcr.io/ajaymore/dm0nk:1.0.0
```

```
Inventory Item
add -> choose type in modal -> Open Editor -> Ask for title first -> Show title on header -> click title to edit -> add, remove, edit, update items -> show count in_stock & out_stock on Masonry Display

Each time a row is updated in the database push out userid, rowid, datahash, timestamp
every device on connect gets all sync information
every device receives an event when new items are pushed

Choose Palette color
Rename
Delete
Pin
Share
Make A Copy
Remove Tag option
```


###
1. Being able to run profiler | Understand the C++ code
2. SQL Management Studio
3. Visual Studio
4. Read and understand codebases