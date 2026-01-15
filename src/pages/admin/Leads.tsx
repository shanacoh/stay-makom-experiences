import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Download, Eye, Mail, Phone, MapPin, Calendar, Building } from "lucide-react";
import { toast } from "sonner";

interface Lead {
  id: string;
  created_at: string;
  source: string;
  email: string;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  status: string | null;
  is_b2b: boolean | null;
  property_name: string | null;
  property_type: string | null;
  interests: string[] | null;
  message: string | null;
  marketing_opt_in: boolean | null;
  metadata: any;
}

const sourceColors: Record<string, string> = {
  coming_soon: "bg-purple-100 text-purple-800",
  newsletter: "bg-blue-100 text-blue-800",
  contact: "bg-green-100 text-green-800",
  partners: "bg-orange-100 text-orange-800",
  corporate: "bg-red-100 text-red-800",
  ai_assistant_save: "bg-cyan-100 text-cyan-800",
  landing_page: "bg-indigo-100 text-indigo-800",
};

const statusColors: Record<string, string> = {
  new: "bg-yellow-100 text-yellow-800",
  contacted: "bg-blue-100 text-blue-800",
  qualified: "bg-green-100 text-green-800",
  converted: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

const AdminLeads = () => {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const { data: leads, isLoading, refetch } = useQuery({
    queryKey: ["admin-leads", sourceFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (sourceFilter !== "all") {
        query = query.eq("source", sourceFilter);
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Lead[];
    },
  });

  const filteredLeads = leads?.filter((lead) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      lead.email?.toLowerCase().includes(searchLower) ||
      lead.name?.toLowerCase().includes(searchLower) ||
      lead.first_name?.toLowerCase().includes(searchLower) ||
      lead.last_name?.toLowerCase().includes(searchLower) ||
      lead.property_name?.toLowerCase().includes(searchLower)
    );
  });

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    const { error } = await supabase
      .from("leads")
      .update({ status: newStatus })
      .eq("id", leadId);

    if (error) {
      toast.error("Failed to update status");
      return;
    }

    toast.success("Status updated");
    refetch();
  };

  const exportToCSV = () => {
    if (!filteredLeads?.length) {
      toast.error("No leads to export");
      return;
    }

    const headers = ["Date", "Source", "Name", "Email", "Phone", "Country", "Status", "B2B", "Property"];
    const rows = filteredLeads.map((lead) => [
      format(new Date(lead.created_at), "yyyy-MM-dd HH:mm"),
      lead.source,
      lead.name || `${lead.first_name || ""} ${lead.last_name || ""}`.trim() || "-",
      lead.email,
      lead.phone || "-",
      lead.country || "-",
      lead.status || "new",
      lead.is_b2b ? "Yes" : "No",
      lead.property_name || "-",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.map(v => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Export complete");
  };

  const getDisplayName = (lead: Lead) => {
    if (lead.name) return lead.name;
    if (lead.first_name || lead.last_name) {
      return `${lead.first_name || ""} ${lead.last_name || ""}`.trim();
    }
    return "-";
  };

  const uniqueSources = leads ? [...new Set(leads.map((l) => l.source))] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            {filteredLeads?.length || 0} leads collected
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email, name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {uniqueSources.map((source) => (
              <SelectItem key={source} value={source}>
                {source.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading leads...
                </TableCell>
              </TableRow>
            ) : filteredLeads?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No leads found
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads?.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(lead.created_at), "dd/MM/yy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={sourceColors[lead.source] || "bg-gray-100 text-gray-800"}
                    >
                      {lead.source.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {getDisplayName(lead)}
                    {lead.is_b2b && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        B2B
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.email}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={lead.status || "new"}
                      onValueChange={(value) => updateLeadStatus(lead.id, value)}
                    >
                      <SelectTrigger className="w-[120px] h-8">
                        <Badge
                          variant="secondary"
                          className={statusColors[lead.status || "new"] || "bg-gray-100"}
                        >
                          {lead.status || "new"}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Lead Details Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={sourceColors[selectedLead.source] || "bg-gray-100"}
                >
                  {selectedLead.source.replace(/_/g, " ")}
                </Badge>
                <Badge
                  variant="secondary"
                  className={statusColors[selectedLead.status || "new"] || "bg-gray-100"}
                >
                  {selectedLead.status || "new"}
                </Badge>
                {selectedLead.is_b2b && (
                  <Badge variant="outline">B2B</Badge>
                )}
              </div>

              <div className="grid gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Date:</span>
                  <span>{format(new Date(selectedLead.created_at), "PPpp")}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <a href={`mailto:${selectedLead.email}`} className="text-primary hover:underline">
                    {selectedLead.email}
                  </a>
                </div>

                {selectedLead.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{selectedLead.phone}</span>
                  </div>
                )}

                {selectedLead.country && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Location:</span>
                    <span>{[selectedLead.city, selectedLead.country].filter(Boolean).join(", ")}</span>
                  </div>
                )}

                {selectedLead.property_name && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Property:</span>
                    <span>
                      {selectedLead.property_name}
                      {selectedLead.property_type && ` (${selectedLead.property_type})`}
                    </span>
                  </div>
                )}

                {selectedLead.interests && selectedLead.interests.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Interests:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedLead.interests.map((interest, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLead.message && (
                  <div>
                    <span className="text-muted-foreground">Message:</span>
                    <p className="mt-1 p-3 bg-muted rounded-md text-sm">
                      {selectedLead.message}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Marketing opt-in:</span>
                  <span>{selectedLead.marketing_opt_in ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLeads;
