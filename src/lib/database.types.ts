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
      connections: {
        Row: {
          id: string;
          requester_id: string;
          addressee_id: string;
          message: string | null;
          status: "pending" | "accepted" | "declined" | "blocked";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          addressee_id: string;
          message?: string | null;
          status?: "pending" | "accepted" | "declined" | "blocked";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string;
          addressee_id?: string;
          message?: string | null;
          status?: "pending" | "accepted" | "declined" | "blocked";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "connections_requester_id_fkey";
            columns: ["requester_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "connections_addressee_id_fkey";
            columns: ["addressee_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      projects: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          description: string;
          full_description: string | null;
          industry: string;
          stage: string;
          commitment: string;
          role_needed: string;
          required_skills: string[];
          status: "planning" | "in progress" | "on hold";
          budget: number | null;
          deadline: string | null;
          keywords: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          description: string;
          full_description?: string | null;
          industry: string;
          stage: string;
          commitment: string;
          role_needed: string;
          required_skills: string[];
          status?: "planning" | "in progress" | "on hold";
          budget?: number | null;
          deadline?: string | null;
          keywords?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          title?: string;
          description?: string;
          full_description?: string | null;
          industry?: string;
          stage?: string;
          commitment?: string;
          role_needed?: string;
          required_skills?: string[];
          status?: "planning" | "in progress" | "on hold";
          budget?: number | null;
          deadline?: string | null;
          keywords?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_author_id_fkey";
            columns: ["author_id"];
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
