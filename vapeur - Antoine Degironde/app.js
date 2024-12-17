require('dotenv').config();
const express = require('express');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const hbs = require('express-handlebars');
const helpers = require('./utils/helpers'); 
const handlebars = require('handlebars');


// Initialise l'application Express
const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

// Liste des genres par défaut
const defaultGenres = ['Action', 'Aventure', 'RPG', 'Simulation', 'Sport', 'MMORPG'];

// Définir le helper 'ifEquals'
handlebars.registerHelper('ifEquals', function(a, b, options) {
    if (a == b) {
        return options.fn(this); 
    } else {
        return options.inverse(this);
    }
});

// Fonction pour insérer les genres par défaut dans la base de données
async function createDefaultGenres() {
    for (const genre of defaultGenres) {
        await prisma.genre.upsert({
            where: { name: genre },
            update: {},
            create: { name: genre }
        });
    }
}

// Crée les genres par défaut au démarrage de l'application
createDefaultGenres().catch(e => {
    console.error(e);
    process.exit(1);
});

// Configuration Handlebars
app.engine('hbs', hbs.engine({ extname: '.hbs', helpers }));
app.set('view engine', 'hbs');

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Routes

// Route pour afficher la page d'accueil avec tous les jeux
app.get('/', async (req, res) => {
    try {
        const games = await prisma.game.findMany({
            include: { genre: true, editor: true },  
            orderBy: { title: 'asc' },              
        });
        res.render('index', { games });           
    } catch (error) {
        console.error('Erreur lors de la récupération des jeux:', error);
        res.status(500).send('Erreur serveur');
    }
});



app.get('/games', async (req, res) => {
    const games = await prisma.game.findMany({
        include: { genre: true, editor: true },
        orderBy: { title: 'asc' },
    });
    res.render('games', { games });  
});


app.get('/games/create', async (req, res) => {
    const genres = await prisma.genre.findMany();
    const editors = await prisma.editor.findMany();
    res.render('gameCreate', { genres, editors });
});

app.get('/games/:id', async (req, res) => {
    const gameId = parseInt(req.params.id);

    try {
        const game = await prisma.game.findUnique({
            where: { id: gameId },
            include: { genre: true, editor: true },
        });

        if (!game) {
            return res.status(404).send('Jeu non trouvé');
        }

        res.render('game-details', { game });
    } catch (error) {
        console.error('Erreur lors de la récupération du jeu :', error);
        res.status(500).send('Erreur serveur');
    }
});




app.post('/games/create', async (req, res) => {
    const { title, description, releaseDate, genreId, editorId } = req.body;

    try {
        const newGame = await prisma.game.create({
            data: {
                title,
                description,
                releaseDate: new Date(releaseDate), 
                genre: { connect: { id: parseInt(genreId) } },
                editor: { connect: { id: parseInt(editorId) } },
            },
        });
        res.redirect(`/games/${newGame.id}`);
    } catch (error) {
        console.error('Error while creating the game:', error);
        res.status(500).send('Erreur lors de la création du jeu');
    }
});

// Route pour afficher le formulaire d'édition d'un jeu
app.get('/games/:id/edit', async (req, res) => {
    const gameId = parseInt(req.params.id);

    try {
        const game = await prisma.game.findUnique({
            where: { id: gameId },
            include: { genre: true, editor: true },
        });

        if (!game) {
            return res.status(404).send('Jeu non trouvé');
        }

        const genres = await prisma.genre.findMany();
        const editors = await prisma.editor.findMany();

        res.render('gameEdit', { game, genres, editors });
    } catch (error) {
        console.error('Erreur lors de la récupération du jeu pour édition:', error);
        res.status(500).send('Erreur serveur');
    }
});

// Route pour mettre à jour un jeu
app.post('/games/:id/edit', async (req, res) => {
    const gameId = parseInt(req.params.id);
    const { title, description, releaseDate, genreId, editorId } = req.body;

    try {
        const updatedGame = await prisma.game.update({
            where: { id: gameId },
            data: {
                title,
                description,
                releaseDate: new Date(releaseDate),
                genre: { connect: { id: parseInt(genreId) } },
                editor: { connect: { id: parseInt(editorId) } },
            },
        });

        res.redirect(`/games/${updatedGame.id}`);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du jeu:', error);
        res.status(500).send('Erreur lors de la mise à jour du jeu');
    }
});


