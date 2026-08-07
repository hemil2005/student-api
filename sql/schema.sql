CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    age INT NOT NULL,
    course TEXT NOT NULL
EXPLAIN
SELECT *
FROM students
WHERE course = 'Computer Science';
select * from students;
select * from student_logs;
CREATE TABLE student_logs (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);
INSERT INTO courses(name)
VALUES
('Information Technology'),
('Mechanincal Engineering');
ADD course_id INT to students FOREIGN KEY courses;
ALTER TABLE students
ADD COLUMN course_id INT,
ADD CONSTRAINT fk_students_courses
FOREIGN KEY (course_id) REFERENCES courses(id);
select * from students;
select * from courses;
UPDATE students
SET course_id = courses.id
FROM courses
WHERE students.course = courses.name;