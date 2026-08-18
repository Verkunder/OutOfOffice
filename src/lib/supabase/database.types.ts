export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string;
          client_seed_key: string | null;
          user_id: string;
          title: string;
          body: string;
          mood: string | null;
          location_name: string | null;
          visited_at: string;
          visibility: "private" | "public";
          created_at: string;
        };
        Insert: {
          id?: string;
          client_seed_key?: string | null;
          user_id: string;
          title: string;
          body: string;
          mood?: string | null;
          location_name?: string | null;
          visited_at?: string;
          visibility?: "private" | "public";
          created_at?: string;
        };
        Update: {
          id?: string;
          client_seed_key?: string | null;
          user_id?: string;
          title?: string;
          body?: string;
          mood?: string | null;
          location_name?: string | null;
          visited_at?: string;
          visibility?: "private" | "public";
          created_at?: string;
        };
        Relationships: [];
      };
      photos: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          storage_path: string;
          caption: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          storage_path: string;
          caption?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          storage_path?: string;
          caption?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      places: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          address: string | null;
          rating: number | null;
          notes: string | null;
          lat: number | null;
          lng: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category: string;
          address?: string | null;
          rating?: number | null;
          notes?: string | null;
          lat?: number | null;
          lng?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: string;
          address?: string | null;
          rating?: number | null;
          notes?: string | null;
          lat?: number | null;
          lng?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      ideas: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          status: "todo" | "done";
          priority: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          status?: "todo" | "done";
          priority?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          status?: "todo" | "done";
          priority?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      idea_status: "todo" | "done";
      post_visibility: "private" | "public";
    };
    CompositeTypes: Record<string, never>;
  };
};
