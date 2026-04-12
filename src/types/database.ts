export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      providers: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          slug: string;
          description: string;
          logo_url: string | null;
          timezone: string;
          currency: string;
          phone: string | null;
          email: string | null;
          website: string | null;
          social_links: Json;
          stripe_account_id: string | null;
          stripe_onboarding_complete: boolean;
          branding: Json;
          cancellation_policy: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name: string;
          slug: string;
          description?: string;
          logo_url?: string | null;
          timezone?: string;
          currency?: string;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          social_links?: Json;
          stripe_account_id?: string | null;
          stripe_onboarding_complete?: boolean;
          branding?: Json;
          cancellation_policy?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_name?: string;
          slug?: string;
          description?: string;
          logo_url?: string | null;
          timezone?: string;
          currency?: string;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          social_links?: Json;
          stripe_account_id?: string | null;
          stripe_onboarding_complete?: boolean;
          branding?: Json;
          cancellation_policy?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          provider_id: string;
          name: string;
          description: string;
          duration_minutes: number;
          price_cents: number;
          deposit_cents: number;
          category: string;
          color: string;
          emoji: string;
          is_active: boolean;
          sort_order: number;
          buffer_before_minutes: number | null;
          buffer_after_minutes: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          name: string;
          description?: string;
          duration_minutes: number;
          price_cents: number;
          deposit_cents?: number;
          category?: string;
          color?: string;
          emoji?: string;
          is_active?: boolean;
          sort_order?: number;
          buffer_before_minutes?: number | null;
          buffer_after_minutes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          name?: string;
          description?: string;
          duration_minutes?: number;
          price_cents?: number;
          deposit_cents?: number;
          category?: string;
          color?: string;
          emoji?: string;
          is_active?: boolean;
          sort_order?: number;
          buffer_before_minutes?: number | null;
          buffer_after_minutes?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      availability_rules: {
        Row: {
          id: string;
          provider_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      availability_overrides: {
        Row: {
          id: string;
          provider_id: string;
          date: string;
          start_time: string | null;
          end_time: string | null;
          is_blocked: boolean;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          date: string;
          start_time?: string | null;
          end_time?: string | null;
          is_blocked?: boolean;
          reason?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          date?: string;
          start_time?: string | null;
          end_time?: string | null;
          is_blocked?: boolean;
          reason?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          provider_id: string;
          service_id: string;
          client_name: string;
          client_email: string;
          client_phone: string | null;
          starts_at: string;
          ends_at: string;
          status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
          client_notes: string;
          provider_notes: string;
          payment_status: "unpaid" | "deposit_paid" | "paid" | "refunded";
          payment_amount_cents: number;
          stripe_payment_intent_id: string | null;
          stripe_checkout_session_id: string | null;
          calendar_event_id: string | null;
          calendar_provider: string | null;
          reminder_sent: boolean;
          timezone: string;
          cancelled_at: string | null;
          cancellation_reason: string;
          refund_amount_cents: number;
          cancellation_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          service_id: string;
          client_name: string;
          client_email: string;
          client_phone?: string | null;
          starts_at: string;
          ends_at: string;
          status?: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
          client_notes?: string;
          provider_notes?: string;
          payment_status?: "unpaid" | "deposit_paid" | "paid" | "refunded";
          payment_amount_cents?: number;
          stripe_payment_intent_id?: string | null;
          stripe_checkout_session_id?: string | null;
          calendar_event_id?: string | null;
          calendar_provider?: string | null;
          reminder_sent?: boolean;
          timezone: string;
          cancelled_at?: string | null;
          cancellation_reason?: string;
          refund_amount_cents?: number;
          cancellation_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          service_id?: string;
          client_name?: string;
          client_email?: string;
          client_phone?: string | null;
          starts_at?: string;
          ends_at?: string;
          status?: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
          client_notes?: string;
          provider_notes?: string;
          payment_status?: "unpaid" | "deposit_paid" | "paid" | "refunded";
          payment_amount_cents?: number;
          stripe_payment_intent_id?: string | null;
          stripe_checkout_session_id?: string | null;
          calendar_event_id?: string | null;
          calendar_provider?: string | null;
          reminder_sent?: boolean;
          timezone?: string;
          cancelled_at?: string | null;
          cancellation_reason?: string;
          refund_amount_cents?: number;
          cancellation_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      personal_events: {
        Row: {
          id: string;
          provider_id: string;
          title: string;
          starts_at: string;
          ends_at: string;
          is_all_day: boolean;
          color: string;
          notes: string;
          recurrence_rule: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          title: string;
          starts_at: string;
          ends_at: string;
          is_all_day?: boolean;
          color?: string;
          notes?: string;
          recurrence_rule?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          title?: string;
          starts_at?: string;
          ends_at?: string;
          is_all_day?: boolean;
          color?: string;
          notes?: string;
          recurrence_rule?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      calendar_connections: {
        Row: {
          id: string;
          provider_id: string;
          calendar_type: "google" | "microsoft" | "caldav";
          calendar_name: string;
          access_token: string | null;
          refresh_token: string | null;
          token_expires_at: string | null;
          caldav_url: string | null;
          caldav_username: string | null;
          caldav_password: string | null;
          external_calendar_id: string | null;
          is_read_enabled: boolean;
          is_write_enabled: boolean;
          last_synced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          calendar_type: "google" | "microsoft" | "caldav";
          calendar_name?: string;
          access_token?: string | null;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          caldav_url?: string | null;
          caldav_username?: string | null;
          caldav_password?: string | null;
          external_calendar_id?: string | null;
          is_read_enabled?: boolean;
          is_write_enabled?: boolean;
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          calendar_type?: "google" | "microsoft" | "caldav";
          calendar_name?: string;
          access_token?: string | null;
          refresh_token?: string | null;
          token_expires_at?: string | null;
          caldav_url?: string | null;
          caldav_username?: string | null;
          caldav_password?: string | null;
          external_calendar_id?: string | null;
          is_read_enabled?: boolean;
          is_write_enabled?: boolean;
          last_synced_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      external_busy_times: {
        Row: {
          id: string;
          provider_id: string;
          connection_id: string | null;
          starts_at: string;
          ends_at: string;
          title: string;
          synced_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          connection_id?: string | null;
          starts_at: string;
          ends_at: string;
          title?: string;
          synced_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          connection_id?: string | null;
          starts_at?: string;
          ends_at?: string;
          title?: string;
          synced_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          booking_id: string | null;
          channel: "sms" | "whatsapp" | "email";
          recipient: string;
          template: string;
          status: "pending" | "sent" | "failed";
          error_message: string | null;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          channel: "sms" | "whatsapp" | "email";
          recipient: string;
          template: string;
          status?: "pending" | "sent" | "failed";
          error_message?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          channel?: "sms" | "whatsapp" | "email";
          recipient?: string;
          template?: string;
          status?: "pending" | "sent" | "failed";
          error_message?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      digital_products: {
        Row: {
          id: string;
          provider_id: string;
          title: string;
          description: string;
          cover_image_url: string | null;
          file_path: string | null;
          preview_image_url: string | null;
          price_cents: number;
          currency: string;
          is_active: boolean;
          sales_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          title: string;
          description?: string;
          cover_image_url?: string | null;
          file_path?: string | null;
          preview_image_url?: string | null;
          price_cents?: number;
          currency?: string;
          is_active?: boolean;
          sales_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          title?: string;
          description?: string;
          cover_image_url?: string | null;
          file_path?: string | null;
          preview_image_url?: string | null;
          price_cents?: number;
          currency?: string;
          is_active?: boolean;
          sales_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      digital_product_sales: {
        Row: {
          id: string;
          product_id: string;
          provider_id: string;
          buyer_email: string;
          buyer_name: string;
          amount_cents: number;
          currency: string;
          stripe_payment_intent_id: string | null;
          stripe_checkout_session_id: string | null;
          download_token: string;
          download_expires_at: string;
          download_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          provider_id: string;
          buyer_email: string;
          buyer_name?: string;
          amount_cents: number;
          currency?: string;
          stripe_payment_intent_id?: string | null;
          stripe_checkout_session_id?: string | null;
          download_token: string;
          download_expires_at: string;
          download_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          provider_id?: string;
          buyer_email?: string;
          buyer_name?: string;
          amount_cents?: number;
          currency?: string;
          stripe_payment_intent_id?: string | null;
          stripe_checkout_session_id?: string | null;
          download_token?: string;
          download_expires_at?: string;
          download_count?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience types
export type Provider = Database["public"]["Tables"]["providers"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type AvailabilityRule = Database["public"]["Tables"]["availability_rules"]["Row"];
export type AvailabilityOverride = Database["public"]["Tables"]["availability_overrides"]["Row"];
export type PersonalEvent = Database["public"]["Tables"]["personal_events"]["Row"];
export type CalendarConnection = Database["public"]["Tables"]["calendar_connections"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type DigitalProduct = Database["public"]["Tables"]["digital_products"]["Row"];
export type DigitalProductSale = Database["public"]["Tables"]["digital_product_sales"]["Row"];
