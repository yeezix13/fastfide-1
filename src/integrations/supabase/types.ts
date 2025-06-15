export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customer_merchant_link: {
        Row: {
          customer_id: string
          loyalty_points: number
          merchant_id: string
        }
        Insert: {
          customer_id: string
          loyalty_points?: number
          merchant_id: string
        }
        Update: {
          customer_id?: string
          loyalty_points?: number
          merchant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_merchant_link_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      merchants: {
        Row: {
          address: string | null
          contact_email: string | null
          id: string
          name: string
          phone: string | null
          points_per_euro: number | null
          signup_code: string
          theme_color: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          id?: string
          name: string
          phone?: string | null
          points_per_euro?: number | null
          signup_code: string
          theme_color?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          id?: string
          name?: string
          phone?: string | null
          points_per_euro?: number | null
          signup_code?: string
          theme_color?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          birth_date: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
        }
        Insert: {
          birth_date?: string | null
          email?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
        }
        Update: {
          birth_date?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          customer_id: string
          id: string
          merchant_id: string
          points_spent: number
          redeemed_at: string
          reward_id: string
        }
        Insert: {
          customer_id: string
          id?: string
          merchant_id: string
          points_spent: number
          redeemed_at?: string
          reward_id: string
        }
        Update: {
          customer_id?: string
          id?: string
          merchant_id?: string
          points_spent?: number
          redeemed_at?: string
          reward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_merchant"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_reward"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          id: string
          merchant_id: string
          name: string
          points_required: number
        }
        Insert: {
          id?: string
          merchant_id: string
          name: string
          points_required: number
        }
        Update: {
          id?: string
          merchant_id?: string
          name?: string
          points_required?: number
        }
        Relationships: [
          {
            foreignKeyName: "rewards_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          amount_spent: number
          created_at: string
          customer_id: string
          id: string
          merchant_id: string
          points_earned: number
          points_spent: number | null
        }
        Insert: {
          amount_spent: number
          created_at?: string
          customer_id: string
          id?: string
          merchant_id: string
          points_earned: number
          points_spent?: number | null
        }
        Update: {
          amount_spent?: number
          created_at?: string
          customer_id?: string
          id?: string
          merchant_id?: string
          points_earned?: number
          points_spent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      record_visit: {
        Args: {
          customer_phone_number: string
          merchant_user_id: string
          spent_amount: number
        }
        Returns: Json
      }
      redeem_reward: {
        Args: {
          customer_phone_number: string
          merchant_user_id: string
          reward_id_to_redeem: string
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
  public: {
    Enums: {},
  },
} as const
