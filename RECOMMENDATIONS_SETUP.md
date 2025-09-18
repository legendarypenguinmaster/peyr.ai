# Co-Founder Recommendations Setup Guide

## Overview
This feature uses GPT-4o to intelligently match founders with potential co-founders (mentors) based on comprehensive profile analysis.

## Setup Steps

### 1. Database Setup
Run this SQL in your Supabase SQL Editor to create the recommendations table:

```sql
-- Create recommendations table
CREATE TABLE IF NOT EXISTS co_founder_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  founder_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recommended_mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  match_score DECIMAL(3,2) NOT NULL CHECK (match_score >= 0 AND match_score <= 1),
  match_reasoning TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE co_founder_recommendations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own recommendations" ON co_founder_recommendations
  FOR SELECT USING (auth.uid() = founder_id);

CREATE POLICY "Users can insert their own recommendations" ON co_founder_recommendations
  FOR INSERT WITH CHECK (auth.uid() = founder_id);

CREATE POLICY "Users can update their own recommendations" ON co_founder_recommendations
  FOR UPDATE USING (auth.uid() = founder_id);

CREATE POLICY "Users can delete their own recommendations" ON co_founder_recommendations
  FOR DELETE USING (auth.uid() = founder_id);

-- Create trigger for updated_at
CREATE TRIGGER update_co_founder_recommendations_updated_at 
  BEFORE UPDATE ON co_founder_recommendations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_co_founder_recommendations_founder_id ON co_founder_recommendations(founder_id);
CREATE INDEX idx_co_founder_recommendations_mentor_id ON co_founder_recommendations(recommended_mentor_id);
CREATE INDEX idx_co_founder_recommendations_score ON co_founder_recommendations(match_score DESC);
CREATE INDEX idx_co_founder_recommendations_created_at ON co_founder_recommendations(created_at DESC);
```

### 2. Environment Variables
Add to your `.env.local` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Install Dependencies
```bash
npm install
```

## How It Works

1. **User visits dashboard** → Component calls `/api/recommendations/co-founders`
2. **Check for cached recommendations** → If found (less than 24h old), returns them
3. **Fetch user data** → Gets founder profile and all available mentors
4. **GPT-4o Analysis** → Sends profiles to GPT-4o for intelligent matching
5. **Store results** → Saves recommendations in database with match scores
6. **Display** → Shows personalized co-founder recommendations

## Features

- **Smart Caching**: Recommendations cached for 24 hours to save GPT tokens
- **Intelligent Matching**: Analyzes 7 compatibility factors
- **Error Handling**: Graceful fallbacks for missing data or API issues
- **Real-time UI**: Loading states and error handling

## Troubleshooting

### Common Issues

1. **500 Error**: Check if the recommendations table exists in Supabase
2. **No recommendations**: Ensure you have mentors in the database
3. **GPT errors**: Verify your OpenAI API key is set correctly
4. **Profile not found**: Complete your founder profile setup

### Debug Steps

1. Check browser console for error messages
2. Verify database tables exist
3. Ensure environment variables are set
4. Check Supabase RLS policies are correct

## API Endpoint

**GET** `/api/recommendations/co-founders`

Returns:
```json
{
  "recommendations": [
    {
      "id": "uuid",
      "founder_id": "uuid", 
      "recommended_mentor_id": "uuid",
      "match_score": 0.95,
      "match_reasoning": "Detailed explanation...",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "cached": false
}
```
