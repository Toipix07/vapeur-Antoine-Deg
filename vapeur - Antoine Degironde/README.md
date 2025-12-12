# Vapeur - Antoine Degironde

Petit projet Node.js / Express avec PostgreSQL et Prisma, conteneurisé avec Docker.

## 🔧 Prérequis

- Node.js (>= 18)
- npm
- Docker + Docker Compose

## 📦 Installation (sans Docker)

1. Cloner le projet :

```bash
git clone <URL_DU_DEPOT>
cd "vapeur - Antoine Degironde"

    Installer les dépendances :

npm install

    Configurer la base locale :
    Créer un fichier .env à la racine :

DATABASE_URL="postgresql://vapeuruser:superpass123@localhost:5433/vapeurdb?schema=public"
DB_PASSWORD=ignored_for_now

    Lancer PostgreSQL (par Docker) :

docker compose up -d db

    Générer Prisma et pousser le schéma :

npx prisma generate
npx prisma db push

    Lancer l’appli :

node app.js

➡️ Aller sur : http://localhost:3000
🐳 Utilisation avec Docker (app + db)

    Vérifier le secret DB :

Créer ./secrets/db_password.txt contenant :

superpass123

    Lancer toute l’appli :

docker compose down -v
docker compose build --no-cache
docker compose up

L’appli est exposée sur :

    Backend : http://localhost:3000

    PostgreSQL : localhost:5433 (user vapeuruser, db vapeurdb)

📝 Commandes utiles

# Lancer uniquement la base
docker compose up -d db

# Regénérer Prisma
npx prisma generate

# Pousser le schéma Prisma
npx prisma db push

# Arrêter et tout nettoyer (conteneurs + volume DB)
docker compose down -
