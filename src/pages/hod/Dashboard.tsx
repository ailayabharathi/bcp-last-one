import DashboardCard from "@/components/shared/DashboardCard";
import { FileClock, Users, ClipboardList } from "lucide-react";
import { useSession } from "@/components/auth/SessionContextProvider";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const HodDashboard = () => {
  const { user, profile } = useSession();
  const [pendingRequests, setPendingRequests] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [activeBatches, setActiveBatches] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id && profile?.department_id) {
        setLoading(true);

        // Fetch batches for HOD's department (RLS will filter by department_id)
        const { data: batchesData, error: batchesError } = await supabase
          .from('batches')
          .select('id, status');

        if (batchesError) {
          showError("Error fetching batches for department: " + batchesError.message);
          setActiveBatches(0);
          setTotalStudents(0);
          setPendingRequests(0);
          setLoading(false);
          return;
        }

        const activeBatchesCount = batchesData?.filter(b => b.status === 'Active').length || 0;
        setActiveBatches(activeBatchesCount);

        // Fetch students in HOD's department (RLS will filter by department_id via batches)
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('id');

        if (studentsError) {
          showError("Error fetching student data for department: " + studentsError.message);
          setTotalStudents(0);
        } else {
          setTotalStudents(studentsData?.length || 0);
        }

        // Fetch pending requests for students in HOD's department (RLS will filter by department_id via students)
        const { data: requestsData, error: requestsError } = await supabase
          .from('requests')
          .select('id')
          .eq('status', 'Pending HOD Approval');

        if (requestsError) {
          showError("Error fetching pending requests: " + requestsError.message);
          setPendingRequests(0);
        } else {
          setPendingRequests(requestsData?.length || 0);
        }
        
        setLoading(false);
      }
    };
    fetchData();
  }, [user, profile?.department_id]);

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
      <h1 className="text-3xl font-bold">HOD Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard
          title="Pending Requests"
          value={pendingRequests.toString()}
          icon={<FileClock />}
          iconColor="text-amber-500"
          cardTheme="warning"
          role="hod"
        />
        <DashboardCard
          title="Total Students"
          value={totalStudents.toString()}
          icon={<Users />}
          iconColor="text-blue-500"
          cardTheme="info"
          role="hod"
        />
        <DashboardCard
          title="Active Batches"
          value={activeBatches.toString()}
          icon={<ClipboardList />}
          iconColor="text-emerald-500"
          cardTheme="success"
          role="hod"
        />
      </div>
    </div>
  );
};

export default HodDashboard;