import axios from "axios";
import {
  ReportsService,
  Report,
  UploadReportRequest,
  AIAnalysisResponse,
} from "@/services/api/reports";

// Custom hook for managing report uploads and AI analysis
export const useReportUpload = () => {
  const uploadAndAnalyze = async (
    file: File,
    additionalInfo: Omit<UploadReportRequest, "file">
  ) => {
    try {
      // Step 1: Upload the file
      const { reportId } = await ReportsService.uploadReport({
        file,
        ...additionalInfo,
      });

      // Step 2: Get AI Analysis
      const analysis = await ReportsService.getAIAnalysis(reportId);

      return { reportId, analysis };
    } catch (error) {
      console.error("Error in upload and analyze:", error);
      throw error;
    }
  };

  return { uploadAndAnalyze };
};

// Custom hook for managing report operations
export const useReports = (patientId: string) => {
  const sendToDoctor = async (reportId: string, doctorId: string) => {
    try {
      await ReportsService.sendToDoctor(reportId, doctorId);
      await ReportsService.updateReportStatus(reportId, "Sent to Doctor");
    } catch (error) {
      console.error("Error sending report to doctor:", error);
      throw error;
    }
  };

  const getReports = async () => {
    try {
      return await ReportsService.getPatientReports(patientId);
    } catch (error) {
      console.error("Error fetching reports:", error);
      throw error;
    }
  };

  const getReportDetails = async (reportId: string) => {
    try {
      return await ReportsService.getReport(reportId);
    } catch (error) {
      console.error("Error fetching report details:", error);
      throw error;
    }
  };

  return {
    sendToDoctor,
    getReports,
    getReportDetails,
  };
};

// Custom hook for real-time report status updates (can be implemented with WebSocket)
export const useReportStatusUpdates = (reportId: string) => {
  // TODO: Implement WebSocket connection for real-time updates
  // This will be useful for tracking AI analysis progress and doctor review status
  return {
    status: "not_implemented",
    lastUpdate: null,
  };
};
