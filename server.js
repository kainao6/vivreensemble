require('dotenv').config();
const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const session = require("express-session");
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');


const app = express();

const port = process.env.PORT || 500;

// Configuration de la connexion à la base de données
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

connection.connect(err => {
    if (err) {
        console.error("Erreur de connexion à la base de données :" + err.stack);
        return;
    }
    console.log("Connexion réussie à la base de données");
});

// Utiliser helmet pour sécuriser les en-têtes HTTP
app.use(helmet());

// Configurer CORS (autoriser toutes les origines dans cet exemple)
app.use(cors());

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));
// Utiliser cookie-parser middleware
app.use(cookieParser());
// Définir une route pour définir un cookie HTTP-only
app.get('/set-cookie', (req, res) => {
    // Définir un cookie appelé "session" avec l'attribut HTTP-only
    res.cookie('session', 'secret_value', {
      httpOnly: true, // Empêche l'accès par JavaScript côté client
      secure: false, // Mettre à true si tu utilises HTTPS
      maxAge: 3600000, // Durée de validité du cookie (exemple : 1 heure)
    });
  
    res.send('Cookie HTTP-only défini !');
  });
  
  // Exemple d'accès à une route protégée
  app.get('/get-cookie', (req, res) => {
    // Accéder au cookie "session"
    const sessionCookie = req.cookies['session'];
    res.send(`Votre cookie session : ${sessionCookie}`);
  });
  

  app.get('/api/users', (req, res) => {
    console.log('Requête reçue sur /api/users');
    res.send('Liste des utilisateurs');
  });
  


app.use(session({
    secret: 'test',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Mettre à true si HTTPS
}));

// Configuration du transporteur nodemailer 
const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
    port: 587,
    secure: false, // false pour STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        ciphers: 'SSLv3'
    }
});

// Vérification de l'authentification administrateur
function checkAdmin(req, res, next) {
    if (req.session.admin) {
        next(); // L'utilisateur est connecté en tant qu'administrateur
    } else {
        res.status(403).json({ success: false, message: "Accès refusé" });
    }
}

// Route pour afficher la page de connexion admin
app.get("/admin_login.html", (req, res) => {
    res.sendFile("admin_login.html", { root: __dirname });
});

// Route pour gérer la connexion admin
app.post("/admin_login", (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM admins WHERE username = ?';
    connection.query(query, [username], (err, results) => {
        if (err) {
            console.error("Erreur lors de la requête : " + err.stack);
            return res.status(500).json({ success: false, message: "Erreur du serveur" });
        }

        if (results.length > 0) {
            const admin = results[0];

            bcrypt.compare(password, admin.password, (err, isMatch) => {
                if (err) {
                    console.error("Erreur lors de la comparaison : " + err.stack);
                    return res.status(500).json({ success: false, message: "Erreur du serveur" });
                }

                if (isMatch) {
                    req.session.admin = admin.username;
                    res.json({ success: true, message: "Connexion réussie" });
                } else {
                    res.status(401).json({ success: false, message: "Nom d'utilisateur ou mot de passe incorrect" });
                }
            });
        } else {
            res.status(401).json({ success: false, message: "Nom d'utilisateur ou mot de passe incorrect" });
        }
    });
});

// Route protégée pour vérifier l'authentification
app.get("/admin_dashboard", checkAdmin, (req, res) => {
    res.redirect("/admin_dashboard.html");
});
// route deconnexion
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          return res.redirect("/admin_dashboard.html");
      }
      res.redirect("/actualite.html"); 
  });
});

// Routes pour ajouter, modifier et supprimer des articles
app.post("/add_article", checkAdmin, (req, res) => {
    const { title, content, image } = req.body;
    const query = 'INSERT INTO articles (title, content, image) VALUES (?, ?, ?)';
    connection.query(query, [title, content, image], (err, result) => {
        if (err) {
            console.error("Erreur lors de l'ajout de l'article :" + err.stack);
            return res.status(500).json({ success: false, message: "Erreur du serveur" });
        }
        res.json({ success: true, message: "Article ajouté avec succès" });
    });
});
//route modification article
app.post("/edit_article", checkAdmin, (req, res) => {
  const { id, title, content, image } = req.body;
  const query = 'UPDATE articles SET title = ?, content = ?, image = ? WHERE id = ?';
  connection.query(query, [title, content, image, id], (err, result) => {
      if (err) {
          console.error("Erreur lors de la modification de l'article :" + err.stack);
          return res.status(500).json({ success: false, message: "Erreur du serveur" });
      }
      if (result.affectedRows === 0) {
          return res.status(404).json({ success: false, message: "Article non trouvé" });
      }
      res.json({ success: true, message: "Article modifié avec succès" });
  });
});

// route pour supprimer des articles
app.delete("/delete_article", checkAdmin, (req, res) => {
    const { id } = req.query;
    const query = 'DELETE FROM articles WHERE id = ?';
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error("Erreur lors de la suppression de l'article :" + err.stack);
            return res.status(500).json({ success: false, message: "Erreur du serveur" });
        }
        res.json({ success: true, message: "Article supprimé avec succès" });
    });
});

