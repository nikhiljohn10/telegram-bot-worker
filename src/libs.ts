export const sha256 = async (text: string): Promise<string> =>
  crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(text))
    .then((array_buffer) =>
      Array.from(new Uint8Array(array_buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    );

// format json with line indents and newlines
export const prettyJSON = (obj: unknown): string =>
  JSON.stringify(obj, null, 2);

// Generate JSON response
export const JSONResponse = (obj: unknown, status = 200): Response =>
  new Response(prettyJSON(obj), {
    status: status,
    headers: {
      "content-type": "application/json",
    },
  });

export const log = <T>(obj: T): T => console.log(obj) === undefined && obj;

export const preTagString = (str: string): string => `<pre>${str}</pre>`;

export const addSearchParams = (
  url: URL,
  params: Record<string, string> = {}
): URL =>
  new URL(
    `${url.origin}${url.pathname}?${new URLSearchParams([
      ...Array.from(url.searchParams.entries()),
      ...Object.entries(params),
    ]).toString()}`
  );
