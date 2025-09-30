import DashboardCard from "@/components/shared/DashboardCard";
import { Building, Briefcase, FileClock, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrincipalDashboard = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalStaff, setTotalStaff] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Total Students
      const { count: studentCount, error: studentError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('role', 'student');
      if (studentError) showError("Error fetching student count: " + studentError.message);
      setTotalStudents(studentCount || 0);

      // Total Staff (Tutors + HODs + Admin + Principal)
      const { count: tutorCount, error: tutorError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('role', 'tutor');
      if (tutorError) showError("Error fetching tutor count: " + tutorError.message);

      const { count: hodCount, error: hodError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('role', 'hod');
      if (hodError) showError("Error fetching HOD count: " + hodError.message);

      const { count: adminCount, error: adminError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('role', 'admin');
      if (adminError) showError("Error fetching admin count: " + adminError.message);

      const { count: principalCount, error: principalError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('role', 'principal');
      if (principalError) showError("Error fetching principal count: " + principalError.message);

      setTotalStaff((tutorCount || 0) + (hodCount || 0) + (adminCount || 0) + (principalCount || 0));

      // Pending Requests (all statuses starting with 'Pending')
      const { count: pendingReqCount, error: pendingReqError } = await supabase
        .from('requests')
        .select('id', { count: 'exact' })
        .like('status', 'Pending%');
      if (pendingReqError) showError("Error fetching pending requests count: " + pendingReqError.message);
      setPendingRequests(pendingReqCount || 0);

      // Total Departments
      const { count: deptCount, error: deptError } = await supabase
        .from('departments')
        .select('id', { count: 'exact' });
      if (deptError) showError("Error fetching department count: " + deptError.message);
      setTotalDepartments(deptCount || 0);

      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Dashboard...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please wait while we fetch your dashboard data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Principal Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Students"
          value={totalStudents.toString()}
          icon={<Users />}
          iconColor="text-blue-500"
          cardTheme="info"
          role="principal"
        />
        <DashboardCard
          title="Total Staff"
          value={totalStaff.toString()}
          icon={<Briefcase />}
          iconColor="text-purple-500"
          cardTheme="purple"
          role="principal"
        />
        <DashboardCard
          title="Pending Requests"
          value={pendingRequests.toString()}
          icon={<FileClock />}
          iconColor="text-amber-500"
          cardTheme="warning"
          role="principal"
        />
        <DashboardCard
          title="Total Departments"
          value={totalDepartments.toString()}
          icon={<Building />}
          iconColor="text-rose-500"
          cardTheme="rose"
          role="principal"
        />
      </div>
    </div>
  );
};

export default PrincipalDashboard;