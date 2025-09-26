-- Fix RLS policies for investors table to allow reading all investor profiles for matching

-- Drop the restrictive select policy
DROP POLICY IF EXISTS "investors_select_own" ON investors;

-- Create a new policy that allows reading all public investor profiles
CREATE POLICY "investors_select_public" ON investors
  FOR SELECT USING (visibility = 'public' OR auth.uid() = id);

-- Also allow reading all investors for authenticated users (for matching purposes)
CREATE POLICY "investors_select_all_authenticated" ON investors
  FOR SELECT USING (auth.role() = 'authenticated');
