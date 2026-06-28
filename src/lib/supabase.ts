import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
);

export type StateKey = "learning_layers" | "journey_done" | "learning_done";

export async function loadState(keys: StateKey[]): Promise<Record<StateKey, string[]>> {
  const { data } = await supabase
    .from("portfolio_state")
    .select("key, value")
    .in("key", keys);

  const result = {} as Record<StateKey, string[]>;
  for (const key of keys) {
    result[key] = data?.find((r) => r.key === key)?.value ?? [];
  }
  return result;
}

export async function saveState(key: StateKey, value: string[]) {
  await supabase
    .from("portfolio_state")
    .upsert({ key, value, updated_at: new Date().toISOString() });
}
