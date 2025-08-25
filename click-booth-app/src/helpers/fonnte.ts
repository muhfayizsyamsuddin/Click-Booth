export async function sendWhatsapp(target: string, message: string) {
  const token = process.env.FONNTE_TOKEN;
  if (!token) throw new Error("Missing Fonnte token");

  const res = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      target
    })
  });

  const data = await res.json();
  if (!res.ok || !data.status) {
    console.error("Fonnte error:", data);
    throw new Error(data.message || "Failed to send WA");
  }

  return data;
}
