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

export async function googleLogin(req, res) {
    const result = await userService.generateUserTokens(req.user);
    res.status(200).json(result);
}


export async function grantAdminAccess(req, res) {
    const userID = Number(req.params.id);
    if (isNaN(userID)) {
        return res.status(400).json({ status: "error", message: "Invalid user ID" });
    }
    const updatedUser = await userService.grantAdminAccess(userID);
    res.status(200).json({
        message: "Admin access granted successfully",
        user: updatedUser
    });
}

export async function refreshToken(req, res) {

    const userId = req.user.id;           // set by authenticateRefresh middleware
    const { refresh_token } = req.body;
    const result = await userService.refreshToken(userId, refresh_token);
    res.status(200).json({
        status: "success",
        token: result.token,
        refresh_token: result.refresh_token
    });
}
