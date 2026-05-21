// fetch.ts — Fetch one feed URL over HTTPS, return raw body (XML or JSON).
// HTTP DI seam (fetchImpl); default: globalThis.fetch (Node 22 native).
// See project-design.md §3.3.

export const DEFAULT_FETCH_TIMEOUT_MS = 15_000;

// Sent on every outbound request. Reddit's /r/<sub>/new.json endpoint 403s
// any request without a unique, descriptive User-Agent (per Reddit API policy);
// observed on GitHub Actions runners 2026-05-21. Other feeds (HN/Wired/Verge)
// don't require this but accept it; setting it uniformly is good citizenship.
export const FEED_USER_AGENT =
  "NbgAiHub-RSS-Pipeline/1.0 (+https://github.com/chomovazuzana/NbgAiHub)";

export class FeedFetchError extends Error {
  public readonly url: string;
  public readonly status: number | null;

  constructor(url: string, status: number | null, message: string) {
    super(message);
    this.name = "FeedFetchError";
    this.url = url;
    this.status = status;
  }
}

export async function fetchFeedXml(
  url: string,
  fetchImpl: typeof globalThis.fetch = globalThis.fetch,
  options?: { timeoutMs?: number },
): Promise<string> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetchImpl(url, {
      signal: controller.signal,
      headers: { "User-Agent": FEED_USER_AGENT },
    });
  } catch (err) {
    throw new FeedFetchError(
      url,
      null,
      `network error fetching ${url}: ${String(err)}`,
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new FeedFetchError(
      url,
      response.status,
      `non-2xx status ${response.status} fetching ${url}`,
    );
  }

  try {
    return await response.text();
  } catch (err) {
    throw new FeedFetchError(
      url,
      response.status,
      `failed reading body from ${url}: ${String(err)}`,
    );
  }
}
