import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, getUserRole, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { CompanyDashboard } from "@/components/dashboard/CompanyDashboard";
import { CompanyRegistrationDialog } from "@/components/dashboard/CompanyRegistrationDialog";
import { LogOut } from "lucide-react";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { user } = await getCurrentUser();
        
        if (!user) {
          navigate("/auth");
          return;
        }

        setUserId(user.id);
        const { role } = await getUserRole(user.id);
        
        if (!role) {
          // User has no role - check if they need to complete registration
          setShowRegistration(true);
        } else {
          setUserRole(role);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (showRegistration && userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Complete Registration</h1>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
          <CompanyRegistrationDialog 
            userId={userId}
            onComplete={() => {
              setShowRegistration(false);
              setUserRole('company_user');
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {userRole === 'admin' ? 'Admin Dashboard' : 'Company Dashboard'}
          </h1>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {userRole === 'admin' ? (
          <AdminDashboard userId={userId!} />
        ) : (
          <CompanyDashboard userId={userId!} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
