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
          name: string | null;
          email: string | null;
          role: "founder" | "mentor" | "investor" | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name?: string | null;
          email?: string | null;
          role?: "founder" | "mentor" | "investor" | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string | null;
          role?: "founder" | "mentor" | "investor" | null;
          avatar_url?: string | null;
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
      founders: {
        Row: {
          id: string;
          bio: string | null;
          location: string | null;
          timezone: string | null;
          skills: string[] | null;
          industries: string[] | null;
          cofounder_preference: string | null;
          commitment_level: string | null;
          availability_hours: number | null;
          communication_style: string | null;
          linkedin_url: string | null;
          github_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          bio?: string | null;
          location?: string | null;
          timezone?: string | null;
          skills?: string[] | null;
          industries?: string[] | null;
          cofounder_preference?: string | null;
          commitment_level?: string | null;
          availability_hours?: number | null;
          communication_style?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bio?: string | null;
          location?: string | null;
          timezone?: string | null;
          skills?: string[] | null;
          industries?: string[] | null;
          cofounder_preference?: string | null;
          commitment_level?: string | null;
          availability_hours?: number | null;
          communication_style?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "founders_id_fkey";
            columns: ["id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      mentors: {
        Row: {
          id: string;
          bio: string | null;
          expertise_domains: string[] | null;
          industries: string[] | null;
          years_experience: number | null;
          past_roles: string[] | null;
          availability_hours: number | null;
          communication_channel: string | null;
          mentorship_style: string | null;
          is_paid: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          bio?: string | null;
          expertise_domains?: string[] | null;
          industries?: string[] | null;
          years_experience?: number | null;
          past_roles?: string[] | null;
          availability_hours?: number | null;
          communication_channel?: string | null;
          mentorship_style?: string | null;
          is_paid?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bio?: string | null;
          expertise_domains?: string[] | null;
          industries?: string[] | null;
          years_experience?: number | null;
          past_roles?: string[] | null;
          availability_hours?: number | null;
          communication_channel?: string | null;
          mentorship_style?: string | null;
          is_paid?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mentors_id_fkey";
            columns: ["id"];
            referencedRelation: "profiles";
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
