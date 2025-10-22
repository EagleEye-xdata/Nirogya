// Types for API Requests and Responses
export interface UploadReportRequest {
  file: File;
  patientId: string;
  reportType: string;
  additionalNotes?: string;
}

export interface AIAnalysisResponse {
  summary: string;
  findings: {
    key: string;
    value: string;
    severity?: "normal" | "warning" | "critical";
  }[];
  recommendations: string[];
  confidence: number;
}

export interface Report {
  id: string;
  patientId: string;
  name: string;
  status: "Uploaded" | "Analyzing" | "Analyzed" | "Sent to Doctor" | "Reviewed";
  analysis: AIAnalysisResponse;
  uploadedAt: Date;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  doctorFeedback?: {
    comment: string;
    recommendations: string[];
    prescriptions?: {
      medicine: string;
      dosage: string;
      duration: string;
      notes?: string;
    }[];
    followUpDate?: Date;
  };
  doctorId?: string;
  doctorName?: string;
  reviewedAt?: Date;
  metadata?: {
    hospitalName?: string;
    labName?: string;
    testDate?: Date;
    reportCategory?: string;
    referringDoctor?: string;
  };
}

// API Service class - To be implemented with actual backend integration
export class ReportsService {
  private static BASE_URL = "/api/reports"; // Will be configured from environment

  // Upload a new report
  static async uploadReport(request: UploadReportRequest): Promise<{ reportId: string }> {
    // TODO: Implement file upload with multipart/form-data
    throw new Error("Not implemented");
  }

  // Get AI analysis for a report
  static async getAIAnalysis(reportId: string): Promise<AIAnalysisResponse> {
    // TODO: Implement AI analysis request
    throw new Error("Not implemented");
  }

  // Send report to a doctor
  static async sendToDoctor(reportId: string, doctorId: string): Promise<void> {
    // TODO: Implement send to doctor
    throw new Error("Not implemented");
  }

  // Get all reports for a patient
  static async getPatientReports(patientId: string): Promise<Report[]> {
    // TODO: Implement get reports
    throw new Error("Not implemented");
  }

  // Get a single report by ID
  static async getReport(reportId: string): Promise<Report> {
    // TODO: Implement get report
    throw new Error("Not implemented");
  }

  // Update report status
  static async updateReportStatus(reportId: string, status: Report["status"]): Promise<void> {
    // TODO: Implement status update
    throw new Error("Not implemented");
  }

  // Add doctor feedback
  static async addDoctorFeedback(
    reportId: string,
    feedback: NonNullable<Report["doctorFeedback"]>
  ): Promise<void> {
    // TODO: Implement add feedback
    throw new Error("Not implemented");
  }
}
