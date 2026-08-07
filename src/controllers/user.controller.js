import * as userService from '../services/user.service.js'
export async function registerUser(req, res) {
    const user = req.body;
    const createdUser = await userService.registerUser(user);
    res.status(201).json(createdUser);
}