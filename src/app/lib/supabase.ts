/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface Profile {
  id: string;
  email: string;
  role: "student" | "teacher";
  display_name: string;
}

export interface Query {
  id: string;
  author_id: string;
  content: string;
  student_visible_to_teacher: boolean;
  teacher_reply_anonymous: boolean;
  ai_flag_status: "pending" | "approved" | "rejected";
  created_at: string;
  // Extra fields for UI mapping
  author_name?: string;
  author_role?: "student" | "teacher";
  replies?: Reply[];
}

export interface Reply {
  id: string;
  query_id: string;
  author_id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  author_name?: string;
  author_role?: "student" | "teacher";
}

const DEFAULT_QUERIES: Query[] = [];

export class MockDB {
  static getSessionUser(): Profile | null {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem("prismate_user");
    if (!stored) return null;
    return JSON.parse(stored);
  }

  static async login(email: string, role: "student" | "teacher", name: string): Promise<Profile> {
    const id = `${role}-${Date.now()}`;
    const profile: Profile = { id, email, role, display_name: name };
    localStorage.setItem("prismate_user", JSON.stringify(profile));

    if (isSupabaseConfigured && supabase) {
      try {
        // UPSERT profile in Supabase profiles table
        const { error } = await supabase
          .from("profiles")
          .upsert({
            id: id, // Mock UUID or handle auth sessions properly if needed
            email,
            role: role.toUpperCase(),
            display_name: name,
            updated_at: new Date().toISOString()
          });
        if (error) console.error("Supabase profile save error:", error);
      } catch (err) {
        console.error("Supabase upsert catch:", err);
      }
    }
    return profile;
  }

  static logout() {
    localStorage.removeItem("prismate_user");
  }

