// Polymarket API Configuration
const API_BASE_URL = 'https://gamma-api.polymarket.com';
const MARKETS_ENDPOINT = '/markets';

// State
let markets = [];

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
    try {
        // Fetch active markets, limit to 100 to get a good pool
        const response = await fetch(`${API_BASE_URL}${MARKETS_ENDPOINT}?limit=100&closed=false`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
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
    const outcomes = market.outcomes || ['Yes', 'No'];
    const prices = market.outcomePrices ? market.outcomePrices.split(',') : ['0.5', '0.5'];

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

function showError() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const container = document.getElementById('markets-container');

    loading.style.display = 'none';
    error.style.display = 'block';
    container.style.display = 'none';
}

// Main Function
async function loadTrendingMarkets() {
    try {
        console.log('Fetching markets from Polymarket API...');
        const allMarkets = await fetchMarkets();
        console.log(`Fetched ${allMarkets.length} markets`);

        const trending = getTrendingMarkets(allMarkets, 10);
        console.log('Top 10 trending markets:', trending);

        markets = trending;
        displayMarkets(trending);
    } catch (error) {
        console.error('Failed to load trending markets:', error);
        showError();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard loaded, fetching trending markets...');
    loadTrendingMarkets();

    // Refresh every 5 minutes
    setInterval(loadTrendingMarkets, 5 * 60 * 1000);
});
