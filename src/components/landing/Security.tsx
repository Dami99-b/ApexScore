import { Shield, Lock, Eye, Server, Award, CheckCircle } from "lucide-react";

const securityFeatures = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "All data is encrypted in transit and at rest using AES-256.",
  },
  {
    icon: Shield,
    title: "SOC 2 Type II",
    description: "Audited security controls and compliance verification.",
  },
  {
    icon: Eye,
    title: "Privacy First",
    description: "GDPR and CCPA compliant data handling practices.",
  },
  {
    icon: Server,
    title: "Secure Infrastructure",
    description: "Enterprise-grade cloud security with 99.9% uptime.",
  },
];

const certifications = [
  "ISO 27001 Certified",
  "GDPR Compliant",
  "SOC 2 Type II",
  "PCI DSS Level 1",
];

const Security = () => {
  return (
    <section id="security" className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/30 mb-6">
              <Award className="w-4 h-4 text-success" />
              <span className="text-sm text-success font-medium">Enterprise Security</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Bank-Level Security for{" "}
              <span className="gradient-text">Your Data</span>
            </h2>

            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              We understand the sensitivity of financial data. ApexScore is built from the ground up 
              with security as a core principle, not an afterthought.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              {certifications.map((cert) => (
                <div key={cert} className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground">{cert}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {securityFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card p-6 group hover:border-primary/50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Security;
