
export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("url");

  if (!raw) {
    return Response.json({ error: "Link kosong" }, { status: 400 });
  }

  let target;
  try {
    target = new URL(raw);
  } catch {
    return Response.json({ error: "Link tidak valid" }, { status: 400 });
  }

  if (!["https:", "http:"].includes(target.protocol)) {
    return Response.json({ error: "URL tidak didukung" }, { status: 400 });
  }

  const blocked = (host) =>
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.startsWith("127.") ||
    host.startsWith("10.") ||
    host.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host);

  if (blocked(target.hostname)) {
    return Response.json({ error: "Alamat lokal tidak diizinkan" }, { status: 400 });
  }

  try {
    const response = await fetch(target.href, {
      method: "HEAD",
      redirect: "follow"
    });

    const destination = new URL(response.url || target.href);

    if (blocked(destination.hostname)) {
      return Response.json({ error: "Tujuan tidak diizinkan" }, { status: 400 });
    }

    return Response.json({ destination: destination.href });
  } catch {
    return Response.json({
      error: "Link tidak dapat diperiksa"
    }, { status: 502 });
  }
}
