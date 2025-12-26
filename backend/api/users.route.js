import express from "express";
import UsersController from "./users.controller.js";

const router = express.Router();

router.post("/register", UsersController.apiRegister);
router.post("/login", UsersController.apiLogin);
router.delete("/:username", UsersController.deleteUser);

export default router;
