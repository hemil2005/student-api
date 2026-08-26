import express from 'express'
import studentRoutes from './src/routes/student.route.js'
import userRoutes from './src/routes/user.route.js'
import courseRoutes from './src/routes/course.route.js'
import { errorHandler } from './src/middleware/error.middleware.js'
import swaggerUi from "swagger-ui-express";
import openapiSpecification from "./src/docs/openapi.js";
const app = express();
app.use(express.json());
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openapiSpecification)
);
app.get('/', (req, res) => {
    res.json({ message: "Welcome to the Student API Home Directory!" });
});

app.use('/students', studentRoutes);
app.use('/courses', courseRoutes);
app.use('/users', userRoutes);

// Error handling middleware must be registered after routes
app.use(errorHandler);

export default app;