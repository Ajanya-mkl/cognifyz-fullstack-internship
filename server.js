const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

let users = [];

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/submit", (req, res) => {
    const { name, email, course, age } = req.body;

    if (!name || !email || !course || !age) {
        return res.send("All fields are required!");
    }

    users.push({ name, email, course, age });

    res.render("result", {
        name,
        email,
        course,
        age
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});