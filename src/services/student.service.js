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
    const result = await pool.query("INSERT INTO students (name, age, course) VALUES ($1, $2, $3) RETURNING *;", [student.name, student.age, student.course]);
    if (result.rows.length === 0) {
        logger.error("Student not found");
        throw new NotFoundError("Student not found");
    }
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
