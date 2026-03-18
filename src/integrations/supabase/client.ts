/* eslint-disable @typescript-eslint/no-explicit-any */
import PocketBase from "pocketbase";

/**
 * NOTE:
 * This app historically used Supabase. To migrate with minimal UI changes,
 * we provide a small Supabase-like adapter on top of PocketBase.
 *
 * Required env:
 * - VITE_POCKETBASE_URL (e.g. http://127.0.0.1:8090)
 */

export type SupabaseLikeError = {
  message: string;
  code?: string;
  status?: number;
};

export type SupabaseLikeResponse<T> = {
  data: T | null;
  error: SupabaseLikeError | null;
  count?: number | null;
};

export type SupabaseLikeSession = {
  access_token: string;
  user: { id: string; email?: string | null } | null;
};

export type SupabaseLikeUser = { id: string; email?: string | null };

const pocketbaseUrl = import.meta.env.VITE_POCKETBASE_URL;

if (!pocketbaseUrl) {
  const errorMessage =
    "PocketBase URL is not defined in environment variables. Please set VITE_POCKETBASE_URL in your .env file.";
  console.error(errorMessage);
  throw new Error(errorMessage);
}

const pb = new PocketBase(pocketbaseUrl);
export { pb };

function resolveCollection(table: string) {
  // Supabase `profiles` table is modeled as extra fields on PocketBase `users`.
  if (table === "profiles") return "users";
  return table;
}

function normalizeProfile(rec: any) {
  if (!rec) return rec;
  // Keep Supabase-like shape where the UI expects it.
  return {
    ...rec,
    created_at: rec.created_at ?? rec.created,
  };
}

function toError(e: unknown, fallback = "Unknown error"): SupabaseLikeError {
  if (e && typeof e === "object") {
    const anyErr = e as any;
    const message = anyErr?.message || anyErr?.data?.message || fallback;
    const status = anyErr?.status || anyErr?.response?.status;
    return { message, status };
  }
  return { message: fallback };
}

function filterValue(v: unknown): string {
  if (v === null) return "null";
  if (typeof v === "number") return `${v}`;
  if (typeof v === "boolean") return v ? "true" : "false";
  // Escape double quotes
  return `"${String(v).replace(/\"/g, '\\"')}"`;
}

function buildFilter(clauses: string[]): string {
  if (clauses.length === 0) return "";
  if (clauses.length === 1) return clauses[0];
  return `(${clauses.join(" && ")})`;
}

