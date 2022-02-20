import { v4 as uuidv4 } from "uuid";
import sha256 from "crypto-js/sha256";
export { sha256 };

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

// Generate InlineQueryResultArticle
export const InlineQueryResultArticle = (content, parse_mode = "") => ({
  type: "article",
  id: uuidv4(),
  title: content.toString(),
  input_message_content: {
    message_text: content.toString(),
    parse_mode: parse_mode,
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
