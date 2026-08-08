import * as userService from '../services/user.service.js'
export async function registerUser(req, res) {
    const user = req.body;
    const createdUser = await userService.registerUser(user);
    res.status(201).json(createdUser);
}

export async function loginUser(req, res) {
    const { email, password } = req.body;
    const result = await userService.loginUser(email, password);
    res.status(200).json(result);
}

export async function grantAdminAccess(req, res) {
    const userID = Number(req.params.id);
    const updatedUser = await userService.grantAdminAccess(userID);
    res.status(200).json({
        message: "Admin access granted successfully",
        user: updatedUser
    });
}