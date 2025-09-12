import { NextResponse } from "next/server";

interface DirectUploadBody {
  maxDurationSeconds?: number;
  expiry?: string;
  creator?: string;
  filename: string;
  contentType: string;
  filesize: number;
}

export async function POST(req: Request) {
  try {
    const { maxDurationSeconds, expiry, creator, filename, contentType, filesize }: DirectUploadBody = await req.json();

    if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ACCOUNT_ID) {
      return NextResponse.json({ error: "Missing Cloudflare env vars" }, { status: 500 });
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`;

    const body: Record<string, unknown> = {
      maxDurationSeconds: maxDurationSeconds || 3600,
      metadata: { filename, contentType, filesize },
    };

    if (expiry) body.expiry = expiry;
    if (creator) body.creator = creator;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("❌ Cloudflare API error:", res.status, data);
      return NextResponse.json({ error: "Cloudflare error", details: data }, { status: 500 });
    }

    return NextResponse.json({
  uploadURL: data.result.uploadURL,
  uid: data.result.uid,
});

  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: "server error", details: error.message }, { status: 500 });
  }
}
