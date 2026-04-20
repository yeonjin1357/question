export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      daily_aggregates: {
        Row: {
          count: number;
          country_code: string | null;
          option_id: string;
          question_id: string;
          updated_at: string;
        };
        Insert: {
          count?: number;
          country_code?: string | null;
          option_id: string;
          question_id: string;
          updated_at?: string;
        };
        Update: {
          count?: number;
          country_code?: string | null;
          option_id?: string;
          question_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_aggregates_option_id_fkey";
            columns: ["option_id"];
            isOneToOne: false;
            referencedRelation: "options";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "daily_aggregates_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      option_translations: {
        Row: {
          locale: string;
          option_id: string;
          text: string;
        };
        Insert: {
          locale: string;
          option_id: string;
          text: string;
        };
        Update: {
          locale?: string;
          option_id?: string;
          text?: string;
        };
        Relationships: [
          {
            foreignKeyName: "option_translations_option_id_fkey";
            columns: ["option_id"];
            isOneToOne: false;
            referencedRelation: "options";
            referencedColumns: ["id"];
          },
        ];
      };
      options: {
        Row: {
          created_at: string;
          id: string;
          question_id: string;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          question_id: string;
          sort_order: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          question_id?: string;
          sort_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: "options_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      question_translations: {
        Row: {
          locale: string;
          question_id: string;
          text: string;
        };
        Insert: {
          locale: string;
          question_id: string;
          text: string;
        };
        Update: {
          locale?: string;
          question_id?: string;
          text?: string;
        };
        Relationships: [
          {
            foreignKeyName: "question_translations_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      questions: {
        Row: {
          category: string;
          created_at: string;
          id: string;
          publish_date: string;
          status: Database["public"]["Enums"]["question_status"];
          updated_at: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          id?: string;
          publish_date: string;
          status?: Database["public"]["Enums"]["question_status"];
          updated_at?: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          id?: string;
          publish_date?: string;
          status?: Database["public"]["Enums"]["question_status"];
          updated_at?: string;
        };
        Relationships: [];
      };
      responses: {
        Row: {
          country_code: string | null;
          created_at: string;
          id: string;
          option_id: string;
          question_id: string;
          session_hash: string;
        };
        Insert: {
          country_code?: string | null;
          created_at?: string;
          id?: string;
          option_id: string;
          question_id: string;
          session_hash: string;
        };
        Update: {
          country_code?: string | null;
          created_at?: string;
          id?: string;
          option_id?: string;
          question_id?: string;
          session_hash?: string;
        };
        Relationships: [
          {
            foreignKeyName: "responses_option_id_fkey";
            columns: ["option_id"];
            isOneToOne: false;
            referencedRelation: "options";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "responses_question_id_fkey";
            columns: ["question_id"];
            isOneToOne: false;
            referencedRelation: "questions";
            referencedColumns: ["id"];
          },
        ];
      };
      suggestions: {
        Row: {
          admin_note: string | null;
          created_at: string;
          id: string;
          ip_hash: string;
          locale: string;
          options_json: Json;
          question_text: string;
          reviewed_at: string | null;
          scheduled_for: string | null;
          status: Database["public"]["Enums"]["suggestion_status"];
          submitter_email: string | null;
        };
        Insert: {
          admin_note?: string | null;
          created_at?: string;
          id?: string;
          ip_hash: string;
          locale: string;
          options_json: Json;
          question_text: string;
          reviewed_at?: string | null;
          scheduled_for?: string | null;
          status?: Database["public"]["Enums"]["suggestion_status"];
          submitter_email?: string | null;
        };
        Update: {
          admin_note?: string | null;
          created_at?: string;
          id?: string;
          ip_hash?: string;
          locale?: string;
          options_json?: Json;
          question_text?: string;
          reviewed_at?: string | null;
          scheduled_for?: string | null;
          status?: Database["public"]["Enums"]["suggestion_status"];
          submitter_email?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      question_status: "scheduled" | "live" | "archived";
      suggestion_status: "pending" | "approved" | "rejected";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      question_status: ["scheduled", "live", "archived"],
      suggestion_status: ["pending", "approved", "rejected"],
    },
  },
} as const;
