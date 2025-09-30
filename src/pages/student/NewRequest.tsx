import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createRequest, fetchStudentDetails } from "@/data/appData";
import { showSuccess, showError } from "@/utils/toast";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/components/auth/SessionContextProvider";
import { useEffect } from "react";
import { StudentDetails } from "@/lib/types";

const NewRequest = () => {
  const navigate = useNavigate();
  const { user, profile } = useSession();
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [type, setType] = useState("");
  const [subType, setSubType] = useState("");
  const [reason, setReason] = useState("");
  const [loadingStudent, setLoadingStudent] = useState(true);

  useEffect(() => {
    const getStudentData = async () => {
      if (user?.id) {
        setLoadingStudent(true);
        const details = await fetchStudentDetails(user.id);
        setStudentDetails(details);
        setLoadingStudent(false);
      }
    };
    getStudentData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !reason || !user?.id) {
      showError("Please fill in all required fields and ensure you are logged in.");
      return;
    }

    const newRequestPayload = {
      student_id: user.id,
      date: new Date().toISOString().split("T")[0],
      type,
      sub_type: subType,
      reason,
      status: "Pending Tutor Approval" as const,
    };

    const createdRequest = await createRequest(newRequestPayload);

    if (createdRequest) {
      showSuccess("Request submitted successfully!");
      navigate("/student/my-requests");
    } else {
      showError("Failed to submit request.");
    }
  };

  if (loadingStudent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Student Details...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please wait while we fetch your information.</p>
        </CardContent>
      </Card>
    );
  }

  if (!studentDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Could not load student details. Please ensure your profile is complete.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>New Bonafide Certificate Request</CardTitle>
          <CardDescription>
            Fill out the form below to submit a new request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="student-name">Student Name</Label>
              <Input id="student-name" defaultValue={`${studentDetails.first_name} ${studentDetails.last_name || ''}`.trim()} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="student-id">Register Number</Label>
              <Input id="student-id" defaultValue={studentDetails.register_number} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parent-name">Father's Name</Label>
              <Input id="parent-name" defaultValue={studentDetails.parent_name || 'N/A'} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department-name">Department</Label>
              <Input id="department-name" defaultValue={studentDetails.department_name || 'N/A'} disabled />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bonafide-type">Type</Label>
                <Select onValueChange={setType} required>
                  <SelectTrigger id="bonafide-type">
                    <SelectValue placeholder="Select a bonafide type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Passport Application">
                      Passport Application
                    </SelectItem>
                    <SelectItem value="Bank Loan">Bank Loan</SelectItem>
                    <SelectItem value="Scholarship">Scholarship</SelectItem>
                    <SelectItem value="Internship Application">
                      Internship Application
                    </SelectItem>
                    <SelectItem value="Visa Application">
                      Visa Application
                    </SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sub-type">Sub-type (Optional)</Label>
                <Input
                  id="sub-type"
                  placeholder="e.g., Education Loan"
                  value={subType}
                  onChange={(e) => setSubType(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Certificate</Label>
              <Textarea
                id="reason"
                placeholder="Please provide any additional details here."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button type="submit">
            Submit Request
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default NewRequest;