import UsersDAO from "../dao/UsersDAO.js";

export default class UsersController {
  static async apiRegister(req, res) {
  console.log("Registering user with data:", req.body);
  try {
    const result = await UsersDAO.register(req.body);

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    res.status(201).json({ message: "User created", userId: result.insertedId });
  } catch (e) {
    console.error("Registration error:", e);
      res.status(500).json({ error: e.message });
  }
}

static async apiLogin(req, res) {
  try {
    const user = await UsersDAO.login(req.body);

    if (user.error) {
      return res.status(401).json({ message: user.error });
    }
    console.log("User logged in successfully:", user._id);

    res.status(200).json({ message: "Login successful", user });
  } catch (e) {
    console.error("Login error:", e);
      res.status(500).json({ error: e.message });
  }
}
static async deleteUser(req, res) {
  try {
    const username = req.params.username;
    const result = await UsersDAO.deleteUser(username);

    if (result.error) {
      return res.status(400).json({ message: result.error });
    }

    res.status(200).json({ message: result.message });
  } catch (e) {
    console.error("Deletion error:", e);
      res.status(500).json({ error: e.message });
  }
}

}
