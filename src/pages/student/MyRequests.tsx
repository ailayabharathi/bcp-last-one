import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchRequests, fetchStudentDetails, fetchTemplates } from "@/data/appData";
import { BonafideRequest, StudentDetails, CertificateTemplate } from "@/lib/types";
import { getStatusVariant, formatDateToIndian } from "@/lib/utils";
import { generatePdf, getCertificateHtml } from "@/lib/pdf";
import { Download } from "lucide-react";
import { useSession } from "@/components/auth/SessionContextProvider";
import { useEffect, useState } from "react";
import { showError } from "@/utils/toast";

const MyRequests = () => {
  const { user } = useSession();
  const [studentRequests, setStudentRequests] = useState<BonafideRequest[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRequests = async () => {
      if (user?.id) {
        setLoading(true);
        const allRequests = await fetchRequests();
        const filtered = allRequests.filter((req) => req.student_id === user.id);
        
        // Sort requests by created_at or date in descending order (most recent first)
        const sortedRequests = [...filtered].sort((a, b) => {
          const dateA = new Date(a.created_at || a.date);
          const dateB = new Date(b.created_at || b.date);
          return dateB.getTime() - dateA.getTime();
        });

        setStudentRequests(sortedRequests);

        const fetchedTemplates = await fetchTemplates();
        setTemplates(fetchedTemplates);
        setLoading(false);
      }
    };
    getRequests();
  }, [user]);

  const handleDownload = async (request: BonafideRequest) => {
    const student: StudentDetails | null = await fetchStudentDetails(request.student_id);
    const template: CertificateTemplate | undefined = templates.find((t) => t.id === request.template_id);

    if (!student || !template) {
      showError("Could not fetch student or template for download.");
      return;
    }

    if (template.template_type === "html") {
      const htmlContent = getCertificateHtml(request, student, template, true);
      const fileName = `Bonafide-${student.register_number}.pdf`;
      await generatePdf(htmlContent, fileName);
    } else if (template.file_url) {
      // For PDF or Word templates, directly download the file
      const link = document.createElement('a');
      link.href = template.file_url;
      link.download = `${template.name}-${student.register_number}.${template.template_type}`;
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
      <Card>
        <CardHeader>
          <CardTitle>Loading Requests...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please wait while we fetch your requests.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Sub-type</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {studentRequests.length > 0 ? (
              studentRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.type}</TableCell>
                  <TableCell>{request.sub_type || "N/A"}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {request.reason}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(request.status)}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {request.status === "Approved" && (
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={() => handleDownload(request)}
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Download</span>
                      </Button>
                    )}
                    {request.status.startsWith("Returned by") && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="secondary" size="sm">
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reason for Return</DialogTitle>
                            <DialogDescription>
                              Your request was returned for the following reason.
                              Please address the issue and resubmit if necessary.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <p className="text-sm font-medium bg-muted p-4 rounded-md">
                              {request.return_reason || "No reason provided."}
                            </p>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MyRequests;