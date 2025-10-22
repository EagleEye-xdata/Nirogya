import React, { useState, useEffect, Suspense, lazy } from "react";
import { NeuroCard } from "@/components/ui/neuro-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Loader2, Share2, MessageCircle, Activity, SendHorizonal } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const UploadSection = lazy(() =>
  import("@/components/reports/UploadSection").then((m) => ({ default: m.UploadSection }))
);

interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: string;
};

type HealthMetric = "bloodPressure" | "heartRate" | "weight" | "glucose" | "cholesterol";

interface HealthData {
  name: string;
  bloodPressure: number;
  heartRate: number;
  weight: number;
  glucose?: number;
  cholesterol?: number;
  date: string;
}

type LocalReport = {
  id: string;
  name: string;
  uploadedAt: string;
  type?: string;
  sharedWithDoctors?: string[];
  metrics?: {
    date: string;
    value: number;
    unit: string;
  }[];
};

const MOCK_DOCTORS: Doctor[] = [
  { id: "dr-smith", name: "Dr. Smith", specialization: "Cardiologist" },
  { id: "dr-jones", name: "Dr. Jones", specialization: "General Physician" },
  { id: "dr-patel", name: "Dr. Patel", specialization: "Endocrinologist" },
  { id: "dr-wilson", name: "Dr. Wilson", specialization: "Neurologist" },
  { id: "dr-brown", name: "Dr. Brown", specialization: "Orthopedic Surgeon" },
  { id: "dr-chen", name: "Dr. Chen", specialization: "Dermatologist" },
  { id: "dr-kumar", name: "Dr. Kumar", specialization: "Pulmonologist" },
  { id: "dr-garcia", name: "Dr. Garcia", specialization: "Pediatrician" },
  { id: "dr-taylor", name: "Dr. Taylor", specialization: "Ophthalmologist" },
];

const HISTORY_KEY = "nirogya.uploads.history";
const MESSAGES_KEY = "nirogya.chat.history";

