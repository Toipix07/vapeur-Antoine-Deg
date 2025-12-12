# 🌬️ Vapeur - Antoine Degironde

Projet Node.js / Express avec Prisma et PostgreSQL, entièrement conteneurisé via Docker.  
Développé dans le cadre du BUT Informatique 3ᵉ année — projet fullstack web.

---

## 🚀 Fonctionnalités

- Application web Node.js / Express  
- Base de données PostgreSQL gérée via Prisma ORM  
- Synchronisation automatique du schéma (`npx prisma db push`) au démarrage  
- Gestion Docker complète (app + base de données)  
- Génération automatique des genres par défaut au lancement  
- Interface accessible sur [http://localhost:3000](http://localhost:3000)

---

## 🧱 Structure du projet

📁 vapeur - Antoine Degironde
├── app.js # Point d’entrée principal Node.js
├── Dockerfile # Image de l’application Node
├── docker-compose.yaml # Stack Docker (app + PostgreSQL)
├── prisma/
│ ├── schema.prisma # Schéma de la base de données
│ └── migrations/ # Migrations Prisma
├── secrets/
│ └── db_password.txt # Mot de passe PostgreSQL utilisé par Docker
├── start.sh # Script de démarrage du conteneur app
├── package.json
├── .env # Variables d’environnement locales
└── README.md


---

## ⚙️ Installation (en local avec Docker)

> 🧠 Prérequis : Docker Desktop installé et en fonctionnement.

1. **Clone le dépôt**

```bash
git clone https://github.com/Antoine-Degironde/vapeur-Antoine-Deg.git
cd "vapeur - Antoine Degironde"

    Assure-toi que ton fichier .env contient :

DATABASE_URL="postgresql://vapeuruser:superpass123@localhost:5433/vapeurdb?schema=public"
DB_PASSWORD=ignored_for_now

    Fichier secret Docker :

Crée (ou vérifie) ./secrets/db_password.txt :

superpass123

    Lance tout avec Docker Compose :

docker compose down -v
docker compose build --no-cache
docker compose up

🧩 Détails techniques
🐘 Base de données

La base PostgreSQL est configurée via docker-compose.yaml :

db:
  image: postgres:16
  environment:
    POSTGRES_USER: vapeuruser
    POSTGRES_PASSWORD: superpass123
    POSTGRES_DB: vapeurdb
  ports:
    - "5433:5432"
  volumes:
    - db_data:/var/lib/postgresql/data

Accessible depuis le host :

Host : localhost
Port : 5433
User : vapeuruser
Password : superpass123
Database : vapeurdb

🧰 Démarrage automatique (start.sh)

Le conteneur app exécute ce script au démarrage :

#!/bin/sh
set -e
echo "Reading DB password from /run/secrets/db_password..."

if [ -f /run/secrets/db_password ]; then
  DB_PASSWORD=$(tr -d '\r\n' < /run/secrets/db_password)
  export DATABASE_URL="postgresql://vapeuruser:${DB_PASSWORD}@db:5432/vapeurdb?schema=public"
fi

echo "Waiting a bit for PostgreSQL to be ready..."
sleep 5

echo "Syncing Prisma schema..."
npx prisma db push

echo "Starting Node app..."
node app.js

🧪 Tests rapides
1. Vérifie que les conteneurs tournent :

docker ps

Tu dois voir :

vapeur-app   ...:3000->3000/tcp
vapeur-db    ...:5433->5432/tcp

2. Ouvre l’application :

➡️ http://localhost:3000
🛠️ Dépannage
❌ Erreur Authentication failed ou User was denied access

➡️ Supprime le volume Docker (recrée la base proprement) :

docker compose down -v
docker compose up -d db

Puis :

npx prisma generate
npx prisma db push

❌ Erreur exec /usr/local/bin/docker-entrypoint.sh: exec format error

➡️ Cela arrivait quand Docker utilisait l’entrypoint par défaut de Node.
Corrigé grâce à ce Dockerfile :

ENTRYPOINT ["sh", "./start.sh"]

❌ Prisma ne se connecte pas

➡️ Vérifie que ton .env et db_password.txt utilisent le même mot de passe
et que ton start.sh est bien en format LF (Unix).
👨‍💻 Auteur

Antoine Degironde
Étudiant en 3ᵉ année de BUT Informatique (spécialité Informatique Graphique)

    Projet académique — développement fullstack avec Prisma & Docker

🧾 Licence

Projet académique — utilisation libre à but pédagogique.
