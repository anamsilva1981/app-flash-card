import { test } from "node:test";
import assert from "node:assert/strict";
import { loadEnvFile } from "node:process";
import { createClient } from "@supabase/supabase-js";
loadEnvFile(process.env.INTEGRATION_ENV_FILE || "/tmp/flashcard-backend.env");
const url = process.env.API_URL;
assert.ok(
  url && ["127.0.0.1", "localhost"].includes(new URL(url).hostname),
  "Integration tests only run against loopback, never production.",
);
const options = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
};
const admin = createClient(url, process.env.SERVICE_ROLE_KEY, options);
const anon = createClient(url, process.env.ANON_KEY, options);
test("Supabase isolated persistence, authorization and deletion", async (t) => {
  const created = [];
  const password = "Integration@123";
  const add = async () => {
    const email = `integration-${crypto.randomUUID()}@example.test`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    assert.ifError(error);
    created.push(data.user.id);
    const client = createClient(url, process.env.ANON_KEY, options);
    assert.ifError(
      (await client.auth.signInWithPassword({ email, password })).error,
    );
    return { client, email, id: data.user.id };
  };
  const operation = (client, path, payload) =>
    client.rpc("apply_account_operation", {
      operation_id: crypto.randomUUID(),
      path,
      payload,
      prefer: "",
    });
  try {
    const a = await add(),
      b = await add();
    const subject = {
      id: crypto.randomUUID(),
      name: "Integration deck",
      days: [1],
      archived: false,
      deck_key: "integration-deck",
    };
    const card = {
      id: 1234,
      subject: "integration-deck",
      subject_id: subject.id,
      topic: "Integration topic",
      question: "Persist?",
      answer: "Yes",
      explanation: "",
      example: "",
      due: "2026-01-01",
      interval: 0,
    };
    await t.test(
      "persists cards, ID relations and progress after a new login",
      async () => {
        assert.ifError(
          (await operation(a.client, "study_subjects", subject)).error,
        );
        assert.ifError(
          (await operation(a.client, "account_cards", card)).error,
        );
        assert.ifError(
          (
            await operation(a.client, "seed_card_progress", {
              card_id: card.id,
              due: "2026-12-01",
              interval: 9,
            })
          ).error,
        );
        await a.client.auth.signOut({ scope: "local" });
        assert.ifError(
          (await a.client.auth.signInWithPassword({ email: a.email, password }))
            .error,
        );
        const { data, error } = await a.client
          .from("account_studies")
          .select("data")
          .single();
        assert.ifError(error);
        assert.equal(data.data.cards[0].subject_id, subject.id);
        assert.equal(data.data.progress[0].interval, 9);
      },
    );
    await t.test(
      "prevents another account and anon from reading or writing studies",
      async () => {
        const { data, error } = await b.client
          .from("account_studies")
          .select("*")
          .eq("user_id", a.id);
        assert.ifError(error);
        assert.deepEqual(data, []);
        assert.ok(
          (
            await b.client
              .from("account_studies")
              .upsert({ user_id: a.id, data: {} })
          ).error,
        );
        assert.ok((await anon.from("account_studies").select("*")).error);
        assert.ok(
          (
            await anon.rpc("apply_account_operation", {
              operation_id: crypto.randomUUID(),
              path: "account_cards",
              payload: card,
            })
          ).error,
        );
      },
    );
    await t.test("rolls back all writes in a failed backup batch", async () => {
      const before = (
        await a.client.from("account_studies").select("data").single()
      ).data.data;
      const operations = [
        {
          id: crypto.randomUUID(),
          path: "account_cards",
          body: { ...card, id: 5678 },
        },
        { id: crypto.randomUUID(), path: "unsupported-operation", body: {} },
      ];
      assert.ok(
        (
          await a.client.rpc("apply_account_batch", {
            batch_id: crypto.randomUUID(),
            operations,
          })
        ).error,
      );
      assert.deepEqual(
        (await a.client.from("account_studies").select("data").single()).data
          .data,
        before,
      );
    });
    await t.test("replays a batch idempotently", async () => {
      const batch_id = crypto.randomUUID();
      const operations = [
        {
          id: crypto.randomUUID(),
          path: "account_cards",
          body: { ...card, id: 9999 },
        },
        {
          id: crypto.randomUUID(),
          path: "study_activity",
          body: {
            activity_date: "2026-01-01",
            kind: "review",
            label: "Integration review",
          },
        },
      ];
      assert.ifError(
        (await a.client.rpc("apply_account_batch", { batch_id, operations }))
          .error,
      );
      assert.ifError(
        (await a.client.rpc("apply_account_batch", { batch_id, operations }))
          .error,
      );
      const data = (
        await a.client.from("account_studies").select("data").single()
      ).data.data;
      assert.equal(data.cards.filter((c) => c.id === 9999).length, 1);
      assert.equal(data.activity.length, 1);
    });
    await t.test(
      "persists topic completion, preferences and subject archive transitions",
      async () => {
        const topic = {
          id: crypto.randomUUID(),
          subject_id: subject.id,
          subject: subject.name,
          title: "Integration topic",
          notes: "Notes",
          link: "https://example.test/",
          priority: "alta",
          status: "todo",
          completed_at: null,
        };
        assert.ifError((await operation(a.client, "study_queue", topic)).error);
        assert.ifError(
          (
            await operation(a.client, "rpc/complete_study_topic", {
              topic_id: topic.id,
              finished_at: "2026-10-07T12:00:00Z",
            })
          ).error,
        );
        assert.ifError(
          (
            await operation(a.client, "account_preferences", {
              display_name: "Integration name",
              reminder_time: "21:30",
              reminder_days: [2, 4],
            })
          ).error,
        );
        assert.ifError(
          (
            await operation(a.client, "rpc/rename_study_subject", {
              subject_id: subject.id,
              new_name: "Renamed integration",
              routine: [2],
              is_archived: true,
            })
          ).error,
        );
        let snapshot = (
          await a.client.from("account_studies").select("data").single()
        ).data.data;
        assert.equal(snapshot.subjects[0].archived, true);
        assert.equal(snapshot.queue[0].status, "done");
        assert.equal(snapshot.queue[0].subject_id, subject.id);
        assert.equal(snapshot.cards[0].subject_id, subject.id);
        assert.equal(snapshot.preferences.reminder_time, "21:30");
        assert.deepEqual(snapshot.preferences.reminder_days, [2, 4]);
        assert.ifError(
          (
            await operation(a.client, "rpc/rename_study_subject", {
              subject_id: subject.id,
              new_name: subject.name,
              routine: [1],
              is_archived: false,
            })
          ).error,
        );
        snapshot = (
          await a.client.from("account_studies").select("data").single()
        ).data.data;
        assert.equal(snapshot.subjects[0].archived, false);
      },
    );
    await t.test(
      "review progress and activity roll back together and replay exactly once",
      async () => {
        const read = async () =>
          (await a.client.from("account_studies").select("data").single()).data
            .data;
        const before = await read();
        const operations = [
          {
            id: crypto.randomUUID(),
            path: "seed_card_progress",
            body: { card_id: card.id, due: "2026-12-15", interval: 14 },
          },
          {
            id: crypto.randomUUID(),
            path: "study_activity",
            body: {
              activity_date: "2026-10-07",
              kind: "review",
              label: "Atomic review",
            },
          },
        ];
        assert.ok(
          (
            await a.client.rpc("apply_account_batch", {
              batch_id: crypto.randomUUID(),
              operations: [
                ...operations,
                { id: crypto.randomUUID(), path: "unsupported", body: {} },
              ],
            })
          ).error,
        );
        assert.deepEqual(await read(), before);
        const batch_id = crypto.randomUUID();
        assert.ifError(
          (await a.client.rpc("apply_account_batch", { batch_id, operations }))
            .error,
        );
        assert.ifError(
          (await a.client.rpc("apply_account_batch", { batch_id, operations }))
            .error,
        );
        const snapshot = await read();
        assert.equal(
          snapshot.progress.find((p) => p.card_id === card.id).interval,
          14,
        );
        assert.equal(
          snapshot.activity.filter((item) => item.label === "Atomic review")
            .length,
          1,
        );
      },
    );
    await t.test("keeps support requests private", async () => {
      assert.ifError(
        (
          await a.client
            .from("support_requests")
            .insert({ user_id: a.id, message: "Integration support request" })
        ).error,
      );
      assert.deepEqual(
        (
          await b.client
            .from("support_requests")
            .select("*")
            .eq("user_id", a.id)
        ).data,
        [],
      );
      assert.ok(
        (
          await b.client
            .from("support_requests")
            .insert({ user_id: a.id, message: "Unauthorized support request" })
        ).error,
      );
    });
    await t.test(
      "deletes only the authenticated disposable user and cascades their studies",
      async () => {
        const { data, error } = await a.client.functions.invoke(
          "delete-account",
          { body: { confirmation: "EXCLUIR" } },
        );
        if (error)
          assert.fail(
            JSON.stringify({
              status: error.context?.status,
              body: await error.context?.json(),
            }),
          );
        assert.equal(data.deleted, true);
        assert.deepEqual(
          (await admin.from("account_studies").select("*").eq("user_id", a.id))
            .data,
          [],
        );
        assert.deepEqual(
          (await admin.from("support_requests").select("*").eq("user_id", a.id))
            .data,
          [],
        );
        assert.ok((await admin.auth.admin.getUserById(b.id)).data.user);
      },
    );
  } finally {
    for (const id of created) await admin.auth.admin.deleteUser(id);
  }
});
