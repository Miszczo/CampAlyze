export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          campaign_id: string | null
          content: string
          created_at: string
          date_range_end: string | null
          date_range_start: string | null
          id: string
          insight_type: string
          organization_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          campaign_id?: string | null
          content: string
          created_at?: string
          date_range_end?: string | null
          date_range_start?: string | null
          id?: string
          insight_type: string
          organization_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          campaign_id?: string | null
          content?: string
          created_at?: string
          date_range_end?: string | null
          date_range_start?: string | null
          id?: string
          insight_type?: string
          organization_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_insights_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_changes: {
        Row: {
          campaign_id: string
          change_type: string
          created_at: string
          description: string
          id: string
          implementation_date: string
          updated_at: string
          user_id: string
          verification_date: string | null
          verification_notes: string | null
          verified: boolean | null
        }
        Insert: {
          campaign_id: string
          change_type: string
          created_at?: string
          description: string
          id?: string
          implementation_date?: string
          updated_at?: string
          user_id: string
          verification_date?: string | null
          verification_notes?: string | null
          verified?: boolean | null
        }
        Update: {
          campaign_id?: string
          change_type?: string
          created_at?: string
          description?: string
          id?: string
          implementation_date?: string
          updated_at?: string
          user_id?: string
          verification_date?: string | null
          verification_notes?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_changes_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          end_date: string | null
          external_id: string | null
          id: string
          name: string
          organization_id: string
          platform_id: string
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          external_id?: string | null
          id?: string
          name: string
          organization_id: string
          platform_id: string
          start_date?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          external_id?: string | null
          id?: string
          name?: string
          organization_id?: string
          platform_id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      imports: {
        Row: {
          created_at: string
          end_date: string | null
          error_message: string | null
          file_path: string
          id: string
          organization_id: string
          original_filename: string
          platform_id: string
          start_date: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          error_message?: string | null
          file_path: string
          id?: string
          organization_id: string
          original_filename: string
          platform_id: string
          start_date?: string | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          error_message?: string | null
          file_path?: string
          id?: string
          organization_id?: string
          original_filename?: string
          platform_id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "imports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imports_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics: {
        Row: {
          campaign_id: string
          clicks: number
          conversions: number
          created_at: string
          date: string
          id: string
          impressions: number
          revenue: number
          spend: number
          updated_at: string
        }
        Insert: {
          campaign_id: string
          clicks?: number
          conversions?: number
          created_at?: string
          date: string
          id?: string
          impressions?: number
          revenue?: number
          spend?: number
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          clicks?: number
          conversions?: number
          created_at?: string
          date?: string
          id?: string
          impressions?: number
          revenue?: number
          spend?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      platforms: {
        Row: {
          created_at: string
          display_name: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_organizations: {
        Row: {
          created_at: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          organization_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_organizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          preferences: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          preferences?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          preferences?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      campaign_metrics_derived: {
        Row: {
          campaign_id: string | null
          campaign_name: string | null
          clicks: number | null
          conversions: number | null
          cost_per_conversion: number | null
          cpc: number | null
          ctr: number | null
          date: string | null
          impressions: number | null
          platform_name: string | null
          revenue: number | null
          roas: number | null
          spend: number | null
        }
        Relationships: [
          {
            foreignKeyName: "metrics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      upcoming_verifications: {
        Row: {
          campaign_id: string | null
          campaign_name: string | null
          change_type: string | null
          description: string | null
          id: string | null
          implementation_date: string | null
          user_email: string | null
          verification_date: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_changes_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

