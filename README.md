# Polymarket Trending Markets Dashboard

A simple, responsive dashboard that displays the top 8 trending prediction markets from Polymarket based on 24-hour trading volume.

![Dashboard Preview](preview.png)

## Features

- 🔥 **Real-time Data**: Fetches live market data from Polymarket's Gamma API
- 📊 **Top 8 Trending**: Displays markets sorted by 24-hour trading volume
- 💹 **Market Statistics**: Shows volume, liquidity, and price changes
- 🎨 **Beautiful UI**: Clean, modern design with responsive layout
- ♻️ **Auto-refresh**: Updates every 5 minutes automatically

## Quick Start

### Option 1: Open Directly in Browser

Simply open `index.html` in your web browser:

```bash
# Using your default browser
open index.html

# Or on Linux
xdg-open index.html

# Or on Windows
start index.html
```

### Option 2: Run with Local Server

For best results, serve the files using a local web server:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open your browser to `http://localhost:8000`

## Project Structure

```
.
├── index.html      # Main HTML structure
├── styles.css      # Styling and responsive design
├── app.js          # JavaScript logic and API integration
├── README.md       # This file
└── CLAUDE.md       # AI assistant guide
```

## How It Works

### Data Source

The dashboard fetches data from the Polymarket Gamma API:
- **Base URL**: `https://gamma-api.polymarket.com`
- **Endpoint**: `/markets?limit=100&closed=false`

### Trending Algorithm

Markets are sorted by their 24-hour trading volume (`volume24hr`) to determine what's trending. The top 8 markets are displayed on the dashboard.

### Display Information

For each market, the dashboard shows:
- **Market Question**: The prediction question
- **Current Prices**: Yes/No outcome probabilities (displayed in cents)
- **24h Volume**: Trading volume in the last 24 hours
- **Total Volume**: All-time trading volume
- **Liquidity**: Available liquidity for trading
- **24h Price Change**: Price movement in the last day

## API Response Fields

The Polymarket API returns rich market data including:

```javascript
{
  id: "market-id",
  question: "Will X happen?",
  slug: "market-slug",
  outcomes: ["Yes", "No"],
  outcomePrices: "0.52,0.48",
  volume: 1234567.89,
  volume24hr: 12345.67,
  liquidityNum: 50000,
  oneDayPriceChange: 0.05,
  image: "https://...",
  // ... and more
}
```

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with Grid and Flexbox
- **Vanilla JavaScript**: No frameworks required
- **Polymarket Gamma API**: Data source

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## Customization

### Change Number of Markets

Edit `app.js` line where `getTrendingMarkets()` is called:

```javascript
const trending = getTrendingMarkets(allMarkets, 15); // Show 15 instead of 8
```

### Change Refresh Interval

Edit `app.js` at the bottom:

```javascript
setInterval(loadTrendingMarkets, 2 * 60 * 1000); // Refresh every 2 minutes
```

### Modify Styling

Edit `styles.css` to customize colors, spacing, or layout:

```css
/* Change the gradient background */
body {
    background: linear-gradient(135deg, #your-color 0%, #another-color 100%);
}
```

## Troubleshooting

### Markets Not Loading

**IMPORTANT**: If you see "Failed to load markets" error, follow these steps:

1. **Use a Local Server** (Most Common Fix)
   - Opening `index.html` directly in your browser may cause CORS errors
   - Run a local server instead:
     ```bash
     python -m http.server 8000
     # Then visit http://localhost:8000
     ```

2. **Check Console for Details**
   - Open browser DevTools (F12)
   - Check the Console tab for specific error messages
   - Look for CORS, network, or API errors

3. **CORS Proxy Fallback**
   - The app automatically tries to use a CORS proxy if direct fetch fails
   - Check console to see if proxy is being used
   - Proxy URL: `https://corsproxy.io/`

4. **API Status**
   - Verify the Polymarket API is accessible
   - Test: https://gamma-api.polymarket.com/markets?limit=10&closed=false
   - If the API is down, wait and retry later

5. **Browser Compatibility**
   - Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)
   - Clear browser cache and reload
   - Try a different browser if issues persist

### Common Error Messages

- **"Browser security blocked the request"**: Use a local server instead of opening the file directly
- **"No markets returned from API"**: The Polymarket API might be down or rate-limiting requests
- **"No trending markets found"**: All markets returned had zero 24h volume (unlikely but possible)

### Slow Loading

- The dashboard fetches 200 markets to find the top 8 trending
- Initial load may take 2-5 seconds depending on network speed and CORS proxy usage
- Markets are cached in memory and only refetch every 5 minutes
- The CORS proxy adds ~1-2 seconds of latency if needed

## Future Enhancements

Potential improvements:
- [ ] Filter by market category (Politics, Sports, Crypto, etc.)
- [ ] Search functionality
- [ ] Historical price charts
- [ ] Mobile app version
- [ ] Dark mode toggle
- [ ] Favorite markets tracking
- [ ] Price alerts

## Resources

- [Polymarket](https://polymarket.com) - Official website
- [Polymarket API Documentation](https://docs.polymarket.com/developers/gamma-markets-api/overview)
- [Polymarket Gamma API](https://gamma-api.polymarket.com/)

## License

MIT License - Feel free to use and modify as needed.

## Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Built with ❤️ using Polymarket's public API**
