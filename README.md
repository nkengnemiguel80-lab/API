# Blog API — INF222 EC1 Taf1

API RESTful pour la gestion d'un blog, développée avec **Node.js**, **Express** et **SQLite**.

---

## 📋 Table des matières

- [Technologies utilisées](#technologies-utilisées)
- [Architecture du projet](#architecture-du-projet)
- [Installation & Lancement](#installation--lancement)
- [Endpoints de l'API](#endpoints-de-lapi)
- [Codes HTTP](#codes-http)
- [Exemples d'utilisation](#exemples-dutilisation)
- [Documentation Swagger](#documentation-swagger)
- [Interface Web](#interface-web)
- [Déploiement](#déploiement)

---

## Technologies utilisées

| Technologie | Rôle | Version |
|---|---|---|
| Node.js | Environnement d'exécution JavaScript côté serveur | ≥ 14.x |
| Express | Framework web minimaliste | 4.18.x |
| SQLite3 | Base de données embarquée, sans configuration | 5.1.x |
| Swagger UI | Documentation et tests interactifs de l'API | 5.0.x |
| CORS | Gestion des requêtes cross-origin | 2.8.x |
| Nodemon | Rechargement automatique en développement | 3.0.x |

---

## Architecture du projet

```
blog-api/
├── server.js                  # Point d'entrée : Express + middleware + routes
├── package.json               # Dépendances et scripts
├── swagger.json               # Spécification OpenAPI 3.0
├── blog.db                    # Base de données SQLite (générée au lancement)
│
├── models/
│   ├── db.js                  # Connexion SQLite + initialisation + données de test
│   └── Article.js             # Opérations CRUD sur la table articles
│
├── controllers/
│   └── articlesController.js  # Logique métier + validation des données
│
├── routes/
│   └── articles.js            # Définition des routes Express
│
└── public/
    └── index.html             # Interface web (frontend)
```

### Séparation des responsabilités

```
Requête HTTP
    ↓
routes/articles.js        ← Définit les URL et méthodes HTTP
    ↓
controllers/              ← Valide les données, applique la logique métier
    ↓
models/Article.js         ← Interagit avec la base de données SQLite
    ↓
Réponse JSON
```

---

## Installation & Lancement

### Prérequis
- **Node.js** (version 14 ou supérieure) — [nodejs.org](https://nodejs.org)
- **npm** (inclus avec Node.js)

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/votre-username/blog-api-inf222.git
cd blog-api-inf222

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur
npm start

# OU en mode développement (rechargement automatique)
npm run dev
```

Le serveur démarre sur **http://localhost:3000**

| URL | Description |
|---|---|
| http://localhost:3000 | Interface web frontend |
| http://localhost:3000/api/articles | API REST |
| http://localhost:3000/api-docs | Documentation Swagger UI |
| http://localhost:3000/health | Vérification de l'état du serveur |

---

## Endpoints de l'API

### Résumé

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/articles` | Liste tous les articles (avec filtres optionnels) |
| GET | `/api/articles/search?query=texte` | Recherche dans les articles |
| GET | `/api/articles/:id` | Récupère un article par ID |
| POST | `/api/articles` | Crée un nouvel article |
| PUT | `/api/articles/:id` | Modifie un article existant |
| DELETE | `/api/articles/:id` | Supprime un article |

---

### GET /api/articles

Récupère tous les articles. Supporte des filtres optionnels via query parameters.

**Paramètres de requête :**

| Paramètre | Type | Exemple | Description |
|---|---|---|---|
| `categorie` | string | `Tech` | Filtre par catégorie |
| `auteur` | string | `Charles` | Filtre par auteur |
| `date` | string | `2026-03-23` | Filtre par date (YYYY-MM-DD) |

**Réponse 200 OK :**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "titre": "Introduction à Node.js",
      "contenu": "Node.js est un environnement...",
      "auteur": "Charles Njiosseu",
      "date": "2026-03-23T10:00:00.000Z",
      "categorie": "Tech",
      "tags": ["nodejs", "javascript"],
      "created_at": "2026-03-23T10:00:00",
      "updated_at": "2026-03-23T10:00:00"
    }
  ]
}
```

---

### GET /api/articles/search?query=texte

Recherche des articles dont le titre, le contenu, l'auteur ou les tags contiennent le texte.

**Paramètres :**

| Paramètre | Type | Requis | Description |
|---|---|---|---|
| `query` | string | ✅ | Texte à rechercher |

**Réponse 200 OK :**
```json
{
  "success": true,
  "count": 1,
  "query": "nodejs",
  "data": [ /* articles correspondants */ ]
}
```

---

### GET /api/articles/:id

Récupère un article spécifique par son identifiant.

**Réponse 200 OK :**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "titre": "Introduction à Node.js",
    ...
  }
}
```

---

### POST /api/articles

Crée un nouvel article.

**Corps de la requête (JSON) :**

| Champ | Type | Requis | Description |
|---|---|---|---|
| `titre` | string | ✅ | Titre de l'article (max 255 caractères) |
| `contenu` | string | ✅ | Contenu complet de l'article |
| `auteur` | string | ✅ | Nom de l'auteur (max 100 caractères) |
| `categorie` | string | ❌ | Catégorie (défaut: `General`) |
| `tags` | array | ❌ | Liste de tags (`["tag1", "tag2"]`) |
| `date` | string | ❌ | Date ISO 8601 (défaut: maintenant) |

**Exemple :**
```json
{
  "titre": "Mon premier article",
  "contenu": "Contenu de l'article avec des explications détaillées.",
  "auteur": "Jean Dupont",
  "categorie": "Tech",
  "tags": ["nodejs", "express", "api"],
  "date": "2026-03-23T14:00:00.000Z"
}
```

**Réponse 201 Created :**
```json
{
  "success": true,
  "message": "Article créé avec succès.",
  "data": {
    "id": 4,
    "titre": "Mon premier article",
    ...
  }
}
```

---

### PUT /api/articles/:id

Met à jour un article existant. Seuls les champs fournis sont modifiés.

**Corps de la requête (JSON) — tous les champs sont optionnels :**
```json
{
  "titre": "Titre mis à jour",
  "categorie": "Backend",
  "tags": ["updated", "express"]
}
```

**Réponse 200 OK :**
```json
{
  "success": true,
  "message": "Article mis à jour avec succès.",
  "data": { /* article mis à jour */ }
}
```

---

### DELETE /api/articles/:id

Supprime un article par son ID.

**Réponse 200 OK :**
```json
{
  "success": true,
  "message": "Article avec l'ID 4 supprimé avec succès.",
  "deletedId": 4
}
```

---

## Codes HTTP

| Code | Signification | Cas d'utilisation |
|---|---|---|
| `200` | OK | Lecture, modification, suppression réussies |
| `201` | Created | Création d'article réussie |
| `400` | Bad Request | Champ manquant, validation échouée, ID invalide |
| `404` | Not Found | Article inexistant |
| `500` | Internal Server Error | Erreur base de données ou serveur |

---

## Exemples d'utilisation

### Avec curl

```bash
# Lister tous les articles
curl http://localhost:3000/api/articles

# Filtrer par catégorie
curl "http://localhost:3000/api/articles?categorie=Tech"

# Filtrer par catégorie ET date
curl "http://localhost:3000/api/articles?categorie=Tech&date=2026-03-23"

# Rechercher
curl "http://localhost:3000/api/articles/search?query=nodejs"

# Lire un article
curl http://localhost:3000/api/articles/1

# Créer un article
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "titre": "Mon article",
    "contenu": "Contenu de l article",
    "auteur": "Jean Dupont",
    "categorie": "Tech",
    "tags": ["test", "api"]
  }'

# Modifier un article
curl -X PUT http://localhost:3000/api/articles/1 \
  -H "Content-Type: application/json" \
  -d '{"titre": "Nouveau titre", "categorie": "Backend"}'

# Supprimer un article
curl -X DELETE http://localhost:3000/api/articles/1
```

### Validation des erreurs

```bash
# Titre manquant → 400 Bad Request
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -d '{"contenu": "Sans titre", "auteur": "Test"}'
# Réponse: {"success":false,"error":"Bad Request","messages":["Le titre est obligatoire..."]}

# Article inexistant → 404 Not Found
curl http://localhost:3000/api/articles/9999
# Réponse: {"success":false,"error":"Not Found","message":"Article avec l'ID 9999 introuvable."}
```

---

## Documentation Swagger

La documentation interactive est disponible sur **http://localhost:3000/api-docs**

Elle permet de :
- Consulter tous les endpoints avec leurs paramètres
- Tester les requêtes directement depuis le navigateur
- Voir les formats de réponse JSON

---

## Interface Web

L'interface web est accessible à **http://localhost:3000**

Fonctionnalités :
- 📋 **Liste des articles** avec filtres par catégorie, auteur et date
- ✍️ **Création** d'articles via formulaire
- ✏️ **Modification** en modal
- 🗑️ **Suppression** avec confirmation
- 🔍 **Recherche** en temps réel
- 📊 **Statistiques** (total articles, catégories, auteurs)

---

## Déploiement

### Railway

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Login et déploiement
railway login
railway init
railway up
```

### Render

1. Créer un compte sur [render.com](https://render.com)
2. Connecter le dépôt GitHub
3. Configurer : **Build Command** `npm install`, **Start Command** `npm start`
4. Déployer

---

## Structure de la base de données

```sql
CREATE TABLE articles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  titre       TEXT    NOT NULL,
  contenu     TEXT    NOT NULL,
  auteur      TEXT    NOT NULL,
  date        TEXT    NOT NULL DEFAULT (datetime('now')),
  categorie   TEXT    NOT NULL DEFAULT 'General',
  tags        TEXT    NOT NULL DEFAULT '[]',  -- JSON array
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
)
```

---

## Auteur

Projet réalisé dans le cadre du **Taf1 — INF222 EC1 (Développement Backend)**  
Encadrant : Charles Njiosseu, PhD Student
