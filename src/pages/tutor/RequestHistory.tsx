import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchRequests, fetchStudentDetails } from "@/data/appData";
import { getStatusVariant, formatDateToIndian } from "@/lib/utils";
import { BonafideRequest, StudentDetails } from "@/lib/types";
import { useSession } from "@/components/auth/SessionContextProvider";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

const TutorRequestHistory = () => {
  const { user } = useSession();
  const [allRequests, setAllRequests] = useState<BonafideRequest[]>([]);
  const [studentsInCharge, setStudentsInCharge] = useState<StudentDetails[]>([]);
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        setLoading(true);
        // Fetch students assigned to this tutor
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select(`id, register_number`) // Only fetch ID and register_number initially
          .eq('tutor_id', user.id);

        if (studentsError) {
          showError("Error fetching assigned students: " + studentsError.message);
          setStudentsInCharge([]);
          setLoading(false);
          return;
        }

        const studentIds = studentsData?.map(s => s.id) || [];
        if (studentIds.length === 0) {
          setAllRequests([]);
          setStudentsInCharge([]);
          setLoading(false);
          return;
        }

        // Fetch full student details for each assigned student
        const detailedStudentsPromises = studentIds.map(id => fetchStudentDetails(id));
        const detailedStudents = await Promise.all(detailedStudentsPromises);
        setStudentsInCharge(detailedStudents.filter(s => s !== null) as StudentDetails[]);

        // Fetch requests for these students, excluding pending tutor approval
        const { data: requestsData, error: requestsError } = await supabase
          .from('requests')
          .select('*')
          .in('student_id', studentIds)
          .neq('status', 'Pending Tutor Approval');

        if (requestsError) {
          showError("Error fetching request history: " + requestsError.message);
          setAllRequests([]);
        } else {
          setAllRequests(requestsData as BonafideRequest[]);
        }
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const filteredHistory = allRequests.filter((request) => {
    if (selectedSemester === "all") return true;
    const student = studentsInCharge.find(
      (s) => s.id === request.student_id
    );
    return student?.current_semester === Number(selectedSemester);
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Request History...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please wait while we fetch the request history.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Request History</CardTitle>
        <div className="flex items-center gap-2">
          <Select onValueChange={setSelectedSemester} defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <SelectItem key={sem} value={String(sem)}>
                  Semester {sem}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.length > 0 ? (
              filteredHistory.map((request) => {
                const student = studentsInCharge.find(
                  (s) => s.id === request.student_id
                );
                return (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      <div>{student ? `${student.first_name} ${student.last_name || ''}`.trim() : "N/A"}</div>
                      <div className="text-xs text-muted-foreground">
                        [{student?.register_number || "N/A"}]
                      </div>
                    </TableCell>
                    <TableCell>{formatDateToIndian(request.date)}</TableCell>
                    <TableCell>{request.type}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(request.status)}>
                        {request.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No request history found for the selected filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TutorRequestHistory;