// Route pour supprimer un jeu
app.post('/games/:id/delete', async (req, res) => {
    const gameId = parseInt(req.params.id);

    try {
        await prisma.game.delete({
            where: { id: gameId },
        });
        res.redirect('/games'); 
    } catch (error) {
        console.error('Erreur lors de la suppression du jeu:', error);
        res.status(500).send('Erreur lors de la suppression du jeu');
    }
});





// Route pour afficher la liste des genres
app.get('/genres', async (req, res) => {
    const genres = await prisma.genre.findMany({
        orderBy: { name: 'asc' },
    });
    res.render('genres', { genres });
});

// Route pour afficher la liste des éditeurs
app.get('/editors', async (req, res) => {
    const editors = await prisma.editor.findMany({
        orderBy: { name: 'asc' },
    });
    include: {
        games: true 
    }
    res.render('editors', { editors });
});

app.get('/editors/create', (req, res) => {
    console.log('La route pour créer un éditeur a été atteinte');
    res.render('editorsCreate');
});


// Route pour traiter la soumission du formulaire de création d'éditeur
app.post('/editors/create', async (req, res) => {
    const { name } = req.body;

    try {
        const newEditor = await prisma.editor.create({
            data: {
                name,
            },
        });
        res.redirect(`/editors`);  
    } catch (error) {
        res.status(500).send('Erreur lors de la création de l\'éditeur');
    }
});

// Route pour afficher un éditeur spécifique (GET)
app.get('/editors/:id', async (req, res) => {
    const editorId = parseInt(req.params.id); 
    try {
        // Récupérer l'éditeur depuis la base de données
        const editor = await prisma.editor.findUnique({
            where: { id: editorId },
            include: { games: true }, 
        });

        // Vérifie si l'éditeur existe
        if (!editor) {
            return res.status(404).send('Éditeur non trouvé');
        }

        // Afficher la page avec les informations de l'éditeur
        res.render('editorDetail', { editor });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération de l\'éditeur');
    }
});


// Route pour afficher le formulaire d'édition de l'éditeur (GET)
app.get('/editors/:id/edit', async (req, res) => {
    const editorId = parseInt(req.params.id);
    try {
        const editor = await prisma.editor.findUnique({
            where: { id: editorId }
        });
        if (!editor) {
            return res.status(404).send('Éditeur non trouvé');
        }
        res.render('editorEdit', { editor }); 
    } catch (error) {
        res.status(500).send('Erreur de récupération de l\'éditeur');
    }
});

// Route pour traiter la soumission du formulaire d'édition de l'éditeur (POST)
app.post('/editors/:id/edit', async (req, res) => {
    const editorId = parseInt(req.params.id);
    const { name } = req.body; 

    try {
        const updatedEditor = await prisma.editor.update({
            where: { id: editorId },
            data: { name: name }
        });
        res.redirect(`/editors/${updatedEditor.id}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la mise à jour de l\'éditeur');
    }
});

// Route pour supprimer un éditeur spécifique
app.post('/editors/:id/delete', async (req, res) => {
    const editorId = parseInt(req.params.id); 
    try {
        // Supprimer les jeux associés à cet éditeur (optionnel)
        await prisma.game.deleteMany({
            where: { editorId: editorId },
        });

        // Supprimer l'éditeur
        await prisma.editor.delete({
            where: { id: editorId },
        });

        // Rediriger vers la liste des éditeurs après la suppression
        res.redirect('/editors');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la suppression de l\'éditeur');
    }
});


// Lancer le serveur
app.listen(port, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});

// Configuration Handlebars
app.engine('hbs', hbs.engine({ extname: '.hbs', helpers }));
app.set('view engine', 'hbs'); 

// Configuration du répertoire des vues
app.set('views', path.join(__dirname, 'views'));
