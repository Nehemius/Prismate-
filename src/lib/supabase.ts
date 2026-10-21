import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { QuizQuestion, ListItem, ListType } from '../types/prismate';

// Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Validates whether Supabase credentials have been configured in .env
 */
export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('YOUR_SUPABASE_PROJECT_URL') &&
  !supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')
);

/**
 * The initialized Supabase client singleton, or null when running in offline/local mode.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

interface SupabaseQuestionRow {
  id: string;
  subject: 'physics' | 'chemistry' | 'mathematics';
  unit: number;
  chapter: string;
  category: 'bb' | 'formula' | 'unit' | 'pta' | 'board';
  question: string;
  options: string[] | string;
  correct_index: number;
  explanation?: string;
  requires_diagram?: boolean;
  source_page?: number;
}

/**
 * Fetch questions from Supabase `quiz_questions` table.
 * Falls back gracefully to null if Supabase is offline or not configured.
 */
export async function fetchQuestionsFromSupabase(
  subject?: 'physics' | 'chemistry' | 'mathematics',
  category?: 'bb' | 'formula' | 'unit' | 'pta' | 'board'
): Promise<QuizQuestion[] | null> {
  if (!supabase) return null;

  try {
    let query = supabase.from('quiz_questions').select('*');
    if (subject) query = query.eq('subject', subject);
    if (category) query = query.eq('category', category);

    const { data, error } = await query;
    if (error) {
      console.warn('Supabase questions query error:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    return (data as SupabaseQuestionRow[]).map((row) => ({
      id: row.id,
      subject: row.subject,
      topic: `Unit ${row.unit}: ${row.chapter}`,
      question: row.question,
      options: (Array.isArray(row.options)
        ? row.options
        : JSON.parse(row.options || '[]')) as [string, string, string, string],
      correctIndex: row.correct_index,
      explanation: row.explanation || '',
      category: row.category,
      sourcePage: row.source_page,
      requiresDiagram: row.requires_diagram,
    }));
  } catch (err) {
    console.warn('Supabase fetch failed, falling back to local dataset:', err);
    return null;
  }
}

/**
 * Sync a personal list item (weaklist, stronglist, studylist) to Supabase `user_lists` table.
 */
export async function syncListItemToSupabase(
  userId: string,
  listType: ListType,
  item: ListItem
): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('user_lists').upsert(
      {
        user_id: userId,
        item_id: item.id,
        item_type: item.category,
        list_type: listType,
        subject: item.subject,
        title: item.title,
        content: item.content,
        added_at: new Date(item.addedAt).toISOString(),
      },
      { onConflict: 'user_id,item_id,list_type' }
    );

    if (error) {
      console.warn('Supabase user_lists sync error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase sync error:', err);
    return false;
  }
}

/**
 * Remove a personal list item from Supabase `user_lists` table.
 */
export async function removeListItemFromSupabase(
  userId: string,
  listType: ListType,
  itemId: string
): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('user_lists')
      .delete()
      .eq('user_id', userId)
      .eq('list_type', listType)
      .eq('item_id', itemId);

    if (error) {
      console.warn('Supabase delete error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase delete error:', err);
    return false;
  }
}
