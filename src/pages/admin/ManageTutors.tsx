import { useState, useMemo, useEffect } from "react";
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
import {
  fetchProfiles,
  fetchBatches,
  fetchDepartments,
  createTutor,
  updateTutor,
  deleteTutor,
} from "@/data/appData";
import { Profile, Department, Batch } from "@/lib/types";
import { showSuccess, showError } from "@/utils/toast";

const ManageTutors = () => {
  const [tutors, setTutors] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingTutor, setEditingTutor] = useState<Profile | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    setLoading(true);
    const fetchedTutors = await fetchProfiles('tutor');
    const fetchedDepartments = await fetchDepartments();
    const fetchedBatches = await fetchBatches();

    setTutors(fetchedTutors);
    setDepartments(fetchedDepartments);
    setBatches(fetchedBatches);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const uniqueBatchNames = useMemo(() => {
    if (!selectedDepartmentId) return [];
    const departmentBatches = batches.filter(
      (b) => b.department_id === selectedDepartmentId
    );
    const names = departmentBatches.map((b) => b.name);
    return [...new Set(names)];
  }, [selectedDepartmentId, batches]);

  const availableSections = useMemo(() => {
    if (!selectedBatchId) return [];
    return batches
      .filter((b) => b.id === selectedBatchId && b.section)
      .map((b) => b.section!);
  }, [selectedBatchId, batches]);

  const openEditDialog = (tutor: Profile) => {
    setEditingTutor(tutor);
    setSelectedDepartmentId(tutor.department_id || "");
    setSelectedBatchId(tutor.batch_id || "");
    setIsAddEditDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingTutor(null);
    setSelectedDepartmentId("");
    setSelectedBatchId("");
    setIsAddEditDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const tutorData: Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'role'> = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      phone_number: formData.get("phone_number") as string,
      department_id: selectedDepartmentId,
      batch_id: selectedBatchId === "null-batch-assignment" ? null : selectedBatchId, // Handle "None" value
    };

    if (editingTutor) {
      const updated = await updateTutor(editingTutor.id, tutorData, selectedBatchId === "null-batch-assignment" ? undefined : selectedBatchId);
      if (updated) {
        showSuccess("Tutor details updated successfully.");
        fetchAllData();
      } else {
        showError("Failed to update tutor details.");
      }
    } else {
      const created = await createTutor({ ...tutorData, role: 'tutor' }, selectedBatchId === "null-batch-assignment" ? undefined : selectedBatchId);
      if (created) {
        showSuccess("New tutor added successfully.");
        fetchAllData();
      } else {
        showError("Failed to add new tutor.");
      }
    }

    setIsAddEditDialogOpen(false);
    setEditingTutor(null);
  };

  const handleDelete = async (tutorId: string, tutorName: string) => {
    const deleted = await deleteTutor(tutorId);
    if (deleted) {
      showSuccess(`Tutor "${tutorName}" removed successfully.`);
      fetchAllData();
    } else {
      showError("Failed to remove tutor.");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Tutors...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please wait while we fetch tutor data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Staff (Tutors)</CardTitle>
        <Dialog
          open={isAddEditDialogOpen}
          onOpenChange={(isOpen) => {
            setIsAddEditDialogOpen(isOpen);
            if (!isOpen) setEditingTutor(null);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>Add New Tutor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTutor ? "Edit Tutor Details" : "Add New Tutor"}
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
                      defaultValue={editingTutor?.first_name || ""}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      name="last_name"
                      defaultValue={editingTutor?.last_name || ""}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    defaultValue={editingTutor?.username || ""}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={selectedDepartmentId}
                    onValueChange={setSelectedDepartmentId}
                    required
                  >
                    <SelectTrigger id="department">
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
                  <Label htmlFor="batch">Assigned Batch (Optional)</Label>
                  <Select
                    value={selectedBatchId || "null-batch-assignment"} // Ensure value is always a string
                    onValueChange={setSelectedBatchId}
                    disabled={!selectedDepartmentId}
                  >
                    <SelectTrigger id="batch">
                      <SelectValue placeholder="Select Batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null-batch-assignment">None</SelectItem> {/* Changed value */}
                      {batches
                        .filter(b => b.department_id === selectedDepartmentId)
                        .map((batch) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {`${batch.name} ${batch.section || ''}`.trim()}
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
                    defaultValue={editingTutor?.email || ""}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    defaultValue={editingTutor?.phone_number || ""}
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
              <TableHead>Batch Assigned</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tutors.length > 0 ? (
              tutors.map((tutor) => {
                const departmentName = departments.find(d => d.id === tutor.department_id)?.name || "N/A";
                const batchAssignedName = batches.find(b => b.id === tutor.batch_id);
                const fullBatchName = batchAssignedName ? `${batchAssignedName.name} ${batchAssignedName.section || ''}`.trim() : "N/A";

                return (
                  <TableRow key={tutor.id}>
                    <TableCell className="font-medium">{`${tutor.first_name} ${tutor.last_name || ''}`.trim()}</TableCell>
                    <TableCell>{departmentName}</TableCell>
                    <TableCell>{fullBatchName}</TableCell>
                    <TableCell>{tutor.email}</TableCell>
                    <TableCell>{tutor.phone_number}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => openEditDialog(tutor)}>
                              Edit Details
                            </DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive">
                                Remove Tutor
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently
                              remove {`${tutor.first_name} ${tutor.last_name || ''}`.trim()} from the records.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(tutor.id, `${tutor.first_name} ${tutor.last_name || ''}`.trim())}
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
                <TableCell colSpan={6} className="text-center">
                  No tutors found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ManageTutors;