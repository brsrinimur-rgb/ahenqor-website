import { EmailMessage } from "cloudflare:email";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff"
    }
  });

const clean = (value, max = 500) =>
  String(value ?? "").replace(/[\r\n]+/g, " ").trim().slice(0, max);

function buildMessage(data, request) {
  const product = clean(data.product, 120) || "AHENQOR Website";
  const first = clean(data.first, 80);
  const last = clean(data.last, 80);
  const email = clean(data.email, 180);
  const company = clean(data.company, 180);
  const stores = clean(data.stores, 80);
  const rooms = clean(data.rooms, 80);
  const ip = request.headers.get("CF-Connecting-IP") || "Unavailable";

  const detailLine = rooms
    ? `Number of rooms: ${rooms}`
    : `Store locations: ${stores || "Not provided"}`;

  const subject = `AHENQOR Lead — ${product} — ${company || "New enquiry"}`;

  const body = [
    "New AHENQOR website enquiry",
    "",
    `Product: ${product}`,
    `Name: ${first} ${last}`.trim(),
    `Work email: ${email}`,
    `Company / Property: ${company}`,
    detailLine,
    "",
    `Submitted from IP: ${ip}`,
    `Received: ${new Date().toISOString()}`
  ].join("\r\n");

  return { subject, body, replyTo: email };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/lead") {
      return env.ASSETS.fetch(request);
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return json({ error: "Invalid request body" }, 400);
    }

    // Honeypot
    if (clean(data.website, 20)) {
      return json({ ok: true });
    }

    const product = clean(data.product, 120);
    const first = clean(data.first, 80);
    const last = clean(data.last, 80);
    const email = clean(data.email, 180);
    const company = clean(data.company, 180);

    if (!product || !first || !last || !email || !company) {
      return json({ error: "Please complete all required fields." }, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "Please enter a valid work email." }, 400);
    }

    const { subject, body, replyTo } = buildMessage(data, request);

    const to = env.LEAD_TO || "hello@ahenqor.com";
    const from = env.LEAD_FROM || "website@ahenqor.com";

    const raw = [
      `From: AHENQOR Website <${from}>`,
      `To: ${to}`,
      `Reply-To: ${replyTo}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      'Content-Type: text/plain; charset="UTF-8"',
      "",
      body
    ].join("\r\n");

    try {
      await env.SEND_EMAIL.send(new EmailMessage(from, to, raw));
      return json({ ok: true });
    } catch (err) {
      console.error("AHENQOR lead email failed", err);
      return json({ error: "Lead delivery failed. Please try again later." }, 500);
    }
  }
};
