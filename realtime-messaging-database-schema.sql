-- =====================================================
-- REAL-TIME MESSAGING DATABASE SCHEMA
-- =====================================================
-- This schema creates tables for real-time messaging with
-- connection requests, messages, and proper RLS policies
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CONNECTIONS TABLE
-- =====================================================
-- Stores connection requests between users
CREATE TABLE IF NOT EXISTS connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT, -- Optional message with connection request
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure users can't connect to themselves
    CONSTRAINT no_self_connection CHECK (requester_id != addressee_id),
    
    -- Ensure unique connection between two users
    CONSTRAINT unique_connection UNIQUE (requester_id, addressee_id)
);

-- =====================================================
-- MESSAGES TABLE
-- =====================================================
-- Stores messages between connected users
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connection_id UUID NOT NULL REFERENCES connections(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system', 'voice')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure sender and receiver are different
    CONSTRAINT no_self_message CHECK (sender_id != receiver_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Connections indexes
CREATE INDEX IF NOT EXISTS idx_connections_requester_id ON connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_addressee_id ON connections(addressee_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);
CREATE INDEX IF NOT EXISTS idx_connections_created_at ON connections(created_at DESC);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_connection_id ON messages(connection_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on both tables
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CONNECTIONS RLS POLICIES
-- =====================================================

-- Users can view connections where they are either requester or addressee
CREATE POLICY "Users can view their connections" ON connections
    FOR SELECT USING (
        auth.uid() = requester_id OR 
        auth.uid() = addressee_id
    );

-- Users can create connection requests to other users
CREATE POLICY "Users can create connection requests" ON connections
    FOR INSERT WITH CHECK (
        auth.uid() = requester_id AND
        auth.uid() != addressee_id
    );

-- Users can update connections where they are the addressee (accept/decline)
-- or where they are the requester (cancel)
CREATE POLICY "Users can update their connections" ON connections
    FOR UPDATE USING (
        auth.uid() = addressee_id OR 
        auth.uid() = requester_id
    );

-- Users can delete their own connection requests
CREATE POLICY "Users can delete their connection requests" ON connections
    FOR DELETE USING (auth.uid() = requester_id);

-- =====================================================
-- MESSAGES RLS POLICIES
-- =====================================================

-- Users can view messages in their connections
CREATE POLICY "Users can view messages in their connections" ON messages
    FOR SELECT USING (
        auth.uid() = sender_id OR 
        auth.uid() = receiver_id
    );

-- Users can send messages in their accepted connections
CREATE POLICY "Users can send messages in their connections" ON messages
    FOR INSERT WITH CHECK (
        (
            -- Normal case: User is the sender
            auth.uid() = sender_id AND
            EXISTS (
                SELECT 1 FROM connections 
                WHERE id = connection_id 
                AND (requester_id = auth.uid() OR addressee_id = auth.uid())
                AND status = 'accepted'
            )
        ) OR (
            -- Special case: Allow addressee to create initial message from connection request
            auth.uid() = receiver_id AND
            EXISTS (
                SELECT 1 FROM connections 
                WHERE id = connection_id 
                AND addressee_id = auth.uid()
                AND requester_id = sender_id
                AND status = 'accepted'
            )
        )
    );

-- Users can update their own messages (for read status, etc.)
CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages" ON messages
    FOR DELETE USING (auth.uid() = sender_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_connections_updated_at 
    BEFORE UPDATE ON connections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- REAL-TIME SETUP
-- =====================================================

-- Enable real-time for connections table
ALTER PUBLICATION supabase_realtime ADD TABLE connections;

-- Enable real-time for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM messages m
        JOIN connections c ON m.connection_id = c.id
        WHERE m.receiver_id = user_id
        AND m.is_read = FALSE
        AND c.status = 'accepted'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(connection_id UUID, user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE messages 
    SET is_read = TRUE, updated_at = NOW()
    WHERE messages.connection_id = mark_messages_as_read.connection_id
    AND receiver_id = user_id
    AND is_read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Uncomment the following lines to insert sample data for testing
-- Note: Replace the UUIDs with actual user IDs from your auth.users table

/*
-- Sample connections
INSERT INTO connections (requester_id, addressee_id, message, status) VALUES
('user-uuid-1', 'user-uuid-2', 'Hi! I would like to connect with you.', 'accepted'),
('user-uuid-2', 'user-uuid-3', 'Let''s collaborate on a project!', 'pending');

-- Sample messages
INSERT INTO messages (connection_id, sender_id, receiver_id, content) VALUES
((SELECT id FROM connections WHERE requester_id = 'user-uuid-1' AND addressee_id = 'user-uuid-2'), 
 'user-uuid-1', 'user-uuid-2', 'Hi! I would like to connect with you.'),
((SELECT id FROM connections WHERE requester_id = 'user-uuid-1' AND addressee_id = 'user-uuid-2'), 
 'user-uuid-2', 'user-uuid-1', 'Hello! I''d be happy to connect.'),
((SELECT id FROM connections WHERE requester_id = 'user-uuid-1' AND addressee_id = 'user-uuid-2'), 
 'user-uuid-1', 'user-uuid-2', 'Great! What kind of projects are you working on?');
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created successfully
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('connections', 'messages')
ORDER BY table_name;

-- Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('connections', 'messages');

-- Check if real-time is enabled
SELECT 
    schemaname,
    tablename
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('connections', 'messages');

-- =====================================================
-- USAGE INSTRUCTIONS
-- =====================================================

/*
1. Run this entire SQL script in your Supabase SQL editor
2. The script will create:
   - connections table for connection requests
   - messages table for chat messages
   - Proper indexes for performance
   - RLS policies for security
   - Real-time subscriptions
   - Helper functions

3. Real-time features will work automatically with Supabase client:
   - New messages appear instantly
   - Connection status updates in real-time
   - Unread message counts update automatically

4. The frontend code is already set up to use these tables and real-time features

5. To test real-time messaging:
   - Create a connection request
   - Accept the connection
   - Send messages between users
   - Messages should appear instantly without page refresh
*/
