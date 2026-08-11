import * as studentService from '../services/student.service.js'
export async function getALLStudents(req, res) {
    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({
            status: "error",
            message: "Invalid pagination parameters. Page and limit must be positive integers, and limit cannot exceed 100."
        });
    }

    let courseId = undefined;
    if (req.query.courseId !== undefined) {
        courseId = Number(req.query.courseId);
        if (!Number.isInteger(courseId) || courseId < 1) {
            return res.status(400).json({
                status: "error",
                message: "Invalid courseId parameter. It must be a positive integer."
            });
        }
    }

    let orderBy = undefined;
    if (req.query.sort) {
        const sortParam = req.query.sort;
        const isDescending = sortParam.startsWith('-');
        const sortField = isDescending ? sortParam.substring(1) : sortParam;

        const allowedSortFields = ["id", "name", "age"];
        if (!allowedSortFields.includes(sortField)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid sort parameter. Allowed fields are: id, name, age."
            });
        }

        orderBy = { [sortField]: isDescending ? "desc" : "asc" };
    }

    const search = req.query.search;

    const students = await studentService.getAllStudents(page, limit, courseId, orderBy, search);
    res.status(200).json({
        "status": "success",
        "data": students.data,
        "meta": students.meta
    });
}

export async function getStudentById(req, res) {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ status: "error", message: "Invalid student ID" });
    }
    const student = await studentService.getStudentById(id);
    res.status(200).json({
        "status": "success",
        "data": student
    });
}

export async function createStudent(req, res) {
    const student = req.body;
    const createdStudent = await studentService.createStudent(student);
    res.status(201).json({
        "status": "success",
        "data": createdStudent
    });
}

export async function updateStudent(req, res) {
    const id = Number(req.params.id);
    const data = req.body;
    const updatedStudent = await studentService.updateStudent(id, data);
    res.status(200).json({
        "status": "success",
        "data": updatedStudent
    });
}

export async function deleteStudent(req, res) {
    const id = Number(req.params.id);
    const deletedStudent = await studentService.deleteStudent(id);
    res.status(200).json({
        "status": "success",
        "data": deletedStudent
    });
}