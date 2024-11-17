import { create } from 'zustand';
import { createAuthslice } from './slices/auth-slice';
import { createChatslice } from './slices/chat-slice';

export const useAppstore = create((set, get) => ({
  ...createAuthslice(set, get),
  ...createChatslice(set, get),
}));
