const MIDTRANS_SERVER_KEY = Deno.env.get("MIDTRANS_SERVER_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function sha512Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-512", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function decrementStock(productId: string, qty: number) {
  const prodRes = await fetch(
    `${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(productId)}&select=stock`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );
  const rows = await prodRes.json();
  const current = rows[0] ? Number(rows[0].stock) || 0 : 0;
  const next = Math.max(0, current - qty);

  await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(productId)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(
      next === 0 ? { stock: 0, status: "sold", available: false } : { stock: next }
    ),
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    const { order_id, status_code, gross_amount, signature_key, transaction_status } = body;

    if (!order_id || !status_code || !gross_amount || !signature_key) {
      return new Response("Invalid payload", { status: 400 });
    }

    const expectedSignature = await sha512Hex(
      order_id + status_code + gross_amount + MIDTRANS_SERVER_KEY
    );
    if (expectedSignature !== signature_key) {
      return new Response("Invalid signature", { status: 403 });
    }

    let newStatus = "pending";
    if (transaction_status === "capture" || transaction_status === "settlement") {
      newStatus = "paid";
    } else if (["deny", "cancel", "expire"].includes(transaction_status)) {
      newStatus = "cancelled";
    }

    // Ambil transaksi dulu untuk cek status sebelumnya (cegah stok berkurang dua kali
    // kalau Midtrans mengirim notifikasi yang sama berulang) dan ambil daftar item-nya.
    const trxRes = await fetch(
      `${SUPABASE_URL}/rest/v1/transactions?order_number=eq.${encodeURIComponent(order_id)}&select=items,payment_status`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
      }
    );
    const trxRows = await trxRes.json();
    const trx = trxRows[0];

    if (newStatus === "paid" && trx && trx.payment_status !== "paid" && Array.isArray(trx.items)) {
      for (const item of trx.items) {
        if (item && item.id) {
          await decrementStock(item.id, Number(item.qty) || 1);
        }
      }
    }

    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/transactions?order_number=eq.${encodeURIComponent(order_id)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({ payment_status: newStatus }),
      }
    );

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      return new Response("Failed to update: " + errText, { status: 500 });
    }

    return new Response("OK", { status: 200 });
  } catch (e) {
    return new Response("Error: " + e.message, { status: 500 });
  }
});
