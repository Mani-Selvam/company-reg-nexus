import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Building2, Mail, MapPin, Phone, Users, Calendar } from "lucide-react";

interface CompanyDashboardProps {
  userId: string;
}

export const CompanyDashboard = ({ userId }: CompanyDashboardProps) => {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('user_id', userId)
          .maybeSingle();

        if (profileError) throw profileError;

        if (profile?.company_id) {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select(`
              *,
              cities(name, states(name, countries(name)))
            `)
            .eq('id', profile.company_id)
            .single();

          if (companyError) throw companyError;
          setCompany(companyData);
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [userId, toast]);

  if (loading) {
    return <div className="text-center py-8">Loading company information...</div>;
  }

  if (!company) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No company information available.</p>
        </CardContent>
      </Card>
    );
  }

  const turnoverLabels: Record<string, string> = {
    'below_1cr': '< ₹1 Crore',
    '1cr_to_10cr': '₹1-10 Crores',
    '10cr_to_50cr': '₹10-50 Crores',
    'above_50cr': '> ₹50 Crores',
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {company.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{company.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{company.mobile}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>
                {company.cities.name}, {company.cities.states.name}, {company.cities.states.countries.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{company.num_employees || 'N/A'} employees</span>
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Company Type:</span>
              <span className="capitalize">{company.company_type.replace('_', ' ')}</span>
              
              <span className="text-muted-foreground">Designation:</span>
              <span className="capitalize">{company.designation}</span>
              
              <span className="text-muted-foreground">Contact Person:</span>
              <span>{company.contact_person}</span>
              
              <span className="text-muted-foreground">Annual Turnover:</span>
              <span>{turnoverLabels[company.avg_annual_turnover]}</span>
              
              <span className="text-muted-foreground">Year Established:</span>
              <span>{company.year_established || 'N/A'}</span>
              
              <span className="text-muted-foreground">Status:</span>
              <span className="capitalize">{company.status}</span>
            </div>
          </div>

          <div className="border-t pt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>Created: {new Date(company.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
