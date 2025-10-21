import { Link } from "react-router-dom";
import { AnimatedButton } from "@/components/ui/animated-button";
import { ShadButton } from "@/components/ui/shad-button";
import { NeuroCard } from "@/components/ui/neuro-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FadeIn, SlideIn } from "@/components/ui/transitions";
import {
  Stethoscope,
  Users,
  FileText,
  Calendar,
  Brain,
  Shield,
  ArrowRight,
  CheckCircle2,
  Star,
  Award,
  HeartPulse,
  Bot,
  Activity,
  LucideIcon,
  ShieldCheck,
  MessageSquare,
  Clock,
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import logo from "@/assets/nirogya-logo.png";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

interface Testimonial {
  name: string;
  role: string;
  text: string;
  avatar: string;
}

const Landing = () => {
  const patientFeatures: Feature[] = [
    {
      icon: HeartPulse,
      title: "Smart Health Tracking",
      description: "Track vitals, medications, and appointments in one place",
      color: "#3B82F6",
    },
    {
      icon: Bot,
      title: "AI Health Assistant",
      description:
        "24/7 AI-powered support for health queries and medication reminders",
      color: "#34D399",
    },
    {
      icon: Activity,
      title: "Health Timeline",
      description: "Visualize your health journey with interactive timelines",
      color: "#4F46E5",
    },
  ];

  const doctorFeatures: Feature[] = [
    {
      icon: Brain,
      title: "AI Scribe & Analysis",
      description: "Save time with AI-powered note-taking and report analysis",
      color: "#F59E0B",
    },
    {
      icon: FileText,
      title: "Smart Prescriptions",
      description: "Create digital prescriptions with drug interaction checks",
      color: "#EC4899",
    },
    {
      icon: Calendar,
      title: "Practice Management",
      description:
        "Efficiently manage appointments, billing, and patient records",
      color: "#8B5CF6",
    },
  ];

  const testimonials: Testimonial[] = [
    {
      name: "Dr. Priya Sharma",
      role: "Cardiologist",
      text: "Nirogya has transformed my practice. The AI scribe saves hours daily, and my patients love the digital prescriptions.",
      avatar: "PS",
    },
    {
      name: "Raj Malhotra",
      role: "Patient",
      text: "The health timeline feature helps me track my progress, and the AI assistant answers my questions instantly.",
      avatar: "RM",
    },
    {
      name: "Dr. Arun Kumar",
      role: "General Physician",
      text: "The practice management tools are incredible. I can focus more on patient care and less on paperwork.",
      avatar: "AK",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src={logo}
                alt="Nirogya"
                className="h-10 w-10 group-hover:scale-105 transition-transform"
              />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Nirogya
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                to="/auth"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                For Doctors
              </Link>
              <Link
                to="/auth"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                For Patients
              </Link>
              <div className="h-4 w-px bg-border" />
              <Link to="/auth">
                <ShadButton variant="ghost" size="sm">
                  Sign In
                </ShadButton>
              </Link>
              <Link to="/auth">
                <AnimatedButton variant="gradient" size="sm">
                  Get Started
                </AnimatedButton>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 overflow-hidden">
        <div className="container px-6 mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn className="space-y-8">
              <Badge variant="secondary" className="px-4 py-2">
                <HeartPulse className="mr-2 h-4 w-4 text-primary" />
                Smart Healthcare Platform
              </Badge>

              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  Modern Healthcare
                  <span className="bg-gradient-primary bg-clip-text text-transparent block">
                    Made Simple
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Experience the future of healthcare with our AI-powered
                  platform. Seamlessly connecting patients with doctors while
                  streamlining medical practice management.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <AnimatedButton
                    variant="gradient"
                    size="lg"
                    className="group"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </AnimatedButton>
                </Link>
                <Link to="/auth">
                  <ShadButton variant="outline" size="lg">
                    Learn More
                  </ShadButton>
                </Link>
              </div>
            </FadeIn>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
              <SlideIn>
                <img
                  src={heroImage}
                  alt="Nirogya Platform"
                  className="relative rounded-2xl shadow-2xl w-full"
                />
              </SlideIn>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-12 border-y border-border/50 bg-muted/30">
        <div className="container px-6 mx-auto">
          <div className="flex flex-wrap justify-center gap-12 items-center">
            <Card className="p-6 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-medium">Secure Platform</p>
                <p className="text-xs text-muted-foreground">
                  Advanced Encryption
                </p>
              </div>
            </Card>
            <Card className="p-6 flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-medium">Expert Support</p>
                <p className="text-xs text-muted-foreground">
                  Professional Team
                </p>
              </div>
            </Card>
            <Card className="p-6 flex items-center gap-3">
              <Award className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-medium">Best Practices</p>
                <p className="text-xs text-muted-foreground">
                  Healthcare Standards
                </p>
              </div>
            </Card>
            <Card className="p-6 flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-medium">Modern Infrastructure</p>
                <p className="text-xs text-muted-foreground">
                  Built for Reliability
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid - For Patients */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="px-4 py-2">
              For Patients
            </Badge>
            <h2 className="text-4xl font-bold">Smart Health Management</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Take control of your health journey with AI-powered insights and
              seamless doctor connectivity
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {patientFeatures.map((feature, idx) => (
              <NeuroCard
                key={idx}
                className="group hover:translate-y-[-4px] transition-transform cursor-pointer"
                topBorderColor={feature.color}
              >
                <div className="space-y-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <feature.icon
                      className="h-6 w-6"
                      style={{ color: feature.color }}
                    />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </NeuroCard>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid - For Doctors */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="px-4 py-2">
              For Doctors
            </Badge>
            <h2 className="text-4xl font-bold">Empower Your Practice</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your practice with AI assistance and comprehensive
              practice management tools
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {doctorFeatures.map((feature, idx) => (
              <NeuroCard
                key={idx}
                className="group hover:translate-y-[-4px] transition-transform cursor-pointer"
                topBorderColor={feature.color}
              >
                <div className="space-y-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${feature.color}20` }}
                  >
                    <feature.icon
                      className="h-6 w-6"
                      style={{ color: feature.color }}
                    />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </NeuroCard>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="px-4 py-2">
              Use Cases
            </Badge>
            <h2 className="text-4xl font-bold mt-4 mb-2">
              Designed for Healthcare
            </h2>
            <p className="text-xl text-muted-foreground">
              See how Nirogya can transform your healthcare experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">For General Practitioners</p>
                  <p className="text-sm text-muted-foreground">Primary Care</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                Streamline patient consultations, manage records efficiently,
                and provide better continuity of care with our integrated
                platform.
              </p>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">For Specialists</p>
                  <p className="text-sm text-muted-foreground">
                    Specialized Care
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground">
                Access detailed patient histories, collaborate with referring
                doctors, and maintain comprehensive treatment records.
              </p>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">For Patients</p>
                  <p className="text-sm text-muted-foreground">
                    Personal Health
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground">
                Track your health journey, schedule appointments, and maintain
                digital health records all in one secure platform.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <NeuroCard className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-primary opacity-90" />
            <div className="relative p-12 text-center space-y-8">
              <h2 className="text-4xl font-bold text-white">
                Experience Modern Healthcare
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Start your journey towards better healthcare management with
                Nirogya
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <ShadButton size="lg" variant="default">
                    Get Started
                  </ShadButton>
                </Link>
                <Link to="/auth">
                  <ShadButton
                    size="lg"
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Request Demo
                  </ShadButton>
                </Link>
              </div>
            </div>
          </NeuroCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src={logo} alt="Nirogya" className="h-8 w-8" />
                <span className="text-xl font-bold">Nirogya</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered healthcare platform designed to improve patient
                outcomes and streamline medical practices.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2">
                <Link
                  to="#"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Features
                </Link>
                <Link
                  to="#"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  For Patients
                </Link>
                <Link
                  to="#"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  For Doctors
                </Link>
                <Link
                  to="#"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Pricing
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2">
                <Link
                  to="#"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  About
                </Link>
                <Link
                  to="#"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Blog
                </Link>
                <Link
                  to="#"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Careers
                </Link>
                <Link
                  to="#"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2">
                <Link
                  to="#"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  to="#"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms
                </Link>
                <Link
                  to="#"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Security
                </Link>
                <Link
                  to="#"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  HIPAA
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Nirogya. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link
                to="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Twitter
              </Link>
              <Link
                to="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                LinkedIn
              </Link>
              <Link
                to="#"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <ScrollToTop />
    </div>
  );
};

export default Landing;
