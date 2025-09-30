import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Imported CardTitle
import { Separator } from "@/components/ui/separator";
import ProfileHeader from "@/components/shared/ProfileHeader";
import ProfileField from "@/components/shared/ProfileField";
import EditableProfileField from "@/components/shared/EditableProfileField";
import { TutorDetails, Profile as ProfileType } from "@/lib/types";
import { useSession } from "@/components/auth/SessionContextProvider";
import { fetchTutorDetails, updateProfile } from "@/data/appData";
import { showError, showSuccess } from "@/utils/toast";

const TutorProfile = () => {
  const { user } = useSession();
  const [profile, setProfile] = useState<TutorDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      if (user?.id) {
        setLoading(true);
        const tutorDetails = await fetchTutorDetails(user.id);
        setProfile(tutorDetails);
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
          <p>Unable to load tutor profile. Please contact support.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <ProfileHeader name={`${profile.first_name} ${profile.last_name || ''}`.trim()} subtitle="Tutor Profile Details" />
      </CardHeader>
      <CardContent>
        <Separator className="my-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <ProfileField label="Username">{profile.username}</ProfileField>
          <ProfileField label="Department">{profile.department_name || "N/A"}</ProfileField>
          <ProfileField label="Batch Assigned">
            {profile.batch_assigned_name || "N/A"}
          </ProfileField>
          <EditableProfileField
            label="Email"
            value={profile.email || ""}
            onSave={(newValue) => handleSaveField("email", newValue)}
          />
          <EditableProfileField
            label="Phone Number"
            value={profile.phone_number || ""}
            onSave={(newValue) => handleSaveField("phone_number", newValue)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TutorProfile;