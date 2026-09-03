import express from 'express'
import studentRoutes from './src/routes/student.route.js'
import userRoutes from './src/routes/user.route.js'
import courseRoutes from './src/routes/course.route.js'
import healthRoutes from './src/routes/health.route.js'
import { errorHandler } from './src/middleware/error.middleware.js'
import swaggerUi from "swagger-ui-express";
import openapiSpecification from "./src/docs/openapi.js";
import passport from "./src/config/passport.js"
import config from "./src/config/env.js";

const app = express();
app.set('trust proxy', 1);
app.use(express.json());

const swaggerUiOptions = {
    swaggerOptions: { persistAuthorization: true }
};

if (
    config.nodeEnv === "development" &&
    config.swagger?.autoAuthEmail &&
    config.swagger?.autoAuthPassword
) {
    swaggerUiOptions.customJsStr = `
(function waitForUi() {
    if (window.ui && window.ui.preauthorizeApiKey) {
        const stored = window.localStorage.getItem("bearerAuth");
        if (!stored || !stored.startsWith("Bearer ")) {
            fetch("/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: ${JSON.stringify(config.swagger.autoAuthEmail)},
                    password: ${JSON.stringify(config.swagger.autoAuthPassword)}
                })
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.token) {
                        window.ui.preauthorizeApiKey("bearerAuth", data.token);
                    }
                })
                .catch(() => {});
        }
    } else {
        setTimeout(waitForUi, 200);
    }
})();
`;
}

app.use(passport.initialize());
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openapiSpecification, swaggerUiOptions)
);
app.get('/', (req, res) => {
    res.json({ message: "Welcome to the Student API Home Directory!" });
});
app.use('/health', healthRoutes);
app.use('/students', studentRoutes);
app.use('/courses', courseRoutes);
app.use('/users', userRoutes);

// Error handling middleware must be registered after routes
app.use(errorHandler);

export default app;