import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils"; // Import cn

interface EditableProfileFieldProps {
  label: string;
  value: string;
  onSave: (newValue: string) => void;
  iconTextColorClass?: string; // New prop
}

const EditableProfileField = ({
  label,
  value,
  onSave,
  iconTextColorClass, // Destructure new prop
}: EditableProfileFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  const handleSave = () => {
    onSave(currentValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCurrentValue(value);
    setIsEditing(false);
  };

  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2 mt-1">
        {isEditing ? (
          <>
            <Input
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              className="h-9"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSave}
              className={cn("h-9 w-9 flex-shrink-0", iconTextColorClass || "text-muted-foreground")} // Apply iconTextColorClass, default to text-muted-foreground
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCancel}
              className={cn("h-9 w-9 flex-shrink-0", iconTextColorClass || "text-muted-foreground")} // Apply iconTextColorClass, default to text-muted-foreground
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <p className="text-base font-medium flex-grow">{value}</p>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className={cn("h-9 w-9 flex-shrink-0", iconTextColorClass || "text-muted-foreground")} // Apply iconTextColorClass, default to text-muted-foreground
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default EditableProfileField;