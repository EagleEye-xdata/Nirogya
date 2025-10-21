import { useState } from "react";
import { NeuroCard } from "@/components/ui/neuro-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Mic, Square, FileText, Copy, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AIScribe = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [prescription, setPrescription] = useState("");

  const handleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      toast({ title: "Recording started..." });

      // Mock recording for 3 seconds
      setTimeout(() => {
        setIsRecording(false);
        const mockTranscript =
          "Patient complains of persistent headache for 3 days. Temperature normal. Blood pressure 120/80. Prescribe Paracetamol 500mg twice daily for 3 days. Advise rest and hydration.";
        setTranscription(mockTranscript);

        const mockPrescription = `
PRESCRIPTION

Patient: [Name]
Date: ${new Date().toLocaleDateString("en-IN")}

Chief Complaint: Persistent headache (3 days)

Vitals:
- Temperature: Normal
- Blood Pressure: 120/80 mmHg

Diagnosis: Tension headache

Prescription:
1. Tab. Paracetamol 500mg
   - Dosage: 1 tablet twice daily
   - Duration: 3 days
   - After meals

Advice:
- Adequate rest
- Stay hydrated
- Avoid stress
- Follow up if symptoms persist

Dr. Smith
Reg. No: MH/12345
        `.trim();
        setPrescription(mockPrescription);
        toast({ title: "Transcription completed!" });
      }, 3000);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prescription);
    toast({ title: "Prescription copied to clipboard!" });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">AI Scribe</h1>
        <p className="text-muted-foreground">
          Voice-to-text prescription assistant
        </p>
      </div>

      <NeuroCard topBorderColor="#4F46E5" className="text-center">
        <div className="space-y-6">
          <div className="relative w-32 h-32 mx-auto">
            <div
              className={`w-full h-full rounded-full bg-gradient-doctor flex items-center justify-center transition-transform ${
                isRecording ? "scale-110 animate-pulse" : ""
              }`}
            >
              {isRecording ? (
                <Square className="h-12 w-12 text-white" />
              ) : (
                <Mic className="h-12 w-12 text-white" />
              )}
            </div>
            {isRecording && (
              <div className="absolute inset-0 rounded-full border-4 border-accent animate-ping" />
            )}
          </div>

          <div>
            <p className="text-xl font-bold mb-2">
              {isRecording ? "Recording..." : "Ready to Record"}
            </p>
            <p className="text-sm text-muted-foreground">
              {isRecording
                ? "Speak clearly about the consultation"
                : "Click the button to start recording"}
            </p>
          </div>

          <AnimatedButton
            onClick={handleRecord}
            disabled={isRecording}
            variant="gradient"
            size="lg"
          >
            {isRecording ? "Processing..." : "Start Recording"}
          </AnimatedButton>
        </div>
      </NeuroCard>

      {transcription && (
        <div className="grid md:grid-cols-2 gap-6">
          <NeuroCard topBorderColor="#F59E0B">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Transcription</h2>
              </div>
              <p className="text-sm leading-relaxed p-4 bg-muted/50 rounded-lg">
                {transcription}
              </p>
            </div>
          </NeuroCard>

          <NeuroCard topBorderColor="#34D399">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-accent" />
                  <h2 className="text-lg font-bold">Generated Prescription</h2>
                </div>
                <button
                  onClick={handleCopy}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <pre className="text-sm leading-relaxed p-4 bg-muted/50 rounded-lg whitespace-pre-wrap font-mono">
                {prescription}
              </pre>
            </div>
          </NeuroCard>
        </div>
      )}
    </div>
  );
};

export default AIScribe;
