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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      comms_outputs: {
        Row: {
          confidence: number | null
          created_at: string
          id: string
          lat: number | null
          location_cluster: string
          lon: number | null
          mission_id: string
          needs: string[] | null
          people_estimated: number | null
          urgency: Database["public"]["Enums"]["urgency_level"]
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          id?: string
          lat?: number | null
          location_cluster: string
          lon?: number | null
          mission_id: string
          needs?: string[] | null
          people_estimated?: number | null
          urgency?: Database["public"]["Enums"]["urgency_level"]
        }
        Update: {
          confidence?: number | null
          created_at?: string
          id?: string
          lat?: number | null
          location_cluster?: string
          lon?: number | null
          mission_id?: string
          needs?: string[] | null
          people_estimated?: number | null
          urgency?: Database["public"]["Enums"]["urgency_level"]
        }
        Relationships: [
          {
            foreignKeyName: "comms_outputs_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      explanations: {
        Row: {
          generated_at: string
          id: string
          mission_id: string
          summary_text: string
        }
        Insert: {
          generated_at?: string
          id?: string
          mission_id: string
          summary_text: string
        }
        Update: {
          generated_at?: string
          id?: string
          mission_id?: string
          summary_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "explanations_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          authority_lat: number | null
          authority_lon: number | null
          created_at: string
          created_by: string
          disaster_type: Database["public"]["Enums"]["disaster_type"]
          id: string
          notes: string | null
          region: string
          status: Database["public"]["Enums"]["mission_status"]
          updated_at: string
        }
        Insert: {
          authority_lat?: number | null
          authority_lon?: number | null
          created_at?: string
          created_by: string
          disaster_type: Database["public"]["Enums"]["disaster_type"]
          id?: string
          notes?: string | null
          region: string
          status?: Database["public"]["Enums"]["mission_status"]
          updated_at?: string
        }
        Update: {
          authority_lat?: number | null
          authority_lon?: number | null
          created_at?: string
          created_by?: string
          disaster_type?: Database["public"]["Enums"]["disaster_type"]
          id?: string
          notes?: string | null
          region?: string
          status?: Database["public"]["Enums"]["mission_status"]
          updated_at?: string
        }
        Relationships: []
      }
      navigation_outputs: {
        Row: {
          created_at: string
          eta_minutes: number | null
          id: string
          mission_id: string
          risk_level: Database["public"]["Enums"]["risk_level"]
          route_geojson: Json | null
        }
        Insert: {
          created_at?: string
          eta_minutes?: number | null
          id?: string
          mission_id: string
          risk_level?: Database["public"]["Enums"]["risk_level"]
          route_geojson?: Json | null
        }
        Update: {
          created_at?: string
          eta_minutes?: number | null
          id?: string
          mission_id?: string
          risk_level?: Database["public"]["Enums"]["risk_level"]
          route_geojson?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "navigation_outputs_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      uploads: {
        Row: {
          file_name: string
          file_size: number | null
          file_type: Database["public"]["Enums"]["file_type"]
          id: string
          mission_id: string
          storage_url: string
          uploaded_at: string
        }
        Insert: {
          file_name: string
          file_size?: number | null
          file_type: Database["public"]["Enums"]["file_type"]
          id?: string
          mission_id: string
          storage_url: string
          uploaded_at?: string
        }
        Update: {
          file_name?: string
          file_size?: number | null
          file_type?: Database["public"]["Enums"]["file_type"]
          id?: string
          mission_id?: string
          storage_url?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploads_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vision_outputs: {
        Row: {
          confidence: number | null
          created_at: string
          id: string
          lat: number
          lon: number
          mission_id: string
          road_id: string
          status: Database["public"]["Enums"]["road_status"]
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          id?: string
          lat: number
          lon: number
          mission_id: string
          road_id: string
          status: Database["public"]["Enums"]["road_status"]
        }
        Update: {
          confidence?: number | null
          created_at?: string
          id?: string
          lat?: number
          lon?: number
          mission_id?: string
          road_id?: string
          status?: Database["public"]["Enums"]["road_status"]
        }
        Relationships: [
          {
            foreignKeyName: "vision_outputs_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "admin" | "operator"
      disaster_type:
        | "flood"
        | "earthquake"
        | "cyclone"
        | "fire"
        | "landslide"
        | "tsunami"
        | "other"
      file_type: "image" | "video"
      mission_status: "pending" | "processing" | "completed"
      risk_level: "low" | "medium" | "high"
      road_status: "blocked" | "partial" | "clear"
      urgency_level: "low" | "medium" | "high" | "critical"
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
      app_role: ["admin", "operator"],
      disaster_type: [
        "flood",
        "earthquake",
        "cyclone",
        "fire",
        "landslide",
        "tsunami",
        "other",
      ],
      file_type: ["image", "video"],
      mission_status: ["pending", "processing", "completed"],
      risk_level: ["low", "medium", "high"],
      road_status: ["blocked", "partial", "clear"],
      urgency_level: ["low", "medium", "high", "critical"],
    },
  },
} as const
