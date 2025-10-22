import { Report } from "@/services/api/reports";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { NeuroCard } from "@/components/ui/neuro-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { FileText, Send, Clock, CheckCircle, Eye } from "lucide-react";
import { DialogTrigger } from "@/components/ui/dialog";

interface ReportCardProps {
  report: Report;
  onSendToDoctor: (report: Report) => Promise<void>;
}

export const ReportCard = ({ report, onSendToDoctor }: ReportCardProps) => {
  return (
    <NeuroCard
      topBorderColor={
        report.status === "Reviewed"
          ? "#34D399"
          : report.status === "Sent to Doctor"
            ? "#F59E0B"
            : "#3B82F6"
      }
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <p className="font-semibold">{report.name}</p>
              <p className="text-sm text-muted-foreground">
                Uploaded {format(report.uploadedAt, "MMM d, yyyy")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {report.status === "Analyzed" && (
              <AnimatedButton onClick={() => onSendToDoctor(report)} variant="outline" size="sm">
                <Send className="mr-2 h-4 w-4" />
                Send to Doctor
              </AnimatedButton>
            )}
            {report.status === "Sent to Doctor" && (
              <Badge variant="secondary" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Awaiting Review
              </Badge>
            )}
            {report.status === "Reviewed" && (
              <Badge variant="default" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Reviewed
              </Badge>
            )}
            <DialogTrigger asChild>
              <AnimatedButton variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </AnimatedButton>
            </DialogTrigger>
          </div>
        </div>
        <div className="space-y-2 rounded-lg bg-accent/10 p-4">
          <p className="text-sm font-semibold">AI Analysis:</p>
          <p className="text-sm">{report.analysis.summary}</p>
          <div className="flex flex-wrap gap-2">
            {report.analysis.findings.map((finding, idx) => (
              <Badge
                key={idx}
                variant={
                  finding.severity === "normal"
                    ? "default"
                    : finding.severity === "warning"
                      ? "secondary"
                      : "destructive"
                }
              >
                {finding.key}: {finding.value}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </NeuroCard>
  );
};
