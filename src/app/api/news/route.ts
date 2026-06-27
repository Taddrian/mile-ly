import { NextResponse } from 'next/server';

export const revalidate = 3600; // cache for 1 hour

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

function extractText(xml: string, tag: string): string {
  const cdataMatch = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i').exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();
  const match = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i').exec(xml);
  return match ? match[1].replace(/<[^>]+>/g, '').trim() : '';
}

export async function GET() {
  try {
    const res = await fetch('https://milelion.com/feed/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RSS reader)' },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error('Feed fetch failed');

    const xml = await res.text();
    const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];

    const items: NewsItem[] = itemMatches.slice(0, 8).map(m => ({
      title: extractText(m[1], 'title'),
      link: extractText(m[1], 'link'),
      pubDate: extractText(m[1], 'pubDate'),
      description: extractText(m[1], 'description').slice(0, 120).trimEnd() + '…',
    }));

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
