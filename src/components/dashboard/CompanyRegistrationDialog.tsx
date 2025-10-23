import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CompanyRegistrationDialogProps {
  userId: string;
  onComplete: () => void;
}

export const CompanyRegistrationDialog = ({ userId, onComplete }: CompanyRegistrationDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    company_type: "",
    contact_person: "",
    designation: "",
    mobile: "",
    email: "",
    address: "",
    pincode: "",
    country_id: "",
    state_id: "",
    city_id: "",
    num_employees: "",
    avg_annual_turnover: "",
    year_established: "",
    status: "active",
  });

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (formData.country_id) {
      fetchStates(formData.country_id);
    }
  }, [formData.country_id]);

  useEffect(() => {
    if (formData.state_id) {
      fetchCities(formData.state_id);
    }
  }, [formData.state_id]);

  const fetchCountries = async () => {
    const { data } = await supabase.from('countries').select('*');
    setCountries(data || []);
  };

  const fetchStates = async (countryId: string) => {
    const { data } = await supabase
      .from('states')
      .select('*')
      .eq('country_id', countryId);
    setStates(data || []);
  };

  const fetchCities = async (stateId: string) => {
    const { data } = await supabase
      .from('cities')
      .select('*')
      .eq('state_id', stateId);
    setCities(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create company
      const companyInsertData = {
        name: formData.name,
        company_type: formData.company_type as any,
        contact_person: formData.contact_person,
        designation: formData.designation as any,
        mobile: formData.mobile,
        email: formData.email,
        address: formData.address,
        pincode: formData.pincode,
        country_id: formData.country_id,
        state_id: formData.state_id,
        city_id: formData.city_id,
        avg_annual_turnover: formData.avg_annual_turnover as any,
        status: formData.status,
        num_employees: formData.num_employees ? parseInt(formData.num_employees) : null,
        year_established: formData.year_established ? parseInt(formData.year_established) : null,
        created_by: userId,
        updated_by: userId,
      };

      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert(companyInsertData)
        .select()
        .single();

      if (companyError) throw companyError;

      // Update user profile with company_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ company_id: companyData.id })
        .eq('user_id', userId);

      if (profileError) throw profileError;

      // Assign company_user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'company_user',
        });

      if (roleError) throw roleError;

      toast({
        title: "Success",
        description: "Company registered successfully!",
      });
      onComplete();
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

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Complete Company Registration</CardTitle>
        <CardDescription>
          Please fill in your company details to access the dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_type">Company Type *</Label>
              <Select
                value={formData.company_type}
                onValueChange={(value) => setFormData({ ...formData, company_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contractor">Contractor</SelectItem>
                  <SelectItem value="builder">Builder</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="supplier">Supplier</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person *</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <Select
                value={formData.designation}
                onValueChange={(value) => setFormData({ ...formData, designation: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="engineer">Engineer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile *</Label>
              <Input
                id="mobile"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                required
              />
            </div>

            <div className="col-span-full space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Select
                value={formData.country_id}
                onValueChange={(value) => setFormData({ ...formData, country_id: value, state_id: "", city_id: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Select
                value={formData.state_id}
                onValueChange={(value) => setFormData({ ...formData, state_id: value, city_id: "" })}
                disabled={!formData.country_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Select
                value={formData.city_id}
                onValueChange={(value) => setFormData({ ...formData, city_id: value })}
                disabled={!formData.state_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="turnover">Avg Annual Turnover *</Label>
              <Select
                value={formData.avg_annual_turnover}
                onValueChange={(value) => setFormData({ ...formData, avg_annual_turnover: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select turnover" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="below_1cr">&lt; ₹1 Crore</SelectItem>
                  <SelectItem value="1cr_to_10cr">₹1-10 Crores</SelectItem>
                  <SelectItem value="10cr_to_50cr">₹10-50 Crores</SelectItem>
                  <SelectItem value="above_50cr">&gt; ₹50 Crores</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employees">Number of Employees</Label>
              <Input
                id="employees"
                type="number"
                value={formData.num_employees}
                onChange={(e) => setFormData({ ...formData, num_employees: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year Established</Label>
              <Input
                id="year"
                type="number"
                value={formData.year_established}
                onChange={(e) => setFormData({ ...formData, year_established: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register Company"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
