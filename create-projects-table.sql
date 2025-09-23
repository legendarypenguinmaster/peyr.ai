-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  full_description TEXT,
  industry TEXT NOT NULL CHECK (industry IN ('fintech', 'healthtech', 'edtech', 'e-commerce', 'ai/ml', 'biotech', 'cleantech', 'other')),
  stage TEXT NOT NULL CHECK (stage IN ('idea', 'mvp', 'growth')),
  commitment TEXT NOT NULL CHECK (commitment IN ('part-time', 'full-time', 'contract')),
  role_needed TEXT NOT NULL,
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in progress', 'on hold')),
  budget INTEGER,
  deadline DATE,
  keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_author_id ON projects(author_id);
CREATE INDEX IF NOT EXISTS idx_projects_industry ON projects(industry);
CREATE INDEX IF NOT EXISTS idx_projects_stage ON projects(stage);
CREATE INDEX IF NOT EXISTS idx_projects_commitment ON projects(commitment);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);

-- Create simple text search indexes
CREATE INDEX IF NOT EXISTS idx_projects_title ON projects USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_projects_description ON projects USING gin(to_tsvector('english', description));

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view all projects
CREATE POLICY "Anyone can view projects" ON projects
  FOR SELECT USING (true);

-- Users can only insert their own projects
CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Users can only update their own projects
CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = author_id);

-- Users can only delete their own projects
CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = author_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
