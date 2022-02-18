import { v4 as uuidv4 } from "uuid";

// Generate JSON response
export function JSONResponse(data, status = 200) {
  const init = {
    status: status,
    headers: {
      "content-type": "application/json",
    },
  };
  return new Response(JSON.stringify(data, null, 2), init);
}

// Generate InlineQueryResultArticle
export const InlineQueryResultArticle = async (content, parse_mode = "") => ({
  type: "article",
  id: uuidv4(),
  title: content.toString(),
  input_message_content: {
    message_text: content.toString(),
    parse_mode: parse_mode,
  },
});

// SHA256 Hash function
export async function sha256(message: string) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);
  // hash the message
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => ("00" + b.toString(16)).slice(-2))
    .join("");
  return hashHex;
}

// Stringify JSON and add <pre> tag HTML
export function logJSONinHTML(data) {
  return preTagString(JSON.stringify(data, null, 2));
}

export function preTagString(str) {
  return "<pre>" + str + "</pre>";
}

// Add options in URL
export function addURLOptions(urlstr, options = {}) {
  let url = urlstr;
  for (const key of Object.keys(options)) {
    if (options[key]) url += "&" + key + "=" + options[key];
  }
  return url;
}

// get the base url for a given url string
export const getBaseURL = (url_string) => {
  const url = new URL(url_string);
  return `${url.protocol}//${url.host}/`;
};
