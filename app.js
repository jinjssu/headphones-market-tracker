/**
 * Headphones Market Tracker
 * 头戴式耳机市场跟踪应用
 * 数据来源：GitHub 每日自动更新
 */

// GitHub Raw 数据源 URL
const DATA_SOURCE_URL = 'https://raw.githubusercontent.com/jinjssu/headphones-market-tracker/main/market-data.json';

// 默认市场数据 (2026 Q1) - 作为 fallback
const defaultMarketData = {
  lastUpdate: "2026-03-02",
  marketSize: "$42.8B",
  marketGrowth: "+8.2%",
  cr10: "68.5%",
  topBrands: [
    { rank: 1, name: "Apple", share: 18.5, change: 2.3, products: "AirPods Max", price: "$549" },
    { rank: 2, name: "Sony", share: 15.2, change: 0.8, products: "WH-1000XM5", price: "$349-$399" },
    { rank: 3, name: "Bose", share: 12.8, change: -1.2, products: "QC Ultra", price: "$379-$429" },
    { rank: 4, name: "Sennheiser", share: 8.5, change: 0.5, products: "Momentum 4", price: "$299-$379" },
    { rank: 5, name: "Samsung", share: 7.2, change: 1.1, products: "Galaxy Buds Max", price: "$249-$349" },
    { rank: 6, name: "JBL", share: 6.8, change: 0.3, products: "Tour One M2", price: "$199-$299" },
    { rank: 7, name: "Audio-Technica", share: 5.5, change: -0.2, products: "M50xBT2", price: "$149-$249" },
    { rank: 8, name: "Beats", share: 4.8, change: -0.8, products: "Studio Pro", price: "$349-$399" },
    { rank: 9, name: "Shure", share: 3.7, change: 0.1, products: "AONIC 50", price: "$299-$399" },
    { rank: 10, name: "Bang & Olufsen", share: 3.5, change: 0.4, products: "H95", price: "$499-$899" }
  ],
  historical: {
    years: ["2023", "2024", "2025", "2026"],
    data: {
      "Apple": [14.2, 15.8, 16.2, 18.5],
      "Sony": [16.5, 15.8, 14.9, 15.2],
      "Bose": [15.2, 14.5, 14.0, 12.8],
      "Sennheiser": [7.8, 8.2, 8.0, 8.5],
      "Samsung": [5.2, 5.8, 6.1, 7.2]
    }
  },
  regions: {
    labels: ["北美", "欧洲", "亚太", "拉美", "中东非洲"],
    data: [35.2, 28.5, 26.8, 5.5, 4.0]
  }
};

// 品牌颜色
const brandColors = [
  '#007AFF', // Apple
  '#FF0000', // Sony
  '#00AEEF', // Bose
  '#000000', // Sennheiser
  '#1428A0', // Samsung
  '#E81D2D', // JBL
  '#005EB8', // Audio-Technica
  '#E4002B', // Beats
  '#00A6FB', // Shure
  '#8B0000'  // B&O
];

// 全局变量
let marketData = null;
let marketShareChart = null;
let trendChart = null;
let regionalChart = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  initCharts();
  renderTable();
  updateMetrics();
  setupEventListeners();
});

// 加载数据 - 优先从 GitHub 获取最新数据
async function loadData() {
  let loaded = false;
  
  // 尝试从 GitHub 获取最新数据
  try {
    const response = await fetch(DATA_SOURCE_URL + '?t=' + Date.now());
    if (response.ok) {
      marketData = await response.json();
      loaded = true;
      console.log('✅ Data loaded from GitHub:', marketData.lastUpdate);
    }
  } catch (e) {
    console.log('⚠️ GitHub fetch failed, using fallback:', e.message);
  }
  
  // Fallback: localStorage 或默认数据
  if (!loaded) {
    const saved = localStorage.getItem('headphonesMarketData');
    if (saved) {
      try {
        marketData = JSON.parse(saved);
        console.log('📦 Data loaded from localStorage');
      } catch (e) {
        marketData = JSON.parse(JSON.stringify(defaultMarketData));
      }
    } else {
      marketData = JSON.parse(JSON.stringify(defaultMarketData));
    }
  }
  
  // 更新编辑器
  document.getElementById('dataEditor').value = JSON.stringify(marketData, null, 2);
  document.getElementById('lastUpdate').textContent = marketData.lastUpdate;
  document.getElementById('footerDate').textContent = marketData.lastUpdate;
}

// 保存数据
function saveData() {
  try {
    const editorValue = document.getElementById('dataEditor').value;
    marketData = JSON.parse(editorValue);
    localStorage.setItem('headphonesMarketData', JSON.stringify(marketData));
    
    // 更新显示
    initCharts();
    renderTable();
    updateMetrics();
    document.getElementById('lastUpdate').textContent = marketData.lastUpdate;
    
    showToast('✅ 数据已保存');
  } catch (e) {
    showToast('❌ JSON 格式错误：' + e.message, true);
  }
}

