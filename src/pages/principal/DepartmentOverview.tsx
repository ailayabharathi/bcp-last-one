import { useMemo, useEffect, useState } from "react";
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
import { fetchDepartments } from "@/data/appData";
import { Department } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

interface DepartmentOverviewData extends Department {
  hod_name: string;
  total_active_students: number;
  total_tutors: number;
}

const DepartmentOverview = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const fetchedDepartments = await fetchDepartments();
      setDepartments(fetchedDepartments);
      setLoading(false);
    };
    fetchData();
  }, []);

  const departmentData = useMemo(() => {
    return Promise.all(
      departments.map(async (dept) => {
        // Fetch HOD for the department
        const { data: hodData, error: hodError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('role', 'hod')
          .eq('department_id', dept.id)
          .single();
        if (hodError && hodError.code !== 'PGRST116') showError("Error fetching HOD for " + dept.name + ": " + hodError.message); // PGRST116 is "no rows found"

        const hodName = hodData ? `${hodData.first_name} ${hodData.last_name || ''}`.trim() : "N/A";

        // Fetch active students in the department
        const { data: batchesInDept, error: batchesError } = await supabase
          .from('batches')
          .select('id')
          .eq('department_id', dept.id)
          .eq('status', 'Active');
        if (batchesError) showError("Error fetching batches for " + dept.name + ": " + batchesError.message);

        const batchIds = batchesInDept?.map(b => b.id) || [];

        const { count: studentCount, error: studentCountError } = await supabase
          .from('students')
          .select('id', { count: 'exact' })
          .in('batch_id', batchIds);
        if (studentCountError) showError("Error fetching student count for " + dept.name + ": " + studentCountError.message);

        // Fetch tutors in the department
        const { count: tutorCount, error: tutorCountError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('role', 'tutor')
          .eq('department_id', dept.id);
        if (tutorCountError) showError("Error fetching tutor count for " + dept.name + ": " + tutorCountError.message);

        return {
          ...dept,
          hod_name: hodName,
          total_active_students: studentCount || 0,
          total_tutors: tutorCount || 0,
        } as DepartmentOverviewData;
      })
    );
  }, [departments]);

  const [resolvedDepartmentData, setResolvedDepartmentData] = useState<DepartmentOverviewData[]>([]);

  useEffect(() => {
    const resolveData = async () => {
      if (departments.length > 0) {
        setLoading(true);
        const data = await departmentData;
        setResolvedDepartmentData(data);
        setLoading(false);
      }
    };
    resolveData();
  }, [departmentData, departments]);


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Department Overview...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please wait while we fetch department data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department Name</TableHead>
              <TableHead>HOD</TableHead>
              <TableHead>Established Year</TableHead>
              <TableHead>Active Students</TableHead>
              <TableHead>Tutors</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resolvedDepartmentData.length > 0 ? (
              resolvedDepartmentData.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell>{dept.hod_name}</TableCell>
                  <TableCell>{dept.established_year || "N/A"}</TableCell>
                  <TableCell>{dept.total_active_students}</TableCell>
                  <TableCell>{dept.total_tutors}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
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

export default DepartmentOverview;