import { Upload, FileText } from "lucide-react";
import { AnimatedButton } from "@/components/ui/animated-button";

interface UploadSectionProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  files: File[];
}

export const UploadSection = ({ onFileChange, files }: UploadSectionProps) => {
  return (
    <div className="rounded-xl border-2 border-dashed border-border p-12 text-center transition-colors hover:border-primary">
      <Upload className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
      <input
        type="file"
        multiple
        accept=".pdf,.jpg,.png,.jpeg"
        onChange={onFileChange}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="mb-2 text-lg font-semibold">Drop files here or click to browse</div>
        <div className="text-sm text-muted-foreground">Supports PDF, JPG, PNG (Max 10MB each)</div>
      </label>

      {files.length > 0 && (
        <div className="mt-6 space-y-2">
          <p className="font-semibold">Selected Files:</p>
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
              <FileText className="h-5 w-5 text-primary" />
              <span className="flex-1">{file.name}</span>
              <span className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
