export const sha256 = async (text) =>
  crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(text))
    .then((array_buffer) =>
      Array.from(new Uint8Array(array_buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    );

// format json with line indents and newlines
export const prettyJSON = (data) => JSON.stringify(data, null, 2);

// Generate JSON response
export const JSONResponse = (data, status = 200): Response =>
  new Response(prettyJSON(data), {
    status: status,
    headers: {
      "content-type": "application/json",
    },
  });

export const preTagString = (str) => `<pre>${str}</pre>`;

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

// get the base url for a given url string
export const getBaseURL = (url_string) => `${new URL(url_string).origin}/`;
