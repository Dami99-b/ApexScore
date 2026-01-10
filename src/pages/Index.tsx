import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Security from "@/components/landing/Security";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/home", { replace: true });
    }
  }, [user, isLoading, navigate]);
  return (
    <>
      <Helmet>
        <title>ApexScore - AI-Powered Loan Risk Prediction System</title>
        <meta name="description" content="Precision data verification for modern lending institutions. Secure your lending decisions with intelligent identity verification and AI-powered risk assessment." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <Hero />
        <Features />
        <HowItWorks />
        <Security />
        <CTA />
        <Footer />
      </div>
    </>
  );
};

export default Index;
