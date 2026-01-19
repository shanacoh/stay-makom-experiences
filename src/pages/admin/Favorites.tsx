import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, User, Sparkles, Building2 } from "lucide-react";
import { format } from "date-fns";

const AdminFavorites = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [hotelFilter, setHotelFilter] = useState<string>("all");

  // Fetch all wishlist items with user and experience details
  const { data: wishlistItems, isLoading } = useQuery({
    queryKey: ["admin-wishlist"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wishlist")
        .select(`
          id,
          user_id,
          experience_id,
          created_at,
          deleted_at,
          experiences (
            id,
            title,
            slug,
            hotel_id,
            hotels (id, name)
          )
        `)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });

  // Fetch user emails for display
  const { data: userProfiles } = useQuery({
    queryKey: ["admin-user-profiles-for-wishlist"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("user_id, display_name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch hotels for filter
  const { data: hotels } = useQuery({
    queryKey: ["admin-hotels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotels")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  // Define types for stats
  interface ExperienceStat {
    experience: any;
    count: number;
    lastAdded: string;
  }

  interface UserStat {
    userId: string;
    experiences: any[];
    lastAdded: string;
  }

  // Group by experience for the "By Experience" view
  const experienceStats = wishlistItems?.reduce((acc, item) => {
    const expId = item.experience_id;
    if (!acc[expId]) {
      acc[expId] = {
        experience: item.experiences,
        count: 0,
        lastAdded: item.created_at,
      };
    }
    acc[expId].count++;
    if (new Date(item.created_at) > new Date(acc[expId].lastAdded)) {
      acc[expId].lastAdded = item.created_at;
    }
    return acc;
  }, {} as Record<string, ExperienceStat>);

  const experienceStatsList: ExperienceStat[] = (Object.values(experienceStats || {}) as ExperienceStat[]).sort(
    (a, b) => b.count - a.count
  );

  // Group by user for the "By User" view
  const userStats = wishlistItems?.reduce((acc, item) => {
    const userId = item.user_id;
    if (!acc[userId]) {
      acc[userId] = {
        userId,
        experiences: [],
        lastAdded: item.created_at,
      };
    }
    acc[userId].experiences.push(item.experiences);
    if (new Date(item.created_at) > new Date(acc[userId].lastAdded)) {
      acc[userId].lastAdded = item.created_at;
    }
    return acc;
  }, {} as Record<string, UserStat>);

  const userStatsList: UserStat[] = (Object.values(userStats || {}) as UserStat[]).sort(
    (a, b) => b.experiences.length - a.experiences.length
  );

  // Filter logic
  const filteredExperienceStats = experienceStatsList.filter((stat) => {
    const matchesSearch = stat.experience?.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesHotel =
      hotelFilter === "all" || stat.experience?.hotel_id === hotelFilter;
    return matchesSearch && matchesHotel;
  });

  const getUserDisplayName = (userId: string) => {
    const profile = userProfiles?.find((p) => p.user_id === userId);
    return profile?.display_name || `User ${userId.slice(0, 8)}...`;
  };

  const totalFavorites = wishlistItems?.length || 0;
  const uniqueUsers = new Set(wishlistItems?.map((w) => w.user_id)).size;
  const uniqueExperiences = new Set(wishlistItems?.map((w) => w.experience_id)).size;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Heart className="h-8 w-8 text-red-500" />
          Favorites Analytics
        </h2>
        <p className="text-muted-foreground">
          See which experiences are most loved by users
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Favorites</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFavorites}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Favorited Experiences
            </CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueExperiences}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Search experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={hotelFilter} onValueChange={setHotelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All hotels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All hotels</SelectItem>
                {hotels?.map((hotel) => (
                  <SelectItem key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="by-experience" className="space-y-4">
        <TabsList>
          <TabsTrigger value="by-experience">By Experience</TabsTrigger>
          <TabsTrigger value="by-user">By User</TabsTrigger>
        </TabsList>

        <TabsContent value="by-experience">
          {isLoading ? (
            <div className="text-center py-12">Loading favorites...</div>
          ) : !filteredExperienceStats?.length ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No favorites found
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredExperienceStats.map((stat, index) => (
                <Card key={stat.experience?.id || index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="secondary"
                            className="bg-red-100 text-red-700 flex items-center gap-1"
                          >
                            <Heart className="h-3 w-3 fill-current" />
                            {stat.count}
                          </Badge>
                          <h3 className="font-semibold">
                            {stat.experience?.title || "Unknown Experience"}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {stat.experience?.hotels?.name || "Unknown Hotel"}
                          </span>
                          <span>
                            Last favorited:{" "}
                            {format(new Date(stat.lastAdded), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="by-user">
          {isLoading ? (
            <div className="text-center py-12">Loading favorites...</div>
          ) : !userStatsList?.length ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No favorites found
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {userStatsList.map((stat) => (
                <Card key={stat.userId}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-700 flex items-center gap-1"
                          >
                            <Heart className="h-3 w-3" />
                            {stat.experiences.length}
                          </Badge>
                          <h3 className="font-semibold flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {getUserDisplayName(stat.userId)}
                          </h3>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {stat.experiences.slice(0, 5).map((exp, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {exp?.title || "Unknown"}
                            </Badge>
                          ))}
                          {stat.experiences.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{stat.experiences.length - 5} more
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Last activity:{" "}
                          {format(new Date(stat.lastAdded), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminFavorites;