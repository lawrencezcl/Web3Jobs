export const config = {
  // Lever.com companies with Web3/blockchain focus
  lever_companies: [
    'ledger', 'coinbase', 'opensea', 'circle', 'stripe', 'block',
    'chainalysis', 'consensys', 'binance', 'crypto', 'kraken',
    'solana', 'polygon', 'avalanche', 'uniswap', 'aave'
  ],

  // Greenhouse boards for crypto companies and VCs
  greenhouse_boards: [
    'ripple', 'a16z', 'paradigm', 'usv', 'placeholder', 'dragonfly',
    'coinbase', 'consensys', 'chainalysis', 'blockchain', 'solana'
  ],

  // RemoteOK Web3 jobs
  enable_remoteok: true,
  remoteok_tags: ['blockchain', 'crypto', 'web3', 'bitcoin', 'ethereum'],

  // RSS feeds for Web3 job boards
  rss_feeds: [
    'https://web3.career/jobs.rss',
    'https://cryptocurrencyjobs.co/rss',
    'https://web3jobs.xyz/rss.xml',
    'https://cryptojobslist.com/feed',
    'https://pompcryptojobs.com/feed',
    'https://blockchainjobz.com/feed'
  ] as string[],

  // Additional job board APIs
  wellfound: {
    enabled: true,
    tags: ['blockchain', 'cryptocurrency', 'web3', 'defi', 'nft', 'smart-contracts']
  },

  // LinkedIn job search (simulated via RSS)
  linkedin: {
    enabled: true,
    keywords: ['blockchain', 'cryptocurrency', 'web3', 'solidity', 'defi']
  },

  // General tech job boards with Web3 filters
  angelco: {
    enabled: true,
    tags: ['blockchain', 'cryptocurrency', 'web3', 'defi']
  },

  // Quality filters
  min_salary: 50000, // Minimum salary to filter out low-quality jobs
  require_description: true, // Jobs must have descriptions
  exclude_keywords: ['intern', 'junior', 'entry level', 'graduate'], // Optional: comment out if you want all levels
  preferred_keywords: ['senior', 'lead', 'principal', 'engineer', 'developer']
}
