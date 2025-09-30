import { supabase } from "@/integrations/supabase/client";
import {
  BonafideRequest,
  Profile,
  Department,
  Batch,
  CertificateTemplate,
  StudentDetails,
  TutorDetails,
  HodDetails,
  RequestStatus, // Imported RequestStatus
} from "@/lib/types";
import { showError } from "@/utils/toast";

// This file will now contain functions to interact with Supabase.

export const fetchRequests = async (): Promise<BonafideRequest[]> => {
  const { data, error } = await supabase.from("requests").select("*");
  if (error) {
    console.error("Error fetching requests:", error);
    throw new Error("Failed to fetch requests: " + error.message);
  }
  return data as BonafideRequest[];
};

export const fetchProfiles = async (role?: string): Promise<Profile[]> => {
  let query = supabase.from("profiles").select("*");
  if (role) {
    query = query.eq("role", role);
  }
  const { data, error } = await query;
  if (error) {
    console.error(`Error fetching ${role || ''} profiles:`, error);
    throw new Error(`Failed to fetch ${role || ''} profiles: ` + error.message);
  }
  return data as Profile[];
};

export const fetchStudentDetails = async (studentId: string): Promise<StudentDetails | null> => {
  console.log("Dyad Debug: Starting fetchStudentDetails for ID:", studentId);

  // 1. Fetch the base profile data for the student
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", studentId)
    .single();

  if (profileError || !profileData) {
    console.error("Dyad Debug: Error fetching student profile:", profileError);
    throw new Error("Failed to fetch student profile: " + profileError?.message);
  }
  console.log("Dyad Debug: Fetched profileData:", profileData);

  // 2. Fetch the student-specific details (register_number, parent_name, and IDs for joins)
  const { data: studentSpecificData, error: studentSpecificError } = await supabase
    .from("students")
    .select(`
      register_number,
      parent_name,
      batch_id,
      tutor_id,
      hod_id
    `)
    .eq("id", studentId)
    .single();

  if (studentSpecificError || !studentSpecificData) {
    console.error("Dyad Debug: Error fetching student-specific data:", studentSpecificError);
    throw new Error("Failed to fetch student-specific data: " + studentSpecificError?.message);
  }
  console.log("Dyad Debug: Fetched studentSpecificData (with IDs):", studentSpecificData);

  const { batch_id, tutor_id, hod_id } = studentSpecificData;

  let batch: Batch | null = null;
  let department: Department | null = null;
  let tutor: Profile | null = null;
  let hod: Profile | null = null;

  // 3. Fetch Batch details
  if (batch_id) {
    const { data: batchData, error: batchError } = await supabase
      .from("batches")
      .select(`*, departments(id, name)`)
      .eq("id", batch_id)
      .single();
    if (batchError) {
      console.warn("Dyad Debug: Error fetching batch details:", batchError);
    } else {
      batch = batchData as Batch;
      department = batchData.departments as Department;
      console.log("Dyad Debug: Fetched batchData:", batch);
      console.log("Dyad Debug: Fetched departmentData:", department);
    }
  } else {
    console.log("Dyad Debug: No batch_id found for student.");
  }

  // 4. Fetch Tutor profile
  if (tutor_id) {
    const { data: tutorData, error: tutorError } = await supabase
      .from("profiles")
      .select(`id, first_name, last_name`)
      .eq("id", tutor_id)
      .single();
    if (tutorError) {
      console.warn("Dyad Debug: Error fetching tutor profile:", tutorError);
    } else {
      tutor = tutorData as Profile;
      console.log("Dyad Debug: Fetched tutorData:", tutor);
    }
  } else {
    console.log("Dyad Debug: No tutor_id found for student.");
  }

  // 5. Fetch HOD profile
  if (hod_id) {
    const { data: hodData, error: hodError } = await supabase
      .from("profiles")
      .select(`id, first_name, last_name`)
      .eq("id", hod_id)
      .single();
    if (hodError) {
      console.warn("Dyad Debug: Error fetching HOD profile:", hodError);
    } else {
      hod = hodData as Profile;
      console.log("Dyad Debug: Fetched hodData:", hod);
    }
  } else {
    console.log("Dyad Debug: No hod_id found for student.");
  }

  return {
    ...profileData,
    register_number: studentSpecificData.register_number,
    parent_name: studentSpecificData.parent_name,
    batch_id: batch?.id,
    batch_name: batch ? `${batch.name} ${batch.section || ''}`.trim() : undefined,
    current_semester: batch?.current_semester,
    department_id: department?.id,
    department_name: department?.name,
    tutor_id: tutor?.id,
    tutor_name: tutor ? `${tutor.first_name} ${tutor.last_name || ''}`.trim() : undefined,
    hod_id: hod?.id,
    hod_name: hod ? `${hod.first_name} ${hod.last_name || ''}`.trim() : undefined,
  } as StudentDetails;
};

