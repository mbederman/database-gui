const express = require("express");
const bodyParser = require("body-parser");

const DB = require(__dirname + "/db.js");
const CONFIG = require(__dirname + "/config.js");

const app = express();

(async () => {
    var contents = await DB.loadDB(CONFIG.DIR);
    var currentContent = [];
    var currentGene = "";
    var user = "";

    app.set("view engine", "ejs");

    app.use(bodyParser.urlencoded({extended: true}));
    app.use('*/js', express.static('public/js'));

    app.get("/", (req, res) => {
        res.render("home");
    });

    app.post("/", (req, res) => {
        user = req.body.user;
        res.redirect("/gene");
    });

    app.get("/gene/", (req, res) => {
        res.render("gene", {files: Object.keys(contents), gene: "", user: user});
    });

    app.get("/gene/:gene", (req, res) => {
        if(req.params.gene !== currentGene) {
            currentGene = req.params.gene;
            currentContent = contents[currentGene].map(mutation => {
                return {
                    position: mutation.position,
                    protein: mutation.protein,
                    comment: mutation.comment,
                    id: mutation.id
                };
            });
        }
        res.render("gene", {files: Object.keys(contents), content: currentContent, gene: currentGene, user: user});
    });

    app.get("/gene/:gene/save", (req, res) => {
        contents[currentGene] = currentContent;
        DB.saveToDB(CONFIG.DIR, currentGene, currentContent);
        res.redirect("/gene/" + currentGene);
    });

    app.get("/gene/:gene/add", (req, res) => {
        res.render("add", {gene: currentGene});
    });

    app.post("/gene/:gene/add", (req, res) => {
        const id = currentContent.length == 0 ? 0 : (currentContent.at(-1).id + 1);
        currentContent.push({
            position: req.body.position,
            protein: req.body.protein,
            comment: req.body.comment,
            id: id
        });

        res.redirect("/gene/" + currentGene);
    });

    app.get("/gene/:gene/:id/edit", (req, res) => {
        res.render("edit", {gene: currentGene, content: currentContent[req.params.id]});
    });

    app.post("/gene/:gene/:id/edit", (req, res) => {
        const id = req.params.id;
        currentContent[id].position = req.body.position;
        currentContent[id].protein = req.body.protein;
        currentContent[id].comment = req.body.comment;
        res.redirect("/gene/" + req.params.gene);
    });

    app.get("/gene/:gene/:id/delete", (req, res) => {
        currentContent = currentContent.filter(mutation => mutation.id !== Number(req.params.id));
        res.redirect("/gene/" + currentGene);
    });

    app.get("/commit", (req, res) => {
        DB.commitDB(CONFIG.DIR);
        res.redirect("/gene");
    });

    app.listen(3000, () => {
        console.log("Running on local host 3000");
    });
    
})();

