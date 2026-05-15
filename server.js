const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

const UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

const StudentSchema = new mongoose.Schema({
    name: String,
    email: String,
    course: String,
    age: Number
});

const User = mongoose.model("User", UserSchema);
const Student = mongoose.model("Student", StudentSchema);

app.get("/", (req, res) => {
    res.render("index");
});

app.post("/submit", async (req, res) => {
    const { name, email, course, age } = req.body;

    await Student.create({ name, email, course, age });

    res.render("result", { name, email, course, age });
});

app.get("/api/students", async (req, res) => {
    const students = await Student.find();
    res.json(students);
});

app.get("/signup", (req, res) => {
    res.send(`
        <form method="POST" action="/signup">
            <input name="username" placeholder="Username" />
            <input name="password" type="password" placeholder="Password" />
            <button>Signup</button>
        </form>
    `);
});

app.post("/signup", async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    await User.create({
        username: req.body.username,
        password: hashedPassword
    });

    res.send("User registered");
});

app.get("/login", (req, res) => {
    res.send(`
        <form method="POST" action="/login">
            <input name="username" placeholder="Username" />
            <input name="password" type="password" placeholder="Password" />
            <button>Login</button>
        </form>
    `);
});

app.post("/login", async (req, res) => {
    const user = await User.findOne({ username: req.body.username });

    if (!user) return res.send("User not found");

    const valid = await bcrypt.compare(req.body.password, user.password);

    if (!valid) return res.send("Wrong password");

    req.session.user = user;
    res.send("Login successful");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});