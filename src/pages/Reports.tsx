import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, Download, Eye, Trash2, File } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Report {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  category: "blood-test" | "scan" | "prescription" | "other";
  fileData?: string; // Base64 encoded file data
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: "1",
      name: "Complete Blood Count",
      type: "PDF",
      uploadDate: "2025-11-28",
      size: "1.2 MB",
      category: "blood-test",
    },
    {
      id: "2",
      name: "Chest X-Ray Results",
      type: "PDF",
      uploadDate: "2025-11-15",
      size: "3.5 MB",
      category: "scan",
    },
    {
      id: "3",
      name: "Prescription - Dr. Johnson",
      type: "PDF",
      uploadDate: "2025-10-30",
      size: "0.8 MB",
      category: "prescription",
    },
    {
      id: "4",
      name: "Lipid Profile Test",
      type: "PDF",
      uploadDate: "2025-10-15",
      size: "1.0 MB",
      category: "blood-test",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reportName, setReportName] = useState("");
  const [reportCategory, setReportCategory] = useState<Report["category"]>("other");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragFileInputRef = useRef<HTMLInputElement>(null);

  // Load reports from localStorage on mount
  useEffect(() => {
    const savedReports = localStorage.getItem('reports_data');
    if (savedReports) {
      setReports(JSON.parse(savedReports));
    }
  }, []);

  // Save reports to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('reports_data', JSON.stringify(reports));
  }, [reports]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setReportName(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleUploadReport = async () => {
    if (!selectedFile || !reportName) return;

    // Convert file to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      const newReport: Report = {
        id: Date.now().toString(),
        name: reportName,
        type: selectedFile.type.includes('pdf') ? 'PDF' : selectedFile.type.includes('image') ? 'Image' : 'File',
        uploadDate: new Date().toISOString().split('T')[0],
        size: formatFileSize(selectedFile.size),
        category: reportCategory,
        fileData: base64String,
      };

      setReports(prev => [newReport, ...prev]);
      setDialogOpen(false);
      setSelectedFile(null);
      setReportName("");
      setReportCategory("other");
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleDeleteReport = (id: string) => {
    setReports(prev => prev.filter(report => report.id !== id));
  };

  const handleDownloadReport = (report: Report) => {
    if (report.fileData) {
      const link = document.createElement('a');
      link.href = report.fileData;
      link.download = `${report.name}.${report.type.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewReport = (report: Report) => {
    if (report.fileData) {
      window.open(report.fileData, '_blank');
    }
  };

  const getCategoryBadge = (category: Report["category"]) => {
    switch (category) {
      case "blood-test":
        return <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200">Blood Test</Badge>;
      case "scan":
        return <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200">Scan</Badge>;
      case "prescription":
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">Prescription</Badge>;
      default:
        return <Badge variant="outline">Other</Badge>;
    }
  };

  const getCategoryIcon = (category: Report["category"]) => {
    switch (category) {
      case "blood-test":
        return "🩸";
      case "scan":
        return "🔬";
      case "prescription":
        return "💊";
      default:
        return "📄";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Medical Reports</h2>
          <p className="text-muted-foreground">Store and manage your medical documents</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Report
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Medical Report</DialogTitle>
              <DialogDescription>Add a new medical document to your records</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportName">Report Name</Label>
                <Input
                  id="reportName"
                  placeholder="e.g., Blood Test Results"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={reportCategory} onValueChange={(value) => setReportCategory(value as Report["category"])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blood-test">Blood Test</SelectItem>
                    <SelectItem value="scan">Scan</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full" 
                onClick={handleUploadReport}
                disabled={!selectedFile || !reportName}
              >
                Upload Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upload Area */}
      <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Upload Medical Reports</h3>
          <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">
            Click to browse and upload your files. Supported formats: PDF, JPG, PNG
          </p>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.gif"
            onChange={handleFileSelect}
            ref={dragFileInputRef}
            style={{ display: 'none' }}
          />
          <Button onClick={() => {
            dragFileInputRef.current?.click();
            setDialogOpen(true);
          }}>
            Choose File
          </Button>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Reports</p>
              <p className="text-3xl font-bold text-foreground">{reports.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Blood Tests</p>
              <p className="text-3xl font-bold text-foreground">
                {reports.filter((r) => r.category === "blood-test").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Scans</p>
              <p className="text-3xl font-bold text-foreground">
                {reports.filter((r) => r.category === "scan").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Prescriptions</p>
              <p className="text-3xl font-bold text-foreground">
                {reports.filter((r) => r.category === "prescription").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Your Reports</CardTitle>
          <CardDescription>All your uploaded medical documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                    {getCategoryIcon(report.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground truncate">{report.name}</h4>
                      {getCategoryBadge(report.category)}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <File className="w-4 h-4" />
                        {report.type}
                      </span>
                      <span>•</span>
                      <span>{report.size}</span>
                      <span>•</span>
                      <span>
                        {new Date(report.uploadDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    title="Preview"
                    onClick={() => handleViewReport(report)}
                    disabled={!report.fileData}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    title="Download"
                    onClick={() => handleDownloadReport(report)}
                    disabled={!report.fileData}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive" 
                    title="Delete"
                    onClick={() => handleDeleteReport(report.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
