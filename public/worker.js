// In `worker.js`.
// import sqlite3InitModule from '@sqlite.org/sqlite-wasm';

const log = console.log;
const error = console.error;

let db;

const start = (sqlite3) => {
  log("Running SQLite3 version", sqlite3.version.libVersion);
  db =
    "opfs" in sqlite3
      ? new sqlite3.oo1.OpfsDb("/mydb.sqlite3")
      : new sqlite3.oo1.DB("/mydb.sqlite3", "ct");
  log(
    "opfs" in sqlite3
      ? `OPFS is available, created persisted database at ${db.filename}`
      : `OPFS is not available, created transient database ${db.filename}`
  );
  // Your SQLite code here.
  // migrations go here..
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  log("Database initialized with users table");
};

// Handle messages from main thread
self.onmessage = async (event) => {
  const { type, payload } = event.data;

  try {
    switch (type) {
      case "LIST_USERS":
        console.log("in worker", "listing", payload);
        const users = db.exec({
          sql: "SELECT * FROM users ORDER BY created_at DESC",
          returnValue: "resultRows",
        });
        console.log(users);
        self.postMessage({ type: "USERS_LISTED", payload: users });
        break;

      case "CREATE_USER":
        console.log("in worker", "creating", payload);
        const { name, email } = payload;
        db.exec({
          sql: "INSERT INTO users (name, email) VALUES (?, ?)",
          bind: [name, email],
        });
        const newUser = db.exec({
          sql: "SELECT * FROM users WHERE id = last_insert_rowid()",
          returnValue: "resultRows",
        });
        self.postMessage({ type: "USER_CREATED", payload: newUser[0] });
        break;

      case "UPDATE_USER":
        const { id, ...updateData } = payload;
        const setClauses = Object.keys(updateData)
          .map((key) => `${key} = ?`)
          .join(", ");
        const values = [...Object.values(updateData), id];

        db.exec({
          sql: `UPDATE users SET ${setClauses} WHERE id = ?`,
          bind: values,
        });

        const updatedUser = db.exec({
          sql: "SELECT * FROM users WHERE id = ?",
          bind: [id],
          returnValue: "resultRows",
        });
        self.postMessage({ type: "USER_UPDATED", payload: updatedUser[0] });
        break;

      case "DELETE_USER":
        const userId = payload;
        db.exec({
          sql: "DELETE FROM users WHERE id = ?",
          bind: [userId],
        });
        self.postMessage({ type: "USER_DELETED", payload: userId });
        break;
    }
  } catch (error) {
    self.postMessage({ type: "ERROR", payload: error.message });
  }
};

let sqlite3Js = "sqlite3.js";
const urlParams = new URL(self.location.href).searchParams;
if (urlParams.has("sqlite3.dir")) {
  sqlite3Js = urlParams.get("sqlite3.dir") + "/" + sqlite3Js;
}
importScripts(sqlite3Js);

self
  .sqlite3InitModule({
    print: log,
    printErr: error,
  })
  .then(function (sqlite3) {
    log("Done initializing. Running demo...");
    try {
      start(sqlite3);
    } catch (e) {
      error("Exception:", e.message);
    }
  });
