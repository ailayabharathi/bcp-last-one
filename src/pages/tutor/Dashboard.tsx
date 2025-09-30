import DashboardCard from "@/components/shared/DashboardCard";
import { fetchRequests } from "@/data/appData";
import { FileClock, Users } from "lucide-react";
import { useSession } from "@/components/auth/SessionContextProvider";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TutorDashboard = () => {
  const { user } = useSession();
  const [totalStudents, setTotalStudents] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        setLoading(true);

        // Fetch students assigned to this tutor
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('id')
          .eq('tutor_id', user.id);

        if (studentsError) {
          console.error("Error fetching students for tutor:", studentsError);
          setTotalStudents(0);
        } else {
          setTotalStudents(studentsData?.length || 0);
        }

        // Fetch pending requests for students assigned to this tutor
        const allRequests = await fetchRequests();
        const tutorStudentsIds = studentsData?.map(s => s.id) || [];
        const pendingForTutor = allRequests.filter(
          (req) =>
            req.status === "Pending Tutor Approval" &&
            tutorStudentsIds.includes(req.student_id)
        ).length;
        setPendingRequests(pendingForTutor);
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

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
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <DashboardCard
          title="Total Students"
          value={totalStudents.toString()}
          icon={<Users />}
          iconColor="text-blue-500"
          cardTheme="info"
          role="tutor"
        />
        <DashboardCard
          title="Pending Requests"
          value={pendingRequests.toString()}
          icon={<FileClock />}
          iconColor="text-amber-500"
          cardTheme="warning"
          role="tutor"
        />
      </div>
    </div>
  );
};

export default TutorDashboard;