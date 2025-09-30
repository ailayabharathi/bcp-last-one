import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { BonafideRequest, CertificateTemplate, StudentDetails } from "./types";
import { fetchStudentDetails, fetchTemplates } from "@/data/appData";

/**
 * Generates the final HTML content for a certificate by populating a template with data.
 * @param request The bonafide request.
 * @param student The student's profile.
 * @param template The certificate template.
 * @param addSignature A boolean to indicate if the admin signature should be added.
 * @returns The final HTML string for the certificate.
 */
export const getCertificateHtml = (
  request: BonafideRequest,
  student: StudentDetails | null,
  template: CertificateTemplate | undefined,
  addSignature: boolean = false
): string => {
  if (!template) {
    return "<p>Error: Certificate template not found.</p>";
  }
  if (!student) {
    return "<p>Error: Student details not found.</p>";
  }

  let content = template.content
    .replace(/{studentName}/g, `${student.first_name} ${student.last_name || ''}`.trim())
    .replace(/{studentId}/g, student.register_number)
    .replace(/{reason}/g, request.type)
    .replace(/{parentName}/g, student.parent_name || 'N/A')
    .replace(/{department}/g, student.department_name || 'N/A')
    .replace(/{batch}/g, student.batch_name || 'N/A')
    .replace(/{currentSemester}/g, student.current_semester?.toString() || 'N/A');

  if (addSignature) {
    content +=
      "<p style='margin-top: 40px; text-align: right;'>--- E-Signed by Principal Thompson ---</p>";
  }

  return content;
};

/**
 * Generates and downloads a PDF from an HTML string.
 * @param htmlContent The HTML content to convert to PDF.
 * @param fileName The name of the file to be downloaded.
 */
export const generatePdf = async (htmlContent: string, fileName: string) => {
  const container = document.createElement("div");
  container.style.width = "210mm"; // A4 width
  container.style.padding = "20mm";
  container.style.position = "absolute";
  container.style.left = "-9999px"; // Render off-screen
  container.innerHTML = `<div class="prose max-w-none">${htmlContent}</div>`;
  document.body.appendChild(container);

  const canvas = await html2canvas(container, { scale: 2 });
  document.body.removeChild(container);

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const ratio = canvasWidth / canvasHeight;
  const imgWidth = pdfWidth;
  const imgHeight = imgWidth / ratio;

  // Check if content exceeds one page
  if (imgHeight > pdfHeight) {
    console.warn("PDF content might be too long for a single page.");
  }

  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  pdf.save(fileName);
};