// Polymarket API Configuration
const API_BASE_URL = 'https://gamma-api.polymarket.com';
const MARKETS_ENDPOINT = '/markets';
const CORS_PROXY = 'https://corsproxy.io/?';

// State
let markets = [];
let useCorsProxy = false;
let currentSearchKeywords = 'ethereum'; // Default search

// Utility Functions
function formatCurrency(value) {
    if (value == null) return '$0.00';
    const num = parseFloat(value);
    if (isNaN(num)) return '$0.00';

    if (num >= 1000000) {
        return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
        return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num.toFixed(2)}`;
}

function formatPrice(price) {
    // Prices are in format like "0.52" meaning 52%
    const num = parseFloat(price);
    if (isNaN(num)) return '0.0¢';

    const percentage = (num * 100).toFixed(1);
    return `${percentage}¢`;
}

function formatPriceChange(change) {
    if (!change) return 'N/A';
    const changePercent = (parseFloat(change) * 100).toFixed(1);
    return changePercent > 0 ? `+${changePercent}%` : `${changePercent}%`;
}

function getMarketUrl(slug) {
    if (!slug) {
        console.warn('Market has no slug!');
        return 'https://polymarket.com';
    }
    return `https://polymarket.com/event/${slug}`;
}

// API Functions
async function fetchMarkets() {
    // Fetch more markets to ensure we find 10 valid ones after filtering
    const url = `${API_BASE_URL}${MARKETS_ENDPOINT}?limit=200&closed=false`;

    try {
        console.log('Attempting to fetch from:', url);

        // Try direct fetch first
        let response;
        try {
            response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (directError) {
            // If direct fetch fails (likely CORS), try with proxy
            console.log('Direct fetch failed, trying CORS proxy...', directError.message);
            useCorsProxy = true;
            const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
            console.log('Fetching from proxy:', proxyUrl);

            response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error with proxy! status: ${response.status}`);
            }
        }

        const data = await response.json();
        console.log('Successfully fetched data, number of markets:', data.length);

        // Debug: Log first market structure
        if (data.length > 0) {
            console.log('Sample market structure:', {
                question: data[0].question,
                outcomes: data[0].outcomes,
                outcomePrices: data[0].outcomePrices,
                outcomePricesType: typeof data[0].outcomePrices,
                isArray: Array.isArray(data[0].outcomePrices),
                volume24hr: data[0].volume24hr,
                slug: data[0].slug
            });
        }

        return data;
    } catch (error) {
        console.error('Error fetching markets:', error);
        throw error;
    }
}

function getMarketsByKeywords(markets, keywords) {
    // Filter for active markets matching the search keywords
    console.log(`Filtering for markets matching: "${keywords}"...`);

    // Split keywords by comma or space and trim
    const keywordList = keywords.toLowerCase()
        .split(/[,\s]+/)
        .map(k => k.trim())
        .filter(k => k.length > 0);

    console.log('Searching for keywords:', keywordList);

    const filteredMarkets = markets
        .filter(market => {
            try {
                // Only require the absolute minimum
                const hasQuestion = market.question && market.question.length > 0;
                const hasSlug = market.slug && market.slug.length > 0;

                // Check if market matches any of the keywords
                const questionLower = market.question.toLowerCase();
                const matchesKeywords = keywordList.some(keyword =>
                    questionLower.includes(keyword)
                );

                // Check if market is active (not resolved/closed)
                const isActive = market.closed !== true;

                console.log(`"${market.question}" - Matches: ${matchesKeywords}, Active: ${isActive}, Closed: ${market.closed}`);

                if (!matchesKeywords) {
                    return false;
                }

                // Normalize the market data (convert strings to arrays if needed)
                if (market.outcomes) {
                    if (typeof market.outcomes === 'string') {
                        // Try JSON.parse first, fallback to split
                        try {
                            market.outcomes = JSON.parse(market.outcomes);
                        } catch {
                            market.outcomes = market.outcomes.split(',').map(o => o.trim());
                        }
                    }
                }
                if (market.outcomePrices) {
                    if (typeof market.outcomePrices === 'string') {
                        // Try JSON.parse first for stringified arrays like "[\"0.008\",\"0.992\"]"
                        try {
                            market.outcomePrices = JSON.parse(market.outcomePrices);
                            console.log(`Parsed outcomePrices from JSON string for "${market.question}":`, market.outcomePrices);

                            // Handle double-stringified arrays - if elements are still strings with quotes
                            if (Array.isArray(market.outcomePrices) && market.outcomePrices.length > 0) {
                                market.outcomePrices = market.outcomePrices.map(price => {
                                    if (typeof price === 'string') {
                                        // Remove surrounding quotes if present: "\"0.008\"" -> "0.008"
                                        return price.replace(/^"|"$/g, '');
                                    }
                                    return price;
                                });
                            }
                        } catch {
                            // Fallback to split
                            market.outcomePrices = market.outcomePrices.split(',').map(p => p.trim());
                        }
                    }
                }

                // Set defaults if missing
                if (!market.outcomes || !Array.isArray(market.outcomes) || market.outcomes.length < 2) {
                    market.outcomes = ['Yes', 'No'];
                }
                if (!market.outcomePrices || !Array.isArray(market.outcomePrices) || market.outcomePrices.length < 2) {
                    market.outcomePrices = ['0.5', '0.5'];
                }

                const isValid = hasQuestion && hasSlug && isEthereumRelated && isActive;

                return isValid;
            } catch (error) {
                console.error(`Error validating market "${market.question}":`, error);
                return false;
            }
        })
        .sort((a, b) => {
            // Sort by volume (handle undefined/null values)
            const volumeA = a.volume24hr != null ? parseFloat(a.volume24hr) : 0;
            const volumeB = b.volume24hr != null ? parseFloat(b.volume24hr) : 0;
            return volumeB - volumeA;
        });

    console.log(`Found ${filteredMarkets.length} markets matching "${keywords}"`);

    // Return all matching markets (no limit)
    return filteredMarkets;
}

// UI Functions
function createMarketCard(market, rank) {
    const card = document.createElement('div');
    card.className = 'market-card';

    const priceChange = market.oneDayPriceChange || 0;
    const priceChangeClass = priceChange > 0 ? 'positive' : priceChange < 0 ? 'negative' : '';

    // Get outcome prices (Yes/No)
    // Note: outcomes and outcomePrices are already arrays from the API
    const outcomes = market.outcomes || ['Yes', 'No'];
    let prices = market.outcomePrices || ['0.5', '0.5'];

    // FIX: Handle nested arrays - sometimes outcomePrices comes as [["0.5", "0.5"]] or even deeper
    // Keep flattening while the first element is an array
    while (Array.isArray(prices) && prices.length > 0 && Array.isArray(prices[0])) {
        console.log('⚠️ Detected nested array in outcomePrices, flattening...', prices);
        prices = prices[0]; // Flatten one level
        console.log('After flattening:', prices);
    }

    // Verify we have valid prices
    if (!Array.isArray(prices) || prices.length < 2) {
        console.warn('Invalid prices after flattening, using defaults:', prices);
        prices = ['0.5', '0.5'];
    }

    // Safely get outcome labels and prices
    const outcome1Label = outcomes[0] || 'Yes';
    const outcome2Label = outcomes[1] || 'No';
    const price1 = prices[0] || '0.5';
    const price2 = prices[1] || '0.5';

    // Debug logging - compact
    console.log(`Market #${rank}: "${market.question}" | Raw prices: ${JSON.stringify(market.outcomePrices)} | Extracted: [${price1}, ${price2}] -> [${formatPrice(price1)}, ${formatPrice(price2)}]`);

    card.innerHTML = `
        <div class="market-rank">#${rank}</div>
        <div class="market-content">
            <div class="market-header">
                ${market.image ? `<img src="${market.image}" alt="${market.question}" class="market-image">` : ''}
                <div class="market-title-section">
                    <h2 class="market-question">${market.question}</h2>
                    <a href="${getMarketUrl(market.slug)}" target="_blank" class="market-link">
                        View on Polymarket →
                    </a>
                </div>
            </div>

            <div class="outcomes">
                <div class="outcome yes">
                    <span class="outcome-label">${outcome1Label}</span>
                    <span class="outcome-price">${formatPrice(price1)}</span>
                </div>
                <div class="outcome no">
                    <span class="outcome-label">${outcome2Label}</span>
                    <span class="outcome-price">${formatPrice(price2)}</span>
                </div>
            </div>

            <div class="market-stats">
                <div class="stat">
                    <span class="stat-label">24h Volume</span>
                    <span class="stat-value">${formatCurrency(market.volume24hr)}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Total Volume</span>
                    <span class="stat-value">${formatCurrency(market.volume)}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Liquidity</span>
                    <span class="stat-value">${formatCurrency(market.liquidityNum || 0)}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">24h Change</span>
                    <span class="stat-value ${priceChangeClass}">${formatPriceChange(priceChange)}</span>
                </div>
            </div>
        </div>
    `;

    return card;
}

function displayMarkets(markets) {
    const container = document.getElementById('markets-container');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');

    // Clear container
    container.innerHTML = '';

    // Hide loading, show markets
    loading.style.display = 'none';
    error.style.display = 'none';
    container.style.display = 'block';

    // Create and append market cards
    markets.forEach((market, index) => {
        const card = createMarketCard(market, index + 1);
        container.appendChild(card);
    });

    // Update last updated time
    const now = new Date();
    document.getElementById('last-updated-time').textContent = now.toLocaleString();
}

function showError(message = null) {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const container = document.getElementById('markets-container');

    loading.style.display = 'none';
    error.style.display = 'block';
    container.style.display = 'none';

    if (message) {
        error.innerHTML = `
            <p>Failed to load markets.</p>
            <p style="font-size: 0.9rem; margin-top: 10px; opacity: 0.9;">${message}</p>
            <button onclick="location.reload()" style="margin-top: 15px; padding: 10px 20px; background: white; color: #ff4444; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Retry</button>
        `;
    }
}

// Main Function
async function loadTrendingMarkets() {
    try {
        console.log('Fetching markets from Polymarket API...');
        const allMarkets = await fetchMarkets();
        console.log(`Fetched ${allMarkets.length} markets`);

        if (!allMarkets || allMarkets.length === 0) {
            throw new Error('No markets returned from API');
        }

        console.log(`Total markets fetched: ${allMarkets.length}`);
        console.log(`Filtering for active markets matching: "${currentSearchKeywords}"...\n`);

        const filteredMarkets = getMarketsByKeywords(allMarkets, currentSearchKeywords);

        console.log(`\n=== Found ${filteredMarkets.length} markets ===`);

        if (filteredMarkets.length === 0) {
            throw new Error(`No active markets found for "${currentSearchKeywords}". Try different keywords.`);
        }

        console.log('Sorted by volume (descending):');
        filteredMarkets.forEach((m, i) => {
            const pricesDisplay = Array.isArray(m.outcomePrices) ? m.outcomePrices.join(', ') : 'N/A';
            const volumeDisplay = m.volume24hr != null ? `$${parseFloat(m.volume24hr).toFixed(2)}` : 'N/A';
            console.log(`#${i+1}: ${m.question} - Volume: ${volumeDisplay} - Prices: ${pricesDisplay}`);
        });

        markets = filteredMarkets;
        displayMarkets(filteredMarkets);
    } catch (error) {
        console.error('Failed to load trending markets:', error);
        let errorMessage = 'Please check your internet connection and try again.';

        if (error.message.includes('CORS')) {
            errorMessage = 'Browser security blocked the request. Try running with a local server.';
        } else if (error.message) {
            errorMessage = error.message;
        }

        showError(errorMessage);
    }
}

// Search functionality
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const keywords = searchInput.value.trim();

    if (keywords.length === 0) {
        alert('Please enter at least one keyword to search');
        return;
    }

    currentSearchKeywords = keywords;
    console.log(`\n\n=== NEW SEARCH: "${keywords}" ===\n`);
    loadTrendingMarkets();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard loaded, fetching markets...');

    // Set up search functionality
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');

    searchButton.addEventListener('click', performSearch);

    // Allow Enter key to trigger search
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Load initial results with default search (Ethereum)
    loadTrendingMarkets();

    // Refresh every 5 minutes
    setInterval(loadTrendingMarkets, 5 * 60 * 1000);
});
