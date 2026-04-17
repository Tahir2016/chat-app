export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: string;
  is_edited?: boolean;
  edited_at?: string;
}
