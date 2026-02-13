import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, BarChart3, MapPin, Brain, ArrowRight, CheckCircle } from "lucide-react";

export default function Index() {
  const features = [
    { icon: Brain, title: "AI Classification", desc: "Automatic complaint categorization and priority detection" },
    { icon: MapPin, title: "Smart Mapping", desc: "Interactive maps with hotspot area detection" },
    { icon: BarChart3, title: "Live Analytics", desc: "Real-time charts and visual complaint insights" },
    { icon: CheckCircle, title: "Status Tracking", desc: "Track complaints from submission to resolution" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium mb-6 animate-fade-in">
              <Shield className="w-4 h-4" />
              AI-Powered Civic Intelligence
            </div>
            <h1 className="text-4xl lg:text-6xl font-display font-bold leading-tight animate-fade-in">
              SmartGov
            </h1>
            <p className="text-lg lg:text-xl text-primary-foreground/70 mt-4 mb-8 animate-fade-in">
              Empowering citizens with intelligent complaint management. Submit, track, and resolve civic issues with AI-assisted classification and real-time analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Link to="/auth">
                <Button size="lg" className="gradient-accent text-accent-foreground px-8">
                  Get Started <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold">Intelligent Governance</h2>
            <p className="text-muted-foreground mt-2">Powered by smart rule-based AI engine</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-6 rounded-xl bg-card shadow-card hover:shadow-elevated transition-all animate-fade-in group">
                <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center mb-4 group-hover:animate-pulse-glow">
                  <f.icon className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="font-display font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-muted border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>SmartGov © 2026 — AI-Assisted Civic Intelligence System</p>
        </div>
      </footer>
    </div>
  );
}
