import bcrypt from "bcrypt";
import prisma from "../src/config/prisma.js";

async function seed() {
    await prisma.student_logs.deleteMany();
    await prisma.students.deleteMany();
    await prisma.courses.deleteMany();
    await prisma.users.deleteMany();

    const hashedPassword = await bcrypt.hash("123456", 10);
    await prisma.users.create({
        data: {
            name: "Test Admin",
            email: "hemil2@gmail.com",
            password: hashedPassword,
            role: "admin"
        }
    });

    console.log("Test database seeded");
}

seed()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
