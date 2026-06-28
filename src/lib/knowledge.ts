import { supabase } from "./supabase";

export type KBlockType =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "image"
  | "link"
  | "table"
  | "divider";

export interface KPage {
  id: string;
  parent_id: string | null;
  title: string;
  icon: string;
}

export interface KBlock {
  id: string;
  page_id: string;
  type: KBlockType;
  content: Record<string, unknown>;
  position: number;
}

export const defaultBlockContent = (type: KBlockType): Record<string, unknown> => {
  if (type === "table") return { headers: ["Column 1", "Column 2"], rows: [["", ""]] };
  if (type === "image") return { url: "", caption: "" };
  if (type === "link") return { href: "", label: "" };
  if (type === "divider") return {};
  return { text: "" };
};

export type KDB = {
  pages: {
    list: () => Promise<KPage[]>;
    create: (title: string, parent_id: string | null) => Promise<KPage>;
    update: (id: string, patch: Partial<Pick<KPage, "title" | "icon">>) => Promise<void>;
    delete: (id: string) => Promise<void>;
  };
  blocks: {
    list: (page_id: string) => Promise<KBlock[]>;
    create: (page_id: string, type: KBlockType, position: number) => Promise<KBlock>;
    update: (id: string, patch: { type?: KBlockType; content?: Record<string, unknown>; position?: number }) => Promise<void>;
    delete: (id: string) => Promise<void>;
  };
};

export const db: KDB = {
  pages: {
    list: async (): Promise<KPage[]> => {
      const { data, error } = await supabase
        .from("knowledge_pages")
        .select("id,parent_id,title,icon")
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as KPage[];
    },

    create: async (title: string, parent_id: string | null): Promise<KPage> => {
      const { data, error } = await supabase
        .from("knowledge_pages")
        .insert({ title, parent_id, icon: "📄" })
        .select("id,parent_id,title,icon")
        .single();
      if (error) throw error;
      return data as KPage;
    },

    update: async (id: string, patch: Partial<Pick<KPage, "title" | "icon">>) => {
      await supabase.from("knowledge_pages").update(patch).eq("id", id);
    },

    delete: async (id: string) => {
      await supabase.from("knowledge_pages").delete().eq("id", id);
    },
  },

  blocks: {
    list: async (page_id: string): Promise<KBlock[]> => {
      const { data, error } = await supabase
        .from("knowledge_blocks")
        .select("*")
        .eq("page_id", page_id)
        .order("position");
      if (error) throw error;
      return (data ?? []) as KBlock[];
    },

    create: async (page_id: string, type: KBlockType, position: number): Promise<KBlock> => {
      const { data, error } = await supabase
        .from("knowledge_blocks")
        .insert({ page_id, type, content: defaultBlockContent(type), position })
        .select("*")
        .single();
      if (error) throw error;
      return data as KBlock;
    },

    update: async (
      id: string,
      patch: { type?: KBlockType; content?: Record<string, unknown>; position?: number },
    ) => {
      await supabase.from("knowledge_blocks").update(patch).eq("id", id);
    },

    delete: async (id: string) => {
      await supabase.from("knowledge_blocks").delete().eq("id", id);
    },
  },
};
