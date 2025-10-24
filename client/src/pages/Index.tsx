import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Building2, Shield, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

const Index = () => {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { user } = await getCurrentUser();
      if (user) {
        setLocation("/dashboard");
      }
    };
    checkAuth();
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 mb-6">
            <Building2 className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Company Registry Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Comprehensive company registration and management system with secure authentication and role-based access control
          </p>
          <Button size="lg" onClick={() => setLocation("/auth")} className="text-lg px-8" data-testid="button-get-started">
            Get Started
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16">
          <div className="text-center p-6 rounded-lg border bg-card">
            <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Secure Access</h3>
            <p className="text-muted-foreground">Google OAuth and email authentication with role-based permissions</p>
          </div>
          <div className="text-center p-6 rounded-lg border bg-card">
            <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Admin Control</h3>
            <p className="text-muted-foreground">Complete company management with creation, editing, and status control</p>
          </div>
          <div className="text-center p-6 rounded-lg border bg-card">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Company Profiles</h3>
            <p className="text-muted-foreground">Comprehensive company information with audit trails and location data</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
