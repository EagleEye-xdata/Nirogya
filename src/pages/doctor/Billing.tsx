import { useState } from "react";
import { NeuroCard } from "@/components/ui/neuro-card";
import { AnimatedButton } from "@/components/ui/animated-button";
import {
  IndianRupee,
  TrendingUp,
  Calendar,
  Download,
  Plus,
} from "lucide-react";

const Billing = () => {
  const [invoices] = useState([
    {
      id: "INV-001",
      patient: "Rajesh Kumar",
      date: "18 Oct 2025",
      amount: 1500,
      status: "Paid",
    },
    {
      id: "INV-002",
      patient: "Priya Sharma",
      date: "17 Oct 2025",
      amount: 2000,
      status: "Paid",
    },
    {
      id: "INV-003",
      patient: "Amit Patel",
      date: "16 Oct 2025",
      amount: 1200,
      status: "Pending",
    },
    {
      id: "INV-004",
      patient: "Sneha Reddy",
      date: "15 Oct 2025",
      amount: 1800,
      status: "Paid",
    },
  ]);

  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices
    .filter((inv) => inv.status === "Pending")
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Billing & Revenue</h1>
          <p className="text-muted-foreground">
            Track your earnings and invoices
          </p>
        </div>
        <AnimatedButton variant="gradient" size="md">
          <Plus className="h-5 w-5 mr-2" />
          New Invoice
        </AnimatedButton>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <NeuroCard topBorderColor="#4F46E5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <IndianRupee className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-accent flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12% this month
            </p>
          </div>
        </NeuroCard>

        <NeuroCard topBorderColor="#34D399">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Received</p>
              <IndianRupee className="h-5 w-5 text-accent" />
            </div>
            <p className="text-3xl font-bold text-accent">
              ₹{paidAmount.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-muted-foreground">
              {invoices.filter((i) => i.status === "Paid").length} invoices paid
            </p>
          </div>
        </NeuroCard>

        <NeuroCard topBorderColor="#F59E0B">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Pending</p>
              <IndianRupee className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-3xl font-bold text-amber-600">
              ₹{pendingAmount.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-muted-foreground">
              {invoices.filter((i) => i.status === "Pending").length} invoices
              pending
            </p>
          </div>
        </NeuroCard>
      </div>

      <NeuroCard>
        <h2 className="text-xl font-bold mb-4">Recent Invoices</h2>
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors border-l-4"
              style={{
                borderLeftColor:
                  invoice.status === "Paid" ? "#34D399" : "#F59E0B",
              }}
            >
              <div className="flex items-center gap-4 flex-1">
                <div>
                  <p className="font-semibold">{invoice.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {invoice.patient}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{invoice.date}</span>
                </div>

                <div className="text-right">
                  <p className="font-bold text-lg">
                    ₹{invoice.amount.toLocaleString("en-IN")}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      invoice.status === "Paid"
                        ? "bg-accent/10 text-accent"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </div>

                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </NeuroCard>
    </div>
  );
};

export default Billing;
