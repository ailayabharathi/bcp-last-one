import DashboardCard from "@/components/shared/DashboardCard";
import { Building, FileClock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboard = () => {
  const [pendingRequests, setPendingRequests] = useState(0);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Calculate pending requests for Admin
      const { data: requestsData, error: requestsError } = await supabase
        .from('requests')
        .select('id')
        .eq('status', 'Pending Admin Approval');

      if (requestsError) {
        showError("Error fetching pending requests: " + requestsError.message);
        setPendingRequests(0);
      } else {
        setPendingRequests(requestsData?.length || 0);
      }

      // Calculate total departments
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('departments')
        .select('id');

      if (departmentsError) {
        showError("Error fetching departments: " + departmentsError.message);
        setTotalDepartments(0);
      } else {
        setTotalDepartments(departmentsData?.length || 0);
      }

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
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <DashboardCard
          title="Pending Requests"
          value={pendingRequests.toString()}
          icon={<FileClock />}
          iconColor="text-amber-500"
          cardTheme="warning"
          role="admin"
        />
        <DashboardCard
          title="Total Departments"
          value={totalDepartments.toString()}
          icon={<Building />}
          iconColor="text-blue-500"
          cardTheme="primary"
          role="admin"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;