async function expandForKnownSelect(table: string, select?: string, baseRecords?: any[]) {
  // Manual "joins" for tables that previously relied on PostgREST embeds.
  // This is intentionally pragmatic and only covers what the UI uses.
  if (!select) return baseRecords;

  if (table === "courses" && select.includes("course_parts")) {
    const courses = baseRecords || [];
    const courseIds = courses.map((c: any) => c.id).filter(Boolean);
    if (courseIds.length === 0) return courses;

    // Fetch parts for all courses
    const parts = (
      await pb.collection("course_parts").getFullList({
        filter: courseIds.map((id: string) => `course_id=${filterValue(id)}`).join(" || "),
        sort: "part_number",
      })
    ).map((p: any) => ({ ...p, lessons: [] as any[] }));

    const partIds = parts.map((p: any) => p.id);
    const lessons =
      partIds.length === 0
        ? []
        : await pb.collection("lessons").getFullList({
            filter: partIds.map((id: string) => `course_part_id=${filterValue(id)}`).join(" || "),
            sort: "order_index",
          });

    const lessonsByPart = new Map<string, any[]>();
    for (const lesson of lessons) {
      const pid = (lesson as any).course_part_id;
      if (!pid) continue;
      const arr = lessonsByPart.get(pid) || [];
      arr.push(lesson);
      lessonsByPart.set(pid, arr);
    }

    const partsByCourse = new Map<string, any[]>();
    for (const part of parts) {
      part.lessons = lessonsByPart.get((part as any).id) || [];
      const cid = (part as any).course_id;
      if (!cid) continue;
      const arr = partsByCourse.get(cid) || [];
      arr.push(part);
      partsByCourse.set(cid, arr);
    }

    return courses.map((c: any) => ({ ...c, course_parts: partsByCourse.get(c.id) || [] }));
  }

  if (table === "course_reviews" && select.includes("profiles")) {
    const reviews = baseRecords || [];
    const userIds = Array.from(new Set(reviews.map((r: any) => r.user_id).filter(Boolean)));
    if (userIds.length === 0) return reviews.map((r: any) => ({ ...r, profiles: null }));

    const profiles = await pb.collection(resolveCollection("profiles")).getFullList({
      filter: userIds.map((id: string) => `id=${filterValue(id)}`).join(" || "),
    });
    const profileByUserId = new Map<string, any>();
    for (const p of profiles) profileByUserId.set((p as any).id, p);

    return reviews.map((r: any) => ({
      ...r,
      profiles: profileByUserId.get(r.user_id)
        ? { username: profileByUserId.get(r.user_id).username }
        : null,
    }));
  }

  if (table === "notifications" && select.includes("profiles")) {
    const notifs = baseRecords || [];
    const ids = Array.from(
      new Set(
        notifs
          .flatMap((n: any) => [n.sent_by, n.user_id])
          .filter((x: any) => typeof x === "string" && x.length > 0)
      )
    );
    if (ids.length === 0) return notifs;
    const profiles = await pb.collection(resolveCollection("profiles")).getFullList({
      filter: ids.map((id: string) => `id=${filterValue(id)}`).join(" || "),
    });
    const byId = new Map<string, any>();
    for (const p of profiles) byId.set((p as any).id, p);
    return notifs.map((n: any) => ({
      ...n,
      profiles: n.sent_by ? { username: byId.get(n.sent_by)?.username ?? null } : null,
      recipient_profile: n.user_id ? { username: byId.get(n.user_id)?.username ?? null } : null,
    }));
  }

  return baseRecords;
}

