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
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showSuccess, showError } from "@/utils/toast";
import { Batch, Department, Profile } from "@/lib/types";
import {
  calculateCurrentSemesterForBatch,
  getSemesterDateRange,
  formatDateToIndian,
} from "@/lib/utils";
import { createBatch, fetchBatches, fetchDepartments, fetchProfiles, updateBatch } from "@/data/appData";
import { supabase } from "@/integrations/supabase/client";

const BatchManagement = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [tutors, setTutors] = useState<Profile[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSemesterDialogOpen, setIsSemesterDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [newBatch, setNewBatch] = useState<Partial<Batch>>({
    name: "",
    total_sections: 1,
    department_id: "",
  });
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const fetchedBatches = await fetchBatches();
      const fetchedDepartments = await fetchDepartments();
      const fetchedTutors = await fetchProfiles('tutor');

      // Process batches to update semester info if needed
      const updatedBatches = fetchedBatches.map((batch) => {
        const fullBatchName = batch.section
          ? `${batch.name} ${batch.section}`
          : batch.name;
        const currentSemester = calculateCurrentSemesterForBatch(fullBatchName);
        const { from, to } = getSemesterDateRange(fullBatchName, currentSemester);
        return {
          ...batch,
          current_semester: currentSemester,
          semester_from_date: from,
          semester_to_date: to,
        };
      });

      setBatches(updatedBatches);
      setDepartments(fetchedDepartments);
      setTutors(fetchedTutors);
    } catch (error: any) {
      showError(error.message);
      setBatches([]); // Clear data on error
      setDepartments([]);
      setTutors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const groupedBatches = useMemo(() => {
    return batches.reduce(
      (acc, batch) => {
        if (!acc[batch.name]) {
          acc[batch.name] = [];
        }
        acc[batch.name].push(batch);
        return acc;
      },
      {} as Record<string, Batch[]>
    );
  }, [batches]);

  const [selectedSections, setSelectedSections] = useState<
    Record<string, string>
  >(() => {
    const initialState: Record<string, string> = {};
    for (const batchName in groupedBatches) {
      initialState[batchName] = groupedBatches[batchName][0]?.id || '';
    }
    return initialState;
  });

  const handleSectionChange = (batchName: string, newBatchId: string) => {
    setSelectedSections((prev) => ({
      ...prev,
      [batchName]: newBatchId,
    }));
  };

  const handleToggleStatus = async (batchId: string) => {
    const batchToUpdate = batches.find((b) => b.id === batchId);
    if (!batchToUpdate) return;

    const newStatus = batchToUpdate.status === "Active" ? "Inactive" : "Active";
    const updated = await updateBatch(batchId, { status: newStatus });

    if (updated) {
      showSuccess(`Batch "${batchToUpdate.name}" marked as ${newStatus}.`);
      fetchAllData(); // Refresh data
    } else {
      showError("Failed to update batch status.");
    }
  };

  const handleOpenEditDialog = (batch: Batch) => {
    setEditingBatch({ ...batch });
    setIsEditDialogOpen(true);
  };

  const handleOpenSemesterDialog = (batch: Batch) => {
    setEditingBatch({ ...batch });
    setIsSemesterDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!editingBatch) return;

    const originalBatch = batches.find((b) => b.id === editingBatch.id);
    if (!originalBatch) return;

    const oldTotalSections = originalBatch.total_sections || 1;
    const newTotalSections = editingBatch.total_sections || 1;

    // Update the main batch entry
    const updatedMainBatch = await updateBatch(editingBatch.id, {
      total_sections: newTotalSections,
    });

    if (!updatedMainBatch) {
      showError("Failed to update batch details.");
      return;
    }

    if (oldTotalSections !== newTotalSections) {
      const batchName = editingBatch.name;
      const departmentId = editingBatch.department_id;
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

      if (newTotalSections > oldTotalSections) {
        for (let i = oldTotalSections; i < newTotalSections; i++) {
          const sectionName = alphabet[i];
          const fullBatchName = `${batchName} ${sectionName}`;
          const currentSemester = calculateCurrentSemesterForBatch(fullBatchName);
          const { from, to } = getSemesterDateRange(fullBatchName, currentSemester);
          const newSection: Omit<Batch, 'id' | 'created_at'> = {
            name: batchName,
            section: sectionName,
            tutor_id: null, // Unassigned by default
            total_sections: newTotalSections,
            student_count: 0,
            status: "Active",
            current_semester: currentSemester,
            semester_from_date: from,
            semester_to_date: to,
            department_id: departmentId,
          };
          await createBatch(newSection);
        }
      } else if (newTotalSections < oldTotalSections) {
        // Remove excess sections
        const sectionsToRemove = batches.filter(b =>
          b.name === batchName &&
          b.department_id === departmentId &&
          b.section &&
          alphabet.indexOf(b.section) >= newTotalSections
        );
        for (const section of sectionsToRemove) {
          await supabase.from('batches').delete().eq('id', section.id);
        }
      }
    }

    showSuccess(`Batch "${editingBatch.name}" updated successfully.`);
    setIsEditDialogOpen(false);
    setEditingBatch(null);
    fetchAllData(); // Refresh all data
  };

  const handleSaveSemesterChanges = async () => {
    if (!editingBatch) return;

    const updated = await updateBatch(editingBatch.id, {
      tutor_id: editingBatch.tutor_id === "unassigned-tutor" ? null : editingBatch.tutor_id, // Handle "Unassigned" value
      current_semester: editingBatch.current_semester,
      semester_from_date: editingBatch.semester_from_date,
      semester_to_date: editingBatch.semester_to_date,
    });

    if (updated) {
      showSuccess(
        `Semester details for "${editingBatch.name} - ${
          editingBatch.section || ""
        }" updated successfully.`
      );
      setIsSemesterDialogOpen(false);
      setEditingBatch(null);
      fetchAllData(); // Refresh data
    } else {
      showError("Failed to update semester details.");
    }
  };

  const handleAddNewBatch = async () => {
    const { name: batchName, total_sections, department_id } = newBatch;

    if (!batchName || !department_id) {
      showError("Batch name and Department are required.");
      return;
    }

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const newSectionsToCreate: Omit<Batch, 'id' | 'created_at'>[] = [];

    for (let i = 0; i < (total_sections || 1); i++) {
      const sectionName = (total_sections || 1) > 1 ? alphabet[i] : undefined;
      const fullBatchName = sectionName
        ? `${batchName} ${sectionName}`
        : batchName;
      const currentSemester = calculateCurrentSemesterForBatch(fullBatchName);
      const { from, to } = getSemesterDateRange(fullBatchName, currentSemester);

      newSectionsToCreate.push({
        name: batchName,
        section: sectionName,
        tutor_id: null, // Unassigned by default
        total_sections: total_sections || 1,
        student_count: 0,
        status: "Active",
        current_semester: currentSemester,
        semester_from_date: from,
        semester_to_date: to,
        department_id: department_id,
      });
    }

    const { error } = await supabase.from('batches').insert(newSectionsToCreate);

    if (error) {
      showError("Failed to create new batch: " + error.message);
    } else {
      showSuccess(
        `Batch "${batchName}" with ${total_sections} section(s) created successfully.`
      );
      setIsAddDialogOpen(false);
      setNewBatch({ name: "", total_sections: 1, department_id: "" });
      fetchAllData(); // Refresh all data
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Batches...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please wait while we fetch batch data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Batch Management</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add New Batch</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Batch</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-batch-department">Department</Label>
                  <Select
                    value={newBatch.department_id}
                    onValueChange={(value) =>
                      setNewBatch({ ...newBatch, department_id: value })
                    }
                    required
                  >
                    <SelectTrigger id="new-batch-department">
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
                  <Label htmlFor="new-batch-name">
                    Batch (e.g., 2024-2028)
                  </Label>
                  <Input
                    id="new-batch-name"
                    value={newBatch.name}
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-total-sections">Total Sections</Label>
                  <Input
                    id="new-total-sections"
                    type="number"
                    min="1"
                    value={newBatch.total_sections}
                    onChange={(e) =>
                      setNewBatch({
                        ...newBatch,
                        total_sections: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddNewBatch}>Create Batch</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Total Sections</TableHead>
                <TableHead>Assigned Tutor</TableHead>
                <TableHead>Current Sem</TableHead>
                <TableHead>Semester Start</TableHead>
                <TableHead>Semester End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.keys(groupedBatches).map((batchName) => {
                const sections = groupedBatches[batchName];
                const selectedBatchId =
                  selectedSections[batchName] || sections[0]?.id;
                const selectedBatchData =
                  batches.find((b) => b.id === selectedBatchId) || sections[0];

                if (!selectedBatchData) return null;

                const department = departments.find(
                  (d) => d.id === selectedBatchData.department_id
                );
                const assignedTutor = tutors.find(t => t.id === selectedBatchData.tutor_id);

                return (
                  <TableRow key={batchName}>
                    <TableCell>{department?.name || "N/A"}</TableCell>
                    <TableCell className="font-medium">{batchName}</TableCell>
                    <TableCell>
                      {sections.length > 1 ? (
                        <Select
                          value={selectedBatchData.id}
                          onValueChange={(value) =>
                            handleSectionChange(batchName, value)
                          }
                        >
                          <SelectTrigger className="w-[80px]">
                            <SelectValue>
                              {selectedBatchData.section}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {sections.map((section) => (
                              <SelectItem key={section.id} value={section.id}>
                                {section.section}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        selectedBatchData.section || "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {selectedBatchData.total_sections || 1}
                    </TableCell>
                    <TableCell>{assignedTutor ? `${assignedTutor.first_name} ${assignedTutor.last_name || ''}`.trim() : "Unassigned"}</TableCell>
                    <TableCell>{selectedBatchData.current_semester}</TableCell>
                    <TableCell>
                      {formatDateToIndian(selectedBatchData.semester_from_date)}
                    </TableCell>
                    <TableCell>
                      {formatDateToIndian(selectedBatchData.semester_to_date)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          selectedBatchData.status === "Active"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {selectedBatchData.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() =>
                              handleOpenEditDialog(selectedBatchData)
                            }
                          >
                            Edit Batch Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleOpenSemesterDialog(selectedBatchData)
                            }
                          >
                            Edit Semester
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleToggleStatus(selectedBatchData.id)
                            }
                          >
                            {selectedBatchData.status === "Active"
                              ? "Mark as Inactive"
                              : "Mark as Active"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Batch: {editingBatch?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-department">Department</Label>
              <Input
                id="edit-department"
                value={
                  departments.find((d) => d.id === editingBatch?.department_id)
                    ?.name || "N/A"
                }
                disabled
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="total-sections">Total Sections for Batch</Label>
              <Input
                id="total-sections"
                type="number"
                min="1"
                value={editingBatch?.total_sections || ""}
                onChange={(e) =>
                  setEditingBatch((prev) =>
                    prev
                      ? { ...prev, total_sections: Number(e.target.value) }
                      : null
                  )
                }
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isSemesterDialogOpen}
        onOpenChange={setIsSemesterDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Semester: {editingBatch?.name} - {editingBatch?.section}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-tutor">Assign Tutor</Label>
              <Select
                value={editingBatch?.tutor_id || "unassigned-tutor"} // Ensure value is always a string
                onValueChange={(value) =>
                  setEditingBatch((prev) =>
                    prev ? { ...prev, tutor_id: value === "unassigned-tutor" ? null : value } : null
                  )
                }
              >
                <SelectTrigger id="edit-tutor">
                  <SelectValue placeholder="Select a tutor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned-tutor">Unassigned</SelectItem> {/* Changed value */}
                  {tutors
                    .filter(
                      (tutor) =>
                        tutor.department_id === editingBatch?.department_id
                    )
                    .map((tutor) => (
                      <SelectItem key={tutor.id} value={tutor.id}>
                        {`${tutor.first_name} ${tutor.last_name || ''}`.trim()}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="current-semester">Current Semester</Label>
              <Select
                value={String(editingBatch?.current_semester || "")}
                onValueChange={(value) =>
                  setEditingBatch((prev) =>
                    prev ? { ...prev, current_semester: Number(value) } : null
                  )
                }
              >
                <SelectTrigger id="current-semester">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <SelectItem key={sem} value={String(sem)}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="from-date">Semester Start Date</Label>
              <Input
                id="from-date"
                type="date"
                value={editingBatch?.semester_from_date || ""}
                onChange={(e) =>
                  setEditingBatch((prev) =>
                    prev ? { ...prev, semester_from_date: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="to-date">Semester End Date</Label>
              <Input
                id="to-date"
                type="date"
                value={editingBatch?.semester_to_date || ""}
                onChange={(e) =>
                  setEditingBatch((prev) =>
                    prev ? { ...prev, semester_to_date: e.target.value } : null
                  )
                }
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveSemesterChanges}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BatchManagement;