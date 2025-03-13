/**
 * User Agent Spoofing Service
 * Provides functions to help bypass bot detection by using realistic user agents
 */

// Expanded list of common user agents for better variety and realism
const USER_AGENTS = {
  desktop: {
    chrome: [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
    ],
    firefox: [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0",
      "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/118.0",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/118.0"
    ],
    safari: [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15"
    ],
    edge: [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.0.0"
    ]
  },
  mobile: {
    ios: [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (iPad; CPU OS 17_0_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
    ],
    android: [
      "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36",
      "Mozilla/5.0 (Linux; Android 13; SM-S901U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36",
      "Mozilla/5.0 (Linux; Android 13; SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36"
    ]
  }
};

// Define types for better organization
export type DeviceType = 'desktop' | 'mobile';
export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'ios' | 'android';

/**
 * Gets a specific user agent by device and browser type
 */
export function getUserAgent(device: DeviceType, browser: BrowserType): string {
  try {
    if (device === 'desktop' && ['chrome', 'firefox', 'safari', 'edge'].includes(browser)) {
      const agents = USER_AGENTS.desktop[browser as keyof typeof USER_AGENTS.desktop];
      return agents[Math.floor(Math.random() * agents.length)];
    } else if (device === 'mobile' && ['ios', 'android'].includes(browser)) {
      const agents = USER_AGENTS.mobile[browser as keyof typeof USER_AGENTS.mobile];
      return agents[Math.floor(Math.random() * agents.length)];
    }
    
    // Fallback to a random Chrome desktop user agent
    return USER_AGENTS.desktop.chrome[0];
  } catch (error) {
    // Provide a safe fallback in case of any errors
    return USER_AGENTS.desktop.chrome[0];
  }
}

/**
 * Get a random user agent from any category
 */
export function getRandomUserAgent(): string {
  // Determine random device type
  const deviceType = Math.random() > 0.7 ? 'mobile' : 'desktop';
  
  if (deviceType === 'desktop') {
    // Choose random desktop browser type
    const browserTypes = ['chrome', 'firefox', 'safari', 'edge'];
    const browserType = browserTypes[Math.floor(Math.random() * browserTypes.length)];
    return getUserAgent('desktop', browserType as BrowserType);
  } else {
    // Choose random mobile browser type
    const browserTypes = ['ios', 'android'];
    const browserType = browserTypes[Math.floor(Math.random() * browserTypes.length)];
    return getUserAgent('mobile', browserType as BrowserType);
  }
}

/**
 * Get the list of all available user agents
 * Used for the UI to show available options
 */
export function getAllUserAgents(): Record<DeviceType, Record<string, string[]>> {
  return USER_AGENTS;
}

/**
 * Generate a complete set of headers to mimic a real browser
 */
export function generateBrowserHeaders(userAgent: string): Record<string, string> {
  const isChrome = userAgent.includes('Chrome');
  const isFirefox = userAgent.includes('Firefox');
  const isSafari = userAgent.includes('Safari') && !userAgent.includes('Chrome');
  const isMobile = userAgent.includes('Mobile');
  
  // Base headers that most browsers send
  const headers: Record<string, string> = {
    'User-Agent': userAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache'
  };
  
  // Browser-specific headers
  if (isChrome) {
    headers['sec-ch-ua'] = '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"';
    headers['sec-ch-ua-mobile'] = isMobile ? '?1' : '?0';
    headers['sec-ch-ua-platform'] = userAgent.includes('Windows') ? '"Windows"' : 
                                    userAgent.includes('Mac') ? '"macOS"' : 
                                    userAgent.includes('Linux') ? '"Linux"' : 
                                    userAgent.includes('Android') ? '"Android"' : 
                                    userAgent.includes('iPhone') || userAgent.includes('iPad') ? '"iOS"' : '"Unknown"';
  } else if (isFirefox) {
    // Firefox has fewer tracking headers
    delete headers['sec-ch-ua'];
    delete headers['sec-ch-ua-mobile'];
    delete headers['sec-ch-ua-platform'];
  } else if (isSafari) {
    // Safari has different accept values
    headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
    delete headers['sec-ch-ua'];
    delete headers['sec-ch-ua-mobile'];
    delete headers['sec-ch-ua-platform'];
  }
  
  return headers;
}