  static async getQueries(user: Profile): Promise<Query[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        // Fetch queries from Supabase queries table
        // Join profiles and replies. RLS handles filter rules
        const { data, error } = await supabase
          .from("queries")
          .select(`
            id,
            user_id,
            query_text,
            student_visible_to_teacher,
            teacher_reply_anonymous,
            ai_flag_status,
            created_at,
            profiles (display_name, role),
            replies (
              id,
              query_id,
              user_id,
              content,
              is_anonymous,
              created_at,
              profiles (display_name, role)
            )
          `)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase fetch queries error:", error);
        } else if (data) {
          // Map database structure to Query interface
          const mapped: Query[] = data.map((item: any) => {
            const authorRole = item.profiles?.role?.toLowerCase() || "student";
            const rawAuthorName = item.profiles?.display_name || "Student";
            
            // Dynamic Author Label Matrix based on client role & visibility preferences
            let finalAuthorName = "Student";
            if (authorRole === "student") {
              if (user.role === "teacher" && item.student_visible_to_teacher) {
                finalAuthorName = rawAuthorName; // Visible strictly to verified teachers
              } else {
                finalAuthorName = "Student"; // Anonymous to peers
              }
            } else {
              // Teacher post
              finalAuthorName = item.teacher_reply_anonymous ? "Anonymous Teacher" : "Teacher";
            }

            const replies: Reply[] = (item.replies || []).map((r: any) => {
              const rRole = r.profiles?.role?.toLowerCase() || "teacher";
              const rName = r.profiles?.display_name || "Teacher";
              
              let finalRName = "Anonymous Teacher";
              if (rRole === "teacher") {
                finalRName = r.is_anonymous ? "Anonymous" : "Teacher";
              } else {
                finalRName = rName;
              }

              return {
                id: String(r.id),
                query_id: String(r.query_id),
                author_id: r.user_id,
                content: r.content,
                is_anonymous: r.is_anonymous,
                created_at: r.created_at,
                author_name: finalRName,
                author_role: rRole
              };
            });

            return {
              id: String(item.id),
              author_id: item.user_id,
              content: item.query_text,
              student_visible_to_teacher: item.student_visible_to_teacher,
              teacher_reply_anonymous: item.teacher_reply_anonymous,
              ai_flag_status: item.ai_flag_status,
              created_at: item.created_at,
              author_name: finalAuthorName,
              author_role: authorRole,
              replies
            };
          });

          // Filter according to Student vs Teacher visibility rules (Simulating RLS fallback if needed)
          if (user.role === "student") {
            return mapped.filter(q => q.author_id === user.id || q.ai_flag_status === "approved");
          } else {
            return mapped.filter(q => q.student_visible_to_teacher || q.author_id === user.id);
          }
        }
      } catch (err) {
        console.error("Supabase getQueries catch:", err);
      }
    }

    // Fallback MockDB
    if (typeof window === "undefined") return DEFAULT_QUERIES;
    const stored = localStorage.getItem("prismate_queries");
    const queries: Query[] = stored ? JSON.parse(stored) : DEFAULT_QUERIES;

    // Resolve Author Labels dynamically for MockDB
    return queries.map((q) => {
      let finalName = "Student";
      if (q.author_role === "student" || !q.author_role) {
        if (user.role === "teacher" && q.student_visible_to_teacher) {
          finalName = q.author_name && q.author_name !== "Anonymous Student" ? q.author_name : "Student";
        } else {
          finalName = "Student";
        }
      } else {
        // Teacher query
        finalName = q.teacher_reply_anonymous ? "Anonymous Teacher" : "Teacher";
      }

      const replies = (q.replies || []).map(r => {
        let finalRName = "Anonymous";
        if (r.author_role === "teacher" || !r.author_role) {
          finalRName = r.is_anonymous ? "Anonymous" : "Teacher";
        } else {
          finalRName = r.author_name || "Student";
        }
        return { ...r, author_name: finalRName };
      });

      return {
        ...q,
        author_name: finalName,
        replies
      };
    }).filter((q) => {
      if (user.role === "student") {
        return q.author_id === user.id || q.ai_flag_status === "approved";
      } else {
        return q.student_visible_to_teacher || q.author_id === user.id;
      }
    });
  }

  static async addQuery(user: Profile, content: string, visibleToTeacher: boolean, teacherAnon: boolean = true): Promise<Query> {
    const isTeacherAnon = user.role === "teacher" ? teacherAnon : true;
    const newQuery: Query = {
      id: `query-${Date.now()}`,
      author_id: user.id,
      content,
      student_visible_to_teacher: user.role === "teacher" ? true : visibleToTeacher,
      teacher_reply_anonymous: isTeacherAnon,
      ai_flag_status: user.role === "teacher" ? "approved" : "pending", // Teacher posts bypass moderation
      created_at: new Date().toISOString(),
      author_name: user.role === "student" 
        ? "Student" 
        : (isTeacherAnon ? "Anonymous Teacher" : (user.display_name || "Teacher")),
      author_role: user.role,
      replies: [],
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("queries")
          .insert({
            user_id: user.id,
            query_text: content,
            student_visible_to_teacher: user.role === "teacher" ? true : visibleToTeacher,
            teacher_reply_anonymous: isTeacherAnon,
            ai_flag_status: user.role === "teacher" ? "approved" : "pending",
            subject: "Chemistry"
          })
          .select()
          .single();

        if (error) {
          console.error("Supabase insert query error:", error);
        } else if (data) {
          newQuery.id = String(data.id);
        }
      } catch (err) {
        console.error("Supabase addQuery catch:", err);
      }
    }

    // Save to LocalStorage MockDB as well for consistency
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("prismate_queries");
      const queries: Query[] = stored ? JSON.parse(stored) : DEFAULT_QUERIES;
      queries.unshift({
        ...newQuery,
        // Store actual name for teacher resolving logic in mock fallback
        author_name: user.display_name, 
        author_role: user.role
      });
      localStorage.setItem("prismate_queries", JSON.stringify(queries));
    }

    return newQuery;
  }

  static async updateQueryStatus(queryId: string, status: "approved" | "rejected") {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("queries")
          .update({ ai_flag_status: status })
          .eq("id", queryId);
        if (error) console.error("Supabase updateQueryStatus error:", error);
      } catch (err) {
        console.error("Supabase updateQueryStatus catch:", err);
      }
    }

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("prismate_queries");
      const queries: Query[] = stored ? JSON.parse(stored) : DEFAULT_QUERIES;
      const query = queries.find((q) => q.id === queryId);
      if (query) {
        query.ai_flag_status = status;
        localStorage.setItem("prismate_queries", JSON.stringify(queries));
      }
    }
  }

  static async addReply(user: Profile, queryId: string, content: string, anonymous: boolean): Promise<Reply> {
    const newReply: Reply = {
      id: `reply-${Date.now()}`,
      query_id: queryId,
      author_id: user.id,
      content,
      is_anonymous: anonymous,
      created_at: new Date().toISOString(),
      author_name: anonymous ? "Anonymous" : "Teacher",
      author_role: "teacher",
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("replies")
          .insert({
            query_id: parseInt(queryId) || 0,
            user_id: user.id,
            content,
            is_anonymous: anonymous
          })
          .select()
          .single();

        if (error) {
          console.error("Supabase insert reply error:", error);
        } else if (data) {
          newReply.id = String(data.id);
        }
      } catch (err) {
        console.error("Supabase addReply catch:", err);
      }
    }

    // Save to LocalStorage MockDB as well for consistency
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("prismate_queries");
      const queries: Query[] = stored ? JSON.parse(stored) : DEFAULT_QUERIES;
      const query = queries.find((q) => q.id === queryId);
      if (query) {
        if (!query.replies) query.replies = [];
        query.replies.push({
          ...newReply,
          author_name: user.display_name,
          author_role: user.role
        });
        localStorage.setItem("prismate_queries", JSON.stringify(queries));
      }
    }

    return newReply;
  }
}
