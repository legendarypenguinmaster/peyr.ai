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
      profiles: {
        Row: {
          id: string;
          role: "founder" | "mentor" | "investor";
          name: string | null;
          onboarding_data: Json | null;
          onboarding_completed: boolean;
          signup_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: "founder" | "mentor" | "investor";
          name?: string | null;
          onboarding_data?: Json | null;
          onboarding_completed?: boolean;
          signup_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: "founder" | "mentor" | "investor";
          name?: string | null;
          onboarding_data?: Json | null;
          onboarding_completed?: boolean;
          signup_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
