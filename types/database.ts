// Generated Supabase types — run `supabase gen types typescript` to regenerate

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          body: Json | null;
          cover_image_url: string | null;
          pdf_url: string | null;
          category_id: string | null;
          author_id: string | null;
          status: "draft" | "published" | "archived";
          is_breaking: boolean;
          is_featured: boolean;
          reading_time_minutes: number | null;
          published_at: string | null;
          created_at: string;
          search_vector: unknown | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["articles"]["Row"],
          "id" | "created_at" | "search_vector" | "reading_time_minutes"
        > & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["articles"]["Insert"]>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          color_hex: string | null;
          display_order: number | null;
        };
        Insert: Omit<Database["public"]["Tables"]["categories"]["Row"], "id"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
      };
      authors: {
        Row: {
          id: string;
          display_name: string;
          bio: string | null;
          avatar_url: string | null;
          role: "editor" | "journalist" | "contributor";
        };
        Insert: Database["public"]["Tables"]["authors"]["Row"];
        Update: Partial<Database["public"]["Tables"]["authors"]["Row"]>;
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tags"]["Row"], "id"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tags"]["Insert"]>;
      };
      article_tags: {
        Row: {
          article_id: string;
          tag_id: string;
        };
        Insert: Database["public"]["Tables"]["article_tags"]["Row"];
        Update: Partial<Database["public"]["Tables"]["article_tags"]["Row"]>;
      };
      breaking_news: {
        Row: {
          id: string;
          text: string;
          link_article_id: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["breaking_news"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["breaking_news"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      article_status: "draft" | "published" | "archived";
      author_role: "editor" | "journalist" | "contributor";
    };
  };
};
