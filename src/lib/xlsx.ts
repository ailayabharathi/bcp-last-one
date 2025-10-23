import * as xlsx from "xlsx";
import { StudentDetails } from "./types";

const studentTemplateHeaders = [
  "first_name",
  "last_name",
  "username",
  "email",
  "phone_number",
  "register_number",
  "parent_name",
  "department_name", // Changed to name for user-friendliness
  "batch_name",      // Changed to name for user-friendliness
  "password",        // New: Password for the student
];

/**
 * Generates and downloads an XLSX template for student bulk upload.
 */
export const downloadStudentTemplate = () => {
  const worksheet = xlsx.utils.aoa_to_sheet([studentTemplateHeaders]);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Students");
  xlsx.writeFile(workbook, "student_upload_template.xlsx");
};

/**
 * Parses an uploaded XLSX file and returns an array of student profiles.
 * @param file The uploaded file object.
 * @returns A promise that resolves to an array of objects with student details, including department_name, batch_name, and password.
 */
export const parseStudentFile = (file: File): Promise<Partial<StudentDetails & { password?: string; department_name?: string; batch_name?: string }>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = xlsx.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = xlsx.utils.sheet_to_json<Partial<StudentDetails & { password?: string; department_name?: string; batch_name?: string }>>(worksheet);
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
};