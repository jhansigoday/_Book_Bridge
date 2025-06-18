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
      book_requests: {
        Row: {
          book_id: string
          created_at: string | null
          donor_id: string
          id: string
          message: string | null
          requester_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          book_id: string
          created_at?: string | null
          donor_id: string
          id?: string
          message?: string | null
          requester_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          book_id?: string
          created_at?: string | null
          donor_id?: string
          id?: string
          message?: string | null
          requester_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "book_requests_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author: string
          category: string | null
          condition: string | null
          coverurl: string | null
          createdat: string | null
          description: string | null
          donorid: string | null
          id: string
          is_free_to_read: boolean | null
          isfeatured: boolean | null
          status: string | null
          title: string
        }
        Insert: {
          author: string
          category?: string | null
          condition?: string | null
          coverurl?: string | null
          createdat?: string | null
          description?: string | null
          donorid?: string | null
          id?: string
          is_free_to_read?: boolean | null
          isfeatured?: boolean | null
          status?: string | null
          title: string
        }
        Update: {
          author?: string
          category?: string | null
          condition?: string | null
          coverurl?: string | null
          createdat?: string | null
          description?: string | null
          donorid?: string | null
          id?: string
          is_free_to_read?: boolean | null
          isfeatured?: boolean | null
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      contact_exchanges: {
        Row: {
          created_at: string | null
          donor_address: string | null
          donor_phone: string | null
          id: string
          request_id: string
          requester_address: string | null
          requester_phone: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          donor_address?: string | null
          donor_phone?: string | null
          id?: string
          request_id: string
          requester_address?: string | null
          requester_phone?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          donor_address?: string | null
          donor_phone?: string | null
          id?: string
          request_id?: string
          requester_address?: string | null
          requester_phone?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_exchanges_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "book_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          createdat: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          userid: string
        }
        Insert: {
          createdat?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          userid: string
        }
        Update: {
          createdat?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          userid?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          username: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          username?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_book_notification: {
        Args: {
          user_id: string
          notification_type: string
          notification_title: string
          notification_message: string
        }
        Returns: undefined
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
