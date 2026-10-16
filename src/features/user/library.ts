"use server";

import "server-only";

import { z } from "zod";

import { createClient, getCurrentUser } from "@/lib/supabase/server";

const seriesId = z.uuid();

export type LibraryStatus = { loggedIn: boolean; favorite: boolean; read: boolean };

// この作品のお気に入り・読了の状態 (詳細ページのボタン用)
export async function getLibraryStatus(id: string): Promise<LibraryStatus> {
  const user = await getCurrentUser();
  if (!user || !seriesId.safeParse(id).success) return { loggedIn: Boolean(user), favorite: false, read: false };
  const supabase = await createClient();
  const [fav, read] = await Promise.all([
    supabase.from("favorite_series").select("series_id").eq("series_id", id).maybeSingle(),
    supabase.from("read_series").select("series_id").eq("series_id", id).maybeSingle(),
  ]);
  return { loggedIn: true, favorite: Boolean(fav.data), read: Boolean(read.data) };
}

// on = true で登録、false で解除。結果の状態を返す (失敗したら変える前の状態)
async function setMark(table: "favorite_series" | "read_series", id: string, on: boolean): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) throw new Error("ログインが必要です");
  seriesId.parse(id);
  const supabase = await createClient();
  // user_id は RLS の WITH CHECK (auth.uid() = user_id) でも確かめられる
  const { error } = on
    ? await supabase.from(table).upsert({ user_id: user.id, series_id: id }, { onConflict: "user_id,series_id" })
    : await supabase.from(table).delete().eq("user_id", user.id).eq("series_id", id);
  if (error) throw new Error("保存できませんでした");
  return on;
}

export async function setFavorite(id: string, on: boolean) {
  return setMark("favorite_series", id, on);
}

export async function setRead(id: string, on: boolean) {
  return setMark("read_series", id, on);
}
