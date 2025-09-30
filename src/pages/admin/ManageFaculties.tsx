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
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchProfiles, fetchDepartments, createHod, updateHod, deleteHod } from "@/data/appData";
import { Profile, Department } from "@/lib/types";
import { showSuccess, showError } from "@/utils/toast";

const ManageFaculties = () => {
  const [faculties, setFaculties] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    setLoading(true);
    const fetchedFaculties = await fetchProfiles('hod');
    const fetchedDepartments = await fetchDepartments();

    setFaculties(fetchedFaculties);
    setDepartments(fetchedDepartments);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const facultyData: Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'role'> = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      username: formData.get("username") as string,
      department_id: formData.get("department_id") as string,
      email: formData.get("email") as string,
      phone_number: formData.get("phone_number") as string,
    };

    if (editingFaculty) {
      const updated = await updateHod(editingFaculty.id, facultyData);
      if (updated) {
        showSuccess("Faculty details updated successfully.");
        fetchAllData();
      } else {
        showError("Failed to update faculty details.");
      }
    } else {
      const created = await createHod({ ...facultyData, role: 'hod' });
      if (created) {
        showSuccess("New faculty added successfully.");
        fetchAllData();
      } else {
        showError("Failed to add new faculty.");
      }
    }

    setIsAddEditDialogOpen(false);
    setEditingFaculty(null);
  };

  const handleDelete = async (facultyId: string, facultyName: string) => {
    const deleted = await deleteHod(facultyId);
    if (deleted) {
      showSuccess(`Faculty "${facultyName}" removed successfully.`);
      fetchAllData();
    } else {
      showError("Failed to remove faculty.");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Faculties...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please wait while we fetch faculty data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Faculties (HODs)</CardTitle>
        <Dialog
          open={isAddEditDialogOpen}
          onOpenChange={(isOpen) => {
            setIsAddEditDialogOpen(isOpen);
            if (!isOpen) setEditingFaculty(null);
          }}
        >
          <DialogTrigger asChild>
            <Button>Add New HOD</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingFaculty ? "Edit HOD Details" : "Add New HOD"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      name="first_name"
                      defaultValue={editingFaculty?.first_name || ""}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      defaultValue={editingFaculty?.last_name || ""}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    defaultValue={editingFaculty?.username || ""}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="department_id">Department</Label>
                  <Select
                    name="department_id"
                    defaultValue={editingFaculty?.department_id || ""}
                    required
                  >
                    <SelectTrigger id="department_id">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={editingFaculty?.email || ""}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    defaultValue={editingFaculty?.phone_number || ""}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Mobile Number</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faculties.length > 0 ? (
              faculties.map((faculty) => {
                const departmentName = departments.find(d => d.id === faculty.department_id)?.name || "N/A";
                return (
                  <TableRow key={faculty.id}>
                    <TableCell className="font-medium">{`${faculty.first_name} ${faculty.last_name || ''}`.trim()}</TableCell>
                    <TableCell>{departmentName}</TableCell>
                    <TableCell>{faculty.email}</TableCell>
                    <TableCell>{faculty.phone_number}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingFaculty(faculty);
                                setIsAddEditDialogOpen(true);
                              }}
                            >
                              Edit Details
                            </DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive">
                                Remove HOD
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently
                              remove {`${faculty.first_name} ${faculty.last_name || ''}`.trim()} from the records.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(faculty.id, `${faculty.first_name} ${faculty.last_name || ''}`.trim())}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No HODs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ManageFaculties;