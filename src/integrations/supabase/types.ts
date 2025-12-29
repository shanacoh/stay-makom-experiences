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
      ai_search_events: {
        Row: {
          booking_id: string | null
          created_at: string | null
          event_type: string
          experience_id: string | null
          id: string
          metadata: Json | null
          position: number | null
          search_id: string | null
          session_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          event_type: string
          experience_id?: string | null
          id?: string
          metadata?: Json | null
          position?: number | null
          search_id?: string | null
          session_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          event_type?: string
          experience_id?: string | null
          id?: string
          metadata?: Json | null
          position?: number | null
          search_id?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_search_events_search_id_fkey"
            columns: ["search_id"]
            isOneToOne: false
            referencedRelation: "ai_search_queries"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_search_queries: {
        Row: {
          conversion_booking_id: string | null
          conversion_experience_id: string | null
          converted: boolean | null
          created_at: string | null
          id: string
          lang: string | null
          query: string
          recommendation_count: number | null
          recommended_ids: string[] | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          conversion_booking_id?: string | null
          conversion_experience_id?: string | null
          converted?: boolean | null
          created_at?: string | null
          id?: string
          lang?: string | null
          query: string
          recommendation_count?: number | null
          recommended_ids?: string[] | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          conversion_booking_id?: string | null
          conversion_experience_id?: string | null
          converted?: boolean | null
          created_at?: string | null
          id?: string
          lang?: string | null
          query?: string
          recommendation_count?: number | null
          recommended_ids?: string[] | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      booking_extras: {
        Row: {
          booking_id: string
          created_at: string | null
          extra_id: string
          extra_name: string | null
          extra_type: string | null
          id: string
          notes: string | null
          price: number | null
          quantity: number
          status: Database["public"]["Enums"]["booking_extra_status"] | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          extra_id: string
          extra_name?: string | null
          extra_type?: string | null
          id?: string
          notes?: string | null
          price?: number | null
          quantity?: number
          status?: Database["public"]["Enums"]["booking_extra_status"] | null
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          extra_id?: string
          extra_name?: string | null
          extra_type?: string | null
          id?: string
          notes?: string | null
          price?: number | null
          quantity?: number
          status?: Database["public"]["Enums"]["booking_extra_status"] | null
          unit_price?: number
          updated_at?: string | null
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
            foreignKeyName: "booking_extras_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings_safe"
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
          package_id: string | null
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
          package_id?: string | null
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
          package_id?: string | null
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
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          bullets: string[] | null
          bullets_he: string[] | null
          created_at: string
          display_order: number | null
          editorial_tiles: Json | null
          hero_image: string | null
          icon: string | null
          id: string
          intro_rich_text: string | null
          intro_rich_text_he: string | null
          meta_description_en: string | null
          meta_description_fr: string | null
          meta_description_he: string | null
          name: string
          name_he: string | null
          og_description_en: string | null
          og_description_fr: string | null
          og_description_he: string | null
          og_image: string | null
          og_title_en: string | null
          og_title_fr: string | null
          og_title_he: string | null
          presentation_title: string | null
          presentation_title_he: string | null
          seo_title_en: string | null
          seo_title_fr: string | null
          seo_title_he: string | null
          slug: string
          status: Database["public"]["Enums"]["hotel_status"]
          updated_at: string
        }
        Insert: {
          bullets?: string[] | null
          bullets_he?: string[] | null
          created_at?: string
          display_order?: number | null
          editorial_tiles?: Json | null
          hero_image?: string | null
          icon?: string | null
          id?: string
          intro_rich_text?: string | null
          intro_rich_text_he?: string | null
          meta_description_en?: string | null
          meta_description_fr?: string | null
          meta_description_he?: string | null
          name: string
          name_he?: string | null
          og_description_en?: string | null
          og_description_fr?: string | null
          og_description_he?: string | null
          og_image?: string | null
          og_title_en?: string | null
          og_title_fr?: string | null
          og_title_he?: string | null
          presentation_title?: string | null
          presentation_title_he?: string | null
          seo_title_en?: string | null
          seo_title_fr?: string | null
          seo_title_he?: string | null
          slug: string
          status?: Database["public"]["Enums"]["hotel_status"]
          updated_at?: string
        }
        Update: {
          bullets?: string[] | null
          bullets_he?: string[] | null
          created_at?: string
          display_order?: number | null
          editorial_tiles?: Json | null
          hero_image?: string | null
          icon?: string | null
          id?: string
          intro_rich_text?: string | null
          intro_rich_text_he?: string | null
          meta_description_en?: string | null
          meta_description_fr?: string | null
          meta_description_he?: string | null
          name?: string
          name_he?: string | null
          og_description_en?: string | null
          og_description_fr?: string | null
          og_description_he?: string | null
          og_image?: string | null
          og_title_en?: string | null
          og_title_fr?: string | null
          og_title_he?: string | null
          presentation_title?: string | null
          presentation_title_he?: string | null
          seo_title_en?: string | null
          seo_title_fr?: string | null
          seo_title_he?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["hotel_status"]
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address_country: string | null
          birthdate: string | null
          city: string | null
          created_at: string
          default_party_size: number
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_country?: string | null
          birthdate?: string | null
          city?: string | null
          created_at?: string
          default_party_size?: number
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_country?: string | null
          birthdate?: string | null
          city?: string | null
          created_at?: string
          default_party_size?: number
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      experience_extras: {
        Row: {
          created_at: string | null
          experience_id: string
          extra_id: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          experience_id: string
          extra_id: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          experience_id?: string
          extra_id?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experience_extras_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experience_extras_extra_id_fkey"
            columns: ["extra_id"]
            isOneToOne: false
            referencedRelation: "extras"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_includes: {
        Row: {
          created_at: string
          description: string | null
          description_he: string | null
          experience_id: string
          icon_url: string | null
          id: string
          order_index: number
          published: boolean
          title: string
          title_he: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_he?: string | null
          experience_id: string
          icon_url?: string | null
          id?: string
          order_index?: number
          published?: boolean
          title: string
          title_he?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_he?: string | null
          experience_id?: string
          icon_url?: string | null
          id?: string
          order_index?: number
          published?: boolean
          title?: string
          title_he?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_includes_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_reviews: {
        Row: {
          created_at: string
          customer_id: string | null
          experience_id: string
          id: string
          published: boolean
          rating: number
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          experience_id: string
          id?: string
          published?: boolean
          rating: number
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          experience_id?: string
          id?: string
          published?: boolean
          rating?: number
          text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_reviews_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          accessibility_info: string | null
          accessibility_info_he: string | null
          address: string | null
          address_he: string | null
          adult_only: boolean | null
          base_price: number
          base_price_type: Database["public"]["Enums"]["base_price_type"] | null
          cancellation_policy: string | null
          cancellation_policy_he: string | null
          category_id: string | null
          checkin_time: string | null
          checkout_time: string | null
          created_at: string | null
          currency: string | null
          duration: string | null
          duration_he: string | null
          good_to_know: string[] | null
          good_to_know_he: string[] | null
          google_maps_link: string | null
          hero_image: string | null
          hotel_id: string
          id: string
          includes: string[] | null
          includes_he: string[] | null
          lead_time_days: number | null
          long_copy: string | null
          long_copy_he: string | null
          max_nights: number | null
          max_party: number | null
          meta_description_en: string | null
          meta_description_fr: string | null
          meta_description_he: string | null
          min_nights: number | null
          min_party: number | null
          not_includes: string[] | null
          not_includes_he: string[] | null
          og_description_en: string | null
          og_description_fr: string | null
          og_description_he: string | null
          og_image: string | null
          og_title_en: string | null
          og_title_fr: string | null
          og_title_he: string | null
          photos: string[] | null
          region_type: string | null
          seo_title_en: string | null
          seo_title_fr: string | null
          seo_title_he: string | null
          services: string[] | null
          services_he: string[] | null
          slug: string
          status: Database["public"]["Enums"]["hotel_status"] | null
          subtitle: string | null
          subtitle_he: string | null
          title: string
          title_he: string | null
          updated_at: string | null
        }
        Insert: {
          accessibility_info?: string | null
          accessibility_info_he?: string | null
          address?: string | null
          address_he?: string | null
          adult_only?: boolean | null
          base_price: number
          base_price_type?:
            | Database["public"]["Enums"]["base_price_type"]
            | null
          cancellation_policy?: string | null
          cancellation_policy_he?: string | null
          category_id?: string | null
          checkin_time?: string | null
          checkout_time?: string | null
          created_at?: string | null
          currency?: string | null
          duration?: string | null
          duration_he?: string | null
          good_to_know?: string[] | null
          good_to_know_he?: string[] | null
          google_maps_link?: string | null
          hero_image?: string | null
          hotel_id: string
          id?: string
          includes?: string[] | null
          includes_he?: string[] | null
          lead_time_days?: number | null
          long_copy?: string | null
          long_copy_he?: string | null
          max_nights?: number | null
          max_party?: number | null
          meta_description_en?: string | null
          meta_description_fr?: string | null
          meta_description_he?: string | null
          min_nights?: number | null
          min_party?: number | null
          not_includes?: string[] | null
          not_includes_he?: string[] | null
          og_description_en?: string | null
          og_description_fr?: string | null
          og_description_he?: string | null
          og_image?: string | null
          og_title_en?: string | null
          og_title_fr?: string | null
          og_title_he?: string | null
          photos?: string[] | null
          region_type?: string | null
          seo_title_en?: string | null
          seo_title_fr?: string | null
          seo_title_he?: string | null
          services?: string[] | null
          services_he?: string[] | null
          slug: string
          status?: Database["public"]["Enums"]["hotel_status"] | null
          subtitle?: string | null
          subtitle_he?: string | null
          title: string
          title_he?: string | null
          updated_at?: string | null
        }
        Update: {
          accessibility_info?: string | null
          accessibility_info_he?: string | null
          address?: string | null
          address_he?: string | null
          adult_only?: boolean | null
          base_price?: number
          base_price_type?:
            | Database["public"]["Enums"]["base_price_type"]
            | null
          cancellation_policy?: string | null
          cancellation_policy_he?: string | null
          category_id?: string | null
          checkin_time?: string | null
          checkout_time?: string | null
          created_at?: string | null
          currency?: string | null
          duration?: string | null
          duration_he?: string | null
          good_to_know?: string[] | null
          good_to_know_he?: string[] | null
          google_maps_link?: string | null
          hero_image?: string | null
          hotel_id?: string
          id?: string
          includes?: string[] | null
          includes_he?: string[] | null
          lead_time_days?: number | null
          long_copy?: string | null
          long_copy_he?: string | null
          max_nights?: number | null
          max_party?: number | null
          meta_description_en?: string | null
          meta_description_fr?: string | null
          meta_description_he?: string | null
          min_nights?: number | null
          min_party?: number | null
          not_includes?: string[] | null
          not_includes_he?: string[] | null
          og_description_en?: string | null
          og_description_fr?: string | null
          og_description_he?: string | null
          og_image?: string | null
          og_title_en?: string | null
          og_title_fr?: string | null
          og_title_he?: string | null
          photos?: string[] | null
          region_type?: string | null
          seo_title_en?: string | null
          seo_title_fr?: string | null
          seo_title_he?: string | null
          services?: string[] | null
          services_he?: string[] | null
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
            foreignKeyName: "experiences_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
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
          hotel_id: string
          id: string
          image_url: string | null
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
          hotel_id: string
          id?: string
          image_url?: string | null
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
          hotel_id?: string
          id?: string
          image_url?: string | null
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
            foreignKeyName: "extras_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_cards: {
        Row: {
          amount: number | null
          booking_id: string | null
          code: string
          created_at: string
          currency: string | null
          delivery_date: string
          delivery_type: string | null
          experience_id: string | null
          expires_at: string
          id: string
          language: string | null
          message: string | null
          recipient_email: string
          recipient_name: string | null
          redeemed_at: string | null
          sender_email: string
          sender_name: string
          sent_at: string | null
          status: string
          stripe_payment_intent_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          booking_id?: string | null
          code: string
          created_at?: string
          currency?: string | null
          delivery_date?: string
          delivery_type?: string | null
          experience_id?: string | null
          expires_at?: string
          id?: string
          language?: string | null
          message?: string | null
          recipient_email: string
          recipient_name?: string | null
          redeemed_at?: string | null
          sender_email: string
          sender_name: string
          sent_at?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          booking_id?: string | null
          code?: string
          created_at?: string
          currency?: string | null
          delivery_date?: string
          delivery_type?: string | null
          experience_id?: string | null
          expires_at?: string
          id?: string
          language?: string | null
          message?: string | null
          recipient_email?: string
          recipient_name?: string | null
          redeemed_at?: string | null
          sender_email?: string
          sender_name?: string
          sent_at?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_cards_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_cards_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_cards_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      global_settings: {
        Row: {
          contact_email: string | null
          created_at: string | null
          default_commission_rate: number | null
          default_currency: string | null
          id: string
          instagram_handle: string | null
          key: string
          meta_description_en: string | null
          meta_description_fr: string | null
          meta_description_he: string | null
          og_description_en: string | null
          og_description_fr: string | null
          og_description_he: string | null
          og_image: string | null
          og_title_en: string | null
          og_title_fr: string | null
          og_title_he: string | null
          partners_email: string | null
          seo_title_en: string | null
          seo_title_fr: string | null
          seo_title_he: string | null
          site_name: string | null
          site_tagline: string | null
          stripe_publishable_key: string | null
          stripe_secret_key: string | null
          updated_at: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string | null
          default_commission_rate?: number | null
          default_currency?: string | null
          id?: string
          instagram_handle?: string | null
          key: string
          meta_description_en?: string | null
          meta_description_fr?: string | null
          meta_description_he?: string | null
          og_description_en?: string | null
          og_description_fr?: string | null
          og_description_he?: string | null
          og_image?: string | null
          og_title_en?: string | null
          og_title_fr?: string | null
          og_title_he?: string | null
          partners_email?: string | null
          seo_title_en?: string | null
          seo_title_fr?: string | null
          seo_title_he?: string | null
          site_name?: string | null
          site_tagline?: string | null
          stripe_publishable_key?: string | null
          stripe_secret_key?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string | null
          default_commission_rate?: number | null
          default_currency?: string | null
          id?: string
          instagram_handle?: string | null
          key?: string
          meta_description_en?: string | null
          meta_description_fr?: string | null
          meta_description_he?: string | null
          og_description_en?: string | null
          og_description_fr?: string | null
          og_description_he?: string | null
          og_image?: string | null
          og_title_en?: string | null
          og_title_fr?: string | null
          og_title_he?: string | null
          partners_email?: string | null
          seo_title_en?: string | null
          seo_title_fr?: string | null
          seo_title_he?: string | null
          site_name?: string | null
          site_tagline?: string | null
          stripe_publishable_key?: string | null
          stripe_secret_key?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hotel_admins: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          hotel_id: string
          job_title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          hotel_id: string
          job_title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          hotel_id?: string
          job_title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hotel_admins_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
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
          meta_description_en: string | null
          meta_description_fr: string | null
          meta_description_he: string | null
          name: string
          name_he: string | null
          og_description_en: string | null
          og_description_fr: string | null
          og_description_he: string | null
          og_image: string | null
          og_title_en: string | null
          og_title_fr: string | null
          og_title_he: string | null
          photos: string[] | null
          region: string | null
          region_he: string | null
          seo_title_en: string | null
          seo_title_fr: string | null
          seo_title_he: string | null
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
          meta_description_en?: string | null
          meta_description_fr?: string | null
          meta_description_he?: string | null
          name: string
          name_he?: string | null
          og_description_en?: string | null
          og_description_fr?: string | null
          og_description_he?: string | null
          og_image?: string | null
          og_title_en?: string | null
          og_title_fr?: string | null
          og_title_he?: string | null
          photos?: string[] | null
          region?: string | null
          region_he?: string | null
          seo_title_en?: string | null
          seo_title_fr?: string | null
          seo_title_he?: string | null
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
          meta_description_en?: string | null
          meta_description_fr?: string | null
          meta_description_he?: string | null
          name?: string
          name_he?: string | null
          og_description_en?: string | null
          og_description_fr?: string | null
          og_description_he?: string | null
          og_image?: string | null
          og_title_en?: string | null
          og_title_fr?: string | null
          og_title_he?: string | null
          photos?: string[] | null
          region?: string | null
          region_he?: string | null
          seo_title_en?: string | null
          seo_title_fr?: string | null
          seo_title_he?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["hotel_status"] | null
          story?: string | null
          story_he?: string | null
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      journal_posts: {
        Row: {
          author_name: string
          category: Database["public"]["Enums"]["journal_category"]
          content_en: string
          content_he: string | null
          cover_image: string | null
          created_at: string
          excerpt_en: string | null
          excerpt_he: string | null
          id: string
          meta_description_en: string | null
          meta_description_fr: string | null
          meta_description_he: string | null
          og_description_en: string | null
          og_description_fr: string | null
          og_description_he: string | null
          og_image: string | null
          og_title_en: string | null
          og_title_fr: string | null
          og_title_he: string | null
          published_at: string | null
          seo_title_en: string | null
          seo_title_fr: string | null
          seo_title_he: string | null
          slug: string
          status: Database["public"]["Enums"]["hotel_status"]
          title_en: string
          title_he: string | null
          updated_at: string
        }
        Insert: {
          author_name?: string
          category: Database["public"]["Enums"]["journal_category"]
          content_en: string
          content_he?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt_en?: string | null
          excerpt_he?: string | null
          id?: string
          meta_description_en?: string | null
          meta_description_fr?: string | null
          meta_description_he?: string | null
          og_description_en?: string | null
          og_description_fr?: string | null
          og_description_he?: string | null
          og_image?: string | null
          og_title_en?: string | null
          og_title_fr?: string | null
          og_title_he?: string | null
          published_at?: string | null
          seo_title_en?: string | null
          seo_title_fr?: string | null
          seo_title_he?: string | null
          slug: string
          status?: Database["public"]["Enums"]["hotel_status"]
          title_en: string
          title_he?: string | null
          updated_at?: string
        }
        Update: {
          author_name?: string
          category?: Database["public"]["Enums"]["journal_category"]
          content_en?: string
          content_he?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt_en?: string | null
          excerpt_he?: string | null
          id?: string
          meta_description_en?: string | null
          meta_description_fr?: string | null
          meta_description_he?: string | null
          og_description_en?: string | null
          og_description_fr?: string | null
          og_description_he?: string | null
          og_image?: string | null
          og_title_en?: string | null
          og_title_fr?: string | null
          og_title_he?: string | null
          published_at?: string | null
          seo_title_en?: string | null
          seo_title_fr?: string | null
          seo_title_he?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["hotel_status"]
          title_en?: string
          title_he?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_to: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string
          cta_id: string | null
          email: string
          first_name: string | null
          group_size: string | null
          id: string
          interests: string[] | null
          is_b2b: boolean | null
          last_name: string | null
          marketing_opt_in: boolean | null
          message: string | null
          metadata: Json | null
          name: string | null
          notes: string | null
          phone: string | null
          preferred_dates: string | null
          property_name: string | null
          property_type: string | null
          request_type: string | null
          source: string
          status: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          cta_id?: string | null
          email: string
          first_name?: string | null
          group_size?: string | null
          id?: string
          interests?: string[] | null
          is_b2b?: boolean | null
          last_name?: string | null
          marketing_opt_in?: boolean | null
          message?: string | null
          metadata?: Json | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          preferred_dates?: string | null
          property_name?: string | null
          property_type?: string | null
          request_type?: string | null
          source: string
          status?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          cta_id?: string | null
          email?: string
          first_name?: string | null
          group_size?: string | null
          id?: string
          interests?: string[] | null
          is_b2b?: boolean | null
          last_name?: string | null
          marketing_opt_in?: boolean | null
          message?: string | null
          metadata?: Json | null
          name?: string | null
          notes?: string | null
          phone?: string | null
          preferred_dates?: string | null
          property_name?: string | null
          property_type?: string | null
          request_type?: string | null
          source?: string
          status?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      packages: {
        Row: {
          created_at: string
          description_short: string | null
          discount_type: string
          discount_value: number
          experience_id: string
          hotel_id: string
          id: string
          min_nights: number | null
          name: string
          status: string
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          description_short?: string | null
          discount_type: string
          discount_value: number
          experience_id: string
          hotel_id: string
          id?: string
          min_nights?: number | null
          name: string
          status?: string
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          description_short?: string | null
          discount_type?: string
          discount_value?: number
          experience_id?: string
          hotel_id?: string
          id?: string
          min_nights?: number | null
          name?: string
          status?: string
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "packages_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packages_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          gdpr_consent_at: string | null
          locale: Database["public"]["Enums"]["locale"]
          marketing_opt_in: boolean
          phone: string | null
          tos_accepted_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          gdpr_consent_at?: string | null
          locale?: Database["public"]["Enums"]["locale"]
          marketing_opt_in?: boolean
          phone?: string | null
          tos_accepted_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          gdpr_consent_at?: string | null
          locale?: Database["public"]["Enums"]["locale"]
          marketing_opt_in?: boolean
          phone?: string | null
          tos_accepted_at?: string
          updated_at?: string
          user_id?: string
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
      wishlist: {
        Row: {
          created_at: string
          deleted_at: string | null
          experience_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          experience_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          experience_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      bookings_safe: {
        Row: {
          checkin: string | null
          checkout: string | null
          created_at: string | null
          currency: string | null
          customer_id: string | null
          experience_id: string | null
          experience_price_subtotal: number | null
          extras_subtotal: number | null
          hotel_id: string | null
          id: string | null
          notes: string | null
          party_size: number | null
          room_price_subtotal: number | null
          selected_room_code: string | null
          selected_room_name: string | null
          selected_room_policy: string | null
          selected_room_rate: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          total_price: number | null
          updated_at: string | null
        }
        Insert: {
          checkin?: string | null
          checkout?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          experience_id?: string | null
          experience_price_subtotal?: number | null
          extras_subtotal?: number | null
          hotel_id?: string | null
          id?: string | null
          notes?: string | null
          party_size?: number | null
          room_price_subtotal?: number | null
          selected_room_code?: string | null
          selected_room_name?: string | null
          selected_room_policy?: string | null
          selected_room_rate?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_price?: number | null
          updated_at?: string | null
        }
        Update: {
          checkin?: string | null
          checkout?: string | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          experience_id?: string | null
          experience_price_subtotal?: number | null
          extras_subtotal?: number | null
          hotel_id?: string | null
          id?: string | null
          notes?: string | null
          party_size?: number | null
          room_price_subtotal?: number | null
          selected_room_code?: string | null
          selected_room_name?: string | null
          selected_room_policy?: string | null
          selected_room_rate?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
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
    }
    Functions: {
      get_customers_with_emails: {
        Args: never
        Returns: {
          address_country: string
          created_at: string
          default_party_size: number
          first_name: string
          id: string
          last_name: string
          notes: string
          updated_at: string
          user_email: string
          user_id: string
        }[]
      }
      get_user_hotel_id: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          _action: string
          _entity_id: string
          _entity_type: string
          _metadata?: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "hotel_admin" | "customer"
      base_price_type: "fixed" | "per_person" | "per_booking"
      booking_extra_status: "pending" | "done" | "unavailable"
      booking_status:
        | "pending"
        | "hold"
        | "accepted"
        | "paid"
        | "confirmed"
        | "failed"
        | "cancelled"
      hotel_status: "draft" | "published" | "pending" | "archived"
      journal_category: "Stories" | "Places" | "Guides" | "People"
      locale: "en" | "he"
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
      base_price_type: ["fixed", "per_person", "per_booking"],
      booking_extra_status: ["pending", "done", "unavailable"],
      booking_status: [
        "pending",
        "hold",
        "accepted",
        "paid",
        "confirmed",
        "failed",
        "cancelled",
      ],
      hotel_status: ["draft", "published", "pending", "archived"],
      journal_category: ["Stories", "Places", "Guides", "People"],
      locale: ["en", "he"],
      pricing_type: ["per_booking", "per_person", "per_night"],
    },
  },
} as const
