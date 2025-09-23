import crypto from 'crypto'

export function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex')
}

export function parseTags(input?: string[] | string | null): string[] {
  if (!input) return []
  if (Array.isArray(input)) return input.map(s=>String(s).trim()).filter(Boolean)
  return String(input).split(',').map(s=>s.trim()).filter(Boolean)
}

export function matchTopics(text: string, topics: string[]): boolean {
  const hay = text.toLowerCase()
  return topics.some(t => hay.includes(t.toLowerCase().trim()))
}

// Parse salary from text and extract min/max amounts
export function parseSalary(salaryText: string): { min?: number; max?: number; currency?: string } {
  if (!salaryText) return {}
  
  const text = salaryText.toLowerCase()
  const currency = detectCurrency(text)
  
  // Remove currency symbols and normalize
  const cleanText = text
    .replace(/[$€£¥₹]/g, '')
    .replace(/usd|eur|gbp|cad|aud/g, '')
    .replace(/per year|annual|yearly|pa|yr/g, '')
    .replace(/per month|monthly|mo/g, '')
    .replace(/[,\s]/g, '')
  
  // Try to find salary ranges (e.g., "80000-120000", "80k-120k")
  const rangeMatch = cleanText.match(/(\d+)k?[-–—to](\d+)k?/)
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]) * (rangeMatch[1].includes('k') ? 1000 : 1)
    const max = parseFloat(rangeMatch[2]) * (rangeMatch[2].includes('k') ? 1000 : 1)
    return { min, max, currency }
  }
  
  // Try to find single amounts with k suffix
  const kMatch = cleanText.match(/(\d+)k/)
  if (kMatch) {
    const amount = parseFloat(kMatch[1]) * 1000
    return { min: amount, max: amount, currency }
  }
  
  // Try to find regular numbers
  const numberMatch = cleanText.match(/(\d+)/)
  if (numberMatch) {
    const amount = parseFloat(numberMatch[1])
    // Assume amounts over 1000 are annual salaries
    if (amount > 1000) {
      return { min: amount, max: amount, currency }
    }
  }
  
  return { currency }
}

function detectCurrency(text: string): string {
  if (text.includes('$') || text.includes('usd')) return 'USD'
  if (text.includes('€') || text.includes('eur')) return 'EUR'
  if (text.includes('£') || text.includes('gbp')) return 'GBP'
  if (text.includes('cad')) return 'CAD'
  if (text.includes('aud')) return 'AUD'
  return 'USD' // default
}

// Extract seniority level from job title or description
export function parseSeniorityLevel(title: string, description?: string): string {
  const text = `${title} ${description || ''}`.toLowerCase()
  
  if (text.match(/\b(senior|sr\.?|lead|principal|staff|architect)\b/)) {
    return 'Senior'
  }
  if (text.match(/\b(junior|jr\.?|entry|intern|graduate|trainee)\b/)) {
    return 'Junior'
  }
  if (text.match(/\b(mid|middle|intermediate)\b/)) {
    return 'Mid'
  }
  if (text.match(/\b(head|director|vp|vice president|cto|ceo)\b/)) {
    return 'Executive'
  }
  
  return 'Mid' // default assumption
}

// Extract country from location string
export function parseCountry(location: string): string | null {
  if (!location) return null
  
  const text = location.toLowerCase()
  
  // Common country patterns
  const countryMap: Record<string, string> = {
    'usa|united states|america|us': 'United States',
    'uk|united kingdom|britain|england|scotland|wales': 'United Kingdom',
    'canada|ca': 'Canada',
    'australia|au': 'Australia',
    'germany|deutschland|de': 'Germany',
    'france|fr': 'France',
    'netherlands|holland|nl': 'Netherlands',
    'singapore|sg': 'Singapore',
    'switzerland|ch': 'Switzerland',
    'israel|il': 'Israel',
    'japan|jp': 'Japan',
    'south korea|korea|kr': 'South Korea'
  }
  
  for (const [pattern, country] of Object.entries(countryMap)) {
    if (new RegExp(pattern).test(text)) {
      return country
    }
  }
  
  return null
}
