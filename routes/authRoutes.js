const express = require("express")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { authSchema, loginSchema } = require("../helpers/validation_schema");

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

// Register
router.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body;
  const { error } = authSchema.validate({ name, email, password, phone });
  if (error) {
    res.status(400).send({
      error: `${error.details[0].message}`,
    });
  }
  try {
    hashed_password = await bcrypt.hash(password, 10);
    await prisma.users.create({
      data: {
        name: `${name}`,
        email: `${email}`,
        password_hash: `${hashed_password}`,
        ...(phone && { phone }),
      },
    });
    res.status(201).send({
      message: `User ${name} created! Login to continue.`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: `Internal server error. `,
      Details: `${error}`,
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const { error } = loginSchema.validate({ email, password });
  if (error) {
    res.status(400).send({
      error: `${error.details[0].message}`,
    });
    return;
  }
  try {
    const user = await prisma.users.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      res.status(404).send({
        error: `User not found!`,
      });
      return;
    } else {
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (isMatch) {
        const token = jwt.sign(
          {
            id: user.user_id,
            email: user.email,
          },
          JWT_SECRET,
          {
            expiresIn: "1h",
          }
        );
        res.status(200).send({
          message: `Successfully logged in!`,
          token,
        });
        return;
      } else {
        console.log("password-", password);
        res.status(400).send({
          error: `Wrong password!`,
        });
        return;
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      error: `Internal server error. `,
      Details: `${error}`,
    });
  }
});

module.exports = router;