class QueryBuilder<T = any> implements PromiseLike<SupabaseLikeResponse<T>> {
  private table: string;
  private op: "select" | "insert" | "update" | "upsert" | "delete" = "select";
  private selectStr: string | undefined;
  private selectOpts: any;
  private filters: string[] = [];
  private sort: string | undefined;
  private limitCount: number | null = null;
  private limitToSingle: "single" | "maybeSingle" | null = null;
  private payload: any;
  private upsertOnConflict: string | undefined;

  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string, opts?: any) {
    this.op = "select";
    this.selectStr = columns;
    this.selectOpts = opts;
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push(`${field}=${filterValue(value)}`);
    return this;
  }

  neq(field: string, value: any) {
    this.filters.push(`${field}!=${filterValue(value)}`);
    return this;
  }

  gte(field: string, value: any) {
    this.filters.push(`${field}>=${filterValue(value)}`);
    return this;
  }

  lt(field: string, value: any) {
    this.filters.push(`${field}<${filterValue(value)}`);
    return this;
  }

  in(field: string, values: any[]) {
    const ors = (values || []).map((v) => `${field}=${filterValue(v)}`);
    if (ors.length === 0) {
      // No matches
      this.filters.push("1=0");
    } else {
      this.filters.push(`(${ors.join(" || ")})`);
    }
    return this;
  }

  ilike(field: string, pattern: string) {
    // Supabase pattern is usually "%text%". We'll translate to a case-insensitive regex.
    const raw = String(pattern);
    const inner = raw.replace(/%/g, "");
    const escaped = inner.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    this.filters.push(`${field}~"(?i).*${escaped}.*"`);
    return this;
  }

  or(expression: string) {
    // Supports patterns used in this codebase:
    // - "a.eq.x,b.is.null"
    // - "and(a.eq.x,b.eq.y),and(a.eq.y,b.eq.x)"
    const exp = expression.trim();

    if (exp.startsWith("and(") || exp.includes("),and(")) {
      // Split into and-groups
      const groups: string[] = [];
      let cursor = 0;
      while (cursor < exp.length) {
        const start = exp.indexOf("and(", cursor);
        if (start === -1) break;
        let depth = 0;
        let end = -1;
        for (let i = start; i < exp.length; i++) {
          if (exp[i] === "(") depth++;
          if (exp[i] === ")") depth--;
          if (depth === 0) {
            end = i;
            break;
          }
        }
        if (end !== -1) {
          groups.push(exp.slice(start + 4, end)); // inside and(...)
          cursor = end + 1;
        } else {
          break;
        }
      }

      const groupFilters: string[] = [];
      for (const g of groups) {
        const parts = g.split(",").map((s) => s.trim()).filter(Boolean);
        const ands: string[] = [];
        for (const p of parts) {
          const [field, op, rawVal] = p.split(".");
          if (!field || !op) continue;
          if (op === "eq") ands.push(`${field}=${filterValue(rawVal)}`);
          else if (op === "is" && rawVal === "null") ands.push(`${field}=null`);
        }
        if (ands.length) groupFilters.push(`(${ands.join(" && ")})`);
      }

      if (groupFilters.length) this.filters.push(`(${groupFilters.join(" || ")})`);
      return this;
    }

    // Simple OR list
    const parts = exp.split(",").map((s) => s.trim()).filter(Boolean);
    const ors: string[] = [];
    for (const p of parts) {
      const [field, op, rawVal] = p.split(".");
      if (!field || !op) continue;
      if (op === "eq") ors.push(`${field}=${filterValue(rawVal)}`);
      else if (op === "is" && rawVal === "null") ors.push(`${field}=null`);
    }
    if (ors.length) this.filters.push(`(${ors.join(" || ")})`);
    return this;
  }

  order(field: string, opts?: { ascending?: boolean } | any) {
    const ascending = (opts?.ascending ?? true) as boolean;
    this.sort = `${ascending ? "" : "-"}${field}`;
    return this;
  }

  limit(count: number) {
    this.limitCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : null;
    return this;
  }

  single() {
    this.limitToSingle = "single";
    return this;
  }

  maybeSingle() {
    this.limitToSingle = "maybeSingle";
    return this;
  }

  insert(payload: any) {
    this.op = "insert";
    this.payload = payload;
    return this;
  }

  update(payload: any) {
    this.op = "update";
    this.payload = payload;
    return this;
  }

  upsert(payload: any, opts?: { onConflict?: string }) {
    this.op = "upsert";
    this.payload = payload;
    this.upsertOnConflict = opts?.onConflict;
    return this;
  }

  delete() {
    this.op = "delete";
    return this;
  }

  then<TResult1 = SupabaseLikeResponse<T>, TResult2 = never>(
    onfulfilled?: ((value: SupabaseLikeResponse<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    const run = async (): Promise<SupabaseLikeResponse<T>> => {
      try {
        const collection = resolveCollection(this.table);

        if (this.op === "select") {
          const filter = buildFilter(this.filters);
          const opts: any = {
            filter: filter || undefined,
            sort: this.sort,
          };

          if (this.limitCount !== null) opts.perPage = this.limitCount;

          let records: any[] = [];
          if (this.limitToSingle) {
            const list = await pb.collection(collection).getList(1, 1, opts);
            records = list.items;
          } else if (this.limitCount !== null) {
            const list = await pb.collection(collection).getList(1, this.limitCount, opts);
            records = list.items;
          } else {
            records = await pb.collection(collection).getFullList(opts);
          }

          if (collection === "users") {
            records = records.map(normalizeProfile);
          }

          records = await expandForKnownSelect(this.table, this.selectStr, records);

          const data: any =
            this.limitToSingle === "single"
              ? records[0] ?? null
              : this.limitToSingle === "maybeSingle"
                ? records[0] ?? null
                : records;

          return { data, error: null, count: (this.selectOpts as any)?.count ? records.length : null };
        }

        if (this.op === "insert") {
          const payloadArr = Array.isArray(this.payload) ? this.payload : [this.payload];
          const created: any[] = [];
          for (const p of payloadArr) {
            const rec = await pb.collection(collection).create(p);
            created.push(rec);
          }
          const data: any = this.limitToSingle ? created[0] : created;
          return { data, error: null };
        }

        if (this.op === "update") {
          // Needs an id filter in practice; we support `.eq('id', ...)` patterns.
          const idClause = this.filters.find((f) => f.startsWith("id="));
          const id = idClause ? idClause.slice(3).replace(/^"|"$/g, "") : null;
          if (!id) return { data: null, error: { message: "Missing id filter for update" } };
          const updated = await pb.collection(collection).update(id, this.payload);
          return { data: this.limitToSingle ? updated : ([updated] as any), error: null };
        }

        if (this.op === "upsert") {
          // Very small approximation: if onConflict is 'id' and id exists -> update else create
          const payloadArr = Array.isArray(this.payload) ? this.payload : [this.payload];
          const results: any[] = [];
          for (const p of payloadArr) {
            if (this.upsertOnConflict === "id" && p?.id) {
              const updated = await pb.collection(collection).update(p.id, p);
              results.push(updated);
            } else {
              const created = await pb.collection(collection).create(p);
              results.push(created);
            }
          }
          const data: any = this.limitToSingle ? results[0] : results;
          return { data, error: null };
        }

        if (this.op === "delete") {
          const idClause = this.filters.find((f) => f.startsWith("id="));
          const id = idClause ? idClause.slice(3).replace(/^"|"$/g, "") : null;
          if (!id) return { data: null, error: { message: "Missing id filter for delete" } };
          await pb.collection(collection).delete(id);
          return { data: null as any, error: null };
        }

        return { data: null, error: { message: "Unsupported operation" } };
      } catch (e) {
        return { data: null, error: toError(e) };
      }
    };

    return run().then(onfulfilled as any, onrejected as any);
  }
}

const supabase = {
  auth: {
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      try {
        const authData = await pb.collection("users").authWithPassword(email, password);
        const user = authData?.record ?? null;
        const access_token = authData?.token ?? "";
        return {
          data: { session: { access_token, user } },
          error: null,
        };
      } catch (e) {
        return { data: null, error: toError(e, "Login failed") };
      }
    },

    async signUp({ email, password }: { email: string; password: string }) {
      try {
        const created = await pb.collection("users").create({ email, password, passwordConfirm: password });
        return { data: created, error: null };
      } catch (e) {
        return { data: null, error: toError(e, "Sign up failed") };
      }
    },

    async signOut() {
      pb.authStore.clear();
      return { error: null };
    },

    async getSession(): Promise<{ data: { session: SupabaseLikeSession | null }; error: SupabaseLikeError | null }> {
      try {
        const token = pb.authStore.token;
        const record = pb.authStore.record as any;
        if (!token || !record) return { data: { session: null }, error: null };
        return { data: { session: { access_token: token, user: { id: record.id, email: record.email } } }, error: null };
      } catch (e) {
        return { data: { session: null }, error: toError(e) };
      }
    },

    async getUser() {
      const rec = pb.authStore.record as any;
      return { data: { user: rec ? { id: rec.id, email: rec.email } : null }, error: null };
    },
  },

  from(table: string) {
    return new QueryBuilder(table);
  },

  channel(_name: string) {
    // Minimal stub for realtime usage in the UI.
    return {
      on() {
        return this;
      },
      subscribe() {
        return { data: null, error: null };
      },
      unsubscribe() {
        return { data: null, error: null };
      },
    };
  },

  storage: {
    from(_bucket: string) {
      return {
        async upload(_path: string, _file: any, _opts?: any) {
          return { data: null, error: { message: "Storage is not supported with PocketBase adapter" } };
        },
        async remove(_paths: string[]) {
          return { data: null, error: { message: "Storage is not supported with PocketBase adapter" } };
        },
        getPublicUrl(path: string) {
          return { data: { publicUrl: path } };
        },
      };
    },
  },

  functions: {
    async invoke(_name: string, _opts?: any) {
      return { data: null, error: { message: "Edge functions are not supported with PocketBase adapter" } };
    },
  },
};

export { supabase };
