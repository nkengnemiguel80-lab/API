const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticle,
  searchArticlesHandler,
  createArticleHandler,
  updateArticleHandler,
  deleteArticleHandler
} = require('../controllers/articlesController');

// NOTE: /search must come BEFORE /:id to avoid "search" being treated as an ID
router.get('/search', searchArticlesHandler);

// CRUD routes
router.get('/', getArticles);
router.get('/:id', getArticle);
router.post('/', createArticleHandler);
router.put('/:id', updateArticleHandler);
router.delete('/:id', deleteArticleHandler);

module.exports = router;
