import { upsertArticles } from '@/db/articles';
import { getFeedById, updateLastFetched } from '@/db/feeds';
import { XMLParser } from 'fast-xml-parser';

type ParsedFeed = {
  title: string;
  description: string | null;
  articles: {
    title: string;
    url: string;
    description: string | null;
    pubDate: string | null;
  }[];
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

function stripHtml(html: string | undefined | null): string | null {
  if (!html) return null;
  return html.replace(/<[^>]*>/g, '').trim() || null;
}

export async function fetchAndParseFeed(url: string): Promise<ParsedFeed> {
  let normalizedUrl = url;
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  let response: Response;
  console.log('[RSS] Fetching:', normalizedUrl);
  try {
    response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'SecondBrainApp/1.0',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
    });
  } catch (err) {
    console.error('[RSS] Network error:', err);
    throw new Error(
      `Network error: could not reach ${normalizedUrl}. Check the URL and your internet connection.`
    );
  }

  console.log('[RSS] Response status:', response.status, response.statusText);
  console.log('[RSS] Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));

  if (!response.ok) {
    const body = await response.text();
    console.error('[RSS] Error body:', body.slice(0, 500));
    const serverDetail = body.length < 200 ? ` (${body.trim()})` : '';
    throw new Error(
      `Server returned ${response.status} ${response.statusText || ''} for ${normalizedUrl}.${serverDetail} ` +
      (response.status === 404
        ? 'The feed URL was not found.'
        : response.status >= 500
          ? 'The feed server encountered an internal error. The feed may be broken or temporarily unavailable.'
          : 'Please verify the URL is correct.')
    );
  }

  const xml = await response.text();
  if (!xml.trim()) {
    throw new Error('The server returned an empty response. This URL may not be an RSS feed.');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let parsed: any;
  try {
    parsed = parser.parse(xml);
  } catch {
    throw new Error('Failed to parse response as XML. This URL may not point to a valid RSS/Atom feed.');
  }

  // RSS 2.0 format
  if (parsed.rss?.channel) {
    const channel = parsed.rss.channel;
    const items = Array.isArray(channel.item)
      ? channel.item
      : channel.item
        ? [channel.item]
        : [];

    return {
      title: channel.title || 'Untitled Feed',
      description: stripHtml(channel.description),
      articles: items.map((item: Record<string, string>) => ({
        title: item.title || 'Untitled',
        url: item.link || '',
        description: stripHtml(item.description),
        pubDate: item.pubDate || null,
      })),
    };
  }

  // Atom format
  if (parsed.feed) {
    const feed = parsed.feed;
    const entries = Array.isArray(feed.entry)
      ? feed.entry
      : feed.entry
        ? [feed.entry]
        : [];

    return {
      title: feed.title || 'Untitled Feed',
      description: stripHtml(feed.subtitle),
      articles: entries.map((entry: Record<string, unknown>) => {
        const link = Array.isArray(entry.link)
          ? (entry.link as Record<string, string>[]).find((l) => l['@_rel'] === 'alternate')?.['@_href'] ||
            (entry.link as Record<string, string>[])[0]?.['@_href']
          : (entry.link as Record<string, string>)?.['@_href'] || '';

        return {
          title: (entry.title as string) || 'Untitled',
          url: link || '',
          description: stripHtml(entry.summary as string) || stripHtml(entry.content as string),
          pubDate: (entry.published as string) || (entry.updated as string) || null,
        };
      }),
    };
  }

  throw new Error('Unrecognized feed format. Please provide an RSS 2.0 or Atom feed URL.');
}

export async function refreshFeed(feedId: number): Promise<void> {
  const feed = getFeedById(feedId);
  if (!feed) throw new Error('Feed not found');

  const parsed = await fetchAndParseFeed(feed.url);
  upsertArticles(feedId, parsed.articles);
  updateLastFetched(feedId);
}
