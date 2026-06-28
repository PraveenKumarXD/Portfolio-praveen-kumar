import { supabase } from "./supabase";
import { defaultBlockContent } from "./knowledge";
import type { KDB, KPage, KBlock, KBlockType } from "./knowledge";

export const idb: KDB = {
  pages: {
    list: async (): Promise<KPage[]> => {
      const { data, error } = await supabase
        .from("interview_pages")
        .select("id,parent_id,title,icon")
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as KPage[];
    },
    create: async (title: string, parent_id: string | null): Promise<KPage> => {
      const { data, error } = await supabase
        .from("interview_pages")
        .insert({ title, parent_id, icon: "📄" })
        .select("id,parent_id,title,icon")
        .single();
      if (error) throw error;
      return data as KPage;
    },
    update: async (id: string, patch: Partial<Pick<KPage, "title" | "icon">>) => {
      await supabase.from("interview_pages").update(patch).eq("id", id);
    },
    delete: async (id: string) => {
      await supabase.from("interview_pages").delete().eq("id", id);
    },
  },
  blocks: {
    list: async (page_id: string): Promise<KBlock[]> => {
      const { data, error } = await supabase
        .from("interview_blocks")
        .select("*")
        .eq("page_id", page_id)
        .order("position");
      if (error) throw error;
      return (data ?? []) as KBlock[];
    },
    create: async (page_id: string, type: KBlockType, position: number): Promise<KBlock> => {
      const { data, error } = await supabase
        .from("interview_blocks")
        .insert({ page_id, type, content: defaultBlockContent(type), position })
        .select("*")
        .single();
      if (error) throw error;
      return data as KBlock;
    },
    update: async (id: string, patch: { type?: KBlockType; content?: Record<string, unknown>; position?: number }) => {
      await supabase.from("interview_blocks").update(patch).eq("id", id);
    },
    delete: async (id: string) => {
      await supabase.from("interview_blocks").delete().eq("id", id);
    },
  },
};
