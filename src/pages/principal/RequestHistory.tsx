import { useState, useMemo, useEffect } from "react";
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
import { fetchRequests, fetchAllStudentsWithDetails, fetchBatches, fetchDepartments } from "@/data/appData";
import { getStatusVariant, formatDateToIndian } from "@/lib/utils";
import { BonafideRequest, StudentDetails, Department, Batch } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

const PrincipalRequestHistory = () => {
  const [allRequests, setAllRequests] = useState<BonafideRequest[]>([]);
  const [allStudents, setAllStudents] = useState<StudentDetails[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [allBatches, setAllBatches] = useState<Batch[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const fetchedRequests = await fetchRequests();
      const fetchedStudents = await fetchAllStudentsWithDetails();
      const fetchedDepartments = await fetchDepartments();
      const fetchedBatches = await fetchBatches();

      setAllRequests(fetchedRequests);
      setAllStudents(fetchedStudents);
      setAllDepartments(fetchedDepartments);
      setAllBatches(fetchedBatches);
      setLoading(false);
    };
    fetchData();
  }, []);

  const uniqueBatches = useMemo(() => {
    const batchNames = allBatches.map((b) =>
      b.section ? `${b.name} ${b.section}` : b.name
    );
    return [...new Set(batchNames)];
  }, [allBatches]);

  const filteredHistory = useMemo(() => {
    return allRequests.filter((request) => {
      const student = allStudents.find(
        (s) => s.id === request.student_id
      );
      if (!student) return false;

      const departmentMatch =
        selectedDepartment === "all" || student.department_name === selectedDepartment;
      const batchMatch =
        selectedBatch === "all" || student.batch_name === selectedBatch;
      const semesterMatch =
        selectedSemester === "all" ||
        student.current_semester === Number(selectedSemester);

      return departmentMatch && batchMatch && semesterMatch;
    });
  }, [allRequests, allStudents, selectedDepartment, selectedBatch, selectedSemester]);

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
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
        <CardTitle>Request History</CardTitle>
        <div className="flex items-center gap-2 flex-wrap">
          <Select onValueChange={setSelectedDepartment} defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {allDepartments.map((dept) => (
                <SelectItem key={dept.id} value={dept.name}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setSelectedBatch} defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by batch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {uniqueBatches.map((batch) => (
                <SelectItem key={batch} value={batch}>
                  {batch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              <TableHead>Department</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.length > 0 ? (
              filteredHistory.map((request) => {
                const student = allStudents.find(
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
                    <TableCell>{student?.department_name || "N/A"}</TableCell>
                    <TableCell>{student?.batch_name || "N/A"}</TableCell>
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
                <TableCell colSpan={6} className="text-center">
                  No request history found for the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PrincipalRequestHistory;