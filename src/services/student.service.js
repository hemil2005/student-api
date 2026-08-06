import logger from '../logger/logger.js';
import NotFoundError from "../errors/NotFoundError.js";
import ConflictError from "../errors/ConflictError.js";
import pool from '../config/database.js';

export async function getAllStudents() {
    logger.info("Fetching all students");
    const result = await pool.query("SELECT * FROM students;");
    return result.rows;
}

export async function getStudentById(id) {
    logger.info("Getting student by id");
    const result = await pool.query("SELECT * FROM students WHERE id = $1;", [id]);
    if (result.rows.length === 0) {
        logger.error("Student not found");
        throw new NotFoundError("Student not found");
    }
    return result.rows[0];
}

export async function createStudent(student) {
    logger.info("Creating student");
    const check = await pool.query("SELECT * FROM students WHERE name = $1 AND age = $2 AND course = $3;", [student.name, student.age, student.course]);
    if (check.rows.length > 0) {
        logger.error("Student already exists");
        throw new ConflictError("Student already exists");
    }
    const result = await pool.query("INSERT INTO students (name, age, course) VALUES ($1, $2, $3) RETURNING *;", [student.name, student.age, student.course]);
    return result.rows[0];
}

export async function updateStudent(id, data) {
    logger.info("Updating student");
    const result = await pool.query("UPDATE students SET name = COALESCE($1, name), age = COALESCE($2, age), course = COALESCE($3, course) WHERE id = $4 RETURNING *;", [data.name, data.age, data.course, id]);
    if (result.rows.length === 0) {
        logger.error("Student not found");
        throw new NotFoundError("Student not found");
    }
    return result.rows[0];
}

export async function deleteStudent(id) {
    logger.info("Deleting student");
    const result = await pool.query("DELETE FROM students WHERE id = $1 RETURNING *;", [id]);
    if (result.rows.length === 0) {
        logger.error("Student not found");
        throw new NotFoundError("Student not found");
    }
    return result.rows[0];
}

export async function createStudentWithLog(student) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await client.query("INSERT INTO students (name, age, course) VALUES ($1, $2, $3) RETURNING *;", [student.name, student.age, student.course]);
        await client.query("INSERT INT student_logs(student_id, action) VALUES ($1, $2);", [result.rows[0].id, "Student created"]);
        await client.query("COMMIT");
        return result.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}