// Route pour récupérer les articles actualite.html
app.get("/get_public_articles", (req, res) => {
  const query = 'SELECT * FROM articles ORDER BY created_at DESC';
  connection.query(query, (err, results) => {
      if (err) {
          console.error("Erreur lors de la récupération des articles : " + err.stack);
          return res.status(500).json({ success: false, message: "Erreur du serveur" });
      }
      res.json(results);
  });
});
// Route pour récupérer un article spécifique par ID pour la modification
app.get("/get_article", checkAdmin, (req, res) => {
  const { id } = req.query;
  console.log("Récupération de l'article avec ID:", id); 
  const query = 'SELECT * FROM articles WHERE id = ?';
  connection.query(query, [id], (err, results) => {
      if (err) {
          console.error("Erreur lors de la récupération de l'article : " + err.stack);
          return res.status(500).json({ success: false, message: "Erreur du serveur" });
      }
      if (results.length > 0) {
          res.json(results[0]);
      } else {
          res.status(404).json({ success: false, message: "Article non trouvé" });
      }
  });
});

// Route pour récupérer tous les articles pour le tableau de bord admin
app.get("/get_articles", checkAdmin, (req, res) => {
  const query = 'SELECT * FROM articles ORDER BY created_at DESC';
  connection.query(query, (err, results) => {
      if (err) {
          console.error("Erreur lors de la récupération des articles : " + err.stack);
          return res.status(500).json({ success: false, message: "Erreur du serveur" });
      }
      res.json(results);
  });
});


// Route pour vérifier si l'utilisateur est admin
app.get("/check_admin", (req, res) => {
    if (req.session.admin) {
        res.json({ isAdmin: true });
    } else {
        res.json({ isAdmin: false });
    }
});


// Routes pour servir les fichiers statiques (à adapter selon vos besoins)
app.get("/", (req, res) => {
    res.sendFile("./menu.html", { root: __dirname });
});

app.get("/menu.html", (req, res) => {
    res.sendFile("./menu.html", { root: __dirname });
});

app.get("/actualite.html", (req, res) => {
    res.sendFile("./actualite.html", { root: __dirname });
});

app.get("/partenaire.html", (req, res) => {
    res.sendFile("./partenaire.html", { root: __dirname });
});

app.get("/don.html", (req, res) => {
    res.sendFile("./don.html", { root: __dirname });
});

app.get("/engage.html", (req, res) => {
    res.sendFile("./engage.html", { root: __dirname });
});

app.get("/header.html", (req, res) => {
    res.sendFile("./header.html", { root: __dirname });
});

app.get("/footer.html", (req, res) => {
    res.sendFile("./footer.html", { root: __dirname });
});

app.get("/popup.html", (req, res) => {
    res.sendFile("./popup.html", { root: __dirname });
});

app.get("/menu.css", (req, res) => {
    res.sendFile("./menu.css", { root: __dirname });
});

app.get("/actualite.css", (req, res) => {
    res.sendFile("./actualite.css", { root: __dirname });
});

app.get("/don.css", (req, res) => {
    res.sendFile("./don.css", { root: __dirname });
});

app.get("/partenaire.css", (req, res) => {
    res.sendFile("./partenaire.css", { root: __dirname });
});

app.get("/engage.css", (req, res) => {
    res.sendFile("./engage.css", { root: __dirname });
});

app.get("/menu.js", (req, res) => {
    res.sendFile("./menu.js", { root: __dirname });
});

app.get("/partenaire.js", (req, res) => {
    res.sendFile("./partenaire.js", { root: __dirname });
});

app.get("/engage.js", (req, res) => {
    res.sendFile("./engage.js", { root: __dirname });
});

app.get("/malv.js", (req, res) => {
    res.sendFile("./malv.js", { root: __dirname });
});

app.get("/include.js", (req, res) => {
    res.sendFile("./include.js", { root: __dirname });
});

app.get("/popup.js", (req, res) => {
    res.sendFile("./popup.js", { root: __dirname });
});

  
  // Route pour gérer l'inscription à la newsletter
app.post("/subscribe", (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "L'email est requis." });
    }

    const query = 'INSERT INTO subscribers (email) VALUES (?)';
    connection.query(query, [email], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, message: "Cet email est déjà inscrit." });
            }
            return res.status(500).json({ success: false, message: "Erreur du serveur." });
        }
        res.json({ success: true, message: "Inscription réussie." });
    });
});

// Route pour gérer le formulaire de bénévolat
app.post("/volunteer", (req, res) => {
    const { civility, lastname, firstname, age, address, city, postalcode, mail, phone, motivation } = req.body;

    if (!lastname || !firstname || !age || !address || !city || !postalcode || !mail || !phone) {
        return res.status(400).json({ success: false, message: "Tous les champs requis doivent être remplis" });
    }

    const query = 'INSERT INTO volunteers (civility, lastname, firstname, age, address, city, postalcode, mail, phone, motivation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(query, [civility, lastname, firstname, age, address, city, postalcode, mail, phone, motivation], (err, result) => {
        if (err) {
            console.error("Erreur lors de l'insertion : " + err.stack);
            return res.status(500).json({ success: false, message: "Erreur du serveur" });
        }

        // Envoi de l'email à l'administrateur
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'marly.vivrensemble@outlook.com',
            subject: 'Nouvelle demande de bénévolat',
            text: `Nouvelle demande de bénévolat :
            Nom : ${civility} ${lastname} ${firstname}
            Âge : ${age}
            Adresse : ${address}, ${city}, ${postalcode}
            Email : ${mail}
            Téléphone : ${phone}
            Motivation : ${motivation}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi de l\'email' });
            } else {
                res.json({ success: true, message: 'Demande envoyée avec succès et email envoyé' });
            }
        });
    });
});

app.listen(port, () => {
    console.log(`Serveur en ligne sur le port ${port}`);
});
