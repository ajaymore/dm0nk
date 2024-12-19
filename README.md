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


- Use SupaBase

- Just publish changesets | Atomic Operation | Create,Update,Delete - Payload, id, timestamp | Sort changesets by timestamp & apply | Make sure pending local changesets are merged before applying
- Fetch all changesets from your last fetched changeset and reconcile
- User Logs In > Device has a unique database. The ID is generated once the user logs in.
- user_id & db_id are mapped using mmkv
- There would be buckets to pull changesets. shared_changesets can be pulled from other buckets as per shared information (view, edit, delete)
- The application should load even when internet is not available
```


###
1. Being able to run profiler | Understand the C++ code
2. SQL Management Studio
3. Visual Studio
4. Read and understand codebases

How to create database?
web -> mmkv searches for uuid -> create if not available -> worker url has the uuid as db name.
app -> mmkv searches for uuid -> create if not available -> useSQLite uses the uuid as db name
on creation of the uuid it is synced up with the server.
```
user_id, db_id, table_entry

I am connected, give me updates from others.
useQuery Hook that fires everytime web has focus or app comes online.

Manual sync button, Filter button, Search Button

Each time something changes Create, Update, Delete -> Queue up to be synced to server


Drizzle-Postgres
Auth with TRPC -> Google Auth, Email with Code
Database unique to the device and user
Server Tables for syncing | Everything is queued up for sync to server
sync from server
Implement Rest of the Types | Ledger, Trip, Weblinks
```

### Postgres

```
docker exec -it postgres-server psql -U postgres
docker exec -it postgres-server psql -U postgres -d dm0nk-dev
docker exec -it postgres-server psql -U postgres -h 206.189.132.156 -d dm0nk

\c my_database | connect to database
\l             | List all databases
\dn            | List all schemas
\dt            | List all tables
\dt drizzle.*  | List all tables
\d tableName   | Describe a Table
\du            | List All Roles
\password [username] | Change User Password
\q
\?
\conninfo
\copy orders TO '/path/to/orders.csv' WITH (FORMAT csv, HEADER true);
\! clear
SET search_path TO drizzle;
SET search_path TO my_schema, public;

CREATE DATABASE dm0nk_dev;
\c dm0nk_dev;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
SELECT extname FROM pg_extension WHERE extname = 'uuid-ossp';
SELECT uuid_generate_v4();
\df uuid_generate_v4
DROP DATABASE dm0nk_dev;
CREATE SCHEMA my_schema;
SELECT * FROM my_schema.my_table;

\c dm0nk_dev
CREATE USER dm1nk_admin WITH PASSWORD 'einei9us7Cahf5luap9erooxahceePah';
GRANT ALL PRIVILEGES ON DATABASE dm1nk TO dm1nk_admin;
GRANT ALL PRIVILEGES ON SCHEMA public TO dm1nk_admin;
ALTER SCHEMA public OWNER TO dm1nk_admin;

## Granular

GRANT CONNECT ON DATABASE dm1nk_dev TO dm1nk_admin;
GRANT USAGE ON SCHEMA public TO dm1nk_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dm1nk_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dm1nk_admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO dm1nk_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON TABLES TO dm1nk_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON SEQUENCES TO dm1nk_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT ALL PRIVILEGES ON FUNCTIONS TO dm1nk_admin;
ALTER ROLE dm1nk_admin NOSUPERUSER NOCREATEDB;
```

### JWT
```
# Here is how you can generate a PKCS#8 encoded RSA key pair:

openssl genpkey -algorithm RSA -out keys/private_key.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -outform PEM -in keys/private_key.pem -out keys/public_key.pem
JSON.stringify(``).replaceAll('\\n','\n')
```
