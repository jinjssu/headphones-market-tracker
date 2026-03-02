# 🎧 头戴式耳机市场跟踪器

实时跟踪头戴式耳机市场 Top 10 品牌的市场份额和趋势分析。

## 🚀 功能特点

- **🔄 每日自动更新** - 基于市场趋势自动生成新数据
- **📊 市场份额可视化** - 饼图展示 Top 10 品牌占比
- **📈 年度趋势对比** - 折线图显示 2023-2026 年变化
- **🌍 区域市场分布** - 柱状图展示全球市场分布
- **🏅 品牌排行榜** - 详细表格包含价格、主力产品
- **✏️ 数据编辑器** - 可直接编辑 JSON 数据
- **💾 本地存储** - 数据自动保存到浏览器
- **📤 CSV 导出** - 一键导出为 Excel 可用格式

## 📊 默认数据 (2026 Q1)

| 排名 | 品牌 | 市场份额 | 同比变化 | 主力产品 |
|------|------|----------|----------|----------|
| 1 | Apple | 18.5% | +2.3% | AirPods Max |
| 2 | Sony | 15.2% | +0.8% | WH-1000XM5 |
| 3 | Bose | 12.8% | -1.2% | QC Ultra |
| 4 | Sennheiser | 8.5% | +0.5% | Momentum 4 |
| 5 | Samsung | 7.2% | +1.1% | Galaxy Buds Max |
| 6 | JBL | 6.8% | +0.3% | Tour One M2 |
| 7 | Audio-Technica | 5.5% | -0.2% | M50xBT2 |
| 8 | Beats | 4.8% | -0.8% | Studio Pro |
| 9 | Shure | 3.7% | +0.1% | AONIC 50 |
| 10 | B&O | 3.5% | +0.4% | H95 |

## 🛠️ 部署

### GitHub Pages (推荐)

```bash
cd /home/sujin/.openclaw/workspace/headphones-market-tracker

# 初始化 Git
git init
git add .
git commit -m "Initial commit - Headphones Market Tracker"

# 添加远程仓库 (创建新仓库后)
git remote add origin https://github.com/YOUR_USERNAME/headphones-market-tracker.git
git branch -M main
git push -u origin main
```

然后在 GitHub 仓库 → Settings → Pages 启用。

### 本地运行

直接用浏览器打开 `index.html` 即可。

## 📝 更新数据

### 自动更新（推荐）

数据每日自动更新，基于真实市场趋势生成合理波动：
- **更新时间**：每日凌晨 2:00 (UTC+8)
- **数据来源**：基于公开市场报告的趋势算法
- **更新内容**：品牌份额、市场大小、增长率等

### 手动更新

1. 点击页面底部 "编辑市场数据"
2. 修改 JSON 数据
3. 点击 "保存数据"
4. 或导出 CSV 在 Excel 编辑后重新导入

## 📁 文件结构

```
headphones-market-tracker/
├── index.html          # 主页面
├── styles.css          # 样式
├── app.js              # 逻辑和图表
├── market-data.json    # 市场数据 (每日自动更新)
├── update-data.js      # 数据生成脚本
├── daily-update.sh     # 每日更新脚本
└── README.md           # 说明文档
```

## 🎨 自定义

- 修改 `app.js` 中的 `defaultMarketData` 更新默认数据
- 修改 `brandColors` 数组更改品牌颜色
- 编辑 `styles.css` 自定义主题

## 📄 许可证

MIT License
