import * as courseService from "../services/course.service.js";
import logger from "../logger/logger.js";

export async function createCourse(req, res){
    const course = req.body;
    const createCourse = await courseService.createCourse(course);
    res.status(201).json({ message: "Course created successfully", data: createCourse });
}

export async function getCourseById(req, res){
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ status: "error", message: "Invalid course ID" });
    }
    const result = await courseService.getCourseById(id);
    res.status(200).json(result);
}

export async function getAllCourses(req, res){
    const result = await courseService.getAllCourses();
    res.status(200).json(result);
}

export async function updateCourse(req, res){
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ status: "error", message: "Invalid course ID" });
    }
    const data = req.body;
    const result = await courseService.updateCourse(id, data);
    res.status(200).json(result);
}
export async function deleteCourse(req, res){
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ status: "error", message: "Invalid course ID" });
    }
    const result = await courseService.deleteCourse(id);
    res.status(200).json(result);
}