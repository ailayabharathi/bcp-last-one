import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Imported CardTitle
import { Separator } from "@/components/ui/separator";
import ProfileHeader from "@/components/shared/ProfileHeader";
import ProfileField from "@/components/shared/ProfileField";
import EditableProfileField from "@/components/shared/EditableProfileField";
import { StudentDetails, Profile as ProfileType } from "@/lib/types";
import { useSession } from "@/components/auth/SessionContextProvider";
import { fetchStudentDetails, updateProfile } from "@/data/appData";
import { showError, showSuccess } from "@/utils/toast";

const StudentProfile = () => {
  const { user, profile: sessionProfile } = useSession();
  const [profile, setProfile] = useState<StudentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      if (user?.id) {
        setLoading(true);
        const studentDetails = await fetchStudentDetails(user.id);
        setProfile(studentDetails);
        setLoading(false);
      }
    };
    getProfile();
  }, [user]);

  const handleSaveField = async (field: keyof ProfileType, value: string) => {
    if (!user?.id) {
      showError("User not authenticated.");
      return;
    }
    const updates: Partial<ProfileType> = { [field]: value };
    const updated = await updateProfile(user.id, updates);
    if (updated) {
      setProfile((prev) => (prev ? { ...prev, ...updated } : null));
      showSuccess(`${field} updated successfully!`);
    } else {
      showError(`Failed to update ${field}.`);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Profile...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please wait while we fetch your profile details.</p>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Unable to load student profile. Please contact support.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <ProfileHeader name={`${profile.first_name} ${profile.last_name || ''}`.trim()} subtitle="Student Profile Details" />
      </CardHeader>
      <CardContent>
        <Separator className="my-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <ProfileField label="Username">{profile.username}</ProfileField>
          <ProfileField label="Register Number">
            {profile.register_number}
          </ProfileField>
          <ProfileField label="Academic Year">{profile.batch_name || "N/A"}</ProfileField>
          <ProfileField label="Current Semester">
            {profile.current_semester || "N/A"}
          </ProfileField>
          <ProfileField label="Status">
            <Badge variant="success">Active</Badge>
          </ProfileField>
          <ProfileField label="Tutor">{profile.tutor_name || "N/A"}</ProfileField>
          <ProfileField label="HOD">{profile.hod_name || "N/A"}</ProfileField>
          <ProfileField label="Department">{profile.department_name || "N/A"}</ProfileField>
          <ProfileField label="Parent Name">{profile.parent_name || "N/A"}</ProfileField>

          <EditableProfileField
            label="Email"
            value={profile.email || ""}
            onSave={(newValue) => handleSaveField("email", newValue)}
          />
          <EditableProfileField
            label="Mobile"
            value={profile.phone_number || ""}
            onSave={(newValue) => handleSaveField("phone_number", newValue)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentProfile;