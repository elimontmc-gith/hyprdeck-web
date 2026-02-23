const API_URL = import.meta.env.VITE_API_URL;

function buildUri(url: string, endpoint?: string): string {
  if (!endpoint) return url;
  return `${url}/${endpoint.replace(/^\/+/, "")}`;
}

export async function request<T = unknown>(
  endpoint: string = "",
  opts: RequestInit = {},
  parse: "json" | "text" | "raw" = "json",
  url: string = API_URL
): Promise<T | string | Response> {
  const fullUrl = buildUri(url, endpoint);

  const headers = new Headers(opts.headers);

  if (opts.body && !(opts.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  console.debug("Request:", { url: fullUrl, options: opts, parse });

  const response = await fetch(fullUrl, {
    ...opts,
    headers
  });

  if (!response.ok) {
    throw new Error(`REQUEST error: ${response.status}`);
  }

  if (parse === "text") return response.text();
  if (parse === "raw") return response;

  return response.json();
}