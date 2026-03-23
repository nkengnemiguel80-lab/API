const {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  searchArticles
} = require('../models/Article');

// Validation helper
function validateArticle(body, requireAll = true) {
  const errors = [];

  if (requireAll || body.titre !== undefined) {
    if (!body.titre || typeof body.titre !== 'string' || body.titre.trim() === '') {
      errors.push('Le titre est obligatoire et ne peut pas être vide.');
    } else if (body.titre.trim().length > 255) {
      errors.push('Le titre ne peut pas dépasser 255 caractères.');
    }
  }

  if (requireAll || body.contenu !== undefined) {
    if (!body.contenu || typeof body.contenu !== 'string' || body.contenu.trim() === '') {
      errors.push('Le contenu est obligatoire et ne peut pas être vide.');
    }
  }

  if (requireAll || body.auteur !== undefined) {
    if (!body.auteur || typeof body.auteur !== 'string' || body.auteur.trim() === '') {
      errors.push('L\'auteur est obligatoire et ne peut pas être vide.');
    } else if (body.auteur.trim().length > 100) {
      errors.push('Le nom de l\'auteur ne peut pas dépasser 100 caractères.');
    }
  }

  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags) && typeof body.tags !== 'string') {
      errors.push('Les tags doivent être un tableau ou une chaîne de caractères.');
    }
  }

  return errors;
}

// GET /api/articles — List all with optional filters
async function getArticles(req, res) {
  try {
    const { categorie, auteur, date } = req.query;
    const filters = {};
    if (categorie) filters.categorie = categorie;
    if (auteur) filters.auteur = auteur;
    if (date) filters.date = date;

    const articles = await getAllArticles(filters);
    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (err) {
    console.error('getArticles error:', err);
    res.status(500).json({ success: false, error: 'Erreur serveur', message: err.message });
  }
}

// GET /api/articles/search — Search by query
async function searchArticlesHandler(req, res) {
  try {
    const { query } = req.query;
    if (!query || query.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Le paramètre "query" est requis pour la recherche.'
      });
    }

    const articles = await searchArticles(query.trim());
    res.status(200).json({
      success: true,
      count: articles.length,
      query: query.trim(),
      data: articles
    });
  } catch (err) {
    console.error('searchArticles error:', err);
    res.status(500).json({ success: false, error: 'Erreur serveur', message: err.message });
  }
}

// GET /api/articles/:id — Get single article
async function getArticle(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, error: 'Bad Request', message: 'ID invalide.' });
    }

    const article = await getArticleById(id);
    if (!article) {
      return res.status(404).json({ success: false, error: 'Not Found', message: `Article avec l'ID ${id} introuvable.` });
    }

    res.status(200).json({ success: true, data: article });
  } catch (err) {
    console.error('getArticle error:', err);
    res.status(500).json({ success: false, error: 'Erreur serveur', message: err.message });
  }
}

// POST /api/articles — Create article
async function createArticleHandler(req, res) {
  try {
    const errors = validateArticle(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: 'Bad Request', messages: errors });
    }

    const { titre, contenu, auteur, categorie, tags, date } = req.body;
    const article = await createArticle({
      titre: titre.trim(),
      contenu: contenu.trim(),
      auteur: auteur.trim(),
      categorie: categorie ? categorie.trim() : 'General',
      tags: tags || [],
      date: date || new Date().toISOString()
    });

    res.status(201).json({
      success: true,
      message: 'Article créé avec succès.',
      data: article
    });
  } catch (err) {
    console.error('createArticle error:', err);
    res.status(500).json({ success: false, error: 'Erreur serveur', message: err.message });
  }
}

// PUT /api/articles/:id — Update article
async function updateArticleHandler(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, error: 'Bad Request', message: 'ID invalide.' });
    }

    const errors = validateArticle(req.body, false);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: 'Bad Request', messages: errors });
    }

    const existing = await getArticleById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Not Found', message: `Article avec l'ID ${id} introuvable.` });
    }

    const updated = await updateArticle(id, req.body);
    res.status(200).json({
      success: true,
      message: 'Article mis à jour avec succès.',
      data: updated
    });
  } catch (err) {
    console.error('updateArticle error:', err);
    res.status(500).json({ success: false, error: 'Erreur serveur', message: err.message });
  }
}

// DELETE /api/articles/:id — Delete article
async function deleteArticleHandler(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ success: false, error: 'Bad Request', message: 'ID invalide.' });
    }

    const existing = await getArticleById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Not Found', message: `Article avec l'ID ${id} introuvable.` });
    }

    await deleteArticle(id);
    res.status(200).json({
      success: true,
      message: `Article avec l'ID ${id} supprimé avec succès.`,
      deletedId: id
    });
  } catch (err) {
    console.error('deleteArticle error:', err);
    res.status(500).json({ success: false, error: 'Erreur serveur', message: err.message });
  }
}

module.exports = {
  getArticles,
  getArticle,
  searchArticlesHandler,
  createArticleHandler,
  updateArticleHandler,
  deleteArticleHandler
};
