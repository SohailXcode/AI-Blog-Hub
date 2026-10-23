const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const test = require("node:test");
const express = require("express");
const bcrypt = require("bcryptjs");
const authRoutes = require("../routes/authRoutes");

const usersFilePath = path.join(__dirname, "../data/users.json");

test("registration validates input, hashes passwords, hides them, and rejects duplicates", async () => {
  const originalUsersFile = await fs.readFile(usersFilePath);
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);
  const server = app.listen(0, "127.0.0.1");

  try {
    await new Promise((resolve) => server.once("listening", resolve));
    const url = `http://127.0.0.1:${server.address().port}/api/auth/register`;
    const invalidResponse = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Test User", email: "test@example.com" }),
    });
    assert.equal(invalidResponse.status, 400);

    const payload = {
      name: "Test User",
      email: "Test@Example.com",
      password: "test-password",
    };
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const user = await response.json();

    assert.equal(response.status, 201);
    assert.equal(user.email, "test@example.com");
    assert.equal(Object.hasOwn(user, "password"), false);

    const storedUsers = JSON.parse(await fs.readFile(usersFilePath, "utf8"));
    assert.equal(storedUsers.length, 1);
    assert.notEqual(storedUsers[0].password, payload.password);
    assert.equal(await bcrypt.compare(payload.password, storedUsers[0].password), true);

    const duplicateResponse = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, email: "test@example.com" }),
    });
    assert.equal(duplicateResponse.status, 409);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await fs.writeFile(usersFilePath, originalUsersFile);
  }
});