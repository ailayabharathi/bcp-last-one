import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { type RequestStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getStatusVariant = (
  status: RequestStatus
): "success" | "secondary" | "destructive" | "default" => {
  switch (status) {
    case "Approved":
      return "success";
    case "Pending Tutor Approval":
    case "Pending HOD Approval":
    case "Pending Admin Approval":
    case "Pending Principal Approval":
      return "secondary";
    case "Returned by Tutor":
    case "Returned by HOD":
    case "Returned by Admin":
    case "Returned by Principal":
      return "destructive";
    default:
      return "default";
  }
};

/**
 * Formats a date string to dd/mm/yyyy format.
 * @param dateString The date string to format (e.g., "yyyy-mm-dd").
 * @returns The formatted date string or "N/A".
 */
export const formatDateToIndian = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    // en-GB locale formats as dd/mm/yyyy
    return date.toLocaleDateString("en-GB");
  } catch (error) {
    console.error("Invalid date string:", dateString);
    return "Invalid Date";
  }
};

/**
 * Calculates the current semester for a batch based on its name (e.g., "2023-2027 A") and the current date.
 * Assumes the academic year starts in July.
 * @param batchName The name of the batch.
 * @returns The calculated current semester (1-8).
 */
export const calculateCurrentSemesterForBatch = (batchName: string): number => {
  const yearPart = batchName.split(" ")[0]; // "2023-2027 A" -> "2023-2027"
  const nameParts = yearPart.split("-");
  if (nameParts.length !== 2) return 0; // Invalid format

  const startYear = parseInt(nameParts[0], 10);
  if (isNaN(startYear)) return 0; // Invalid year

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11 (January is 0)

  // Assuming academic year starts in July (month index 6)
  const isFirstHalfOfCalendarYear = currentMonth < 6; // Jan-June

  const academicYearOffset = currentYear - startYear;

  let semester;
  if (isFirstHalfOfCalendarYear) {
    // Jan-June: Belongs to the second (even) semester of the academic year.
    semester = academicYearOffset * 2;
  } else {
    // July-Dec: Belongs to the first (odd) semester of the academic year.
    semester = academicYearOffset * 2 + 1;
  }

  // Clamp the semester between 1 and 8, as a batch can't be in semester 0 or > 8.
  if (semester < 1) return 1;
  if (semester > 8) return 8;

  return semester;
};

/**
 * Calculates the start and end dates for a given semester of a batch.
 * @param batchName The name of the batch (e.g., "2023-2027 A").
 * @param currentSemester The semester to calculate dates for.
 * @returns An object with `from` and `to` date strings.
 */
export const getSemesterDateRange = (
  batchName: string,
  currentSemester: number
): { from: string; to: string } => {
  const yearPart = batchName.split(" ")[0]; // "2023-2027 A" -> "2023-2027"
  const startYear = parseInt(yearPart.split("-")[0], 10);
  const academicYearOffset = Math.floor((currentSemester - 1) / 2);
  const isOddSemester = currentSemester % 2 !== 0;

  let fromDate: Date;
  let toDate: Date;

  if (isOddSemester) {
    // Odd semesters: July 1st to Dec 31st
    const year = startYear + academicYearOffset;
    fromDate = new Date(year, 6, 1); // July 1st
    toDate = new Date(year, 11, 31); // Dec 31st
  } else {
    // Even semesters: Jan 1st to June 30th
    const year = startYear + academicYearOffset + 1;
    fromDate = new Date(year, 0, 1); // Jan 1st
    toDate = new Date(year, 5, 30); // June 30th
  }

  return {
    from: fromDate.toISOString().split("T")[0],
    to: toDate.toISOString().split("T")[0],
  };
};