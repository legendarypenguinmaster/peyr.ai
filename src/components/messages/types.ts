export interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  id_verification: boolean;
}

export interface Connection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  requester?: Profile;
  addressee?: Profile;
}

export interface Message {
  id: string;
  connection_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email?: string;
}
