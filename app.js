require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

// Config JSON response

app.use(express.json());

// Models

const User = require("./models/User");

app.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem vindo a nossa API!" });
});

// Credencials

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

// Register User

app.post("/auth/register", async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;
  if (!name) {
    return res.status(422).json({ msg: "O nome é obrigatório!" });
  }

  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatório!" });
  }

  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatória!" });
  }

  if (password !== confirmpassword) {
    return res.status(422).json({ msg: "As senhas não conferem!" });
  }

  // Check if User Exists

  const userExists = await User.findOne({ email: email });

  if (userExists) {
    return res
      .status(200)
      .json({ msg: "Usuário já existe, por favor utilize outro e-mail!" });
  }

  // Create Password

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create User

  const user = new User({
    name,
    email,
    password: passwordHash,
  });

  try {
    await user.save();
    res.status(201).json({ msg: "Usuário criado com sucesso!" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ mgs: "Erro interno no servidor, tente novamente mais tarde!" });
  }
});

mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@cluster0.n066ec1.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3000);
    console.log("Conectado");
  })
  .catch((err) => console.log(err));
