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