export interface Person {
  id: string;
  name: string;
  shortName: string;
  role: string;
  team?: string;
  category?: 'Leadership' | 'Stakeholders' | 'Teammates & Friends' | 'Colleagues' | 'Technology' | 'Product & Business' | 'General' | string;
  message: string[];
  featured?: boolean;
  specialQuote?: string;
  sharedMemory?: string;
  avatarUrl?: string;
}

export type AppScreen = 'intro' | 'transition' | 'directory' | 'message' | 'final' | 'admin';
