export interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  role: "founder" | "mentor" | "investor" | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  github_url: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  id_verification: boolean;
  created_at: string;
  updated_at: string;
}

export interface FounderData {
  id: string;
  location: string | null;
  availability_hours: number | null;
  linkedin_url: string | null;
  github_url: string | null;
  skills: string[];
  industries: string[];
  timezone: string | null;
  bio?: string | null;
  cofounder_preference: string | null;
  commitment_level: string | null;
  communication_style: string | null;
  communication_channel: string | null;
  created_at: string;
  updated_at: string;
}

export interface MentorData {
  id: string;
  expertise_domains: string[];
  years_experience: number | null;
  availability_hours: number | null;
  past_roles: string[];
  industries: string[];
  bio?: string | null;
  location?: string | null;
  timezone?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  is_paid: boolean;
  mentorship_style: string | null;
  communication_style: string | null;
  communication_channel: string | null;
  created_at: string;
  updated_at: string;
}
