// Polymarket API Configuration
const API_BASE_URL = 'https://gamma-api.polymarket.com';
const MARKETS_ENDPOINT = '/markets';
const CORS_PROXY = 'https://corsproxy.io/?';

// State
let markets = [];
let useCorsProxy = false;

// Utility Functions
function formatCurrency(value) {
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

function getTrendingMarkets(markets, count = 8) {
    // Filter for markets with essential valid data, then sort by 24-hour volume
    // This matches Polymarket's trending section which shows high-volume markets
    const validMarkets = markets
        .filter(market => {
            try {
                // Essential requirements only
                const hasValidSlug = market.slug && market.slug.length > 0;

                // Check outcomes - must be array with 2+ items
                // Handle both array and string formats
                let outcomes = market.outcomes;
                if (typeof outcomes === 'string') {
                    outcomes = outcomes.split(',');
                }
                const hasValidOutcomes = outcomes && Array.isArray(outcomes) && outcomes.length >= 2;

                // Check outcomePrices - handle both array and string formats
                let outcomePrices = market.outcomePrices;
                if (typeof outcomePrices === 'string') {
                    outcomePrices = outcomePrices.split(',');
                }

                if (!outcomePrices || !Array.isArray(outcomePrices)) {
                    console.log(`Skipping "${market.question}": outcomePrices is ${typeof market.outcomePrices} = ${JSON.stringify(market.outcomePrices)}`);
                    return false;
                }

                const hasValidPrices = outcomePrices.length >= 2;

                // Check if any price values are non-zero
                let hasNonZeroPrices = false;
                if (hasValidPrices) {
                    hasNonZeroPrices = outcomePrices.some(p => {
                        const num = parseFloat(p);
                        return !isNaN(num) && num > 0;
                    });
                }

                // Check volume
                const volume = parseFloat(market.volume24hr);
                const hasVolume = !isNaN(volume) && volume > 0;

                // Normalize the market data (convert strings to arrays)
                if (typeof market.outcomes === 'string') {
                    market.outcomes = market.outcomes.split(',');
                }
                if (typeof market.outcomePrices === 'string') {
                    market.outcomePrices = market.outcomePrices.split(',');
                }

                // Don't filter on closed status - just need essential display data
                const isValid = hasValidSlug && hasValidOutcomes && hasValidPrices && hasNonZeroPrices && hasVolume;

                if (!isValid) {
                    console.log(`Skipping market: ${market.question} - slug: ${hasValidSlug}, outcomes: ${hasValidOutcomes}, prices: ${hasValidPrices}, nonZeroPrices: ${hasNonZeroPrices}, volume: ${hasVolume}`);
                }

                return isValid;
            } catch (error) {
                console.error(`Error validating market "${market.question}":`, error);
                return false;
            }
        })
        .sort((a, b) => {
            const volumeA = parseFloat(a.volume24hr);
            const volumeB = parseFloat(b.volume24hr);
            return volumeB - volumeA;
        });

    console.log(`Found ${validMarkets.length} valid markets total`);

    // Return up to count markets
    return validMarkets.slice(0, count);
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
    const prices = market.outcomePrices || ['0.5', '0.5'];

    // Safely get outcome labels and prices
    const outcome1Label = outcomes[0] || 'Yes';
    const outcome2Label = outcomes[1] || 'No';
    const price1 = prices[0] || '0.5';
    const price2 = prices[1] || '0.5';

    // Debug logging - compact
    console.log(`Market #${rank}: "${market.question}" | Prices: [${price1}, ${price2}] -> [${formatPrice(price1)}, ${formatPrice(price2)}]`);

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
        console.log('Filtering for trending markets with valid data...\n');

        const trending = getTrendingMarkets(allMarkets, 8);

        console.log(`\n=== Found ${trending.length} trending markets ===`);

        if (trending.length === 0) {
            throw new Error('No valid markets found. Check console for filtering details.');
        }

        console.log('Sorted by volume (descending):');
        trending.forEach((m, i) => {
            const pricesDisplay = Array.isArray(m.outcomePrices) ? m.outcomePrices.join(', ') : 'N/A';
            console.log(`#${i+1}: ${m.question} - Volume: $${m.volume24hr.toFixed(2)} - Prices: ${pricesDisplay}`);
        });

        markets = trending;
        displayMarkets(trending);
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard loaded, fetching trending markets...');
    loadTrendingMarkets();

    // Refresh every 5 minutes
    setInterval(loadTrendingMarkets, 5 * 60 * 1000);
});
