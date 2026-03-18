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
  return `"${String(v).replaceAll('"', '\\"')}"`;
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
    const inner = raw.replaceAll("%", "");
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

  order(field: string, opts?: { ascending?: boolean }) {
    const ascending = opts?.ascending ?? true;
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

  insert(values: any[] | any) {
    this.op = "insert";
    this.payload = values;
    return this;
  }

  update(values: any) {
    this.op = "update";
    this.payload = values;
    return this;
  }

  upsert(values: any, opts?: { onConflict?: string }) {
    this.op = "upsert";
    this.payload = values;
    this.upsertOnConflict = opts?.onConflict;
    return this;
  }

  private async execSelect(): Promise<SupabaseLikeResponse<any>> {
    const filter = buildFilter(this.filters);
    const wantCount = this.selectOpts?.count === "exact";
    const headOnly = !!this.selectOpts?.head;
    const collection = resolveCollection(this.table);

    try {
      if (wantCount && headOnly) {
        const list = await pb.collection(collection).getList(1, 1, { filter });
        return { data: null, error: null, count: list.totalItems };
      }

      if (this.limitToSingle) {
        const list = await pb.collection(collection).getList(1, 1, { filter, sort: this.sort });
        const item = list.items[0];
        if (!item) {
          if (this.limitToSingle === "maybeSingle") return { data: null, error: null };
          return { data: null, error: { code: "PGRST116", message: "No rows found" } };
        }
        const normalized = this.table === "profiles" ? normalizeProfile(item) : item;
        const expanded = (await expandForKnownSelect(this.table, this.selectStr, [normalized]))?.[0] ?? normalized;
        return { data: expanded, error: null };
      }

      // Default list
      const items =
        typeof this.limitCount === "number"
          ? (await pb.collection(collection).getList(1, this.limitCount, { filter, sort: this.sort })).items
          : await pb.collection(collection).getFullList({ filter, sort: this.sort });
      const normalized = this.table === "profiles" ? items.map(normalizeProfile) : items;
      const expanded = await expandForKnownSelect(this.table, this.selectStr, normalized);
      return { data: expanded ?? normalized, error: null };
    } catch (e) {
      return { data: null, error: toError(e) };
    }
  }

  private async execInsert(): Promise<SupabaseLikeResponse<any>> {
    try {
      const collection = resolveCollection(this.table);
      const values = Array.isArray(this.payload) ? this.payload : [this.payload];
      const created: any[] = [];
      for (const v of values) {
        if (this.table === "profiles" && v?.id) {
          // Treat as "ensure profile exists": update the user record with profile fields.
          const { id, ...rest } = v;
          const rec = await pb.collection(collection).update(id, rest);
          created.push(normalizeProfile(rec));
        } else {
          const rec = await pb.collection(collection).create(v);
          created.push(this.table === "profiles" ? normalizeProfile(rec) : rec);
        }
      }
      const data = Array.isArray(this.payload) ? created : created[0] ?? null;
      return { data, error: null };
    } catch (e) {
      return { data: null, error: toError(e) };
    }
  }

  private async execUpdate(): Promise<SupabaseLikeResponse<any>> {
    const filter = buildFilter(this.filters);
    try {
      const collection = resolveCollection(this.table);
      const list = await pb.collection(collection).getFullList({ filter });
      if (list.length === 0) return { data: null, error: null };
      const updated: any[] = [];
      for (const rec of list) {
        const u = await pb.collection(collection).update((rec as any).id, this.payload);
        updated.push(this.table === "profiles" ? normalizeProfile(u) : u);
      }
      return { data: updated as any, error: null };
    } catch (e) {
      return { data: null, error: toError(e) };
    }
  }

  private async execUpsert(): Promise<SupabaseLikeResponse<any>> {
    const values = this.payload;
    const onConflict = (this.upsertOnConflict || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const collection = resolveCollection(this.table);
      if (onConflict.length === 0) {
        // Fallback: just create
        const rec = await pb.collection(collection).create(values);
        return { data: this.table === "profiles" ? normalizeProfile(rec) : rec, error: null };
      }

      const conflictFilter = onConflict.map((f) => `${f}=${filterValue(values[f])}`).join(" && ");
      const existing = await pb.collection(collection).getList(1, 1, { filter: conflictFilter });
      const first = existing.items[0];
      if (first) {
        const rec = await pb.collection(collection).update((first as any).id, values);
        return { data: this.table === "profiles" ? normalizeProfile(rec) : rec, error: null };
      }
      const created = await pb.collection(collection).create(values);
      return { data: this.table === "profiles" ? normalizeProfile(created) : created, error: null };
    } catch (e) {
      return { data: null, error: toError(e) };
    }
  }

  private async execDelete(): Promise<SupabaseLikeResponse<any>> {
    const filter = buildFilter(this.filters);
    try {
      const collection = resolveCollection(this.table);
      const list = await pb.collection(collection).getFullList({ filter });
      for (const rec of list) {
        await pb.collection(collection).delete((rec as any).id);
      }
      return { data: null, error: null };
    } catch (e) {
      return { data: null, error: toError(e) };
    }
  }

  delete() {
    this.op = "delete";
    return this;
  }

  private async execute(): Promise<SupabaseLikeResponse<any>> {
    if (this.op === "select") return this.execSelect();
    if (this.op === "insert") return this.execInsert();
    if (this.op === "update") return this.execUpdate();
    if (this.op === "upsert") return this.execUpsert();
    if (this.op === "delete") return this.execDelete();
    return { data: null, error: { message: "Not implemented" } };
  }

  then<TResult1 = SupabaseLikeResponse<T>, TResult2 = never>(
    onfulfilled?: ((value: SupabaseLikeResponse<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled as any, onrejected as any);
  }
}

export const supabase = {
  auth: {
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      try {
        await pb.collection("users").authWithPassword(email, password);
        return { data: { session: { access_token: pb.authStore.token, user: pb.authStore.model } }, error: null };
      } catch (e) {
        return { data: null, error: toError(e) };
      }
    },

    async signUp({
      email,
      password,
      options,
    }: {
      email: string;
      password: string;
      options?: { data?: Record<string, any> };
    }) {
      try {
        // PocketBase expects passwordConfirm
        const maybeUsername = options?.data?.username;
        await pb.collection("users").create({
          email,
          password,
          passwordConfirm: password,
          ...(typeof maybeUsername === "string" && maybeUsername.length > 0 ? { username: maybeUsername } : {}),
        });
        return { data: { user: null, session: null }, error: null };
      } catch (e) {
        return { data: null, error: toError(e) };
      }
    },

    async signOut() {
      pb.authStore.clear();
      return { error: null };
    },

    async getSession() {
      const model = pb.authStore.model as any;
      const session: SupabaseLikeSession | null = pb.authStore.isValid
        ? { access_token: pb.authStore.token, user: model ? { id: model.id, email: model.email } : null }
        : null;
      return { data: { session }, error: null };
    },

    onAuthStateChange(callback: (event: string, session: SupabaseLikeSession | null) => void) {
      const unsub = pb.authStore.onChange(() => {
        const model = pb.authStore.model as any;
        const session: SupabaseLikeSession | null = pb.authStore.isValid
          ? { access_token: pb.authStore.token, user: model ? { id: model.id, email: model.email } : null }
          : null;
        callback(session ? "SIGNED_IN" : "SIGNED_OUT", session);
      }, true);
      return { data: { subscription: { unsubscribe: () => unsub() } } };
    },

    async getUser() {
      const model = pb.authStore.model as any;
      if (!pb.authStore.isValid || !model) return { data: { user: null }, error: null };
      const user: SupabaseLikeUser = { id: model.id, email: model.email };
      return { data: { user }, error: null };
    },
  },

  from(table: string) {
    return new QueryBuilder(table);
  },

  // Minimal realtime stubs (PocketBase migration).
  // The UI previously relied on Supabase Realtime. For now we no-op these so chat doesn't break,
  // and components can use polling.
  channel(_name: string, _opts?: any) {
    const handlers: Array<{ type: string; filter: any; cb: (payload: any) => void }> = [];
    const api = {
      on(type: string, filter: any, cb: (payload: any) => void) {
        handlers.push({ type, filter, cb });
        return api;
      },
      subscribe() {
        return api;
      },
      send(_msg: any) {
        // No-op: typing indicator won't broadcast cross-clients in this adapter.
        // We still return a resolved promise-like to match some callsites.
        return Promise.resolve({ data: null, error: null });
      },
      _handlers: handlers,
    };
    return api as any;
  },

  removeChannel(_channel: any) {
    // no-op
  },
};