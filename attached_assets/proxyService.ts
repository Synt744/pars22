/**
 * Proxy Service
 * Provides functions for working with proxy servers to help avoid IP blocking
 */

// Proxy types supported
export enum ProxyType {
  HTTP = 'http',
  HTTPS = 'https',
  SOCKS4 = 'socks4',
  SOCKS5 = 'socks5'
}

// Interface for proxy configuration
export interface ProxyConfig {
  type: ProxyType;
  host: string;
  port: number;
  username?: string;
  password?: string;
  countryCode?: string;
}

/**
 * Parse a proxy URL into its components
 * Supports formats:
 * - http://username:password@host:port
 * - host:port:username:password
 * - host:port
 */
export function parseProxyUrl(proxyUrl: string): ProxyConfig | null {
  try {
    // Check if the URL has a protocol
    if (proxyUrl.includes('://')) {
      // Parse as URL
      const url = new URL(proxyUrl);
      const type = (url.protocol.replace(':', '')) as ProxyType;
      const host = url.hostname;
      const port = parseInt(url.port, 10) || 
                  (type === ProxyType.HTTP ? 80 : 
                   type === ProxyType.HTTPS ? 443 : 
                   type === ProxyType.SOCKS4 ? 1080 : 
                   type === ProxyType.SOCKS5 ? 1080 : 8080);
      
      // Extract username and password from auth
      const username = url.username || undefined;
      const password = url.password || undefined;
      
      return { type, host, port, username, password };
    } 
    // Check if it's in the format host:port:username:password
    else if (proxyUrl.includes(':')) {
      const parts = proxyUrl.split(':');
      
      // Basic validation
      if (parts.length < 2) {
        throw new Error('Invalid proxy format');
      }
      
      const host = parts[0];
      const port = parseInt(parts[1], 10);
      
      // Default to HTTP proxy
      const type = ProxyType.HTTP;
      
      // Check if username and password are provided
      const username = parts.length > 2 ? parts[2] : undefined;
      const password = parts.length > 3 ? parts[3] : undefined;
      
      return { type, host, port, username, password };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing proxy URL:', error);
    return null;
  }
}

/**
 * Format proxy configuration as a URL string
 */
export function formatProxyUrl(config: ProxyConfig): string {
  const { type, host, port, username, password } = config;
  
  if (username && password) {
    return `${type}://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}`;
  } else {
    return `${type}://${host}:${port}`;
  }
}

/**
 * Create fetch options for using a proxy
 */
export function createProxyFetchOptions(
  proxyConfig: ProxyConfig, 
  options: RequestInit = {}
): RequestInit {
  // In a real implementation, this would configure the request to use the proxy
  // Since Node's fetch doesn't natively support proxies, this would use a library like 'node-fetch-with-proxy'
  
  // For demonstration purposes, we'll return the original options
  // and log that we would use a proxy in a real implementation
  console.log(`Would use proxy ${formatProxyUrl(proxyConfig)} for request`);
  
  return {
    ...options,
    // Add a header to indicate we're using a proxy (for demonstration only)
    headers: {
      ...options.headers as Record<string, string>,
      'X-Using-Proxy': 'true',
    }
  };
}

/**
 * Test if a proxy is working
 */
export async function testProxy(proxyConfig: ProxyConfig): Promise<{ working: boolean, latency: number, error?: string }> {
  const startTime = Date.now();
  
  try {
    // In a real implementation, this would make a request through the proxy to test it
    // For demonstration, we'll simulate a successful proxy test with random latency
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // 80% chance of working proxy
    const working = Math.random() > 0.2;
    
    if (!working) {
      throw new Error('Proxy connection timed out');
    }
    
    const latency = Date.now() - startTime;
    
    return { working, latency };
  } catch (error) {
    return { 
      working: false, 
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Rotate through a list of proxies to avoid IP blocking
 */
export class ProxyRotator {
  private proxies: ProxyConfig[];
  private currentIndex: number = 0;
  private lastRotationTime: number = 0;
  private rotationInterval: number; // in milliseconds
  
  constructor(proxies: ProxyConfig[], rotationInterval: number = 60000) {
    this.proxies = proxies;
    this.rotationInterval = rotationInterval;
  }
  
  /**
   * Get the current proxy, rotating if necessary
   */
  getCurrentProxy(): ProxyConfig {
    const now = Date.now();
    
    // Check if we need to rotate
    if (now - this.lastRotationTime > this.rotationInterval) {
      this.rotate();
    }
    
    return this.proxies[this.currentIndex];
  }
  
  /**
   * Manually rotate to the next proxy
   */
  rotate(): ProxyConfig {
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
    this.lastRotationTime = Date.now();
    return this.proxies[this.currentIndex];
  }
  
  /**
   * Mark the current proxy as failed and rotate to the next one
   */
  markCurrentAsFailed(): ProxyConfig {
    console.log(`Marking proxy ${formatProxyUrl(this.proxies[this.currentIndex])} as failed`);
    return this.rotate();
  }
  
  /**
   * Add a new proxy to the rotation
   */
  addProxy(proxy: ProxyConfig): void {
    this.proxies.push(proxy);
  }
  
  /**
   * Remove a proxy from the rotation
   */
  removeProxy(index: number): boolean {
    if (index >= 0 && index < this.proxies.length) {
      this.proxies.splice(index, 1);
      
      // Adjust current index if necessary
      if (this.currentIndex >= this.proxies.length) {
        this.currentIndex = 0;
      }
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Get all proxies
   */
  getAllProxies(): ProxyConfig[] {
    return [...this.proxies];
  }
}