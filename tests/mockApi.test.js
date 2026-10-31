import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { mockFetch, resetDemo, DEMO_ADMIN, DEMO_VOTER } from "../src/api/mockApi.js";

const post = (path, body) => mockFetch(path, { method: "POST", body: JSON.stringify(body) });

async function loginVoter() {
  const res = await post("/auth/pemilih/login", DEMO_VOTER);
  localStorage.setItem("voter_token", res.token);
  return res;
}

async function loginAdmin() {
  const res = await post("/auth/admin/login", DEMO_ADMIN);
  localStorage.setItem("admin_token", res.token);
  return res;
}

beforeEach(() => {
  resetDemo();
});

test("demo voter can log in with the published NIM and token", async () => {
  const res = await loginVoter();
  assert.equal(res.status, "success");
  assert.equal(res.role, "pemilih");
  assert.equal(res.pemilih.nim, DEMO_VOTER.nim);
  assert.equal(res.pemilih.sudah_memilih, false);
});

test("voter login rejects a wrong token", async () => {
  await assert.rejects(
    post("/auth/pemilih/login", { nim: DEMO_VOTER.nim, token: "WRONG1" }),
    /Token atau NIM tidak valid/
  );
});

test("demo admin can log in and wrong password is rejected", async () => {
  const res = await loginAdmin();
  assert.equal(res.status, "success");
  assert.equal(res.role, "admin");
  assert.equal(res.admin.username, DEMO_ADMIN.username);

  await assert.rejects(
    post("/auth/admin/login", { username: DEMO_ADMIN.username, password: "nope" }),
    /Kredensial admin tidak valid/
  );
});

test("a voter can vote only once and cannot log in again afterwards", async () => {
  await loginVoter();

  const first = await post("/vote", { kandidat_id: 1 });
  assert.equal(first.success, true);

  await assert.rejects(post("/vote", { kandidat_id: 2 }), /sudah melakukan voting/);
  await assert.rejects(
    post("/auth/pemilih/login", DEMO_VOTER),
    /telah melakukan voting sebelumnya/
  );
});

test("results summary requires an admin session", async () => {
  await assert.rejects(mockFetch("/results/summary"), /Unauthorized/);
});

test("results summary tallies the new vote", async () => {
  await loginAdmin();
  const before = await mockFetch("/results/summary");

  const sum = (summary) => summary.data.reduce((n, k) => n + k.total_suara, 0);
  assert.equal(sum(before), before.total_pemilih_sudah_memilih);

  await loginVoter();
  await post("/vote", { kandidat_id: 2 });
  const after = await mockFetch("/results/summary");

  const votesFor = (summary, id) => summary.data.find((k) => k.kandidat_id === id).total_suara;
  assert.equal(votesFor(after, 2), votesFor(before, 2) + 1);
  assert.equal(votesFor(after, 1), votesFor(before, 1));
  assert.equal(after.total_pemilih_sudah_memilih, before.total_pemilih_sudah_memilih + 1);
  assert.equal(after.total_pemilih, before.total_pemilih);
  assert.equal(sum(after), after.total_pemilih_sudah_memilih);
});
