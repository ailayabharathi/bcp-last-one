import { useState, useEffect } from "react";
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
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Department } from "@/lib/types";
import { showSuccess, showError } from "@/utils/toast";
import { createDepartment, fetchDepartments } from "@/data/appData";
import { supabase } from "@/integrations/supabase/client";

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newEstablishedYear, setNewEstablishedYear] = useState<number | ''>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDepartmentsData = async () => {
    setLoading(true);
    const fetchedDepartments = await fetchDepartments();
    setDepartments(fetchedDepartments);
    setLoading(false);
  };

  useEffect(() => {
    fetchDepartmentsData();
  }, []);

  const handleAddDepartment = async () => {
    if (newDepartmentName.trim() === "") {
      showError("Department name is required.");
      return;
    }

    const newDepartmentPayload: Omit<Department, 'id' | 'created_at'> = {
      name: newDepartmentName,
      established_year: newEstablishedYear === '' ? undefined : newEstablishedYear,
    };

    const createdDept = await createDepartment(newDepartmentPayload);

    if (createdDept) {
      showSuccess(`Department "${newDepartmentName}" created successfully.`);
      setNewDepartmentName("");
      setNewEstablishedYear('');
      setIsDialogOpen(false);
      fetchDepartmentsData(); // Refresh list
    } else {
      showError("Failed to create department.");
    }
  };

  const handleDeleteDepartment = async (departmentId: string, departmentName: string) => {
    const { error } = await supabase.from('departments').delete().eq('id', departmentId);
    if (error) {
      showError("Failed to delete department: " + error.message);
    } else {
      showSuccess(`Department "${departmentName}" deleted successfully.`);
      fetchDepartmentsData(); // Refresh list
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Departments...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please wait while we fetch department data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Department Management</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Department</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Department</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="department-name">Department Name</Label>
                <Input
                  id="department-name"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  placeholder="e.g., Information Technology"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="established-year">Established Year (Optional)</Label>
                <Input
                  id="established-year"
                  type="number"
                  value={newEstablishedYear}
                  onChange={(e) => setNewEstablishedYear(Number(e.target.value) || '')}
                  placeholder="e.g., 2005"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddDepartment}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department ID</TableHead>
              <TableHead>Department Name</TableHead>
              <TableHead>Established Year</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.length > 0 ? (
              departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.id}</TableCell>
                  <TableCell>{dept.name}</TableCell>
                  <TableCell>{dept.established_year || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {/* <DropdownMenuItem>Edit</DropdownMenuItem> */}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No departments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DepartmentManagement;