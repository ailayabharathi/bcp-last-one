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
  "department_id", // Use department_id for linking
  "batch_id", // Use batch_id for linking
  // tutor_id and hod_id will be assigned by admin, not directly in template
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
 * @returns A promise that resolves to an array of StudentDetails objects.
 */
export const parseStudentFile = (file: File): Promise<Partial<StudentDetails>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = xlsx.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = xlsx.utils.sheet_to_json<Partial<StudentDetails>>(worksheet);
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