// src/worker.ts
var log = console.log;
var error = console.error;
var db;
var start = (sqlite3) => {
  log("Running SQLite3 version", sqlite3.version.libVersion);
  db = "opfs" in sqlite3 ? new sqlite3.oo1.OpfsDb("/mydb.sqlite3") : new sqlite3.oo1.DB("/mydb.sqlite3", "ct");
  log(
    "opfs" in sqlite3 ? `OPFS is available, created persisted database at ${db.filename}` : `OPFS is not available, created transient database ${db.filename}`
  );
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  log("Database initialized with users table");
  self.postMessage({ type: "READY" });
};
self.onmessage = async (event) => {
  const { type, payload, responseId } = event.data;
  console.log("worker", { type, payload, responseId });
  try {
    switch (type) {
      case "SQL_QUERY":
        const result = db.exec(payload);
        self.postMessage({ type: "SQL", payload: result, responseId });
        break;
    }
  } catch (e) {
    if (e instanceof Error) {
      error("Exception:", e.message);
      self.postMessage({ type: "ERROR", payload: e.message });
    } else {
      error("Exception:", String(e));
      self.postMessage({ type: "ERROR", payload: String(e) });
    }
  }
};
var sqlite3Js = "sqlite3.js";
var urlParams = new URL(self.location.href).searchParams;
if (urlParams.has("sqlite3.dir")) {
  sqlite3Js = urlParams.get("sqlite3.dir") + "/" + sqlite3Js;
}
importScripts(sqlite3Js);
self.sqlite3InitModule({
  print: log,
  printErr: error
}).then(function(sqlite3) {
  log("Done initializing. Running demo...");
  try {
    start(sqlite3);
  } catch (e) {
    if (e instanceof Error) {
      error("Exception:", e.message);
    } else {
      error("Exception:", String(e));
    }
  }
});
