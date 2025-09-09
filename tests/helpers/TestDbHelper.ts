import sqlite3 from "sqlite3";

export class TestDbHelper {
  private db: sqlite3.Database;

  constructor(testName: string) {
    // Use in-memory database for faster tests
    this.db = new sqlite3.Database(":memory:");
  }

  async setupDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const initSql = `
        CREATE TABLE IF NOT EXISTS characters (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          status TEXT NOT NULL,
          species TEXT NOT NULL,
          type TEXT DEFAULT '',
          gender TEXT NOT NULL,
          origin_name TEXT DEFAULT '',
          origin_url TEXT DEFAULT '',
          location_name TEXT DEFAULT '',
          location_url TEXT DEFAULT '',
          image TEXT DEFAULT '',
          created TEXT DEFAULT CURRENT_TIMESTAMP
        );

        INSERT INTO characters (id, name, status, species, gender) VALUES
        (1, 'Rick Sanchez', 'Alive', 'Human', 'Male'),
        (2, 'Morty Smith', 'Alive', 'Human', 'Male');
      `;

      this.db.exec(initSql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  getDatabase(): sqlite3.Database {
    return this.db;
  }

  async cleanup(): Promise<void> {
    return new Promise((resolve) => {
      this.db.close((err) => {
        resolve();
      });
    });
  }
}
