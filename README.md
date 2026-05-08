# 📊 Professional Chart Generator for Affinity

[![Version](https://img.shields.io/badge/version-4.0.0-blue.svg)](https://github.com/busclog/affinity-scripts)
[![Affinity](https://img.shields.io/badge/Affinity-2.x-red.svg)](https://affinity.serif.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> Generate professional charts (pie, bar, line, radar) directly in Affinity Designer/Publisher from CSV files.

![Demo](docs/images/chart-generator-demo.gif)

## ✨ Features

### 📁 CSV Import
- File selection via GUI
- Supports `,` `;` `\t` separators
- Data preview before import
- Automatic column detection

### 📊 6 Chart Types

| Type | Icon | Use Case |
|------|-------|-------------|
| Pie | 🥧 | Percentage distribution |
| Doughnut | 🍩 | Pie chart with hollow center |
| Vertical Bar | 📊 | Value comparison |
| Horizontal Bar | 📈 | Ideal for long labels |
| Line | 📉 | Time series / Trends |
| Radar | 🕸️ | Multi-criteria comparison |

### 🎨 6 Color Palettes

| Palette | Style | Best For |
|---------|-------|-------------|
| Chart.js Original | Modern & Dynamic | Dashboards |
| BUSCOLOG Corporate | Blue & Yellow | Business reports |
| Soft Pastel | Gentle tones | Elegant presentations |
| Vibrant | Bright colors | Marketing materials |
| Monochrome | Grayscale | Professional printing |
| Ocean / Sunset | Thematic | Specific themes |

### ⚙️ Advanced Settings

#### Dimensions
- Custom width / height (400-2000px)

#### Axes & Grid
- Show/hide grid
- Show/hide axes
- Axis color (Gray/Black/Blue)

#### Legend
- Position (Right/Left/Bottom)
- Value format (Percentage/Value/Both/None)
- Adjustable height

#### Pie Chart
- Radius (30-95%)
- Inner hole for doughnut (0-80%)
- Start angle (-360° to 360°)

#### Bar Chart
- Bar width (30-90%)
- Optional value labels

#### Line Chart
- Stroke thickness
- Data point size

#### Radar Chart
- Adjustable ring count
- Optional data point display

## 📥 Installation

### Method 1: Direct Installation

1. **Download** the `chart-generator.js` script
2. **Open** `Affinity.studio-window-general-script`
3. **Go to** `View → Studio → Scripts`
4. **Click** "Add Script" and select the file

### Method 2: Manifest Installation

```bash
# Clone the repository
git clone https://github.com/busclog/affinity-scripts.git

# Copy scripts to Affinity folder
cp affinity-scripts/*.js ~/Library/Application\ Support/Affinity\ Publisher/Scripts/
```
