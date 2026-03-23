const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'blog.db');

let db;

function getDB() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
      }
    });
    db.run('PRAGMA foreign_keys = ON');
  }
  return db;
}

function initDB() {
  return new Promise((resolve, reject) => {
    const database = getDB();

    const createTable = `
      CREATE TABLE IF NOT EXISTS articles (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        titre       TEXT    NOT NULL,
        contenu     TEXT    NOT NULL,
        auteur      TEXT    NOT NULL,
        date        TEXT    NOT NULL DEFAULT (datetime('now')),
        categorie   TEXT    NOT NULL DEFAULT 'General',
        tags        TEXT    NOT NULL DEFAULT '[]',
        created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
      )
    `;

    database.run(createTable, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
        return reject(err);
      }

      // Insert sample data if table is empty
      database.get('SELECT COUNT(*) as count FROM articles', (err, row) => {
        if (err) return reject(err);

        if (row.count === 0) {
          const samples = [
            {
              titre: 'Bienvenue sur notre Blog',
              contenu: 'Ceci est le premier article de notre blog. Nous parlerons de développement web, de Node.js, et bien plus encore !',
              auteur: 'Admin',
              categorie: 'General',
              tags: JSON.stringify(['bienvenue', 'blog', 'intro']),
              date: new Date().toISOString()
            },
            {
              titre: 'Introduction à Node.js et Express',
              contenu: 'Node.js est un environnement d\'exécution JavaScript côté serveur. Express est un framework web minimaliste et flexible pour Node.js qui fournit un ensemble robuste de fonctionnalités.',
              auteur: 'Charles Njiosseu',
              categorie: 'Tech',
              tags: JSON.stringify(['nodejs', 'express', 'backend', 'javascript']),
              date: new Date().toISOString()
            },
            {
              titre: 'SQLite : Base de données légère pour vos projets',
              contenu: 'SQLite est une bibliothèque en langage C qui implémente un moteur de base de données SQL. Contrairement aux autres bases de données SQL, SQLite n\'a pas de processus serveur séparé.',
              auteur: 'Étudiant INF222',
              categorie: 'Base de Données',
              tags: JSON.stringify(['sqlite', 'database', 'sql']),
              date: new Date().toISOString()
            }
          ];

          const stmt = database.prepare(
            'INSERT INTO articles (titre, contenu, auteur, categorie, tags, date) VALUES (?, ?, ?, ?, ?, ?)'
          );

          samples.forEach(s => {
            stmt.run(s.titre, s.contenu, s.auteur, s.categorie, s.tags, s.date);
          });

          stmt.finalize((err) => {
            if (err) return reject(err);
            console.log('✅ Database initialized with sample data');
            resolve(database);
          });
        } else {
          console.log('✅ Database already initialized');
          resolve(database);
        }
      });
    });
  });
}

module.exports = { getDB, initDB };
