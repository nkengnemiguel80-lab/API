const { getDB } = require('./db');

// Helper: parse tags from JSON string
function parseArticle(article) {
  if (!article) return null;
  return {
    ...article,
    tags: (() => {
      try { return JSON.parse(article.tags); }
      catch { return []; }
    })()
  };
}

function parseArticles(articles) {
  return articles.map(parseArticle);
}

// Get all articles with optional filters
function getAllArticles(filters = {}) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    let query = 'SELECT * FROM articles WHERE 1=1';
    const params = [];

    if (filters.categorie) {
      query += ' AND LOWER(categorie) = LOWER(?)';
      params.push(filters.categorie);
    }
    if (filters.auteur) {
      query += ' AND LOWER(auteur) = LOWER(?)';
      params.push(filters.auteur);
    }
    if (filters.date) {
      query += ' AND DATE(date) = DATE(?)';
      params.push(filters.date);
    }

    query += ' ORDER BY created_at DESC';

    db.all(query, params, (err, rows) => {
      if (err) return reject(err);
      resolve(parseArticles(rows));
    });
  });
}

// Get single article by ID
function getArticleById(id) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.get('SELECT * FROM articles WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      resolve(parseArticle(row));
    });
  });
}

// Create new article
function createArticle({ titre, contenu, auteur, categorie, tags, date }) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const tagsJSON = JSON.stringify(Array.isArray(tags) ? tags : (tags ? [tags] : []));
    const articleDate = date || new Date().toISOString();

    const query = `
      INSERT INTO articles (titre, contenu, auteur, categorie, tags, date)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [titre, contenu, auteur, categorie || 'General', tagsJSON, articleDate], function(err) {
      if (err) return reject(err);
      getArticleById(this.lastID).then(resolve).catch(reject);
    });
  });
}

// Update article
function updateArticle(id, updates) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const allowed = ['titre', 'contenu', 'auteur', 'categorie', 'tags'];
    const fields = [];
    const params = [];

    allowed.forEach(field => {
      if (updates[field] !== undefined) {
        fields.push(`${field} = ?`);
        if (field === 'tags') {
          params.push(JSON.stringify(Array.isArray(updates.tags) ? updates.tags : [updates.tags]));
        } else {
          params.push(updates[field]);
        }
      }
    });

    if (fields.length === 0) {
      return reject(new Error('No valid fields to update'));
    }

    fields.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    const query = `UPDATE articles SET ${fields.join(', ')} WHERE id = ?`;

    db.run(query, params, function(err) {
      if (err) return reject(err);
      if (this.changes === 0) return resolve(null);
      getArticleById(id).then(resolve).catch(reject);
    });
  });
}

// Delete article
function deleteArticle(id) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    db.run('DELETE FROM articles WHERE id = ?', [id], function(err) {
      if (err) return reject(err);
      resolve(this.changes > 0);
    });
  });
}

// Search articles
function searchArticles(query) {
  return new Promise((resolve, reject) => {
    const db = getDB();
    const searchTerm = `%${query}%`;
    const sql = `
      SELECT * FROM articles
      WHERE titre LIKE ? OR contenu LIKE ? OR auteur LIKE ? OR tags LIKE ?
      ORDER BY created_at DESC
    `;
    db.all(sql, [searchTerm, searchTerm, searchTerm, searchTerm], (err, rows) => {
      if (err) return reject(err);
      resolve(parseArticles(rows));
    });
  });
}

module.exports = { getAllArticles, getArticleById, createArticle, updateArticle, deleteArticle, searchArticles };
