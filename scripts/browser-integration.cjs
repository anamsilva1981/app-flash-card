const { createClient } = require("@supabase/supabase-js");
const { loadEnvFile } = require("node:process");
module.exports = function tasks() {
  loadEnvFile("/tmp/flashcard-backend.env");
  const url = process.env.API_URL;
  if (!["localhost", "127.0.0.1"].includes(new URL(url).hostname))
    throw new Error("Local backend required");
  const options = { auth: { persistSession: false, autoRefreshToken: false } };
  const admin = createClient(url, process.env.SERVICE_ROLE_KEY, options);
  const created = new Set();
  return {
    async createDisposableAccount() {
      const email = `browser-${crypto.randomUUID()}@example.test`,
        password = "Browser@123";
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: "Browser" },
      });
      if (error) throw error;
      created.add(data.user.id);
      const client = createClient(url, process.env.ANON_KEY, options);
      const login = await client.auth.signInWithPassword({ email, password });
      if (login.error) throw login.error;
      const result = await client.rpc("apply_account_operation", {
        operation_id: crypto.randomUUID(),
        path: "study_subjects",
        prefer: "",
        payload: {
          id: crypto.randomUUID(),
          name: "Biologia",
          deck_key: "biology",
          days: [0, 1, 2, 3, 4, 5, 6],
          archived: false,
        },
      });
      if (result.error) throw result.error;
      return { email, password, id: data.user.id };
    },
    async disposableSnapshot(id) {
      if (!created.has(id)) throw new Error("Unknown disposable account");
      const { data, error } = await admin
        .from("account_studies")
        .select("data")
        .eq("user_id", id)
        .single();
      if (error) throw error;
      return data.data;
    },
    async cleanupDisposableAccounts() {
      for (const id of created) {
        const { error } = await admin.auth.admin.deleteUser(id);
        if (error) throw error;
      }
      created.clear();
      return null;
    },
  };
};
