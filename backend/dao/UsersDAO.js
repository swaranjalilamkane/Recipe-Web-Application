import mongodb from "mongodb";
import bcrypt from "bcryptjs";
const ObjectId = mongodb.ObjectId;

let users;

export default class UsersDAO {
  static async injectDB(conn) {
    if (users) return;
    try {
      users = await conn.db(process.env.RECIPES_DB_NAME).collection("users");
    } catch (e) {
      console.error(`Unable to connect to users collection: ${e}`);
    }
  }

  // Register a new user
  static async register({ username, email, password, isAdmin = false }) {
    try {
      const existingUser = await users.findOne({ email });
      if (existingUser) {
        return { error: "User already exists with this email" };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await users.insertOne({
        username,
        email,
        password: hashedPassword,
        isAdmin: isAdmin,
        favorites: [],
      });

      return { insertedId: result.insertedId };
    } catch (e) {
      console.error("Error in register:", e);
      return { error: "Registration failed" };
    }
  }

  // Login user
  static async login({ email, password }) {
    try {
      const user = await users.findOne({ email });
      if (!user) {
        return { error: "Invalid email or password" };
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { error: "Invalid email or password" };
      }

      return {
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        favorites: user.favorites,
      };
    } catch (e) {
      console.error("Error in login:", e);
      return { error: "Login failed" };
    }
  }
  static async deleteUser(username) {
    try {
      const result = await users.deleteOne({ username });
      if (result.deletedCount === 0) {
        return { error: "User not found" };
      }
      return { message: "User deleted successfully" };
    }
    catch (e) {
      console.error("Error in deleteUser:", e);
      return { error: "Failed to delete user" };
    }
  }

}
