export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      booking_extras: {
        Row: {
          booking_id: string
          created_at: string | null
          extra_id: string
          id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          extra_id: string
          id?: string
          quantity?: number
          unit_price: number
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          extra_id?: string
          id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_extras_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_extras_extra_id_fkey"
            columns: ["extra_id"]
            isOneToOne: false
            referencedRelation: "extras"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          checkin: string
          checkout: string
          created_at: string | null
          currency: string | null
          customer_id: string | null
          experience_id: string
          experience_price_subtotal: number
          extras_subtotal: number | null
          hotel_id: string
          id: string
          notes: string | null
          party_size: number
          payment_status: string | null
          room_price_subtotal: number | null
          selected_room_code: string | null
          selected_room_name: string | null
          selected_room_policy: string | null
          selected_room_rate: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          stripe_payment_intent_id: string | null
          total_price: number
          updated_at: string | null
        }
        Insert: {
          checkin: string
          checkout: string
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          experience_id: string
          experience_price_subtotal: number
          extras_subtotal?: number | null
          hotel_id: string
          id?: string
          notes?: string | null
          party_size: number
          payment_status?: string | null
          room_price_subtotal?: number | null
          selected_room_code?: string | null
          selected_room_name?: string | null
          selected_room_policy?: string | null
          selected_room_rate?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          stripe_payment_intent_id?: string | null
          total_price: number
          updated_at?: string | null
        }
        Update: {
          checkin?: string
          checkout?: string
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          experience_id?: string
          experience_price_subtotal?: number
          extras_subtotal?: number | null
          hotel_id?: string
          id?: string
          notes?: string | null
          party_size?: number
          payment_status?: string | null
          room_price_subtotal?: number | null
          selected_room_code?: string | null
          selected_room_name?: string | null
          selected_room_policy?: string | null
          selected_room_rate?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          stripe_payment_intent_id?: string | null
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          base_price: number
          base_price_type: Database["public"]["Enums"]["base_price_type"] | null
          cancellation_policy: string | null
          cancellation_policy_he: string | null
          category: Database["public"]["Enums"]["experience_category"]
          created_at: string | null
          currency: string | null
          duration: string | null
          duration_he: string | null
          good_to_know: string[] | null
          hero_image: string | null
          hotel_id: string
          id: string
          includes: string[] | null
          includes_he: string[] | null
          lead_time_days: number | null
          long_copy: string | null
          long_copy_he: string | null
          max_party: number | null
          min_party: number | null
          not_includes: string[] | null
          not_includes_he: string[] | null
          photos: string[] | null
          slug: string
          status: Database["public"]["Enums"]["hotel_status"] | null
          subtitle: string | null
          subtitle_he: string | null
          title: string
          title_he: string | null
          updated_at: string | null
        }
        Insert: {
          base_price: number
          base_price_type?:
            | Database["public"]["Enums"]["base_price_type"]
            | null
          cancellation_policy?: string | null
          cancellation_policy_he?: string | null
          category: Database["public"]["Enums"]["experience_category"]
          created_at?: string | null
          currency?: string | null
          duration?: string | null
          duration_he?: string | null
          good_to_know?: string[] | null
          hero_image?: string | null
          hotel_id: string
          id?: string
          includes?: string[] | null
          includes_he?: string[] | null
          lead_time_days?: number | null
          long_copy?: string | null
          long_copy_he?: string | null
          max_party?: number | null
          min_party?: number | null
          not_includes?: string[] | null
          not_includes_he?: string[] | null
          photos?: string[] | null
          slug: string
          status?: Database["public"]["Enums"]["hotel_status"] | null
          subtitle?: string | null
          subtitle_he?: string | null
          title: string
          title_he?: string | null
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          base_price_type?:
            | Database["public"]["Enums"]["base_price_type"]
            | null
          cancellation_policy?: string | null
          cancellation_policy_he?: string | null
          category?: Database["public"]["Enums"]["experience_category"]
          created_at?: string | null
          currency?: string | null
          duration?: string | null
          duration_he?: string | null
          good_to_know?: string[] | null
          hero_image?: string | null
          hotel_id?: string
          id?: string
          includes?: string[] | null
          includes_he?: string[] | null
          lead_time_days?: number | null
          long_copy?: string | null
          long_copy_he?: string | null
          max_party?: number | null
          min_party?: number | null
          not_includes?: string[] | null
          not_includes_he?: string[] | null
          photos?: string[] | null
          slug?: string
          status?: Database["public"]["Enums"]["hotel_status"] | null
          subtitle?: string | null
          subtitle_he?: string | null
          title?: string
          title_he?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experiences_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      extras: {
        Row: {
          created_at: string | null
          currency: string | null
          description: string | null
          description_he: string | null
          experience_id: string
          id: string
          is_available: boolean | null
          max_qty: number | null
          name: string
          name_he: string | null
          price: number
          pricing_type: Database["public"]["Enums"]["pricing_type"] | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          description_he?: string | null
          experience_id: string
          id?: string
          is_available?: boolean | null
          max_qty?: number | null
          name: string
          name_he?: string | null
          price: number
          pricing_type?: Database["public"]["Enums"]["pricing_type"] | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          description?: string | null
          description_he?: string | null
          experience_id?: string
          id?: string
          is_available?: boolean | null
          max_qty?: number | null
          name?: string
          name_he?: string | null
          price?: number
          pricing_type?: Database["public"]["Enums"]["pricing_type"] | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "extras_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      hotels: {
        Row: {
          amenities: string[] | null
          amenities_he: string[] | null
          city: string | null
          city_he: string | null
          commission_rate: number | null
          contact_email: string | null
          contact_instagram: string | null
          contact_phone: string | null
          contact_website: string | null
          created_at: string | null
          faqs: Json | null
          hero_image: string | null
          highlights: string[] | null
          highlights_he: string[] | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          name_he: string | null
          photos: string[] | null
          region: string | null
          region_he: string | null
          slug: string
          status: Database["public"]["Enums"]["hotel_status"] | null
          story: string | null
          story_he: string | null
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          amenities?: string[] | null
          amenities_he?: string[] | null
          city?: string | null
          city_he?: string | null
          commission_rate?: number | null
          contact_email?: string | null
          contact_instagram?: string | null
          contact_phone?: string | null
          contact_website?: string | null
          created_at?: string | null
          faqs?: Json | null
          hero_image?: string | null
          highlights?: string[] | null
          highlights_he?: string[] | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          name_he?: string | null
          photos?: string[] | null
          region?: string | null
          region_he?: string | null
          slug: string
          status?: Database["public"]["Enums"]["hotel_status"] | null
          story?: string | null
          story_he?: string | null
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          amenities?: string[] | null
          amenities_he?: string[] | null
          city?: string | null
          city_he?: string | null
          commission_rate?: number | null
          contact_email?: string | null
          contact_instagram?: string | null
          contact_phone?: string | null
          contact_website?: string | null
          created_at?: string | null
          faqs?: Json | null
          hero_image?: string | null
          highlights?: string[] | null
          highlights_he?: string[] | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          name_he?: string | null
          photos?: string[] | null
          region?: string | null
          region_he?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["hotel_status"] | null
          story?: string | null
          story_he?: string | null
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          hotel_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          hotel_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          hotel_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "hotel_admin" | "customer"
      base_price_type: "fixed" | "per_person"
      booking_status:
        | "pending"
        | "hold"
        | "accepted"
        | "paid"
        | "confirmed"
        | "failed"
        | "cancelled"
      experience_category:
        | "romantic"
        | "family"
        | "golden_age"
        | "beyond_nature"
        | "taste_affair"
        | "active_break"
      hotel_status: "draft" | "published"
      pricing_type: "per_booking" | "per_person" | "per_night"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "hotel_admin", "customer"],
      base_price_type: ["fixed", "per_person"],
      booking_status: [
        "pending",
        "hold",
        "accepted",
        "paid",
        "confirmed",
        "failed",
        "cancelled",
      ],
      experience_category: [
        "romantic",
        "family",
        "golden_age",
        "beyond_nature",
        "taste_affair",
        "active_break",
      ],
      hotel_status: ["draft", "published"],
      pricing_type: ["per_booking", "per_person", "per_night"],
    },
  },
} as const