export const fetchTutorDetails = async (tutorId: string): Promise<TutorDetails | null> => {
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select(`
      *,
      departments(name),
      batches(name, section)
    `)
    .eq("id", tutorId)
    .single();

  if (profileError || !profileData) {
    console.error("Error fetching tutor profile:", profileError);
    throw new Error("Failed to fetch tutor profile: " + profileError?.message);
  }

  const department = profileData.departments as unknown as Department;
  const batch = profileData.batches as unknown as Batch;

  return {
    ...profileData,
    department_name: department?.name,
    batch_assigned_name: batch ? `${batch.name} ${batch.section || ''}`.trim() : undefined,
  } as TutorDetails;
};

export const fetchHodDetails = async (hodId: string): Promise<HodDetails | null> => {
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select(`
      *,
      departments(name)
    `)
    .eq("id", hodId)
    .single();

  if (profileError || !profileData) {
    console.error("Error fetching HOD profile:", profileError);
    throw new Error("Failed to fetch HOD profile: " + profileError?.message);
  }

  const department = profileData.departments as unknown as Department;

  return {
    ...profileData,
    department_name: department?.name,
  } as HodDetails;
};


export const fetchDepartments = async (): Promise<Department[]> => {
  const { data, error } = await supabase.from("departments").select("*");
  if (error) {
    console.error("Error fetching departments:", error);
    throw new Error("Failed to fetch departments: " + error.message);
  }
  return data as Department[];
};

export const fetchBatches = async (): Promise<Batch[]> => {
  const { data, error } = await supabase.from("batches").select(`
    *,
    departments(name),
    tutors:profiles!batches_tutor_id_fkey(first_name, last_name)
  `);
  if (error) {
    console.error("Error fetching batches:", error);
    throw new Error("Failed to fetch batches: " + error.message);
  }
  return data as Batch[];
};

export const fetchTemplates = async (): Promise<CertificateTemplate[]> => {
  const { data, error } = await supabase.from("templates").select("*");
  if (error) {
    console.error("Error fetching templates:", error);
    throw new Error("Failed to fetch templates: " + error.message);
  }
  return data as CertificateTemplate[];
};

// Example functions for data manipulation
export const createRequest = async (newRequest: Omit<BonafideRequest, 'id' | 'created_at'>): Promise<BonafideRequest | null> => {
  const { data, error } = await supabase.from("requests").insert(newRequest).select().single();
  if (error) {
    console.error("Error creating request:", error);
    return null;
  }
  return data as BonafideRequest;
};

export const updateRequestStatus = async (requestId: string, status: RequestStatus, returnReason?: string): Promise<BonafideRequest | null> => {
  const updateData: Partial<BonafideRequest> = { status };
  if (returnReason) {
    updateData.return_reason = returnReason;
  }
  const { data, error } = await supabase.from("requests").update(updateData).eq("id", requestId).select().single();
  if (error) {
    console.error("Error updating request status:", error);
    return null;
  }
  return data as BonafideRequest;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile | null> => {
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single();
  if (error) {
    console.error("Error updating profile:", error);
    return null;
  }
  return data as Profile;
};

export const createDepartment = async (newDepartment: Omit<Department, 'id' | 'created_at'>): Promise<Department | null> => {
  const { data, error } = await supabase.from("departments").insert(newDepartment).select().single();
  if (error) {
    console.error("Error creating department:", error);
    return null;
  }
  return data as Department;
};

export const createBatch = async (newBatch: Omit<Batch, 'id' | 'created_at'>): Promise<Batch | null> => {
  const { data, error } = await supabase.from("batches").insert(newBatch).select().single();
  if (error) {
    console.error("Error creating batch:", error);
    return null;
  }
  return data as Batch;
};

export const updateBatch = async (batchId: string, updates: Partial<Batch>): Promise<Batch | null> => {
  const { data, error } = await supabase.from("batches").update(updates).eq("id", batchId).select().single();
  if (error) {
    console.error("Error updating batch:", error);
    return null;
  }
  return data as Batch;
};

export const createTemplate = async (
  newTemplate: Omit<CertificateTemplate, 'id' | 'created_at' | 'file_url'>,
  file?: File
): Promise<CertificateTemplate | null> => {
  let file_url: string | undefined;

  if (file) {
    const filePath = `public/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('certificate-templates')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      showError("Error uploading file: " + uploadError.message);
      return null;
    }
    file_url = supabase.storage.from('certificate-templates').getPublicUrl(filePath).data.publicUrl;
  }

  const { data, error } = await supabase.from("templates").insert({
    ...newTemplate,
    file_url: file_url,
  }).select().single();

  if (error) {
    console.error("Error creating template in DB:", error);
    showError("Failed to create template in database: " + error.message);
    return null;
  }
  return data as CertificateTemplate;
};

export const updateTemplate = async (
  templateId: string,
  updates: Partial<Omit<CertificateTemplate, 'created_at' | 'file_url'>>,
  file?: File
): Promise<CertificateTemplate | null> => {
  let file_url: string | null | undefined;

  // If a new file is provided, upload it
  if (file) {
    // First, get the existing template to check for an old file to delete
    const { data: existingTemplate, error: fetchError } = await supabase
      .from('templates')
      .select('file_url')
      .eq('id', templateId)
      .single();

    if (fetchError) {
      console.error("Error fetching existing template for file update:", fetchError);
      showError("Failed to update template file: " + fetchError.message);
      return null;
    }

    // If an old file exists, delete it
    if (existingTemplate?.file_url) {
      const oldFilePath = existingTemplate.file_url.split('/public/')[1]; // Extract path after /public/
      if (oldFilePath) {
        const { error: deleteError } = await supabase.storage
          .from('certificate-templates')
          .remove([oldFilePath]);
        if (deleteError) {
          console.warn("Error deleting old file:", deleteError.message);
          // Don't block the update if old file deletion fails
        }
      }
    }

    const filePath = `public/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('certificate-templates')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      showError("Error uploading new file: " + uploadError.message);
      console.error("Error uploading new file:", uploadError);
      return null;
    }
    file_url = supabase.storage.from('certificate-templates').getPublicUrl(filePath).data.publicUrl;
  } else if (updates.template_type === 'html') {
    // If switching to HTML and no new file is provided, explicitly clear file_url
    file_url = null;
  }
  // If template_type is 'pdf' or 'word' and no new file is provided,
  // file_url remains undefined, meaning it won't be updated in the DB,
  // thus retaining the existing file_url. This is the desired behavior.

  const updatePayload: Partial<CertificateTemplate> = { ...updates };
  if (file_url !== undefined) { // Only include file_url in payload if it was explicitly set (to a new URL or null)
    updatePayload.file_url = file_url;
  }

  const { data, error } = await supabase.from("templates").update(updatePayload).eq("id", templateId).select().single();
  if (error) {
    console.error("Error updating template in DB:", error);
    showError("Failed to update template in database: " + error.message);
    return null;
  }
  return data as CertificateTemplate;
};

export const deleteTemplate = async (templateId: string): Promise<boolean> => {
  // First, fetch the template to get the file_url if it exists
  const { data: template, error: fetchError } = await supabase
    .from('templates')
    .select('file_url')
    .eq('id', templateId)
    .single();

  if (fetchError) {
    console.error("Error fetching template for deletion:", fetchError);
    showError("Failed to delete template: " + fetchError.message);
    return false;
  }

  // If a file is associated, delete it from storage
  if (template?.file_url) {
    const filePath = template.file_url.split('/public/')[1]; // Extract path after /public/
    if (filePath) {
      const { error: deleteFileError } = await supabase.storage
        .from('certificate-templates')
        .remove([filePath]);
      if (deleteFileError) {
        console.warn("Error deleting associated file from storage:", deleteFileError.message);
        // Continue with database deletion even if file deletion fails
      }
    }
  }

  const { error } = await supabase.from("templates").delete().eq("id", templateId);
  if (error) {
    console.error("Error deleting template from DB:", error);
    showError("Failed to delete template from database: " + error.message);
    return false;
  }
  return true;
};

