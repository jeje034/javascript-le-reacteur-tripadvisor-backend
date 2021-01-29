require("dotenv").config(); // Permet d'activer les variables d'environnement qui se trouvent dans le fichier `.env`
const express = require("express");
const formidableMiddleware = require("express-formidable");
const cors = require("cors");
const app = express();
app.use(formidableMiddleware());
app.use(cors());

const mailgun = require("mailgun-js");

const DOMAIN = process.env.MAILGUN_DOMAIN;
const mg = mailgun({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: DOMAIN,
});

app.post("/contact", (req, res) => {
    try {
        console.log(req.fields);

        const data = {
            from: `${req.fields.firstname} ${req.fields.lastname} <${req.fields.email}>`,
            to: process.env.EMAIL_RECIPIENT,
            subject: req.fields.subject,
            text: req.fields.message,
        };
        mg.messages().send(data, function (error, body) {
            console.log(body);
        });

        // You can see a record of this email in your logs: https://app.mailgun.com/app/logs.

        // You can send up to 300 emails/day from this sandbox server.
        // Next, you should add your own domain so you can send 10000 emails/month for free.

        res.status(200).json({ message: "Email sent." });
    } catch (error) {
        res.status(400).json({ message: { error: error.message } });
    }
});

//Pour gérer les pages introuvables (à ajouter juste avant le app.listen)
app.all("*", function (req, res) {
    res.json({ message: "Page not found" });
});

// Démarrer le serveur avec écoutes des requêtes du port 3000. Le `app.listen` doit se trouver après les déclarations des routes
app.listen(process.env.PORT, () => {
    console.log("Server has started");
});
