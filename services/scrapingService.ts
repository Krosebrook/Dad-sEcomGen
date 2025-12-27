import { supabase } from '../lib/supabase';

const SCRAPER_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/web-scraper`;
const CRAWLER_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/web-crawler`;

export interface ScrapeRequest {
  url: string;
  ventureId: string;
  sourceType: 'competitor' | 'market' | 'product' | 'pricing' | 'trends';
  selectors?: Record<string, string>;
}

export interface CrawlRequest {
  startUrl: string;
  ventureId: string;
  maxDepth?: number;
  maxPages?: number;
  domainOnly?: boolean;
}

export async function scrapeWebsite(request: ScrapeRequest, token: string) {
  const response = await fetch(SCRAPER_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Scraping failed: ${response.statusText}`);
  }

  return await response.json();
}

export async function crawlWebsite(request: CrawlRequest, token: string) {
  const response = await fetch(CRAWLER_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      Apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Crawling failed: ${response.statusText}`);
  }

  return await response.json();
}

export async function listScrapedData(ventureId: string, sourceType?: string) {
  let query = supabase
    .from('scraped_data')
    .select('*')
    .eq('venture_id', ventureId);

  if (sourceType) {
    query = query.eq('source_type', sourceType);
  }

  const { data, error } = await query.order('scrape_date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getScrapedData(dataId: string) {
  const { data, error } = await supabase
    .from('scraped_data')
    .select('*')
    .eq('id', dataId)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteScrapedData(dataId: string) {
  const { error } = await supabase.from('scraped_data').delete().eq('id', dataId);

  if (error) throw error;
}

export async function listCrawlJobs(ventureId: string) {
  const { data, error } = await supabase
    .from('crawl_jobs')
    .select('*')
    .eq('venture_id', ventureId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getCrawlJob(jobId: string) {
  const { data, error } = await supabase
    .from('crawl_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) throw error;
  return data;
}

export async function analyzeCompetitor(url: string, ventureId: string, token: string) {
  const scrapeResult = await scrapeWebsite(
    {
      url,
      ventureId,
      sourceType: 'competitor',
      selectors: {
        pricing: '\\$(\\d+(?:\\.\\d{2})?)',
        features: '<ul[^>]*class="features"[^>]*>([\\s\\S]*?)<\\/ul>',
      },
    },
    token
  );

  return scrapeResult;
}

export async function monitorPricing(urls: string[], ventureId: string, token: string) {
  const results = [];

  for (const url of urls) {
    try {
      const result = await scrapeWebsite(
        {
          url,
          ventureId,
          sourceType: 'pricing',
        },
        token
      );
      results.push(result);
    } catch (error) {
      console.error(`Failed to scrape ${url}:`, error);
    }
  }

  return results;
}

export async function extractProductData(url: string, ventureId: string, token: string) {
  return await scrapeWebsite(
    {
      url,
      ventureId,
      sourceType: 'product',
      selectors: {
        title: '<h1[^>]*>([^<]*)<\\/h1>',
        price: '\\$(\\d+(?:\\.\\d{2})?)',
        description: '<div[^>]*class="description"[^>]*>([\\s\\S]*?)<\\/div>',
        rating: '(\\d+\\.\\d+)\\s*stars?',
      },
    },
    token
  );
}