const MOCK_HEALTH_DATA: HealthData[] = [
  {
    name: "Jan",
    date: "2024-01-15",
    bloodPressure: 120,
    heartRate: 75,
    weight: 70,
    glucose: 95,
    cholesterol: 175,
  },
  {
    name: "Feb",
    date: "2024-02-15",
    bloodPressure: 118,
    heartRate: 72,
    weight: 71,
    glucose: 98,
    cholesterol: 180,
  },
  {
    name: "Mar",
    date: "2024-03-15",
    bloodPressure: 122,
    heartRate: 78,
    weight: 69,
    glucose: 105,
    cholesterol: 185,
  },
  {
    name: "Apr",
    date: "2024-04-15",
    bloodPressure: 119,
    heartRate: 73,
    weight: 70,
    glucose: 100,
    cholesterol: 178,
  },
];
export default function UploadReports() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [history, setHistory] = useState<LocalReport[]>([]);
  const [selected, setSelected] = useState<LocalReport | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [showAIChat, setShowAIChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<HealthMetric>("bloodPressure");
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  // Load chat history
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(MESSAGES_KEY);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch {
      setMessages([]);
    }
  }, []);

  // Save chat history
  useEffect(() => {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  }, [messages]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load upload history
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      setHistory([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const upload = async () => {
    if (files.length === 0) return toast({ title: "No files selected", variant: "destructive" });
    setUploading(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      const added = files.map((f) => ({
        id: `${Date.now()}-${f.name}`,
        name: f.name,
        uploadedAt: new Date().toISOString(),
      }));
      setHistory((s) => [...added, ...s].slice(0, 50));
      setFiles([]);
      toast({ title: "Saved to history" });
    } catch (e) {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const clearHistory = () => setHistory([]);

  const handleMetricChange = (metric: HealthMetric) => {
    setSelectedMetric(metric);
  };

  const shareWithDoctor = (report: LocalReport) => {
    setSelected(report);
    setSelectedDoctor("");
  };

  const handleShare = async () => {
    if (!selectedDoctor || !selected) return;

    // Update report's shared status
    const updatedHistory = history.map((h) => {
      if (h.id === selected.id) {
        return {
          ...h,
          sharedWithDoctors: [...(h.sharedWithDoctors || []), selectedDoctor],
        };
      }
      return h;
    });

    setHistory(updatedHistory);
    toast({
      title: "Report Shared",
      description: `Shared with ${MOCK_DOCTORS.find((d) => d.id === selectedDoctor)?.name}`,
    });
    setSelected(null);
  };

  const getAIResponse = (query: string): string => {
    const latest = MOCK_HEALTH_DATA[MOCK_HEALTH_DATA.length - 1];
    const lowerQuery = query.toLowerCase();

    // Specific metric responses
    if (lowerQuery.includes("blood pressure")) {
      const status = getMetricStatus("bloodPressure");
      const response = `Your latest blood pressure reading is ${latest.bloodPressure} mmHg (${status}).`;

      if (status === "High") {
        return (
          response +
          "\nRecommendations:\n" +
          "- Reduce sodium intake to less than 2,300mg per day\n" +
          "- Exercise regularly (30 minutes of moderate activity)\n" +
          "- Practice stress management techniques\n" +
          "- Consider scheduling a check-up with Dr. Smith (Cardiologist)"
        );
      } else if (status === "Elevated") {
        return (
          response +
          "\nPreventive measures:\n" +
          "- Monitor your blood pressure regularly\n" +
          "- Maintain a healthy diet rich in fruits and vegetables\n" +
          "- Limit alcohol consumption\n" +
          "- Stay physically active"
        );
      }
      return response + "\nKeep maintaining your healthy lifestyle!";
    }

    if (lowerQuery.includes("heart") || lowerQuery.includes("pulse")) {
      const status = getMetricStatus("heartRate");
      const response = `Your heart rate is ${latest.heartRate} BPM (${status}).`;

      if (status !== "Normal") {
        return (
          response +
          "\nSuggestions:\n" +
          "- Regular cardiovascular exercise\n" +
          "- Practice deep breathing exercises\n" +
          "- Maintain good sleep habits\n" +
          "- Consider scheduling a consultation with our cardiologist"
        );
      }
      return response + "\nYour heart rate is in the healthy range. Great job!";
    }

    if (lowerQuery.includes("glucose")) {
      const status = getMetricStatus("glucose");
      const response = `Your blood glucose level is ${latest.glucose} mg/dL (${status}).`;

      if (status === "High") {
        return (
          response +
          "\nRecommendations:\n" +
          "- Monitor carbohydrate intake\n" +
          "- Exercise regularly\n" +
          "- Stay hydrated\n" +
          "- Consider consulting Dr. Patel (Endocrinologist)"
        );
      } else if (status === "Low") {
        return (
          response +
          "\nImmediate steps:\n" +
          "- Consume fast-acting carbohydrates\n" +
          "- Monitor levels more frequently\n" +
          "- Have regular, balanced meals\n" +
          "- Discuss with your healthcare provider"
        );
      }
      return response + "\nYour glucose levels are well-maintained!";
    }

    if (lowerQuery.includes("cholesterol")) {
      const status = getMetricStatus("cholesterol");
      const response = `Your cholesterol level is ${latest.cholesterol} mg/dL (${status}).`;

      if (status === "High" || status === "Borderline") {
        return (
          response +
          "\nRecommendations:\n" +
          "- Reduce saturated and trans fats\n" +
          "- Increase fiber intake\n" +
          "- Exercise regularly\n" +
          "- Consider scheduling a lipid panel test"
        );
      }
      return response + "\nYour cholesterol levels are in the healthy range!";
    }

    if (lowerQuery.includes("weight")) {
      const status = getMetricStatus("weight");
      const trend = latest.weight - MOCK_HEALTH_DATA[0].weight;
      const response = `Your weight is currently ${latest.weight} kg (${status}). `;

      if (status !== "Stable") {
        return (
          response +
          `There's been a ${trend > 0 ? "gain" : "loss"} of ${Math.abs(trend).toFixed(1)}kg.\n` +
          "Recommendations:\n" +
          "- Maintain a balanced nutrition plan\n" +
          "- Regular physical activity\n" +
          "- Track your meals and exercise\n" +
          "- Consider consulting with our nutritionist"
        );
      }
      return response + "Your weight has been stable. Keep maintaining your healthy lifestyle!";
    }

    if (lowerQuery.includes("doctor") || lowerQuery.includes("specialist")) {
      return (
        "I can help you connect with our specialists:\n" +
        "- Dr. Smith (Cardiologist) - Heart and blood pressure\n" +
        "- Dr. Patel (Endocrinologist) - Diabetes and hormones\n" +
        "- Dr. Jones (General Physician) - Overall health\n" +
        "Which specialist would you like to consult?"
      );
    }

    if (lowerQuery.includes("report") || lowerQuery.includes("export")) {
      return (
        "I can help you:\n" +
        "- Export your health data as a comprehensive report\n" +
        "- Share reports with specific doctors\n" +
        "- View historical health trends\n" +
        "What would you like to do?"
      );
    }

    // Default response with overview
    return (
      "I can help you understand your health metrics:\n" +
      `- Blood Pressure: ${latest.bloodPressure} mmHg (${getMetricStatus("bloodPressure")})\n` +
      `- Heart Rate: ${latest.heartRate} BPM (${getMetricStatus("heartRate")})\n` +
      `- Weight: ${latest.weight} kg (${getMetricStatus("weight")})\n` +
      `- Glucose: ${latest.glucose} mg/dL (${getMetricStatus("glucose")})\n` +
      `- Cholesterol: ${latest.cholesterol} mg/dL (${getMetricStatus("cholesterol")})\n\n` +
      "Ask me about any specific metric or type 'export' to download your health report!"
    );
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: chatInput,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setChatInput("");

    // Simulate AI response with smart health advice
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(chatInput),
        sender: "ai",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  const getMetricStatus = (metric: HealthMetric) => {
    const latest = MOCK_HEALTH_DATA[MOCK_HEALTH_DATA.length - 1];
    switch (metric) {
      case "bloodPressure": {
        const systolic = latest.bloodPressure;
        if (systolic < 120) return "Normal";
        if (systolic < 130) return "Elevated";
        return "High";
      }
      case "heartRate": {
        const hr = latest.heartRate;
        if (hr < 60) return "Low";
        if (hr <= 100) return "Normal";
        return "High";
      }
      case "weight": {
        const trend = latest.weight - MOCK_HEALTH_DATA[0].weight;
        if (Math.abs(trend) < 1) return "Stable";
        return trend > 0 ? "Increasing" : "Decreasing";
      }
      case "glucose": {
        const glucose = latest.glucose || 100; // Mock data
        if (glucose < 70) return "Low";
        if (glucose <= 140) return "Normal";
        return "High";
      }
      case "cholesterol": {
        const chol = latest.cholesterol || 180; // Mock data
        if (chol < 200) return "Normal";
        if (chol < 240) return "Borderline";
        return "High";
      }
      default:
        return "Unknown";
    }
  };

  const exportHealthData = () => {
    const data = {
      patientInfo: {
        // Mock patient info
        name: "Patient Name",
        id: "P12345",
        dateGenerated: new Date().toISOString(),
      },
      metrics: MOCK_HEALTH_DATA,
      reports: history,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `health-report-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Exported",
      description: "Your health data has been downloaded successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Medical Reports</h1>
      </div>

      <NeuroCard topBorderColor="#3B82F6">
        <div className="space-y-6">
          <Suspense fallback={<div>Loading...</div>}>
            <UploadSection onFileChange={onFiles} files={files} />
          </Suspense>

          <AnimatedButton
            onClick={upload}
            disabled={uploading || files.length === 0}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload & Save"
            )}
          </AnimatedButton>
        </div>
      </NeuroCard>

      <Tabs defaultValue="history">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="clear">Clear</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <div className="space-y-2">
            {history.length === 0 ? (
              <div className="text-sm text-muted-foreground">No uploads yet.</div>
            ) : (
              history.map((h) => (
                <div key={h.id} className="flex items-center justify-between rounded border p-3">
                  <div>
                    <div className="font-medium">{h.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(h.uploadedAt).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <button className="text-sm text-primary" onClick={() => setSelected(h)}>
                      View
                    </button>
                    <button
                      className="ml-2 text-sm text-blue-500"
                      onClick={() => {
                        setSelected(h);
                        setSelectedDoctor("");
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="text-sm text-muted-foreground">(Local-only mode: no API calls.)</div>
        </TabsContent>

        <TabsContent value="clear">
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">Clear local upload history</div>
            <button className="btn btn-destructive" onClick={clearHistory}>
              Clear
            </button>
          </div>
        </TabsContent>
      </Tabs>

      <Tabs defaultValue="reports" className="mt-6">
        <TabsList>
          <TabsTrigger value="reports">Health Stats</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <NeuroCard>
            <div className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Health Metrics</h3>
                <Select value={selectedMetric} onValueChange={handleMetricChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bloodPressure">Blood Pressure</SelectItem>
                    <SelectItem value="heartRate">Heart Rate</SelectItem>
                    <SelectItem value="weight">Weight</SelectItem>
                    <SelectItem value="glucose">Blood Glucose</SelectItem>
                    <SelectItem value="cholesterol">Cholesterol</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer>
                  <LineChart data={MOCK_HEALTH_DATA}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-medium text-muted-foreground">Current Status</h4>
                <div className="mt-1 text-lg font-semibold text-primary">
                  {getMetricStatus(selectedMetric)}
                </div>
              </div>
            </div>
          </NeuroCard>
        </TabsContent>

        <TabsContent value="trends">
          <NeuroCard>
            <div className="p-4">
              <h3 className="mb-4 text-lg font-semibold">Health Trends</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">Blood Pressure</div>
                  <div className="mt-1 text-2xl font-bold">120/80</div>
                  <div className="mt-2 flex items-center text-sm text-green-500">
                    <Activity className="mr-1 h-4 w-4" />
                    Normal
                  </div>
                </div>
              </div>
            </div>
          </NeuroCard>
        </TabsContent>
      </Tabs>

      <Dialog>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="p-4">
              <p className="text-sm text-muted-foreground">
                Uploaded: {new Date(selected.uploadedAt).toLocaleString()}
              </p>
              <div className="mt-4">
                <h4 className="font-medium">Share with Doctor</h4>
                <div className="mt-2 flex gap-2">
                  <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_DOCTORS.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleShare} disabled={!selectedDoctor}>
                    Share
                  </Button>
                </div>
              </div>
              <div className="mt-4">
                <button className="btn" onClick={() => setSelected(null)}>
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Chatbot Bubble */}
      <div className="fixed bottom-6 right-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="icon" className="h-12 w-12 rounded-full bg-primary shadow-lg">
              <MessageCircle className="h-6 w-6 text-white" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>AI Health Assistant</DialogTitle>
            </DialogHeader>
            <div className="h-[400px] overflow-y-auto rounded-lg border p-4">
              <div className="flex flex-col space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-lg p-3 ${
                      msg.sender === "user"
                        ? "self-end bg-primary text-primary-foreground"
                        : "self-start bg-muted"
                    }`}
                  >
                    {msg.text}
                    <div className="mt-1 text-xs opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="self-start rounded-lg bg-muted p-3">
                    Hello! How can I help you understand your health reports today?
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 rounded-md border p-2"
              />
              <Button size="icon" onClick={sendMessage} disabled={!chatInput.trim()}>
                <SendHorizonal className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
