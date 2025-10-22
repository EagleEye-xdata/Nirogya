import { Report } from "@/services/api/reports";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DialogHeader, DialogTitle, DialogContent } from "@/components/ui/dialog";

interface ReportDetailsProps {
  report: Report;
}

export const ReportDetails = ({ report }: ReportDetailsProps) => {
  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Report Details</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{report.name}</h3>
            <p className="text-sm text-muted-foreground">
              Uploaded on {format(report.uploadedAt, "MMM d, yyyy")}
            </p>
          </div>
          <Badge
            variant={
              report.status === "Reviewed"
                ? "default"
                : report.status === "Sent to Doctor"
                  ? "secondary"
                  : "outline"
            }
          >
            {report.status}
          </Badge>
        </div>

        <div className="space-y-3 rounded-lg bg-muted p-4">
          <h4 className="font-semibold">AI Analysis</h4>
          <p className="font-medium">{report.analysis.summary}</p>

          <div className="space-y-2">
            <h5 className="text-sm font-semibold">Key Findings:</h5>
            <div className="grid gap-2">
              {report.analysis.findings.map((finding, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span>{finding.key}</span>
                  <Badge
                    variant={
                      finding.severity === "normal"
                        ? "default"
                        : finding.severity === "warning"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {finding.value}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="text-sm font-semibold">Recommendations:</h5>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {report.analysis.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>

          <div className="text-xs text-muted-foreground">
            AI Confidence: {(report.analysis.confidence * 100).toFixed(1)}%
          </div>
        </div>

        {report.doctorFeedback && (
          <div className="space-y-3 rounded-lg bg-accent/10 p-4">
            <h4 className="font-semibold">Doctor's Feedback</h4>
            <p>{report.doctorFeedback.comment}</p>

            <div className="space-y-2">
              <h5 className="text-sm font-semibold">Recommendations:</h5>
              <ul className="list-inside list-disc space-y-1 text-sm">
                {report.doctorFeedback.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>

            {report.doctorFeedback.prescriptions && (
              <div className="space-y-2">
                <h5 className="text-sm font-semibold">Prescriptions:</h5>
                <div className="grid gap-2">
                  {report.doctorFeedback.prescriptions.map((prescription, idx) => (
                    <div key={idx} className="rounded-lg bg-background p-2 text-sm">
                      <div className="font-medium">{prescription.medicine}</div>
                      <div className="text-muted-foreground">
                        {prescription.dosage} - {prescription.duration}
                        {prescription.notes && ` (${prescription.notes})`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{report.doctorName}</span>
              <div className="space-y-1 text-right">
                <div>Reviewed on {format(report.reviewedAt!, "MMM d, yyyy")}</div>
                {report.doctorFeedback.followUpDate && (
                  <div>
                    Follow-up on {format(report.doctorFeedback.followUpDate, "MMM d, yyyy")}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  );
};
