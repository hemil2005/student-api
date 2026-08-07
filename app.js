import express from 'express'
import studentRoutes from './src/routes/student.route.js'
import userRoutes from './src/routes/user.route.js'
import { errorHandler } from './src/middleware/error.middleware.js'
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: "Welcome to the Student API Home Directory!" });
});

app.use('/students', studentRoutes);
app.use('/users', userRoutes);

// Error handling middleware must be registered after routes
app.use(errorHandler);

export default app;