// Define a specific type for the studentData parameter in createStudent
interface NewStudentDetailsPayload {
  register_number: string;
  parent_name?: string;
  batch_id?: string;
  tutor_id?: string;
  hod_id?: string;
}

export const createStudent = async (profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>, studentData: NewStudentDetailsPayload): Promise<StudentDetails | null> => {
  const { data: newProfile, error: profileError } = await supabase
    .from("profiles")
    .insert({ ...profileData, role: 'student' })
    .select()
    .single();

  if (profileError || !newProfile) {
    console.error("Error creating student profile:", profileError);
    return null;
  }

  const { data: newStudent, error: studentError } = await supabase
    .from("students")
    .insert({
      id: newProfile.id,
      register_number: studentData.register_number,
      parent_name: studentData.parent_name,
      batch_id: studentData.batch_id,
      tutor_id: studentData.tutor_id,
      hod_id: studentData.hod_id,
    })
    .select()
    .single();

  if (studentError || !newStudent) {
    console.error("Error creating student entry:", studentError);
    // Optionally, roll back profile creation here
    await supabase.from("profiles").delete().eq("id", newProfile.id);
    return null;
  }

  return { ...newProfile, ...newStudent } as StudentDetails;
};

export const fetchAllStudentsWithDetails = async (): Promise<StudentDetails[]> => {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id, first_name, last_name, username, email, phone_number, avatar_url, role, department_id, batch_id, created_at, updated_at,
      students(register_number, parent_name, batch_id, tutor_id, hod_id),
      batches(name, section, current_semester, departments(name)),
      tutors:profiles!students_tutor_id_fkey(first_name, last_name),
      hods:profiles!students_hod_id_fkey(first_name, last_name)
    `)
    .eq('role', 'student');

  if (error) {
    console.error("Error fetching all students with details:", error);
    throw new Error("Failed to fetch all students with details: " + error.message);
  }

  return data.map((profile: any) => {
    const studentData = profile.students[0];
    const batch = profile.batches;
    const department = batch?.departments;
    const tutor = profile.tutors;
    const hod = profile.hods;

    return {
      ...profile,
      register_number: studentData?.register_number,
      parent_name: studentData?.parent_name,
      batch_id: batch?.id,
      batch_name: batch ? `${batch.name} ${batch.section || ''}`.trim() : undefined,
      current_semester: batch?.current_semester,
      department_id: department?.id,
      department_name: department?.name,
      tutor_id: tutor?.id,
      tutor_name: tutor ? `${tutor.first_name} ${tutor.last_name || ''}`.trim() : undefined,
      hod_id: hod?.id, // Corrected: This should be the ID, not the name
      hod_name: hod ? `${hod.first_name} ${hod.last_name || ''}`.trim() : undefined,
    } as StudentDetails;
  });
};

export const createTutor = async (profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>, batchId?: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .insert({ ...profileData, role: 'tutor', batch_id: batchId })
    .select()
    .single();

  if (error) {
    console.error("Error creating tutor:", error);
    return null;
  }
  return data as Profile;
};

export const updateTutor = async (tutorId: string, updates: Partial<Profile>, batchId?: string): Promise<Profile | null> => {
  const updatePayload: Partial<Profile> = { ...updates };
  if (batchId !== undefined) {
    updatePayload.batch_id = batchId;
  }
  const { data, error } = await supabase.from("profiles").update(updatePayload).eq("id", tutorId).select().single();
  if (error) {
    console.error("Error updating tutor:", error);
    return null;
  }
  return data as Profile;
};

export const deleteTutor = async (tutorId: string): Promise<boolean> => {
  const { error } = await supabase.from("profiles").delete().eq("id", tutorId);
  if (error) {
    console.error("Error deleting tutor:", error);
    return false;
  }
  return true;
};

export const createHod = async (profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .insert({ ...profileData, role: 'hod' })
    .select()
    .single();

  if (error) {
    console.error("Error creating HOD:", error);
    return null;
  }
  return data as Profile;
};

export const updateHod = async (hodId: string, updates: Partial<Profile>): Promise<Profile | null> => {
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", hodId).select().single();
  if (error) {
    console.error("Error updating HOD:", error);
    return null;
  }
  return data as Profile;
};

export const deleteHod = async (hodId: string): Promise<boolean> => {
  const { error } = await supabase.from("profiles").delete().eq("id", hodId);
  if (error) {
    console.error("Error deleting HOD:", error);
    return false;
  }
  return true;
};