const express = require("express");
const fs = require("fs");
const path = require("path");
const PORT = process.env.PORT || 3001;
const noted = require("./db/db.json");
const uuid = require("./helpers/uuid.js")

const app = express();

app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT}`)
)

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));


app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, './public/notes.html'))
);

app.get('/notes', (req, res) => {
    res.status(200).json(noted);
})

app.get("/api/notes", (req, res) => {
    fs.readFile("./db/db.json", "utf8", (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json(err);
        } else {
            res.status(200).json(JSON.parse(data));
        }
    });
});

app.post("/api/notes", async (req, res) => {
    console.info(`${req.method} `)

    const { title, text } = req.body

    if (title && text) {
        await inputAppend({ ...req.body, id: uuid() }, "./db/db.json");
        res.status(200).send("Post /api/notes success");
    } else {
        res.status(400).send("Bad request");
    }
});

app.delete("/api/notes/:id", (req, res) => {
    const id = req.params.id;
    console.log("delete note", id);
    fs.readFile("./db/db.json", "utf8", (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json(err);
        } else {
            let oldNotes = JSON.parse(data);
            let noted = oldNotes.filter((note) => note.id != id);
            writeToFile("./db/db.json", noted);
            res.status(200).json(noted);
        }
    });
});

const inputAppend = (input, file) => {
    fs.readFile(file, "utf8", (err, data) => {
        if (err) {
            console.error(err)
        } else {
            const dataInput = JSON.parse(data);
            dataInput.push(input);
            writeToFile(file, dataInput);
        }
    })
};
const writeToFile = (print, input) =>
    fs.writeFile(print, JSON.stringify(input, null, 4), (err) =>
        err ? console.error(err) : console.info(`\nData written to ${print}`)
    );

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "index.html")))