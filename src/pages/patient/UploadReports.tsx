import { useState } from "react";
import { NeuroCard } from "@/components/ui/neuro-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const UploadReports = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ name: string; status: string; analysis: string }>
  >([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({ title: "No files selected", variant: "destructive" });
      return;
    }

    setUploading(true);

    // Mock upload and AI analysis
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const analyzed = files.map((file) => ({
      name: file.name,
      status: "Analyzed",
      analysis:
        "Blood sugar levels normal. Cholesterol slightly elevated. Recommend dietary changes.",
    }));

    setUploadedFiles((prev) => [...analyzed, ...prev]);
    setFiles([]);
    setUploading(false);
    toast({ title: "Reports uploaded and analyzed successfully!" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Upload Medical Reports</h1>
        <p className="text-muted-foreground">
          Upload your reports for AI-powered analysis
        </p>
      </div>

      <NeuroCard topBorderColor="#3B82F6">
        <div className="space-y-6">
          <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary transition-colors">
            <Upload className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.png,.jpeg"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-lg font-semibold mb-2">
                Drop files here or click to browse
              </div>
              <div className="text-sm text-muted-foreground">
                Supports PDF, JPG, PNG (Max 10MB each)
              </div>
            </label>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <p className="font-semibold">Selected Files:</p>
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg"
                >
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="flex-1">{file.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                </div>
              ))}
            </div>
          )}

          <AnimatedButton
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="w-full"
            variant="gradient"
            size="md"
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Upload & Analyze"
            )}
          </AnimatedButton>
        </div>
      </NeuroCard>

      {uploadedFiles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Recently Uploaded</h2>
          {uploadedFiles.map((file, idx) => (
            <NeuroCard key={idx} topBorderColor="#34D399">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-primary" />
                    <div>
                      <p className="font-semibold">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded just now
                      </p>
                    </div>
                  </div>
                  <CheckCircle className="h-6 w-6 text-accent" />
                </div>
                <div className="p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm font-semibold mb-1">AI Analysis:</p>
                  <p className="text-sm">{file.analysis}</p>
                </div>
              </div>
            </NeuroCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default UploadReports;
