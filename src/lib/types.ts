import * as React from "react";

export type RequestStatus =
  | "Pending Tutor Approval"
  | "Pending HOD Approval"
  | "Pending Admin Approval"
  | "Pending Principal Approval"
  | "Approved"
  | "Returned by Tutor"
  | "Returned by HOD"
  | "Returned by Admin"
  | "Returned by Principal";

export interface BonafideRequest {
  id: string; // UUID from Supabase
  student_id: string; // UUID of the student profile
  date: string;
  type: string;
  sub_type?: string;
  reason: string;
  status: RequestStatus;
  template_id?: string; // UUID of the template
  return_reason?: string;
  created_at?: string;
}

export interface CertificateTemplate {
  id: string; // UUID from Supabase
  name: string;
  content?: string; // Optional for file-based templates
  template_type: "html" | "pdf" | "word"; // New: 'html', 'pdf', or 'word'
  file_url?: string; // New: URL to the uploaded PDF/Word file
  created_at?: string;
}

export interface Department {
  id: string; // UUID from Supabase
  name: string;
  established_year?: number;
  created_at?: string;
}

export interface Batch {
  id: string; // UUID from Supabase
  name: string;
  section?: string;
  tutor_id?: string; // UUID of the tutor profile
  student_count?: number;
  total_sections?: number;
  status: "Active" | "Inactive";
  current_semester?: number;
  semester_from_date?: string;
  semester_to_date?: string;
  department_id: string; // UUID of the department
  departments?: Department; // Added for joined data
  tutors?: Profile; // Added for joined data
  created_at?: string;
}

// Unified Profile type for all users (student, tutor, hod, admin, principal)
export interface Profile {
  id: string; // auth.users UUID
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  phone_number?: string;
  avatar_url?: string;
  role: "student" | "tutor" | "hod" | "admin" | "principal";
  department_id?: string; // For HODs, Tutors
  batch_id?: string; // For Students, Tutors
  departments?: Department; // Added for joined data
  batches?: Batch; // Added for joined data
  created_at?: string;
  updated_at?: string;
}

// Specific types for joined data or extended profiles if needed in UI
export interface StudentDetails extends Profile {
  register_number: string;
  parent_name?: string;
  batch_name?: string; // Joined from batches table
  department_name?: string; // Joined from departments table
  tutor_name?: string; // Joined from profiles table
  hod_name?: string; // Joined from profiles table
  current_semester?: number; // Joined from batches table
}

export interface TutorDetails extends Profile {
  department_name?: string; // Joined from departments table
  batch_assigned_name?: string; // Joined from batches table
}

export interface HodDetails extends Profile {
  department_name?: string; // Joined from departments table
}

export interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export type ColorVariant = "default" | "blue" | "green"; // New type for color variants