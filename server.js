import 'dotenv/config';
import app from './app.js';
import pool from './src/config/database.js'

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
const result = await pool.query("SELECT NOW();")