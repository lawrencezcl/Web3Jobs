// Enhanced error handling and retry utilities
export interface RetryOptions {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
}

export const defaultRetryOptions: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2
}

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...defaultRetryOptions, ...options }
  let lastError: Error
  
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === opts.maxRetries) {
        break
      }
      
      const delay = Math.min(
        opts.baseDelay * Math.pow(opts.backoffFactor, attempt),
        opts.maxDelay
      )
      
      console.warn(`Operation failed, attempt ${attempt + 1}/${opts.maxRetries + 1}, retrying in ${delay}ms:`, error)
      await sleep(delay)
    }
  }
  
  throw lastError!
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function fetchWithRetry(
  url: string, 
  options: RequestInit = {},
  retryOptions?: Partial<RetryOptions>
): Promise<Response> {
  return retryWithBackoff(async () => {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'web3-remote-jobs/1.0',
        ...options.headers
      },
      ...options
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText} for ${url}`)
    }
    
    return response
  }, retryOptions)
}

export class ConnectorError extends Error {
  constructor(
    message: string,
    public source: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'ConnectorError'
  }
}

export function logConnectorError(source: string, error: Error, context?: any) {
  console.error(`[${source}] Connector error:`, {
    message: error.message,
    stack: error.stack,
    context
  })
}