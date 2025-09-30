import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  fetchAllStudentsWithDetails,
  fetchBatches,
  fetchDepartments,
  createStudent,
  fetchProfiles,
} from "@/data/appData";
import { Download, MoreHorizontal, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { downloadStudentTemplate, parseStudentFile } from "@/lib/xlsx";
import { showSuccess, showError } from "@/utils/toast";
import { StudentDetails, Department, Batch, Profile } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

const StudentManagement = () => {
  const [allStudents, setAllStudents] = useState<StudentDetails[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [hods, setHods] = useState<Profile[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const fetchedStudents = await fetchAllStudentsWithDetails();
      const fetchedDepartments = await fetchDepartments();
      const fetchedBatches = await fetchBatches();
      const fetchedHods = await fetchProfiles('hod');

      setAllStudents(fetchedStudents);
      setDepartments(fetchedDepartments);
      setBatches(fetchedBatches);
      setHods(fetchedHods);
    } catch (error: any) {
      showError(error.message);
      setAllStudents([]); // Clear data on error
      setDepartments([]);
      setBatches([]);
      setHods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const filteredStudents = useMemo(() => {
    return allStudents.filter((student) => {
      const departmentMatch =
        selectedDepartment === "all" || student.department_name === selectedDepartment;
      const batchMatch =
        selectedBatch === "all" || student.batch_name === selectedBatch;
      return departmentMatch && batchMatch;
    });
  }, [allStudents, selectedDepartment, selectedBatch]);

  const handleFileUpload = async () => {
    if (!uploadFile) {
      showError("Please select a file to upload.");
      return;
    }

    try {
      const parsedStudents = await parseStudentFile(uploadFile);
      const newStudents: StudentDetails[] = [];
      for (const student of parsedStudents) {
        // Find department and batch IDs based on names from template
        const department = departments.find(d => d.id === student.department_id);
        const batch = batches.find(b => b.id === student.batch_id);
        const hod = hods.find(h => h.department_id === department?.id);

        if (!department || !batch) {
          console.warn(`Skipping student ${student.register_number} due to missing department or batch.`);
          continue;
        }

        const newStudent = await createStudent(
          {
            first_name: student.first_name,
            last_name: student.last_name,
            username: student.username,
            email: student.email,
            phone_number: student.phone_number,
            department_id: department.id,
            batch_id: batch.id,
            role: 'student', // Explicitly set role
          },
          {
            register_number: student.register_number!,
            parent_name: student.parent_name,
            batch_id: batch.id,
            tutor_id: batch.tutor_id, // Assign batch's tutor as student's tutor
            hod_id: hod?.id, // Assign correct HOD ID
          }
        );
        if (newStudent) {
          newStudents.push(newStudent);
        }
      }
      showSuccess(`${newStudents.length} students uploaded successfully!`);
      setUploadFile(null);
      setIsUploadDialogOpen(false);
      fetchAllData(); // Refresh student list
    } catch (error: any) {
      showError("Failed to parse or upload file: " + error.message);
      console.error(error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Students...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please wait while we fetch student data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
        <CardTitle>Student Management</CardTitle>
        <div className="flex items-center gap-2 flex-wrap">
          <Select onValueChange={setSelectedDepartment} defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
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
              {batches.map((batch) => {
                const fullBatchName = batch.section
                  ? `${batch.name} ${batch.section}`
                  : batch.name;
                return (
                  <SelectItem key={batch.id} value={fullBatchName}>
                    {fullBatchName}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={downloadStudentTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Upload Students</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Select an XLSX file with student data. Use the downloadable
                  template for the correct format.
                </p>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="student-file">XLSX File</Label>
                  <Input
                    id="student-file"
                    type="file"
                    accept=".xlsx"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleFileUpload} disabled={!uploadFile}>
                  Upload and Process
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Register No.</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Tutor</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <TableRow key={student.register_number}>
                  <TableCell className="font-medium">
                    {student.register_number}
                  </TableCell>
                  <TableCell>{`${student.first_name} ${student.last_name || ''}`.trim()}</TableCell>
                  <TableCell>{student.department_name}</TableCell>
                  <TableCell>{student.batch_name}</TableCell>
                  <TableCell>{student.tutor_name}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Student</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Remove Student
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default StudentManagement;