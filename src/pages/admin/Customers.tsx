import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FunctionsHttpError } from '@supabase/supabase-js';
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
import { Eye, Search, Plus, Download, Trash2, UserX, UserCheck } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const AdminCustomers = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "hotel_admin" | "customer">("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [bookingsFilter, setBookingsFilter] = useState<"all" | "has_bookings" | "no_bookings">("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "customer" as "admin" | "hotel_admin" | "customer",
    country: "",
    hotelId: "",
  });

  // Fetch all hotels for hotel assignment
  const { data: hotels } = useQuery({
    queryKey: ["all-hotels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotels")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: customers, isLoading, refetch } = useQuery({
    queryKey: ["admin-customers", searchTerm, roleFilter, countryFilter, statusFilter, bookingsFilter],
    queryFn: async () => {
      // Fetch customers with emails using the secure function
      const { data: customersWithEmails, error: emailError } = await supabase
        .rpc("get_customers_with_emails");

      if (emailError) throw emailError;
      if (!customersWithEmails) return [];

      // Fetch all user data we need
      const userIds = customersWithEmails.map((c) => c.user_id);

      // Fetch user profiles
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("*")
        .in("user_id", userIds);

      // Fetch user roles
      const { data: roles } = await supabase
        .from("user_roles")
        .select("*")
        .in("user_id", userIds);

      // Fetch hotel admins data
      const { data: hotelAdmins } = await supabase
        .from("hotel_admins")
        .select("user_id, hotel_id, hotels(name)")
        .in("user_id", userIds);

      // Apply search filter (name, email, phone, country)
      let filteredBySearch = customersWithEmails;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredBySearch = customersWithEmails.filter(c => {
          const profile = profiles?.find(p => p.user_id === c.user_id);
          return (
            c.first_name?.toLowerCase().includes(searchLower) ||
            c.last_name?.toLowerCase().includes(searchLower) ||
            c.user_email?.toLowerCase().includes(searchLower) ||
            profile?.phone?.toLowerCase().includes(searchLower) ||
            c.address_country?.toLowerCase().includes(searchLower)
          );
        });
      }

      // Apply country filter
      let filteredByCountry = filteredBySearch;
      if (countryFilter !== "all") {
        filteredByCountry = filteredBySearch.filter(c => c.address_country === countryFilter);
      }

      // Apply role filter
      let filteredByRole = filteredByCountry;
      if (roleFilter !== "all") {
        const filteredUserIds = roles?.filter(r => r.role === roleFilter).map(r => r.user_id) || [];
        filteredByRole = filteredByCountry.filter(c => filteredUserIds.includes(c.user_id));
      }

      // Apply status filter (active/inactive)
      let filteredByStatus = filteredByRole;
      if (statusFilter !== "all") {
        // Note: Status filtering requires service_role key access
        // For now, we assume all users in database are active
        filteredByStatus = filteredByRole;
      }

      // Fetch booking data
      const customerIds = filteredByStatus.map((c) => c.id);

      const { data: bookingStats } = await supabase
        .from("bookings")
        .select("customer_id, total_price, hotel_id, hotels(name)")
        .in("customer_id", customerIds);

      // Aggregate booking data with unique hotels
      const statsMap = (bookingStats || []).reduce((acc, booking) => {
        const custId = booking.customer_id;
        if (!custId) return acc;
        if (!acc[custId]) {
          acc[custId] = { count: 0, total: 0, hotels: new Set() };
        }
        acc[custId].count += 1;
        acc[custId].total += Number(booking.total_price || 0);
        if (booking.hotel_id) {
          acc[custId].hotels.add(booking.hotel_id);
        }
        return acc;
      }, {} as Record<string, { count: number; total: number; hotels: Set<string> }>);

      // Apply bookings filter
      let filteredCustomers = filteredByStatus;
      if (bookingsFilter !== "all") {
        filteredCustomers = filteredByStatus.filter(c => {
          const hasBookings = (statsMap[c.id]?.count || 0) > 0;
          return bookingsFilter === "has_bookings" ? hasBookings : !hasBookings;
        });
      }

      // Map profiles and roles to customers
      const profilesMap = (profiles || []).reduce((acc, p) => {
        acc[p.user_id] = p;
        return acc;
      }, {} as Record<string, any>);

      const rolesMap = (roles || []).reduce((acc, r) => {
        acc[r.user_id] = r;
        return acc;
      }, {} as Record<string, any>);

      const hotelAdminsMap = (hotelAdmins || []).reduce((acc, ha) => {
        acc[ha.user_id] = ha;
        return acc;
      }, {} as Record<string, any>);

      return filteredCustomers.map((customer: any) => {
        return {
          ...customer,
          user_profiles: profilesMap[customer.user_id] || null,
          user_roles: rolesMap[customer.user_id] || null,
          hotel_admin: hotelAdminsMap[customer.user_id] || null,
          bookingsCount: statsMap[customer.id]?.count || 0,
          totalSpent: statsMap[customer.id]?.total || 0,
          hotelsVisited: statsMap[customer.id]?.hotels.size || 0,
          isActive: true, // Assume active if user exists in database
        };
      });
    },
  });

  // Mutation: Update user role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole, oldRoleId }: { userId: string; newRole: string; oldRoleId?: string }) => {
      // Delete old role
      if (oldRoleId) {
        await supabase.from("user_roles").delete().eq("id", oldRoleId);
      }
      // Insert new role
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: newRole as any,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("User role updated successfully");
      refetch();
    },
    onError: () => {
      toast.error("Failed to update user role");
    },
  });

  // Mutation: Assign hotel to hotel admin
  const assignHotelMutation = useMutation({
    mutationFn: async ({ userId, hotelId }: { userId: string; hotelId: string }) => {
      // Check if already exists
      const { data: existing } = await supabase
        .from("hotel_admins")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (existing) {
        // Update
        const { error } = await supabase
          .from("hotel_admins")
          .update({ hotel_id: hotelId })
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase.from("hotel_admins").insert({
          user_id: userId,
          hotel_id: hotelId,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Hotel assigned successfully");
      refetch();
    },
    onError: () => {
      toast.error("Failed to assign hotel");
    },
  });

  // Mutation: Toggle account status
  const toggleAccountStatusMutation = useMutation({
    mutationFn: async ({ userId, activate }: { userId: string; activate: boolean }) => {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { 
          action: 'toggle-status',
          userId,
          banned: !activate
        }
      });
      
      if (error) {
        console.error('Edge function error:', error);
        
        if (error instanceof FunctionsHttpError) {
          const errorData = await error.context.json();
          throw new Error(errorData.error || 'Failed to update status');
        }
        
        throw new Error(error.message || 'Failed to update status');
      }
      
      if (!data?.success) throw new Error(data?.error || 'Failed to update status');
    },
    onSuccess: (_, { activate }) => {
      toast.success(activate ? "User activated" : "User deactivated");
      refetch();
    },
    onError: () => {
      toast.error("Failed to update account status");
    },
  });

  // Mutation: Delete user
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { 
          action: 'delete',
          userId
        }
      });
      
      if (error) {
        console.error('Edge function error:', error);
        
        if (error instanceof FunctionsHttpError) {
          const errorData = await error.context.json();
          throw new Error(errorData.error || 'Failed to delete user');
        }
        
        throw new Error(error.message || 'Failed to delete user');
      }
      
      if (!data?.success) throw new Error(data?.error || 'Failed to delete user');
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      setDeleteUserId(null);
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete user");
      setDeleteUserId(null);
    },
  });

  // Mutation: Create new user
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { 
          action: 'create',
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          country: userData.country,
          hotelId: userData.hotelId || null
        }
      });
      
      // Handle edge function errors (network errors, 400/500 responses)
      if (error) {
        console.error('Edge function error:', error);
        
        // FunctionsHttpError contains the response body in error.context
        if (error instanceof FunctionsHttpError) {
          const errorData = await error.context.json();
          throw new Error(errorData.error || 'Failed to create user');
        }
        
        throw new Error(error.message || 'Failed to create user');
      }
      
      // Handle business logic errors returned in data
      if (data && typeof data === 'object') {
        if (!data.success && data.error) {
          throw new Error(data.error);
        }
        if (!data.success) {
          throw new Error('Failed to create user');
        }
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success("User created successfully");
      setAddUserOpen(false);
      setNewUser({
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        role: "customer",
        country: "",
        hotelId: "",
      });
      refetch();
    },
    onError: (error: any) => {
      console.error('Create user mutation error:', error);
      // Extract error message from various error formats
      let errorMessage = "Failed to create user";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.error) {
        errorMessage = error.error;
      }
      
      toast.error(errorMessage);
    },
  });

  // Export to CSV
  const exportToCSV = () => {
    if (!customers || customers.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Role",
      "Country",
      "Bookings",
      "Total Spent",
      "Hotels Visited",
      "Status",
      "Joined",
    ];

    const rows = customers.map((c: any) => [
      `${c.first_name} ${c.last_name}`,
      c.user_email || "",
      c.user_profiles?.phone || "",
      c.user_roles?.role || "customer",
      c.address_country || "",
      c.bookingsCount,
      c.totalSpent.toFixed(2),
      c.hotelsVisited,
      c.isActive ? "Active" : "Inactive",
      format(new Date(c.created_at), "yyyy-MM-dd"),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const { data: customerDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["admin-customer-detail", selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return null;

      const { data: customer, error } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", selectedCustomerId)
        .single();

      if (error) throw error;

      // Fetch user profile
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", selectedCustomerId)
        .single();

      // Fetch user role
      const { data: role } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", selectedCustomerId)
        .single();

      // Fetch bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*, hotels(name), experiences(title)")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false });

      // Get total spent and unique hotels
      const totalSpent = bookings?.reduce((sum, b) => sum + Number(b.total_price || 0), 0) || 0;
      const uniqueHotels = new Set(bookings?.map(b => b.hotel_id).filter(Boolean));

      // Get hotel admin info
      const { data: hotelAdmin } = await supabase
        .from("hotel_admins")
        .select("*, hotels(name)")
        .eq("user_id", selectedCustomerId)
        .single();

      return {
        ...customer,
        user_profiles: profile,
        user_roles: role,
        hotel_admin: hotelAdmin,
        bookings: bookings || [],
        totalSpent,
        hotelsVisited: uniqueHotels.size,
        isActive: true, // Assume active if user exists in database
      };
    },
    enabled: !!selectedCustomerId,
  });

  const countries = [...new Set(customers?.map((c) => c.address_country).filter(Boolean))] as string[];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage all user accounts, roles, and permissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setAddUserOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as any)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="hotel_admin">Hotel Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={bookingsFilter} onValueChange={(value) => setBookingsFilter(value as any)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="has_bookings">Has Bookings</SelectItem>
            <SelectItem value="no_bookings">No Bookings</SelectItem>
          </SelectContent>
        </Select>
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : customers && customers.length > 0 ? (
        <div className="border rounded-lg bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned Hotel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Bookings</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer: any) => {
                const roleColors = {
                  admin: "bg-blue-900 text-white hover:bg-blue-900/80",
                  hotel_admin: "bg-amber-100 text-amber-900 hover:bg-amber-100/80 border-amber-300",
                  customer: "bg-green-100 text-green-900 hover:bg-green-100/80 border-green-300",
                };

                const currentRole = customer.user_roles?.role || "customer";

                return (
                  <TableRow key={customer.user_id}>
                    <TableCell className="font-medium">
                      {customer.first_name} {customer.last_name}
                      {customer.user_profiles?.display_name && (
                        <div className="text-xs text-muted-foreground">
                          {customer.user_profiles.display_name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{customer.user_email || "-"}</TableCell>
                    <TableCell>{customer.user_profiles?.phone || "-"}</TableCell>
                    <TableCell>
                      <Select
                        value={currentRole}
                        onValueChange={(newRole) => {
                          updateRoleMutation.mutate({
                            userId: customer.user_id,
                            newRole,
                            oldRoleId: customer.user_roles?.id,
                          });
                        }}
                      >
                        <SelectTrigger className={`w-[140px] ${roleColors[currentRole as keyof typeof roleColors]}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="customer">Customer</SelectItem>
                          <SelectItem value="hotel_admin">Hotel Admin</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {currentRole === "hotel_admin" ? (
                        <Select
                          value={customer.hotel_admin?.hotel_id || ""}
                          onValueChange={(hotelId) => {
                            assignHotelMutation.mutate({
                              userId: customer.user_id,
                              hotelId,
                            });
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select hotel" />
                          </SelectTrigger>
                          <SelectContent>
                            {hotels?.map((hotel) => (
                              <SelectItem key={hotel.id} value={hotel.id}>
                                {hotel.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.isActive ? "default" : "secondary"} className={customer.isActive ? "bg-green-600" : "bg-gray-400"}>
                        {customer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{customer.bookingsCount}</TableCell>
                    <TableCell className="text-right">
                      ${customer.totalSpent.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCustomerId(customer.user_id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            toggleAccountStatusMutation.mutate({
                              userId: customer.user_id,
                              activate: !customer.isActive,
                            });
                          }}
                        >
                          {customer.isActive ? (
                            <UserX className="w-4 h-4 text-orange-600" />
                          ) : (
                            <UserCheck className="w-4 h-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteUserId(customer.user_id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-white">
          <p className="text-muted-foreground">
            {searchTerm || roleFilter !== "all" || countryFilter !== "all"
              ? "No customers found"
              : "No customers yet"}
          </p>
        </div>
      )}

      {/* User Detail Sheet */}
      <Sheet open={!!selectedCustomerId} onOpenChange={() => setSelectedCustomerId(null)}>
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>User Details</SheetTitle>
          </SheetHeader>
          {isLoadingDetail ? (
            <div className="py-8 text-center">Loading...</div>
          ) : customerDetail ? (
            <div className="space-y-6 mt-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold">{customerDetail.bookings.length}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">${customerDetail.totalSpent.toFixed(2)}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Hotels Visited</p>
                  <p className="text-2xl font-bold">{customerDetail.hotelsVisited}</p>
                </div>
              </div>

              {/* Personal Info */}
              <div className="space-y-3 border rounded-lg p-4">
                <h3 className="font-semibold">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">{customerDetail.first_name} {customerDetail.last_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{customerDetail.user_profiles?.phone || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Country:</span>
                    <p className="font-medium">{customerDetail.address_country || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">City:</span>
                    <p className="font-medium">{customerDetail.city || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Role & Access */}
              <div className="space-y-3 border rounded-lg p-4">
                <h3 className="font-semibold">Role & Access</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Role:</span>
                    <div className="mt-1">
                      <Badge>{customerDetail.user_roles?.role || "customer"}</Badge>
                    </div>
                  </div>
                  {customerDetail.user_roles?.role === "hotel_admin" && customerDetail.hotel_admin && (
                    <div>
                      <span className="text-muted-foreground">Assigned Hotel:</span>
                      <p className="font-medium mt-1">{customerDetail.hotel_admin.hotels?.name}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Account Status:</span>
                    <div className="mt-1">
                      <Badge variant={customerDetail.isActive ? "default" : "secondary"}>
                        {customerDetail.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking History */}
              <div className="space-y-3 border rounded-lg p-4">
                <h3 className="font-semibold">Booking History</h3>
                {customerDetail.bookings && customerDetail.bookings.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {customerDetail.bookings.map((booking: any) => (
                      <div key={booking.id} className="border rounded-lg p-3 space-y-2 bg-muted/30">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{booking.hotels?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.experiences?.title}
                            </p>
                          </div>
                          <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Check-in:</span>
                            <p>{format(new Date(booking.checkin), "MMM d, yyyy")}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Check-out:</span>
                            <p>{format(new Date(booking.checkout), "MMM d, yyyy")}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total:</span>
                            <p className="font-medium">${Number(booking.total_price).toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Party:</span>
                            <p>{booking.party_size} guests</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No bookings yet</p>
                )}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Add User Dialog */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account with role and permissions</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="hotel_admin">Hotel Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newUser.role === "hotel_admin" && (
              <div className="space-y-2">
                <Label>Assigned Hotel</Label>
                <Select value={newUser.hotelId} onValueChange={(value) => setNewUser({ ...newUser, hotelId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hotel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hotels?.map((hotel) => (
                      <SelectItem key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                value={newUser.country}
                onChange={(e) => setNewUser({ ...newUser, country: e.target.value })}
                placeholder="United States"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUserOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createUserMutation.mutate(newUser)}
              disabled={!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName}
            >
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone. Users with existing bookings cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && deleteUserMutation.mutate(deleteUserId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCustomers;
