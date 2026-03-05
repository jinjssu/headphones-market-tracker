#!/usr/bin/env node
/**
 * Headphones Market Data Daily Updater
 * Generates realistic daily market fluctuations based on trends
 */

const fs = require('fs');
const path = require('path');

// Base data with realistic daily fluctuation ranges
const brandBaseData = {
  Apple: { base: 18.5, trend: 0.02, volatility: 0.15, products: 'AirPods Max', price: '$549' },
  Sony: { base: 15.2, trend: 0.005, volatility: 0.12, products: 'WH-1000XM5', price: '$349-$399' },
  Bose: { base: 12.8, trend: -0.01, volatility: 0.10, products: 'QC Ultra', price: '$379-$429' },
  Sennheiser: { base: 8.5, trend: 0.008, volatility: 0.08, products: 'Momentum 4', price: '$299-$379' },
  Samsung: { base: 7.2, trend: 0.015, volatility: 0.12, products: 'Galaxy Buds Max', price: '$249-$349' },
  JBL: { base: 6.8, trend: 0.003, volatility: 0.06, products: 'Tour One M2', price: '$199-$299' },
  'Audio-Technica': { base: 5.5, trend: -0.002, volatility: 0.05, products: 'M50xBT2', price: '$149-$249' },
  Beats: { base: 4.8, trend: -0.008, volatility: 0.07, products: 'Studio Pro', price: '$349-$399' },
  Shure: { base: 3.7, trend: 0.001, volatility: 0.04, products: 'AONIC 50', price: '$299-$399' },
  'Bang & Olufsen': { base: 3.5, trend: 0.004, volatility: 0.05, products: 'H95', price: '$499-$899' }
};

const marketMetrics = {
  size: { base: 42.8, trend: 0.0002, unit: 'B' },
  growth: { base: 8.2, trend: 0.001, unit: '%' },
  cr10: { base: 68.5, trend: 0.0005, unit: '%' }
};

// Generate random fluctuation with trend
function fluctuate(base, trend, volatility) {
  const random = (Math.random() - 0.5) * 2 * volatility;
  const newValue = base + trend + random;
  return Math.round(newValue * 100) / 100;
}

// Calculate YoY change based on historical data
function calculateYoY(current, historical) {
  const lastYear = historical[historical.length - 1];
  const change = current - lastYear;
  return Math.round(change * 100) / 100;
}

// Update historical data (shift if needed)
function updateHistorical(historical, brandData) {
  const currentYear = new Date().getFullYear();
  const years = historical.years.map(y => parseInt(y));
  const latestYear = Math.max(...years);
  
  // If we're in a new year, add new data point
  if (currentYear > latestYear) {
    historical.years.push(currentYear.toString());
    Object.keys(historical.data).forEach(brand => {
      const baseInfo = brandBaseData[brand];
      if (baseInfo) {
        const lastValue = historical.data[brand][historical.data[brand].length - 1];
        const newValue = fluctuate(lastValue, baseInfo.trend, baseInfo.volatility * 0.5);
        historical.data[brand].push(Math.max(0, newValue));
      }
    });
  }
  
  return historical;
}

// Generate today's market data
function generateMarketData() {
  const today = new Date().toISOString().split('T')[0];
  
  // Load existing data or use base
  let existingData = null;
  const dataPath = path.join(__dirname, 'market-data.json');
  try {
    existingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (e) {
    console.log('No existing data, using base values');
  }
  
  // Generate brand shares
  const topBrands = Object.entries(brandBaseData).map(([name, info], index) => {
    // Get existing brand data if available (to preserve products/price)
    const existingBrand = existingData?.topBrands?.find(b => b.name === name);
    
    // Calculate current share based on existing or base
    const baseShare = existingBrand?.share || info.base;
    const currentShare = fluctuate(baseShare, info.trend * 0.1, info.volatility);
    
    // Get historical data
    const historical = existingData?.historical?.data?.[name] || [info.base * 0.9, info.base * 0.95, info.base, currentShare];
    const yoyChange = calculateYoY(currentShare, historical);
    
    return {
      rank: index + 1,
      name,
      share: Math.max(0.1, currentShare), // Ensure positive share
      change: yoyChange,
      products: existingBrand?.products || info.products || 'N/A',
      price: existingBrand?.price || info.price || 'N/A'
    };
  });
  
  // Sort by share and update ranks
  topBrands.sort((a, b) => b.share - a.share);
  topBrands.forEach((brand, i) => brand.rank = i + 1);
  
  // Generate market metrics
  const marketSize = fluctuate(marketMetrics.size.base, marketMetrics.size.trend, 0.05);
  const marketGrowth = fluctuate(marketMetrics.growth.base, marketMetrics.growth.trend, 0.1);
  const cr10 = fluctuate(marketMetrics.cr10.base, marketMetrics.cr10.trend, 0.08);
  
  // Update historical data
  const historical = existingData?.historical || {
    years: ["2023", "2024", "2025", "2026"],
    data: Object.fromEntries(
      Object.entries(brandBaseData).map(([name, info]) => [
        name,
        [info.base * 0.9, info.base * 0.95, info.base, info.base]
      ])
    )
  };
  updateHistorical(historical, topBrands);
  
  // Regional data (stable, minor fluctuations)
  const regions = {
    labels: ["北美", "欧洲", "亚太", "拉美", "中东非洲"],
    data: [35.2, 28.5, 26.8, 5.5, 4.0].map(v => 
      Math.round(fluctuate(v, 0.001, 0.02) * 10) / 10
    )
  };
  
  return {
    lastUpdate: today,
    marketSize: `$${marketSize}B`,
    marketGrowth: `${marketGrowth >= 0 ? '+' : ''}${marketGrowth}%`,
    cr10: `${cr10}%`,
    topBrands,
    historical,
    regions
  };
}

// Main execution
const newData = generateMarketData();
const outputPath = path.join(__dirname, 'market-data.json');

fs.writeFileSync(outputPath, JSON.stringify(newData, null, 2));

console.log('✅ Market data updated successfully!');
console.log(`📅 Date: ${newData.lastUpdate}`);
console.log(`📊 Market Size: ${newData.marketSize}`);
console.log(`📈 Growth: ${newData.marketGrowth}`);
console.log(`🏆 Top Brand: ${newData.topBrands[0].name} (${newData.topBrands[0].share}%)`);