// 导出数据为 CSV
function exportData() {
  let csv = '排名，品牌，市场份额 (%),同比变化 (%),主力产品，价格区间\n';
  marketData.topBrands.forEach(brand => {
    csv += `${brand.rank},${brand.name},${brand.share},${brand.change},${brand.products},${brand.price}\n`;
  });
  
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `headphones-market-${marketData.lastUpdate}.csv`;
  link.click();
  
  showToast('📤 数据已导出');
}

// 重置数据
function resetData() {
  if (confirm('确定要重置为默认数据吗？')) {
    marketData = JSON.parse(JSON.stringify(defaultMarketData));
    localStorage.setItem('headphonesMarketData', JSON.stringify(marketData));
    document.getElementById('dataEditor').value = JSON.stringify(marketData, null, 2);
    initCharts();
    renderTable();
    updateMetrics();
    showToast('🔄 数据已重置');
  }
}

// 更新指标卡片
function updateMetrics() {
  document.getElementById('marketSize').textContent = marketData.marketSize;
  document.querySelector('.metrics .metric-change').textContent = marketData.marketGrowth + ' YoY';
  document.getElementById('cr10').textContent = marketData.cr10;
  
  // 找出增长最快的品牌
  const fastest = [...marketData.topBrands].sort((a, b) => b.change - a.change)[0];
  document.getElementById('fastestGrowth').textContent = fastest.name;
  document.querySelector('.metrics .metric-card:nth-child(3) .metric-change').textContent = 
    `+${fastest.change}%`;
}

// 渲染表格
function renderTable() {
  const tbody = document.getElementById('rankingTable');
  tbody.innerHTML = marketData.topBrands.map((brand, index) => `
    <tr>
      <td class="rank rank-${brand.rank}">#${brand.rank}</td>
      <td>
        <div class="brand">
          <div class="brand-logo" style="background: ${brandColors[index]}">${brand.name[0]}</div>
          ${brand.name}
        </div>
      </td>
      <td>
        ${brand.share}%
        <div class="share-bar">
          <div class="share-fill" style="width: ${brand.share * 3}%; background: ${brandColors[index]}"></div>
        </div>
      </td>
      <td class="${brand.change >= 0 ? 'change-up' : 'change-down'}">
        ${brand.change >= 0 ? '↑' : '↓'} ${Math.abs(brand.change)}%
      </td>
      <td>${brand.products}</td>
      <td>${brand.price}</td>
    </tr>
  `).join('');
}

// 初始化图表
function initCharts() {
  // 市场份额饼图
  const ctx1 = document.getElementById('marketShareChart').getContext('2d');
  if (marketShareChart) marketShareChart.destroy();
  
  marketShareChart = new Chart(ctx1, {
    type: 'doughnut',
    data: {
      labels: marketData.topBrands.map(b => b.name),
      datasets: [{
        data: marketData.topBrands.map(b => b.share),
        backgroundColor: brandColors,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 1.5,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#fff', padding: 8, boxWidth: 10, font: { size: 10 } }
        }
      }
    }
  });
  
  // 趋势图
  const ctx2 = document.getElementById('trendChart').getContext('2d');
  if (trendChart) trendChart.destroy();
  
  trendChart = new Chart(ctx2, {
    type: 'line',
    data: {
      labels: marketData.historical.years,
      datasets: Object.entries(marketData.historical.data).map(([name, data], i) => ({
        label: name,
        data: data,
        borderColor: brandColors[i],
        backgroundColor: brandColors[i] + '20',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 2.5,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#fff', padding: 12, boxWidth: 12 }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 25,
          grid: { color: 'rgba(255,255,255,0.08)' },
          ticks: { color: '#888', callback: (v) => v + '%' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#888' }
        }
      }
    }
  });
  
  // 区域图
  const ctx3 = document.getElementById('regionalChart').getContext('2d');
  if (regionalChart) regionalChart.destroy();
  
  regionalChart = new Chart(ctx3, {
    type: 'bar',
    data: {
      labels: marketData.regions.labels,
      datasets: [{
        label: '市场份额 (%)',
        data: marketData.regions.data,
        backgroundColor: [
          'rgba(0, 212, 255, 0.7)',
          'rgba(123, 47, 247, 0.7)',
          'rgba(241, 7, 163, 0.7)',
          'rgba(56, 239, 125, 0.7)',
          'rgba(255, 159, 64, 0.7)'
        ],
        borderColor: [
          'rgba(0, 212, 255, 1)',
          'rgba(123, 47, 247, 1)',
          'rgba(241, 7, 163, 1)',
          'rgba(56, 239, 125, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 4,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          max: 40,
          grid: { color: 'rgba(255,255,255,0.08)' },
          ticks: { color: '#888', callback: (v) => v + '%' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#888' }
        }
      }
    }
  });
}

// 设置事件监听
function setupEventListeners() {
  document.getElementById('saveData').addEventListener('click', saveData);
  document.getElementById('loadData').addEventListener('click', loadData);
  document.getElementById('exportData').addEventListener('click', exportData);
  document.getElementById('resetData').addEventListener('click', resetData);
}

// Toast 提示
function showToast(message, isError = false) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  
  toast.textContent = message;
  toast.className = 'toast' + (isError ? ' error' : '');
  toast.classList.add('show');
  
  setTimeout(() => toast.classList.remove('show'), 3000);
}
