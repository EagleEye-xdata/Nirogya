import { useState } from "react";
import { NeuroCard } from "@/components/ui/neuro-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Send, Bot, User } from "lucide-react";

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI health assistant. I can help you understand your reports and answer health-related questions. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Mock AI response
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const aiResponse = {
      role: "assistant",
      content:
        "Based on your recent blood test results, your parameters are within normal range. However, I notice your cholesterol is slightly elevated. I recommend incorporating more fiber-rich foods and regular exercise. Would you like specific dietary suggestions?",
    };

    setMessages((prev) => [...prev, aiResponse]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] animate-fade-in">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">AI Health Assistant</h1>
        <p className="text-muted-foreground">
          Ask anything about your health and reports
        </p>
      </div>

      <NeuroCard className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shrink-0">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[70%] p-4 rounded-xl ${
                  msg.role === "user" ? "bg-primary text-white" : "bg-muted"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
              </div>
              {msg.role === "user" && (
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shrink-0">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="bg-muted p-4 rounded-xl">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <div
                    className="w-2 h-2 rounded-full bg-primary animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-primary animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your question..."
              className="flex-1 px-4 py-3 rounded-xl bg-neuro-base shadow-neuro-inset focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <AnimatedButton
              onClick={handleSend}
              disabled={loading}
              size="md"
              variant="gradient"
            >
              <Send className="h-5 w-5" />
            </AnimatedButton>
          </div>
        </div>
      </NeuroCard>
    </div>
  );
};

export default AIChat;
