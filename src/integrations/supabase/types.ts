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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      crisis_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          id: string
          matched_keywords: string[]
          severity: string
          submission_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          id?: string
          matched_keywords?: string[]
          severity?: string
          submission_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          id?: string
          matched_keywords?: string[]
          severity?: string
          submission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crisis_alerts_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "public_voices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crisis_alerts_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      pastor_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      pastor_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          pastor_id: string
          read_at: string | null
          sender_id: string
          subject: string | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          pastor_id: string
          read_at?: string | null
          sender_id: string
          subject?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          pastor_id?: string
          read_at?: string | null
          sender_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pastor_messages_pastor_id_fkey"
            columns: ["pastor_id"]
            isOneToOne: false
            referencedRelation: "pastors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pastor_messages_pastor_id_fkey"
            columns: ["pastor_id"]
            isOneToOne: false
            referencedRelation: "public_pastors"
            referencedColumns: ["id"]
          },
        ]
      }
      pastoral_responses: {
        Row: {
          author_display_name: string | null
          author_id: string
          body: string
          created_at: string
          id: string
          is_internal_note: boolean
          scripture_reference: string | null
          submission_id: string
          updated_at: string
        }
        Insert: {
          author_display_name?: string | null
          author_id: string
          body: string
          created_at?: string
          id?: string
          is_internal_note?: boolean
          scripture_reference?: string | null
          submission_id: string
          updated_at?: string
        }
        Update: {
          author_display_name?: string | null
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          is_internal_note?: boolean
          scripture_reference?: string | null
          submission_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pastoral_responses_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "public_voices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pastoral_responses_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      pastors: {
        Row: {
          bio: string | null
          created_at: string
          display_name: string
          email: string | null
          facebook: string | null
          id: string
          instagram: string | null
          is_visible: boolean
          phone: string | null
          photo_url: string | null
          sort_order: number
          title: string | null
          twitter: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          display_name: string
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          is_visible?: boolean
          phone?: string | null
          photo_url?: string | null
          sort_order?: number
          title?: string | null
          twitter?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          display_name?: string
          email?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          is_visible?: boolean
          phone?: string | null
          photo_url?: string | null
          sort_order?: number
          title?: string | null
          twitter?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      peer_chamber_members: {
        Row: {
          chamber_id: string
          id: string
          joined_at: string
          pseudonym: string
          role: string
          user_id: string
        }
        Insert: {
          chamber_id: string
          id?: string
          joined_at?: string
          pseudonym: string
          role?: string
          user_id: string
        }
        Update: {
          chamber_id?: string
          id?: string
          joined_at?: string
          pseudonym?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "peer_chamber_members_chamber_id_fkey"
            columns: ["chamber_id"]
            isOneToOne: false
            referencedRelation: "peer_chambers"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_chamber_messages: {
        Row: {
          author_id: string
          body: string
          chamber_id: string
          created_at: string
          id: string
          pseudonym: string
          risk_flagged: boolean
          risk_keywords: string[] | null
        }
        Insert: {
          author_id: string
          body: string
          chamber_id: string
          created_at?: string
          id?: string
          pseudonym: string
          risk_flagged?: boolean
          risk_keywords?: string[] | null
        }
        Update: {
          author_id?: string
          body?: string
          chamber_id?: string
          created_at?: string
          id?: string
          pseudonym?: string
          risk_flagged?: boolean
          risk_keywords?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "peer_chamber_messages_chamber_id_fkey"
            columns: ["chamber_id"]
            isOneToOne: false
            referencedRelation: "peer_chambers"
            referencedColumns: ["id"]
          },
        ]
      }
      peer_chambers: {
        Row: {
          capacity: number
          created_at: string
          description: string | null
          id: string
          status: Database["public"]["Enums"]["chamber_status"]
          steward_id: string | null
          topic: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["chamber_status"]
          steward_id?: string | null
          topic: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["chamber_status"]
          steward_id?: string | null
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          membership_tier: Database["public"]["Enums"]["membership_tier"]
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          membership_tier?: Database["public"]["Enums"]["membership_tier"]
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          membership_tier?: Database["public"]["Enums"]["membership_tier"]
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          category: string | null
          contact_email: string | null
          contact_name: string | null
          content: string
          created_at: string
          display_publicly: boolean
          id: string
          is_anonymous: boolean
          pastoral_response: string | null
          public_approved_at: string | null
          public_approved_by: string | null
          public_excerpt: string | null
          public_title: string | null
          responded_at: string | null
          risk_flagged: boolean
          risk_keywords: string[] | null
          status: Database["public"]["Enums"]["submission_status"]
          tracking_token: string
          type: Database["public"]["Enums"]["submission_type"]
          updated_at: string
        }
        Insert: {
          category?: string | null
          contact_email?: string | null
          contact_name?: string | null
          content: string
          created_at?: string
          display_publicly?: boolean
          id?: string
          is_anonymous?: boolean
          pastoral_response?: string | null
          public_approved_at?: string | null
          public_approved_by?: string | null
          public_excerpt?: string | null
          public_title?: string | null
          responded_at?: string | null
          risk_flagged?: boolean
          risk_keywords?: string[] | null
          status?: Database["public"]["Enums"]["submission_status"]
          tracking_token: string
          type: Database["public"]["Enums"]["submission_type"]
          updated_at?: string
        }
        Update: {
          category?: string | null
          contact_email?: string | null
          contact_name?: string | null
          content?: string
          created_at?: string
          display_publicly?: boolean
          id?: string
          is_anonymous?: boolean
          pastoral_response?: string | null
          public_approved_at?: string | null
          public_approved_by?: string | null
          public_excerpt?: string | null
          public_title?: string | null
          responded_at?: string | null
          risk_flagged?: boolean
          risk_keywords?: string[] | null
          status?: Database["public"]["Enums"]["submission_status"]
          tracking_token?: string
          type?: Database["public"]["Enums"]["submission_type"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_pastors: {
        Row: {
          bio: string | null
          display_name: string | null
          facebook: string | null
          id: string | null
          instagram: string | null
          is_visible: boolean | null
          photo_url: string | null
          sort_order: number | null
          title: string | null
          twitter: string | null
          website: string | null
        }
        Insert: {
          bio?: string | null
          display_name?: string | null
          facebook?: string | null
          id?: string | null
          instagram?: string | null
          is_visible?: boolean | null
          photo_url?: string | null
          sort_order?: number | null
          title?: string | null
          twitter?: string | null
          website?: string | null
        }
        Update: {
          bio?: string | null
          display_name?: string | null
          facebook?: string | null
          id?: string | null
          instagram?: string | null
          is_visible?: boolean | null
          photo_url?: string | null
          sort_order?: number | null
          title?: string | null
          twitter?: string | null
          website?: string | null
        }
        Relationships: []
      }
      public_voices: {
        Row: {
          approved_at: string | null
          category: string | null
          created_at: string | null
          excerpt: string | null
          id: string | null
          title: string | null
          type: Database["public"]["Enums"]["submission_type"] | null
        }
        Insert: {
          approved_at?: string | null
          category?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string | null
          title?: never
          type?: Database["public"]["Enums"]["submission_type"] | null
        }
        Update: {
          approved_at?: string | null
          category?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string | null
          title?: never
          type?: Database["public"]["Enums"]["submission_type"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_membership_tier: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["membership_tier"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_chamber_member: {
        Args: { _chamber_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "pastor" | "peer_mentor" | "member"
      chamber_status: "open" | "closed" | "archived"
      membership_tier: "free" | "regular" | "premium"
      submission_status:
        | "received"
        | "in_review"
        | "being_prayed_for"
        | "pastor_assigned"
        | "responded"
        | "resolved"
      submission_type: "confession" | "prayer"
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
      app_role: ["admin", "pastor", "peer_mentor", "member"],
      chamber_status: ["open", "closed", "archived"],
      membership_tier: ["free", "regular", "premium"],
      submission_status: [
        "received",
        "in_review",
        "being_prayed_for",
        "pastor_assigned",
        "responded",
        "resolved",
      ],
      submission_type: ["confession", "prayer"],
    },
  },
} as const
