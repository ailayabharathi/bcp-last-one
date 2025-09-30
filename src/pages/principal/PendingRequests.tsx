import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fetchRequests, fetchStudentDetails, fetchTemplates, updateRequestStatus } from "@/data/appData";
import { BonafideRequest, StudentDetails, CertificateTemplate } from "@/lib/types";
import { showSuccess, showError } from "@/utils/toast";
import { generatePdf, getCertificateHtml } from "@/lib/pdf";
import { formatDateToIndian } from "@/lib/utils";
import RequestDetailsView from "@/components/shared/RequestDetailsView";
import { useSession } from "@/components/auth/SessionContextProvider";
import { supabase } from "@/integrations/supabase/client";

const PrincipalPendingRequests = () => {
  const { user } = useSession();
  const [requests, setRequests] = useState<BonafideRequest[]>([]);
  const [selectedRequest, setSelectedRequest] =
    useState<BonafideRequest | null>(null);
  const [previewStudentDetails, setPreviewStudentDetails] = useState<StudentDetails | null>(null); // New state for preview
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [addSignature, setAddSignature] = useState(true);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrincipalRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .eq('status', 'Pending Principal Approval');

    if (error) {
      showError("Error fetching pending requests: " + error.message);
      setRequests([]);
    } else {
      setRequests(data as BonafideRequest[]);
    }

    const fetchedTemplates = await fetchTemplates();
    setTemplates(fetchedTemplates);
    setLoading(false);
  };

  useEffect(() => {
    fetchPrincipalRequests();
  }, [user]);

  const handleApproveAndDownload = async () => {
    if (!selectedRequest) return;

    const student: StudentDetails | null = await fetchStudentDetails(selectedRequest.student_id);
    const template: CertificateTemplate | undefined = templates.find(
      (t) => t.id === selectedRequest.template_id
    );

    if (!student || !template) {
      showError("Could not fetch student or template for certificate generation.");
      return;
    }

    if (template.template_type === "html") {
      const htmlContent = getCertificateHtml(
        selectedRequest,
        student,
        template,
        addSignature
      );
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

    const updated = await updateRequestStatus(selectedRequest.id, "Approved");
    if (updated) {
      showSuccess(`Request ${selectedRequest.id} approved and document downloaded.`);
      fetchPrincipalRequests(); // Refresh list
      setIsApproveOpen(false);
      setSelectedRequest(null);
      setPreviewStudentDetails(null); // Clear preview student details
      setAddSignature(true);
    } else {
      showError("Failed to approve request.");
    }
  };

  const handleReturn = async () => {
    if (!selectedRequest || !returnReason) return;
    const updated = await updateRequestStatus(selectedRequest.id, "Returned by Principal", returnReason);
    if (updated) {
      showSuccess(`Request ${selectedRequest.id} returned to HOD.`);
      fetchPrincipalRequests(); // Refresh list
      setIsReturnOpen(false);
      setReturnReason("");
      setSelectedRequest(null);
      setPreviewStudentDetails(null); // Clear preview student details
    } else {
      showError("Failed to return request.");
    }
  };

  const openReviewDialog = async (request: BonafideRequest) => {
    setSelectedRequest(request);
    setIsReviewOpen(true);
    // Fetch student details for the preview
    const student = await fetchStudentDetails(request.student_id);
    setPreviewStudentDetails(student);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Requests...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please wait while we fetch pending requests.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length > 0 ? (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      <div>{request.student_id}</div>
                    </TableCell>
                    <TableCell>{formatDateToIndian(request.date)}</TableCell>
                    <TableCell>{request.type}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => openReviewDialog(request)}>
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No pending requests.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isReviewOpen} onOpenChange={(open) => {
        setIsReviewOpen(open);
        if (!open) {
          setSelectedRequest(null);
          setPreviewStudentDetails(null);
        }
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && <RequestDetailsView request={selectedRequest} />}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsReviewOpen(false);
                setIsReturnOpen(true);
              }}
            >
              Return to HOD
            </Button>
            <Button
              onClick={() => {
                setIsReviewOpen(false);
                setIsApproveOpen(true);
              }}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isApproveOpen} onOpenChange={(open) => {
        setIsApproveOpen(open);
        if (!open) {
          setSelectedRequest(null);
          setPreviewStudentDetails(null);
          setAddSignature(true);
        }
      }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Approve Certificate</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="py-4">
              <h3 className="font-semibold mb-2">Certificate Preview</h3>
              {templates.find((t) => t.id === selectedRequest.template_id)?.template_type === "html" ? (
                <>
                  <div
                    className="p-4 border rounded-md bg-muted prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: getCertificateHtml(
                        selectedRequest,
                        previewStudentDetails, // Use the fetched student details
                        templates.find(
                          (t) => t.id === selectedRequest.template_id
                        ),
                        addSignature
                      ),
                    }}
                  />
                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox
                      id="e-sign"
                      checked={addSignature}
                      onCheckedChange={(checked) =>
                        setAddSignature(checked as boolean)
                      }
                    />
                    <Label htmlFor="e-sign">Add E-Signature</Label>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">
                  This is a file-based template ({templates.find((t) => t.id === selectedRequest.template_id)?.template_type?.toUpperCase()}). It will be downloaded directly.
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleApproveAndDownload}>
              Approve and Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReturnOpen} onOpenChange={(open) => {
        setIsReturnOpen(open);
        if (!open) {
          setSelectedRequest(null);
          setPreviewStudentDetails(null);
          setReturnReason("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reason for Return</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="return-reason">
              Please provide a reason for returning this request to the HOD.
            </Label>
            <Textarea
              id="return-reason"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleReturn} disabled={!returnReason}>
              Confirm Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PrincipalPendingRequests;