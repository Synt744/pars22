/**
 * Cloudflare Protection Bypass Service
 * Provides functions to help bypass Cloudflare's anti-bot protection
 */

import { generateBrowserHeaders } from './userAgentService';

// Cookie names that Cloudflare typically sets
const CLOUDFLARE_COOKIES = [
  'cf_clearance',
  'cf_chl_',
  '__cf_bm',
  '__cfduid',
];

/**
 * Checks if a response is protected by Cloudflare
 */
export function isCloudflareProtected(responseText: string, statusCode: number): boolean {
  // Check for Cloudflare's challenge page
  const isChallengePage = (
    responseText.includes('cf-browser-verification') ||
    responseText.includes('cf_chl_') ||
    responseText.includes('cf-please-wait') ||
    responseText.includes('Just a moment...') ||
    responseText.includes('Checking your browser') ||
    responseText.includes('DDoS protection by Cloudflare')
  );
  
  // Check for typical Cloudflare status codes
  const isBlockedStatus = statusCode === 403 || statusCode === 503;
  
  return isChallengePage || (isBlockedStatus && responseText.includes('Cloudflare'));
}

/**
 * Creates fetch options to bypass Cloudflare protection
 */
export function createCloudflareBypassOptions(url: string, userAgent: string): RequestInit {
  // Create headers that mimic real browser behavior
  const headers = generateBrowserHeaders(userAgent);
  
  // Additional headers that help bypass Cloudflare
  const enhancedHeaders = {
    ...headers,
    'Referer': new URL(url).origin,
    'Origin': new URL(url).origin,
  };
  
  return {
    method: 'GET',
    headers: enhancedHeaders,
    // These are crucial for Cloudflare bypass:
    redirect: 'follow',       // Follow all redirects
    credentials: 'include',   // Include cookies in the request
    mode: 'no-cors' as RequestMode,  // Avoid CORS issues with Cloudflare
  };
}

/**
 * Handles Cloudflare protection by solving challenges
 * This is a simplified version - in a real implementation this would use
 * a headless browser or specialized service to solve Cloudflare challenges
 */
export async function solveCloudflareChallenge(url: string, userAgent: string): Promise<Record<string, string>> {
  console.log(`Attempting to solve Cloudflare challenge for ${url}`);
  
  // In a real implementation, this would:
  // 1. Launch a headless browser (puppeteer/playwright)
  // 2. Navigate to the URL and wait for the challenge to complete
  // 3. Extract the cookies and return them
  
  // For demo purposes, we'll simulate a solved challenge with mock cookies
  // In a production environment, this would connect to a real anti-Cloudflare service
  
  // Simulate waiting for challenge solving
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Return mock Cloudflare clearance cookies
  return {
    'cf_clearance': 'mock_clearance_token_' + Date.now(),
    '__cf_bm': 'mock_cf_bm_token_' + new Date().toISOString()
  };
}

/**
 * Formats cookies as a string for use in HTTP headers
 */
export function formatCookieHeader(cookies: Record<string, string>): string {
  return Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

/**
 * Creates a complete set of options to use for fetching Cloudflare-protected sites
 */
export async function prepareCloudflareRequest(url: string, userAgent: string): Promise<RequestInit> {
  const baseOptions = createCloudflareBypassOptions(url, userAgent);
  
  try {
    // In a real implementation, we would check if we need to solve a challenge
    // For demonstration, we'll assume we always need to solve it
    const cookies = await solveCloudflareChallenge(url, userAgent);
    
    // Add the cookies to the headers
    const cookieHeader = formatCookieHeader(cookies);
    const headersWithCookies = {
      ...baseOptions.headers as Record<string, string>,
      'Cookie': cookieHeader
    };
    
    return {
      ...baseOptions,
      headers: headersWithCookies
    };
  } catch (error) {
    console.error('Error preparing Cloudflare request:', error);
    return baseOptions;
  }
}