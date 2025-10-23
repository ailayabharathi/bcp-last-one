import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Eye, EyeOff, MoreHorizontal } from "lucide-react";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { fetchProfiles, fetchDepartments, createHod, updateHod, updateUserPassword, deleteHod } from "@/data/appData";
import { Profile, Department } from "@/lib/types";
import { showSuccess, showError } from "@/utils/toast";

const formSchema = z.object({
  first_name: z.string().min(1, { message: "First name is required." }),
  last_name: z.string().optional(),
  username: z.string().min(1, { message: "Username is required." }),
  department_id: z.string().min(1, { message: "Department is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone_number: z.string().min(10, { message: "Phone number must be at least 10 digits." }).optional().or(z.literal("")),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }).optional(),
});

const ManageFaculties = () => {
  const [faculties, setFaculties] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Profile | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      department_id: "",
      email: "",
      phone_number: "",
      password: "",
    },
  });

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

  useEffect(() => {
    if (isAddEditDialogOpen && editingFaculty) {
      form.reset({
        first_name: editingFaculty.first_name || "",
        last_name: editingFaculty.last_name || "",
        username: editingFaculty.username || "",
        department_id: editingFaculty.department_id || "",
        email: editingFaculty.email || "",
        phone_number: editingFaculty.phone_number || "",
        password: "", // Password is never pre-filled for security
      });
    } else if (isAddEditDialogOpen && !editingFaculty) {
      form.reset({
        first_name: "",
        last_name: "",
        username: "",
        department_id: "",
        email: "",
        phone_number: "",
        password: "",
      });
    }
  }, [isAddEditDialogOpen, editingFaculty, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const facultyData: Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'role'> = {
        first_name: values.first_name,
        last_name: values.last_name,
        username: values.username,
        department_id: values.department_id,
        email: values.email,
        phone_number: values.phone_number,
      };

      if (editingFaculty) {
        const updated = await updateHod(editingFaculty.id, facultyData);
        if (!updated) {
          showError("Failed to update faculty details.");
          return;
        }

        if (values.password) {
          const passwordUpdated = await updateUserPassword(editingFaculty.id, values.password);
          if (!passwordUpdated) {
            showError("Failed to update faculty password.");
          }
        }
        showSuccess("Faculty details updated successfully.");
      } else {
        if (!values.password) {
          showError("Password is required for new HODs.");
          return;
        }
        const created = await createHod({ ...facultyData, role: 'hod' }, values.password);
        if (!created) {
          showError("Failed to add new faculty.");
          return;
        }
        showSuccess("New faculty added successfully.");
      }

      setIsAddEditDialogOpen(false);
      setEditingFaculty(null);
      form.reset();
      fetchAllData();
    } catch (error: any) {
      showError(error.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
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
            if (!isOpen) {
              setEditingFaculty(null);
              form.reset(); // Reset form state when dialog closes
            }
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Password {editingFaculty ? "(Leave blank to keep current)" : ""}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              {...field}
                              required={!editingFaculty}
                              autoComplete="new-password"
                              disabled={isSubmitting}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-primary/10"
                              onClick={() => setShowPassword((prev) => !prev)}
                              disabled={isSubmitting}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                              <span className="sr-only">Toggle password visibility</span>
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
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