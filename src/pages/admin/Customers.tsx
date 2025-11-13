import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Search } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const AdminCustomers = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: customers, isLoading } = useQuery({
    queryKey: ["admin-customers", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("customers" as any)
        .select(`
          *,
          user_profiles:user_id(display_name),
          bookings:bookings(count)
        `)
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Customers</h2>
        <p className="text-muted-foreground">All B2C customer accounts</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : customers && customers.length > 0 ? (
        <div className="border rounded-lg bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Party Size</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.user_id}>
                  <TableCell className="font-medium">
                    {customer.first_name} {customer.last_name}
                  </TableCell>
                  <TableCell>{customer.user_profiles?.display_name || "-"}</TableCell>
                  <TableCell>{customer.address_country || "-"}</TableCell>
                  <TableCell>
                    {customer.bookings?.[0]?.count || 0}
                  </TableCell>
                  <TableCell>{customer.default_party_size}</TableCell>
                  <TableCell>{format(new Date(customer.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <Link to={`/admin/customers/${customer.user_id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-white">
          <p className="text-muted-foreground">
            {searchTerm ? "No customers found" : "No customers yet"}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
