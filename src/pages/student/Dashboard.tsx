import DashboardCard from "@/components/shared/DashboardCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchRequests, fetchStudentDetails, fetchTemplates } from "@/data/appData";
import { BonafideRequest, StudentDetails, CertificateTemplate } from "@/lib/types";
import { getStatusVariant, formatDateToIndian } from "@/lib/utils";
import { generatePdf, getCertificateHtml } from "@/lib/pdf";
import { CheckCircle, Download, FileText, Clock } from "lucide-react";
import { useSession } from "@/components/auth/SessionContextProvider";
import { useEffect, useState } from "react";
import { showError } from "@/utils/toast";
// Removed useOutletContext as setTheme is no longer passed
// import { useOutletContext } from "react-router-dom";
import { cn } from "@/lib/utils";

// Removed ThemeSwitcher component

const StudentDashboard = () => {
  const { user, profile } = useSession();
  // Removed setTheme from useOutletContext
  // const { setTheme } = useOutletContext<{ setTheme: (theme: string) => void }>();
  const [studentRequests, setStudentRequests] = useState<BonafideRequest[]>([]);
  const [studentDetails, setStudentDetails] = useState<StudentDetails | null>(null);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        setLoading(true);
        const allRequests = await fetchRequests();
        const filteredRequests = allRequests.filter((req) => req.student_id === user.id);
        setStudentRequests(filteredRequests);

        const details = await fetchStudentDetails(user.id);
        setStudentDetails(details);

        const fetchedTemplates = await fetchTemplates();
        setTemplates(fetchedTemplates);
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const totalRequests = studentRequests.length;
  const approvedRequests = studentRequests.filter(
    (req) => req.status === "Approved"
  );
  const pendingOrReturned = totalRequests - approvedRequests.length;

  // Sort requests by created_at or date in descending order (most recent first)
  const latestRequest = [...studentRequests].sort(
    (a, b) => {
      const dateA = new Date(a.created_at || a.date);
      const dateB = new Date(b.created_at || b.date);
      return dateB.getTime() - dateA.getTime();
    }
  )[0];

  const handleDownload = async (request: BonafideRequest) => {
    if (!studentDetails) {
      showError("Student details not available for download.");
      return;
    }
    const template: CertificateTemplate | undefined = templates.find((t) => t.id === request.template_id);

    if (!template) {
      showError("Could not find template for download.");
      return;
    }

    if (template.template_type === "html") {
      const htmlContent = getCertificateHtml(request, studentDetails, template, true);
      const fileName = `Bonafide-${studentDetails.register_number}.pdf`;
      await generatePdf(htmlContent, fileName);
    } else if (template.file_url) {
      const link = document.createElement('a');
      link.href = template.file_url;
      link.download = `${template.name}-${studentDetails.register_number}.${template.template_type}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      showError("No file URL found for this template type.");
      return;
    }
  };

  if (loading) {
    return (
      <div className="text-center text-muted-foreground">Loading Dashboard...</div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-shadow-lg animate-fade-in-up">
        Welcome, {profile?.first_name || 'Student'}!
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <DashboardCard
            title="Total Requests"
            value={totalRequests.toString()}
            icon={<FileText />}
            iconColor="text-blue-500"
            cardTheme="info"
            role="student"
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <DashboardCard
            title="Approved"
            value={approvedRequests.length.toString()}
            icon={<CheckCircle />}
            iconColor="text-green-500"
            cardTheme="success"
            role="student"
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <DashboardCard
            title="Pending / Returned"
            value={pendingOrReturned.toString()}
            icon={<Clock />}
            iconColor="text-amber-500"
            cardTheme="warning"
            role="student"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          {latestRequest ? (
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Latest Application Status</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Details of your most recent request.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Request ID
                    </p>
                    <p className="font-semibold">{latestRequest.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Type
                    </p>
                    <p className="font-semibold">{latestRequest.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Date Submitted
                    </p>
                    <p className="font-semibold">
                      {formatDateToIndian(latestRequest.created_at || latestRequest.date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Status
                    </p>
                    <Badge variant={getStatusVariant(latestRequest.status)}>
                      {latestRequest.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>No Requests Yet</CardTitle>
              </CardHeader>
              <CardContent>
                <p>You haven't submitted any bonafide requests.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Ready for Download</h2>
          {approvedRequests.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {approvedRequests.map((request, index) => (
                <div key={request.id} className="animate-fade-in-up" style={{ animationDelay: `${0.6 + index * 0.1}s` }}>
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="text-lg">{request.type}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Approved on {formatDateToIndian(request.created_at || request.date)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => handleDownload(request)}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download Certificate
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              You have no approved certificates available for download.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;