/**
 * CAPTCHA Management Service
 * Provides functions to detect and handle various types of CAPTCHA challenges
 */

// Supported CAPTCHA types
export enum CaptchaType {
  RECAPTCHA_V2 = 'recaptcha_v2',
  RECAPTCHA_V3 = 'recaptcha_v3',
  HCAPTCHA = 'hcaptcha',
  TURNSTILE = 'turnstile', // Cloudflare's CAPTCHA
  IMAGE_CAPTCHA = 'image_captcha',
  TEXT_CAPTCHA = 'text_captcha'
}

// CAPTCHA detection patterns
const CAPTCHA_PATTERNS = {
  [CaptchaType.RECAPTCHA_V2]: [
    'class="g-recaptcha"',
    'google.com/recaptcha/api.js',
    'data-sitekey',
    'grecaptcha.execute'
  ],
  [CaptchaType.RECAPTCHA_V3]: [
    'google.com/recaptcha/api.js?render=',
    'grecaptcha.execute'
  ],
  [CaptchaType.HCAPTCHA]: [
    'hcaptcha.com/1/api.js',
    'class="h-captcha"',
    'data-sitekey'
  ],
  [CaptchaType.TURNSTILE]: [
    'challenges.cloudflare.com/turnstile/v0',
    'class="cf-turnstile"',
    'data-sitekey'
  ],
  [CaptchaType.IMAGE_CAPTCHA]: [
    'captcha.php',
    'captcha.jpg',
    'captcha.png',
    'captchaImage'
  ]
};

/**
 * Detects if CAPTCHA is present in a page and identifies its type
 */
export function detectCaptcha(html: string): { detected: boolean, type?: CaptchaType, siteKey?: string } {
  for (const [type, patterns] of Object.entries(CAPTCHA_PATTERNS)) {
    for (const pattern of patterns) {
      if (html.includes(pattern)) {
        // Try to extract the site key if present
        let siteKey: string | undefined;
        
        if (type === CaptchaType.RECAPTCHA_V2 || type === CaptchaType.RECAPTCHA_V3) {
          const siteKeyMatch = html.match(/data-sitekey="([^"]+)"/);
          if (siteKeyMatch && siteKeyMatch[1]) {
            siteKey = siteKeyMatch[1];
          }
        } else if (type === CaptchaType.HCAPTCHA) {
          const siteKeyMatch = html.match(/data-sitekey="([^"]+)"/);
          if (siteKeyMatch && siteKeyMatch[1]) {
            siteKey = siteKeyMatch[1];
          }
        } else if (type === CaptchaType.TURNSTILE) {
          const siteKeyMatch = html.match(/data-sitekey="([^"]+)"/);
          if (siteKeyMatch && siteKeyMatch[1]) {
            siteKey = siteKeyMatch[1];
          }
        }
        
        return { 
          detected: true, 
          type: type as CaptchaType,
          siteKey 
        };
      }
    }
  }
  
  return { detected: false };
}

// Interface for CAPTCHA solution services
interface CaptchaSolutionProvider {
  // In a real implementation, this would connect to an external CAPTCHA solving service
  solveCaptcha(siteKey: string, url: string, type: CaptchaType): Promise<string>;
}

/**
 * Mock CAPTCHA solution provider for demonstration purposes
 * In a real implementation, this would interface with services like 2Captcha, Anti-Captcha, etc.
 */
class MockCaptchaSolver implements CaptchaSolutionProvider {
  private apiKey?: string;
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }
  
  async solveCaptcha(siteKey: string, url: string, type: CaptchaType): Promise<string> {
    console.log(`Solving CAPTCHA of type ${type} with site key ${siteKey} for URL ${url}`);
    
    if (!this.apiKey) {
      throw new Error('No API key provided for CAPTCHA solving service');
    }
    
    // Simulate captcha solving delay
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Return a mock token
    return `captcha_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}

/**
 * Factory function to create a CAPTCHA solver based on the configuration
 */
export function createCaptchaSolver(apiKey?: string): CaptchaSolutionProvider {
  // In a real implementation, you would instantiate different solvers
  // based on the service being used (2Captcha, Anti-Captcha, etc.)
  return new MockCaptchaSolver(apiKey);
}

/**
 * Solves a CAPTCHA challenge using the configured service
 */
export async function solveCaptchaChallenge(
  type: CaptchaType,
  siteKey: string,
  url: string,
  apiKey?: string
): Promise<string> {
  try {
    const solver = createCaptchaSolver(apiKey);
    const token = await solver.solveCaptcha(siteKey, url, type);
    return token;
  } catch (error) {
    console.error('Error solving CAPTCHA:', error);
    throw new Error(`Failed to solve CAPTCHA: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Apply CAPTCHA solution to form data or request parameters
 */
export function applyCaptchaSolution(
  type: CaptchaType,
  token: string
): Record<string, string> {
  if (type === CaptchaType.RECAPTCHA_V2) {
    return { 'g-recaptcha-response': token };
  } else if (type === CaptchaType.RECAPTCHA_V3) {
    return { 'g-recaptcha-response': token };
  } else if (type === CaptchaType.HCAPTCHA) {
    return { 'h-captcha-response': token };
  } else if (type === CaptchaType.TURNSTILE) {
    return { 'cf-turnstile-response': token };
  } else {
    // Generic captcha
    return { 'captcha-response': token };
  }
}