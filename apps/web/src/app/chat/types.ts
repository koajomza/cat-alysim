// apps/web/src/app/chat/types.ts

export type ChatMessage = {
  id: string;
  room_id: string;
  sender_id: string | null;
  username: string | null;
  content: string;
  created_at: string;
};

export type Profile = {
  id: string | null;
  username: string | null;
  nickname: string | null;
  full_name: string | null;
  og_name?: string | null;
  email: string | null;
  avatar_url?: string | null;
};

export type InspectProfileState = {
  userId: string | null;
  username: string | null;
  profile: Profile | null;
  loading: boolean;
  self: boolean;
};
