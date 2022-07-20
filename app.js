const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const DB = require(__dirname + "/db.js");
const CONFIG = require(__dirname + "/config.js");

const app = express();

(async () => {
    var contents = await DB.loadDB(CONFIG.DIR);
    var currentContent = [];
    var currentGene = "";

    app.set("view engine", "ejs");

    app.use(cookieParser());
    app.use(bodyParser.urlencoded({extended: true}));

    app.use((req, res, next) => {
        const access_token = req.cookies.access_token;
        if(access_token === undefined) {
            if(req.path !== "/")
                res.redirect("/");
            else
                next();
        }
        else {
            jwt.verify(access_token, CONFIG.ACCESS_SECRET_KEY, (err, user) => {
                if(err)
                    return res.sendStatus(403)
                else {
                    req.user = user.name;
                    if(req.path === "/")
                        res.redirect("/gene");
                    else
                        next();
                }
            });
        }
    });

    app.use('*/js', express.static('public/js'));

    app.get("/", (req, res) => {
        res.render("home");
    });

    app.post("/", (req, res) => {
        const username = req.body.user;
        const user = {
            "name": username
        };

        const access_token = jwt.sign(user, CONFIG.ACCESS_SECRET_KEY);
        res.cookie('access_token', access_token).redirect("/gene");
    });

    app.get("/gene/", (req, res) => {
        res.render("gene", {files: Object.keys(contents), gene: "", user: req.user});
    });

    app.get("/gene/:gene", (req, res) => {
        if(req.params.gene !== currentGene) {
            currentGene = req.params.gene;
            currentContent = contents[currentGene].map(mutation => {
                return {
                    position: mutation.position,
                    protein: mutation.protein,
                    comment: mutation.comment,
                    id: mutation.id,
                    deleted: false
                };
            });
        }
        res.render("gene", {files: Object.keys(contents), content: currentContent, gene: currentGene, user: req.user});
    });

    app.get("/gene/:gene/save", (req, res) => {
        contents[currentGene] = currentContent.filter(mutation => !mutation.deleted);
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
        currentContent[req.params.id].deleted = true;
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
