-- AddForeignKey
ALTER TABLE "student_logs" ADD CONSTRAINT "fk_student_logs_students" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
