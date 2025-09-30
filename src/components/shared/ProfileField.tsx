import React from "react";

interface ProfileFieldProps {
  label: string;
  children: React.ReactNode;
}

const ProfileField = ({ label, children }: ProfileFieldProps) => (
  <div>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="text-base font-medium">{children}</p>
  </div>
);

export default ProfileField;