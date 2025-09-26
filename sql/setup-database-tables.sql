-- Database Setup Script for Peyr.ai
-- Run this in your Supabase SQL Editor to create the required tables

-- 1. Drop existing tables if they exist (be careful with this in production!)
DROP TABLE IF EXISTS mentors CASCADE;
DROP TABLE IF EXISTS founders CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  role TEXT CHECK (role IN ('founder', 'mentor', 'investor')),
  avatar_url TEXT,
  signup_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create founders table
CREATE TABLE founders (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  bio TEXT,
  location TEXT,
  timezone TEXT,
  skills TEXT[],
  industries TEXT[],
  cofounder_preference TEXT,
  commitment_level TEXT,
  availability_hours INTEGER,
  communication_style TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create mentors table
CREATE TABLE mentors (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  bio TEXT,
  expertise_domains TEXT[],
  industries TEXT[],
  years_experience INTEGER,
  past_roles TEXT[],
  availability_hours INTEGER,
  communication_channel TEXT,
  mentorship_style TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- 7. Create RLS policies for founders
CREATE POLICY "Users can view all founder profiles" ON founders
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own founder profile" ON founders
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own founder profile" ON founders
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own founder profile" ON founders
  FOR DELETE USING (auth.uid() = id);

-- 8. Create RLS policies for mentors
CREATE POLICY "Users can view all mentor profiles" ON mentors
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own mentor profile" ON mentors
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own mentor profile" ON mentors
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete their own mentor profile" ON mentors
  FOR DELETE USING (auth.uid() = id);

-- 9. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_founders_updated_at BEFORE UPDATE ON founders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentors_updated_at BEFORE UPDATE ON mentors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Create indexes for better performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_founders_skills ON founders USING GIN(skills);
CREATE INDEX idx_founders_industries ON founders USING GIN(industries);
CREATE INDEX idx_mentors_expertise ON mentors USING GIN(expertise_domains);
CREATE INDEX idx_mentors_industries ON mentors USING GIN(industries);

-- 12. Test the setup by checking if tables exist
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename IN ('profiles', 'founders', 'mentors')
ORDER BY tablename;