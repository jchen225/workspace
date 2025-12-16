// Polymarket API Configuration
const API_BASE_URL = 'https://gamma-api.polymarket.com';
const MARKETS_ENDPOINT = '/markets';
const CORS_PROXY = 'https://corsproxy.io/?';

// State
let markets = [];
let useCorsProxy = false;

// Utility Functions
function formatCurrency(value) {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
}

function formatPrice(price) {
    // Prices are in format like "0.52" meaning 52%
    const percentage = (parseFloat(price) * 100).toFixed(1);
    return `${percentage}¢`;
}

function formatPriceChange(change) {
    if (!change) return 'N/A';
    const changePercent = (parseFloat(change) * 100).toFixed(1);
    return changePercent > 0 ? `+${changePercent}%` : `${changePercent}%`;
}

function getMarketUrl(slug) {
    return `https://polymarket.com/event/${slug}`;
}

// API Functions
async function fetchMarkets() {
    const url = `${API_BASE_URL}${MARKETS_ENDPOINT}?limit=100&closed=false`;

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
        return data;
    } catch (error) {
        console.error('Error fetching markets:', error);
        throw error;
    }
}

function getTrendingMarkets(markets, count = 10) {
    // Sort by 24-hour volume to get trending markets
    return markets
        .filter(market => market.volume24hr > 0)
        .sort((a, b) => b.volume24hr - a.volume24hr)
        .slice(0, count);
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
                    <span class="outcome-label">${outcomes[0]}</span>
                    <span class="outcome-price">${formatPrice(prices[0])}</span>
                </div>
                <div class="outcome no">
                    <span class="outcome-label">${outcomes[1]}</span>
                    <span class="outcome-price">${formatPrice(prices[1])}</span>
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

        const trending = getTrendingMarkets(allMarkets, 10);
        console.log('Top 10 trending markets:', trending);

        if (trending.length === 0) {
            throw new Error('No trending markets found with volume data');
        }

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
