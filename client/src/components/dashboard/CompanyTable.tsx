import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { EditCompanyDialog } from "./EditCompanyDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CompanyTableProps {
  companies: any[];
  onRefresh: () => void;
  userId: string;
}

export const CompanyTable = ({ companies, onRefresh, userId }: CompanyTableProps) => {
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this company?")) return;

    try {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const turnoverLabels: Record<string, string> = {
    'below_1cr': '< ₹1Cr',
    '1cr_to_10cr': '₹1-10Cr',
    '10cr_to_50cr': '₹10-50Cr',
    'above_50cr': '> ₹50Cr',
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Turnover</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No companies found
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell className="capitalize">
                    {company.company_type.replace('_', ' ')}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{company.contact_person}</div>
                      <div className="text-muted-foreground">{company.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {company.cities?.name}, {company.cities?.states?.name}
                  </TableCell>
                  <TableCell>{turnoverLabels[company.avg_annual_turnover]}</TableCell>
                  <TableCell>
                    <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                      {company.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCompany(company)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(company.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingCompany && (
        <EditCompanyDialog
          company={editingCompany}
          open={!!editingCompany}
          onOpenChange={(open) => !open && setEditingCompany(null)}
          onSuccess={() => {
            setEditingCompany(null);
            onRefresh();
          }}
          userId={userId}
        />
      )}
    </>
  );
};
