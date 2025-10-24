import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EditCompanyDialogProps {
  company: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userId: string;
}

export const EditCompanyDialog = ({ company, open, onOpenChange, onSuccess, userId }: EditCompanyDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: company.name || "",
    company_type: company.company_type || "",
    contact_person: company.contact_person || "",
    designation: company.designation || "",
    mobile: company.mobile || "",
    email: company.email || "",
    address: company.address || "",
    pincode: company.pincode || "",
    country_id: company.country_id || "",
    state_id: company.state_id || "",
    city_id: company.city_id || "",
    num_employees: company.num_employees?.toString() || "",
    avg_annual_turnover: company.avg_annual_turnover || "",
    year_established: company.year_established?.toString() || "",
    status: company.status || "active",
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
      const updateData = {
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
        updated_by: userId,
      };

      const { error } = await supabase
        .from('companies')
        .update(updateData)
        .eq('id', company.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Company updated successfully",
      });
      onSuccess();
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Company</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Same form fields as CreateCompanyDialog */}
          <div className="grid grid-cols-2 gap-4">
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

            <div className="col-span-2 space-y-2">
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

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Company"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
