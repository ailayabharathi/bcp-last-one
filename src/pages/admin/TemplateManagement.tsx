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
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreHorizontal, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CertificateTemplate } from "@/lib/types";
import { showSuccess, showError } from "@/utils/toast";
import RichTextEditor from "@/components/shared/RichTextEditor";
import { createTemplate, deleteTemplate, fetchTemplates, updateTemplate } from "@/data/appData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TemplateManagement = () => {
  const [templates, setTemplates] =
    useState<CertificateTemplate[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [currentTemplate, setCurrentTemplate] = useState<
    Partial<CertificateTemplate>
  >({ template_type: "html", content: "" }); // Default to HTML with empty content
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTemplatesData = async () => {
    setLoading(true);
    const fetchedTemplates = await fetchTemplates();
    setTemplates(fetchedTemplates);
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplatesData();
  }, []);

  const handleOpenDialog = (
    mode: "create" | "edit",
    template?: CertificateTemplate
  ) => {
    setDialogMode(mode);
    let initialTemplate: Partial<CertificateTemplate>;

    if (mode === "create") {
      // For create mode, explicitly set default values for an HTML template
      initialTemplate = { name: "", template_type: "html", content: "" };
    } else { // mode === "edit"
      // For edit mode, copy the existing template
      initialTemplate = { ...template! }; // 'template' is guaranteed to be defined in 'edit' mode
      // Ensure content is an empty string if template_type is html and content is undefined/null
      if (initialTemplate.template_type === "html" && (initialTemplate.content === undefined || initialTemplate.content === null)) {
        initialTemplate.content = "";
      }
    }
    setCurrentTemplate(initialTemplate);
    setSelectedFile(null); // Clear selected file on dialog open
    setIsDialogOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (!currentTemplate.name) {
      showError("Template name is required.");
      return;
    }

    // Ensure content is an empty string if template_type is html and content is undefined/null
    const contentToSave = currentTemplate.template_type === "html" ? (currentTemplate.content || "") : undefined;

    if (currentTemplate.template_type === "html" && !contentToSave) {
      showError("HTML content is required for HTML templates.");
      return;
    }

    if ((currentTemplate.template_type === "pdf" || currentTemplate.template_type === "word") && !selectedFile && dialogMode === "create") {
      showError("A file is required for PDF/Word templates.");
      return;
    }

    if (dialogMode === "create") {
      const newTemplatePayload: Omit<CertificateTemplate, 'id' | 'created_at' | 'file_url'> = {
        name: currentTemplate.name,
        content: contentToSave,
        template_type: currentTemplate.template_type!, // template_type is guaranteed to be set
      };
      const created = await createTemplate(newTemplatePayload, selectedFile || undefined);
      if (created) {
        showSuccess(`Template "${created.name}" created successfully.`);
        fetchTemplatesData();
      } else {
        showError("Failed to create template.");
      }
    } else {
      if (!currentTemplate.id) {
        showError("Template ID is missing for update.");
        return;
      }
      const updated = await updateTemplate(currentTemplate.id, {
        name: currentTemplate.name,
        content: contentToSave,
        template_type: currentTemplate.template_type!, // template_type is guaranteed to be set
      }, selectedFile || undefined);
      if (updated) {
        showSuccess(`Template "${updated.name}" updated successfully.`);
        fetchTemplatesData();
      } else {
        showError("Failed to update template.");
      }
    }
    setIsDialogOpen(false);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    const templateName = templates.find((t) => t.id === templateId)?.name;
    const deleted = await deleteTemplate(templateId);
    if (deleted) {
      showSuccess(`Template "${templateName}" deleted successfully.`);
      fetchTemplatesData();
    } else {
      showError("Failed to delete template.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Templates...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please wait while we fetch template data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Template Management</CardTitle>
        <Button onClick={() => handleOpenDialog("create")}>
          Add New Template
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length > 0 ? (
              templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.template_type?.toUpperCase() || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => handleOpenDialog("edit", template)}
                        >
                          Edit
                        </DropdownMenuItem>
                        {template.file_url && (
                          <DropdownMenuItem asChild>
                            <a href={template.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                              <Download className="mr-2 h-4 w-4" /> Download
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No templates found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Create New" : "Edit"} Template
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={currentTemplate.name || ""}
                onChange={(e) =>
                  setCurrentTemplate({
                    ...currentTemplate,
                    name: e.target.value,
                  })
                }
                placeholder="e.g., Standard Bonafide"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="template-type">Template Type</Label>
              <Select
                value={currentTemplate.template_type || "html"}
                onValueChange={(value: "html" | "pdf" | "word") => {
                  setCurrentTemplate((prev) => ({
                    ...prev,
                    template_type: value,
                    content: value === "html" ? (prev?.content || "") : undefined, // Clear content if not HTML
                    file_url: value !== "html" ? prev?.file_url : undefined, // Clear file_url if HTML
                  }));
                  setSelectedFile(null); // Clear file when type changes
                }}
              >
                <SelectTrigger id="template-type">
                  <SelectValue placeholder="Select template type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="html">HTML Content</SelectItem>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="word">Word Document</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {currentTemplate.template_type === "html" ? (
              <div className="grid gap-2">
                <Label htmlFor="template-content">Content</Label>
                <RichTextEditor
                  content={currentTemplate.content || ""} // Ensure content is always a string
                  onChange={(content) =>
                    setCurrentTemplate({ ...currentTemplate, content })
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use placeholders like {"{studentName}"}, {"{studentId}"}, etc.
                </p>
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="template-file">
                  Upload {currentTemplate.template_type?.toUpperCase()} File
                </Label>
                <Input
                  id="template-file"
                  type="file"
                  accept={currentTemplate.template_type === "pdf" ? ".pdf" : ".docx"}
                  onChange={handleFileChange}
                />
                {currentTemplate.file_url && !selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Current file:{" "}
                    <a
                      href={currentTemplate.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      View
                    </a>
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TemplateManagement;