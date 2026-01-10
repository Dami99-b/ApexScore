import { 
  Search, 
  MapPin, 
  History, 
  Download, 
  Bot, 
  Shield,
  Smartphone,
  Globe
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Intelligent Email Search",
    description: "Input a client's email to instantly retrieve their borrowing footprint across multiple lending platforms.",
  },
  {
    icon: MapPin,
    title: "Geolocation Verification",
    description: "Verify that the address provided matches their actual digital location at the time of application.",
  },
  {
    icon: Smartphone,
    title: "SIM & Device Analysis",
    description: "Cross-reference phone number registrations and device fingerprints for additional identity verification.",
  },
  {
    icon: Globe,
    title: "IP Address Matching",
    description: "Compare IP address regions with declared residential addresses to detect remote fraud attempts.",
  },
  {
    icon: Bot,
    title: "AI Risk Assessment",
    description: "Our AI chat analyzes behavioral patterns and provides comprehensive default risk predictions.",
  },
  {
    icon: History,
    title: "Search History & Analytics",
    description: "Access your complete verification history with detailed analytics and trend insights.",
  },
  {
    icon: Download,
    title: "Batch Export to CSV",
    description: "Download individual or batch verification results in CSV format for your records.",
  },
  {
    icon: Shield,
    title: "Fraud Detection",
    description: "Advanced algorithms detect synthetic identities and loan stacking attempts in real-time.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Powerful Features for{" "}
            <span className="gradient-text">Smarter Decisions</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to verify client identities and assess loan risk with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card p-6 group hover:border-primary/50 transition-all duration-300 glow-effect"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
