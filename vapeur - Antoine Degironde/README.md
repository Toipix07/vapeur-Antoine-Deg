# Vapeur

Vapeur est une application web permettant de gérer une collection de jeux vidéo.

## Installation et lancement

### Prérequis
- **Node.js** installé
- **SQLite** pour la base de données

### Installation
1. Clone le projet sur ta machine :
   ```bash
   git clone <URL_DU_REPO>
   cd <NOM_DU_PROJET>
   ```

2. Installe les dépendances nécessaires :
   ```bash
   npm install
   ```

### Lancement du serveur

Pour démarrer l'application, utilise la commande suivante :
   ```bash
   node app.js
   ```

### Accès à l'application

Ouvre ton navigateur et accède à : [http://localhost:3000](http://localhost:3000)

## Fonctionnalités

- **Jeux** : ajouter, modifier, supprimer, lister et afficher les détails.
- **Genres** : lister les genres et les jeux associés.
- **Éditeurs** : ajouter, modifier, supprimer, lister les éditeurs et les jeux associés.
- **Mise en avant** : possibilité d'afficher un jeu sur la page d'accueil.
- Les listes sont triées par ordre alphabétique.

## Technologies utilisées

- **Node.js** avec **Express.js** (serveur web)
- **Prisma** (ORM pour SQLite)
- **Handlebars** (moteur de template)
