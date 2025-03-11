/**
 * Utility function to make API requests through a CORS proxy
 * This helps bypass CORS restrictions when making requests from the browser
 */

// List of public CORS proxies to try
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url=',
  'https://proxy.cors.sh/'
];

/**
 * Attempts to fetch a URL through multiple CORS proxies
 * @param url The URL to fetch
 * @param options Fetch options
 * @returns A Promise resolving to the fetch Response
 */
export async function fetchWithCorsProxy(url: string, options: RequestInit): Promise<Response> {
  // Try each proxy in sequence
  for (const proxy of CORS_PROXIES) {
    try {
      const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
      console.log(`Trying CORS proxy: ${proxy}`);
      
      // Clone the options to avoid modifying the original
      const proxyOptions = { ...options };
      
      // Clone the headers to avoid modifying the original
      proxyOptions.headers = { ...proxyOptions.headers };
      
      // Add headers required by some proxies
      if (proxy === 'https://proxy.cors.sh/') {
        proxyOptions.headers = {
          ...proxyOptions.headers,
          'x-cors-api-key': 'temp_me_later',
        };
      } else {
        proxyOptions.headers = {
          ...proxyOptions.headers,
          'X-Requested-With': 'XMLHttpRequest',
        };
      }
      
      const response = await fetch(proxyUrl, proxyOptions);
      
      // If successful, return the response
      if (response.ok) {
        console.log(`Successfully used proxy: ${proxy}`);
        return response;
      }
      
      console.warn(`Proxy ${proxy} returned status ${response.status}`);
    } catch (error) {
      console.error(`Proxy ${proxy} failed:`, error);
      // Continue to the next proxy
    }
  }
  
  // If all proxies fail, try direct request as a last resort
  console.log('All proxies failed, attempting direct request');
  return fetch(url, options);
}