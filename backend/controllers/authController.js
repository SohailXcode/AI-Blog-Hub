const { randomUUID } = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const bcrypt = require("bcryptjs");

const usersFilePath = path.join(__dirname, "../data/users.json");

async function register(req, res) {
  const { name, email, password } = req.body || {};

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const fileContents = await fs.readFile(usersFilePath, "utf8");
    const users = fileContents.trim() ? JSON.parse(fileContents) : [];

    if (!Array.isArray(users)) {
      throw new Error("Users data must be a JSON array.");
    }

    const emailExists = users.some(
      (user) => typeof user.email === "string" && user.email.toLowerCase() === normalizedEmail,
    );

    if (emailExists) {
      return res.status(409).json({ message: "An account with that email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      password: passwordHash,
    };

    users.push(newUser);
    await fs.writeFile(usersFilePath, `${JSON.stringify(users, null, 2)}\n`);

    return res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    });
  } catch (error) {
    console.error("Failed to register user:", error);
    return res.status(500).json({ message: "Unable to register user." });
  }
}

module.exports = { register };