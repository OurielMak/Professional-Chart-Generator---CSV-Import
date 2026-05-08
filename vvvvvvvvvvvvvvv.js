/**
 * name: Professional Chart Generator - CSV Import
 * version: 4.0.0
 * description: Génère des graphiques circulaires et à barres à partir d'un fichier CSV importé
 * author: BUSCOLOG
 * features: Import CSV, réglages avancés, multiples types de graphiques
 */

'use strict';

const { app } = require('/application');
const { Dialog, DialogResult } = require('/dialog');
const { Document, NewDocumentOptions } = require('/document');
const { UnitType } = require('/units');
const { Colour } = require('/colours');
const { FillDescriptor, SolidFill } = require('/fills');
const { ShapeNodeDefinition } = require('/nodes');
const { Shape, ShapeType } = require('/shapes');
const { Rectangle } = require('/geometry');
const { BlendMode } = require('affinity:common');
const { AddChildNodesCommandBuilder, NodeChildType } = require('/commands');
const { FileSystemApi } = require('affinity:fs');

// ============================================================
// PALETTES DE COULEURS PROFESSIONNELLES
// ============================================================

const COLOR_PALETTES = {
    // Palette Chart.js originale
    CHART_JS: {
        name: "Chart.js Original",
        colors: [
            { r: 255, g: 99, b: 132, alpha: 255 },  // Rouge
            { r: 54, g: 162, b: 235, alpha: 255 },  // Bleu
            { r: 255, g: 206, b: 86, alpha: 255 },  // Jaune
            { r: 75, g: 192, b: 192, alpha: 255 },  // Turquoise
            { r: 153, g: 102, b: 255, alpha: 255 }, // Violet
            { r: 255, g: 159, b: 64, alpha: 255 },  // Orange
            { r: 255, g: 99, b: 255, alpha: 255 },  // Rose
            { r: 99, g: 255, b: 132, alpha: 255 }   // Vert
        ]
    },
    // Palette Corporate (BUSCOLOG)
    CORPORATE: {
        name: "Corporate BUSCOLOG",
        colors: [
            { r: 18, g: 48, b: 136, alpha: 255 },   // Bleu marine
            { r: 255, g: 223, b: 5, alpha: 255 },    // Jaune
            { r: 0, g: 112, b: 192, alpha: 255 },    // Bleu ciel
            { r: 255, g: 128, b: 0, alpha: 255 },    // Orange
            { r: 112, g: 48, b: 160, alpha: 255 },   // Violet
            { r: 0, g: 176, b: 80, alpha: 255 }      // Vert
        ]
    },
    // Palette Pastel doux
    PASTEL: {
        name: "Pastel Doux",
        colors: [
            { r: 255, g: 179, b: 186, alpha: 255 },  // Rose
            { r: 255, g: 223, b: 186, alpha: 255 },  // Pêche
            { r: 255, g: 255, b: 186, alpha: 255 },  // Jaune
            { r: 186, g: 255, b: 201, alpha: 255 },  // Vert
            { r: 186, g: 225, b: 255, alpha: 255 },  // Bleu
            { r: 216, g: 191, b: 255, alpha: 255 },  // Lavande
            { r: 255, g: 191, b: 216, alpha: 255 }   // Rose clair
        ]
    },
    // Palette Vibrante
    VIBRANT: {
        name: "Vibrant",
        colors: [
            { r: 255, g: 59, b: 48, alpha: 255 },   // Rouge vif
            { r: 255, g: 149, b: 0, alpha: 255 },    // Orange
            { r: 255, g: 204, b: 0, alpha: 255 },    // Jaune
            { r: 52, g: 199, b: 89, alpha: 255 },    // Vert
            { r: 0, g: 122, b: 255, alpha: 255 },    // Bleu
            { r: 88, g: 86, b: 214, alpha: 255 },    // Indigo
            { r: 175, g: 82, b: 222, alpha: 255 }    // Violet
        ]
    },
    // Palette Monochrome
    MONOCHROME: {
        name: "Monochrome",
        colors: [
            { r: 30, g: 30, b: 30, alpha: 255 },
            { r: 70, g: 70, b: 70, alpha: 255 },
            { r: 110, g: 110, b: 110, alpha: 255 },
            { r: 150, g: 150, b: 150, alpha: 255 },
            { r: 190, g: 190, b: 190, alpha: 255 },
            { r: 230, g: 230, b: 230, alpha: 255 }
        ]
    },
    // Palette Océan
    OCEAN: {
        name: "Océan",
        colors: [
            { r: 0, g: 119, b: 190, alpha: 255 },   // Bleu profond
            { r: 0, g: 180, b: 216, alpha: 255 },   // Cyan
            { r: 72, g: 202, b: 228, alpha: 255 },  // Bleu clair
            { r: 144, g: 224, b: 239, alpha: 255 }, // Turquoise
            { r: 0, g: 150, b: 136, alpha: 255 },   // Vert océan
            { r: 0, g: 200, b: 83, alpha: 255 }     // Vert
        ]
    },
    // Palette Coucher de soleil
    SUNSET: {
        name: "Coucher de soleil",
        colors: [
            { r: 255, g: 94, b: 77, alpha: 255 },   // Corail
            { r: 255, g: 154, b: 0, alpha: 255 },   // Orange
            { r: 255, g: 207, b: 64, alpha: 255 },  // Jaune
            { r: 255, g: 99, b: 132, alpha: 255 },  // Rose
            { r: 218, g: 112, b: 214, alpha: 255 }, // Orchidée
            { r: 147, g: 112, b: 219, alpha: 255 }  // Violet
        ]
    }
};

// ============================================================
// TYPES DE GRAPHIQUES
// ============================================================

const CHART_TYPES = {
    PIE: { id: "pie", name: "Camembert (Pie)", icon: "🥧" },
    DOUGHNUT: { id: "doughnut", name: "Anneau (Doughnut)", icon: "🍩" },
    BAR: { id: "bar", name: "Barres verticales", icon: "📊" },
    BAR_HORIZONTAL: { id: "barHorizontal", name: "Barres horizontales", icon: "📈" },
    LINE: { id: "line", name: "Lignes (Line)", icon: "📉" },
    RADAR: { id: "radar", name: "Radar", icon: "🕸️" }
};

// ============================================================
// OPTIONS DE FORMATAGE
// ============================================================

const FORMAT_OPTIONS = {
    PERCENTAGE: "percentage",
    VALUE: "value",
    BOTH: "both"
};

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

function mkColour(rgba) {
    if (!rgba) return Colour.createDefault();
    return Colour.createRGBA8({ r: rgba.r, g: rgba.g, b: rgba.b, alpha: rgba.alpha });
}

function mkFill(rgba) {
    if (!rgba) return FillDescriptor.createNone();
    const solidFill = SolidFill.create(mkColour(rgba));
    return FillDescriptor.createSolid(solidFill, BlendMode.Normal);
}

function addRect(builder, x, y, w, h, fillRgba) {
    if (w <= 0 || h <= 0) return;
    const shape = Shape.create(ShapeType.Rectangle);
    const fill = fillRgba ? mkFill(fillRgba) : FillDescriptor.createNone();
    const shapeDef = ShapeNodeDefinition.create(shape, new Rectangle(x, y, w, h), fill, null, null, null);
    builder.addNode(shapeDef);
}

function addLine(builder, x1, y1, x2, y2, strokeRgba, strokeWidth = 1) {
    // Création d'une ligne via un rectangle fin
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.hypot(dx, dy);
    
    if (length < 0.1) return;
    
    const angle = Math.atan2(dy, dx);
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    
    // Pour les axes horizontaux/verticaux, simplification
    if (Math.abs(angle) < 0.01) {
        addRect(builder, x1, y1 - strokeWidth/2, length, strokeWidth, strokeRgba);
    } else if (Math.abs(angle - Math.PI/2) < 0.01) {
        addRect(builder, x1 - strokeWidth/2, y1, strokeWidth, length, strokeRgba);
    } else {
        // Approximation pour les lignes diagonales
        addRect(builder, centerX - length/2, centerY - strokeWidth/2, length, strokeWidth, strokeRgba);
    }
}

// ============================================================
// DESSIN D'UN SECTEUR DE CAMEMBERT
// ============================================================

function drawPieSlice(builder, centerX, centerY, radius, startDeg, endDeg, fillRgba) {
    if (endDeg <= startDeg) return;
    
    const startRad = startDeg * Math.PI / 180;
    const endRad = endDeg * Math.PI / 180;
    
    try {
        const shape = Shape.create(ShapeType.Pie);
        if (shape) {
            shape.startAngle = startRad;
            shape.endAngle = endRad;
            shape.innerRadius = 0;
            
            const bounds = {
                x: centerX - radius,
                y: centerY - radius,
                width: radius * 2,
                height: radius * 2
            };
            
            const shapeDef = ShapeNodeDefinition.create(
                shape,
                new Rectangle(bounds.x, bounds.y, bounds.width, bounds.height),
                fillRgba ? mkFill(fillRgba) : null,
                null, null, null
            );
            builder.addNode(shapeDef);
            return;
        }
    } catch(e) {
        // Fallback: polygone
    }
    
    // Méthode alternative avec polygone
    const segments = Math.max(12, Math.floor((endDeg - startDeg) / 3));
    const points = [{ x: centerX, y: centerY }];
    
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const angleDeg = startDeg + (endDeg - startDeg) * t;
        const angleRad = angleDeg * Math.PI / 180;
        points.push({
            x: centerX + radius * Math.cos(angleRad),
            y: centerY + radius * Math.sin(angleRad)
        });
    }
    
    // Création des triangles
    for (let i = 1; i < points.length; i++) {
        const p1 = points[i - 1];
        const p2 = points[i];
        const width = Math.abs(p2.x - p1.x);
        const height = Math.abs(p2.y - p1.y);
        if (width > 0.3 && height > 0.3) {
            addRect(builder, p1.x, p1.y, width, height, fillRgba);
        }
    }
}

// ============================================================
// FONCTIONS DE GRAPHIQUES AVANCÉES
// ============================================================

function generatePieChart(builder, data, labels, config) {
    const centerX = config.width / 2;
    const centerY = config.height / 2;
    const radius = Math.min(config.width, config.height) * (config.radius / 100) * 0.5;
    
    let total = data.reduce((sum, val) => sum + val, 0);
    let currentAngle = config.startAngle;
    const sectors = [];
    
    for (let i = 0; i < data.length; i++) {
        const angle = (data[i] / total) * 360;
        const color = config.palette[i % config.palette.length];
        
        drawPieSlice(builder, centerX, centerY, radius, currentAngle, currentAngle + angle, color);
        
        sectors.push({
            label: labels[i],
            value: data[i],
            percentage: (data[i] / total) * 100,
            startAngle: currentAngle,
            endAngle: currentAngle + angle,
            color: color
        });
        
        currentAngle += angle;
    }
    
    // Anneau (doughnut)
    if (config.chartType === CHART_TYPES.DOUGHNUT.id && config.doughnutHole > 0) {
        const holeRadius = radius * (config.doughnutHole / 100);
        drawPieSlice(builder, centerX, centerY, holeRadius, 0, 360, config.backgroundColor || { r: 255, g: 255, b: 255, alpha: 255 });
    }
    
    return sectors;
}

function generateBarChart(builder, data, labels, config) {
    const margin = config.margin;
    const chartX = margin.left;
    const chartY = margin.top;
    const chartWidth = config.width - margin.left - margin.right;
    const chartHeight = config.height - margin.top - margin.bottom;
    
    const maxValue = Math.max(...data, 1);
    const valueRange = maxValue - (config.minValue || 0);
    
    // Axes
    const axisX = chartX;
    const axisY = chartY + chartHeight;
    
    addLine(builder, axisX, chartY, axisX, axisY, config.axisColor, config.axisWidth);
    addLine(builder, axisX, axisY, axisX + chartWidth, axisY, config.axisColor, config.axisWidth);
    
    // Grille horizontale
    if (config.showGrid) {
        const gridLines = Math.min(10, Math.floor(chartHeight / 30));
        for (let i = 1; i <= gridLines; i++) {
            const y = axisY - (i / gridLines) * chartHeight;
            addLine(builder, axisX, y, axisX + chartWidth, y, config.gridColor, config.gridWidth);
        }
    }
    
    // Barres
    const barCount = data.length;
    const barWidth = (chartWidth / barCount) * config.barWidthRatio;
    const barSpacing = (chartWidth / barCount) * (1 - config.barWidthRatio);
    
    const bars = [];
    for (let i = 0; i < barCount; i++) {
        const barHeight = (data[i] / maxValue) * chartHeight;
        const barX = axisX + i * (barWidth + barSpacing) + barSpacing/2;
        const barY = axisY - barHeight;
        const color = config.palette[i % config.palette.length];
        
        addRect(builder, barX, barY, barWidth, barHeight, color);
        
        bars.push({
            label: labels[i],
            value: data[i],
            percentage: (data[i] / maxValue) * 100,
            x: barX,
            y: barY,
            width: barWidth,
            height: barHeight,
            color: color
        });
    }
    
    return bars;
}

function generateHorizontalBarChart(builder, data, labels, config) {
    const margin = config.margin;
    const chartX = margin.left;
    const chartY = margin.top;
    const chartWidth = config.width - margin.left - margin.right;
    const chartHeight = config.height - margin.top - margin.bottom;
    
    const maxValue = Math.max(...data, 1);
    
    // Axes
    const axisX = chartX;
    const axisY = chartY + chartHeight;
    
    addLine(builder, axisX, chartY, axisX, axisY, config.axisColor, config.axisWidth);
    addLine(builder, axisX, axisY, axisX + chartWidth, axisY, config.axisColor, config.axisWidth);
    
    // Barres horizontales
    const barCount = data.length;
    const barHeight = (chartHeight / barCount) * config.barWidthRatio;
    const barSpacing = (chartHeight / barCount) * (1 - config.barWidthRatio);
    
    const bars = [];
    for (let i = 0; i < barCount; i++) {
        const barWidth = (data[i] / maxValue) * chartWidth;
        const barY = chartY + i * (barHeight + barSpacing) + barSpacing/2;
        const barX = axisX;
        const color = config.palette[i % config.palette.length];
        
        addRect(builder, barX, barY, barWidth, barHeight, color);
        
        bars.push({
            label: labels[i],
            value: data[i],
            percentage: (data[i] / maxValue) * 100,
            x: barX,
            y: barY,
            width: barWidth,
            height: barHeight,
            color: color
        });
    }
    
    return bars;
}

function generateLineChart(builder, data, labels, config) {
    const margin = config.margin;
    const chartX = margin.left;
    const chartY = margin.top;
    const chartWidth = config.width - margin.left - margin.right;
    const chartHeight = config.height - margin.top - margin.bottom;
    
    const maxValue = Math.max(...data, 1);
    
    // Axes
    const axisX = chartX;
    const axisY = chartY + chartHeight;
    
    addLine(builder, axisX, chartY, axisX, axisY, config.axisColor, config.axisWidth);
    addLine(builder, axisX, axisY, axisX + chartWidth, axisY, config.axisColor, config.axisWidth);
    
    // Points et lignes
    const points = [];
    const xStep = chartWidth / (data.length - 1);
    
    for (let i = 0; i < data.length; i++) {
        const x = axisX + i * xStep;
        const y = axisY - (data[i] / maxValue) * chartHeight;
        points.push({ x, y, value: data[i], label: labels[i] });
        
        // Point
        if (config.showPoints) {
            const pointSize = config.pointSize;
            addRect(builder, x - pointSize/2, y - pointSize/2, pointSize, pointSize, config.lineColor || config.palette[0]);
        }
    }
    
    // Lignes entre points
    for (let i = 1; i < points.length; i++) {
        addLine(builder, points[i-1].x, points[i-1].y, points[i].x, points[i].y, config.lineColor || config.palette[0], config.lineWidth);
    }
    
    return points;
}

function generateRadarChart(builder, data, labels, config) {
    const centerX = config.width / 2;
    const centerY = config.height / 2;
    const maxRadius = Math.min(config.width, config.height) * 0.35;
    const maxValue = Math.max(...data, 1);
    
    const angles = [];
    const step = (Math.PI * 2) / data.length;
    
    for (let i = 0; i < data.length; i++) {
        angles.push(-Math.PI/2 + i * step);
    }
    
    // Dessin des axes
    for (let i = 0; i < data.length; i++) {
        const x = centerX + maxRadius * Math.cos(angles[i]);
        const y = centerY + maxRadius * Math.sin(angles[i]);
        addLine(builder, centerX, centerY, x, y, config.axisColor, config.axisWidth);
    }
    
    // Dessin des anneaux concentriques
    const rings = [0.2, 0.4, 0.6, 0.8, 1.0];
    for (const ring of rings) {
        const radius = maxRadius * ring;
        // Approximation du cercle avec des rectangles
        for (let i = 0; i < 360; i += 10) {
            const rad = i * Math.PI / 180;
            const x = centerX + radius * Math.cos(rad);
            const y = centerY + radius * Math.sin(rad);
            const nextRad = (i + 10) * Math.PI / 180;
            const nextX = centerX + radius * Math.cos(nextRad);
            const nextY = centerY + radius * Math.sin(nextRad);
            addLine(builder, x, y, nextX, nextY, config.gridColor, config.gridWidth);
        }
    }
    
    // Dessin de la zone radar
    const points = [];
    for (let i = 0; i < data.length; i++) {
        const radius = (data[i] / maxValue) * maxRadius;
        const x = centerX + radius * Math.cos(angles[i]);
        const y = centerY + radius * Math.sin(angles[i]);
        points.push({ x, y, value: data[i], label: labels[i] });
    }
    
    // Lignes de connexion
    for (let i = 0; i < points.length; i++) {
        const next = points[(i + 1) % points.length];
        addLine(builder, points[i].x, points[i].y, next.x, next.y, config.lineColor || config.palette[0], config.lineWidth);
    }
    
    // Points
    if (config.showPoints) {
        for (const point of points) {
            addRect(builder, point.x - 3, point.y - 3, 6, 6, config.lineColor || config.palette[0]);
        }
    }
    
    return points;
}

// ============================================================
// GÉNÉRATION DE LA LÉGENDE
// ============================================================

function generateLegend(builder, items, config) {
    if (!config.showLegend) return;
    
    const legendX = config.legendPosition === "left" ? 20 : config.width - 200;
    const legendY = config.legendY;
    const itemHeight = config.legendItemHeight;
    const colors = config.palette;
    
    for (let i = 0; i < Math.min(items.length, colors.length); i++) {
        const y = legendY + i * itemHeight;
        const color = colors[i % colors.length];
        
        // Rectangle de couleur
        addRect(builder, legendX, y, 15, 15, color);
        
        // Fond pour le label (indicateur visuel)
        let labelText = items[i].label;
        if (config.showValues === FORMAT_OPTIONS.PERCENTAGE && items[i].percentage !== undefined) {
            labelText += ` (${items[i].percentage.toFixed(1)}%)`;
        } else if (config.showValues === FORMAT_OPTIONS.VALUE) {
            labelText += ` (${items[i].value})`;
        } else if (config.showValues === FORMAT_OPTIONS.BOTH && items[i].percentage !== undefined) {
            labelText += ` (${items[i].value} - ${items[i].percentage.toFixed(1)}%)`;
        }
        
        const bgWidth = Math.min(180, labelText.length * 5 + 10);
        addRect(builder, legendX + 20, y, bgWidth, 15, { r: 245, g: 245, b: 245, alpha: 255 });
    }
}

// ============================================================
// IMPORT CSV AVEC DIALOGUE DE SÉLECTION DE FICHIER
// ============================================================

function importCSVFile() {
    return new Promise((resolve, reject) => {
        // Utilisation de l'API fichier d'Affinity
        const dialog = Dialog.create("Importer fichier CSV");
        dialog.initialWidth = 450;
        
        const col = dialog.addColumn();
        const grpFile = col.addGroup("Sélection du fichier");
        const lblFile = grpFile.addStaticText("", "Aucun fichier sélectionné");
        const btnBrowse = grpFile.addButtonSet("", ["Parcourir..."], 0);
        
        const grpPreview = col.addGroup("Aperçu des données");
        const txtPreview = grpPreview.addStaticText("", "");
        txtPreview.isFullWidth = true;
        
        let selectedPath = null;
        
        btnBrowse.doClick = () => {
            // Dans Affinity, l'ouverture de fichier est asynchrone
            // Simulation pour l'exemple
            const path = FileSystemApi.getOpenFileName("CSV Files|*.csv|All Files|*.*");
            if (path) {
                selectedPath = path;
                lblFile.text = path.split("/").pop();
                
                // Lecture du fichier
                const content = FileSystemApi.readAllText(path);
                if (content) {
                    const lines = content.split(/\r?\n/);
                    const preview = lines.slice(0, 5).join("\n");
                    txtPreview.text = preview + (lines.length > 5 ? "\n..." : "");
                }
            }
        };
        
        const result = dialog.runModal();
        if (result.value !== DialogResult.Ok.value || !selectedPath) {
            resolve(null);
            return;
        }
        
        const content = FileSystemApi.readAllText(selectedPath);
        resolve(content);
    });
}

// ============================================================
// PARSER CSV AVANCÉ
// ============================================================

function parseCSV(csvContent) {
    const lines = csvContent.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return null;
    
    // Détection du séparateur
    let separator = ",";
    if (lines[0].includes(";")) separator = ";";
    if (lines[0].includes("\t")) separator = "\t";
    
    const headers = lines[0].split(separator).map(h => h.trim().replace(/^"|"$/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(separator);
        const row = {};
        for (let j = 0; j < headers.length; j++) {
            let value = values[j] ? values[j].trim().replace(/^"|"$/g, '') : '';
            // Conversion en nombre si possible
            const numValue = parseFloat(value);
            row[headers[j]] = isNaN(numValue) ? value : numValue;
        }
        data.push(row);
    }
    
    return { headers, data };
}

// ============================================================
// INTERFACE DE RÉGLAGES AVANCÉS
// ============================================================

function showAdvancedConfigDialog(csvData) {
    const dlg = Dialog.create('Configuration du graphique - Chart Studio');
    dlg.initialWidth = 650;
    dlg.isResizable = true;
    
    const tabs = dlg.addColumn();
    
    // === Onglet Type ===
    const typeGroup = tabs.addGroup("📊 Type de graphique");
    const chartTypeCtrl = typeGroup.addComboBox("Type de graphique", [
        CHART_TYPES.PIE.name,
        CHART_TYPES.DOUGHNUT.name,
        CHART_TYPES.BAR.name,
        CHART_TYPES.BAR_HORIZONTAL.name,
        CHART_TYPES.LINE.name,
        CHART_TYPES.RADAR.name
    ]);
    chartTypeCtrl.selectedIndex = 0;
    
    // === Onglet Données ===
    const dataGroup = tabs.addGroup("📁 Colonnes CSV");
    
    // Sélection de la colonne label
    const labelOptions = csvData.headers;
    const labelCtrl = dataGroup.addComboBox("Colonne des labels", labelOptions);
    labelCtrl.selectedIndex = 0;
    
    // Sélection de la colonne valeur
    const valueCtrl = dataGroup.addComboBox("Colonne des valeurs", labelOptions);
    valueCtrl.selectedIndex = Math.min(1, labelOptions.length - 1);
    
    // === Onglet Couleurs ===
    const colorGroup = tabs.addGroup("🎨 Palette de couleurs");
    const paletteCtrl = colorGroup.addComboBox("Palette", Object.keys(COLOR_PALETTES));
    paletteCtrl.selectedIndex = 0;
    
    // Ordre des couleurs
    const reverseColorsCtrl = colorGroup.addCheckBox("Inverser l'ordre des couleurs", false);
    
    // Couleur de fond
    const bgColorCtrl = colorGroup.addCheckBox("Fond blanc", true);
    
    // === Onglet Dimensions ===
    const sizeGroup = tabs.addGroup("📐 Dimensions");
    const widthCtrl = sizeGroup.addUnitValueEditor("Largeur (px)", "", "", 800, 400, 2000);
    const heightCtrl = sizeGroup.addUnitValueEditor("Hauteur (px)", "", "", 600, 400, 2000);
    
    // === Onglet Axes (pour bar/line) ===
    const axisGroup = tabs.addGroup("📏 Axes et grille");
    const showGridCtrl = axisGroup.addCheckBox("Afficher la grille", true);
    const showAxisCtrl = axisGroup.addCheckBox("Afficher les axes", true);
    const axisColorCtrl = axisGroup.addComboBox("Couleur des axes", ["Gris", "Noir", "Bleu"]);
    
    // === Onglet Légende ===
    const legendGroup = tabs.addGroup("📌 Légende");
    const showLegendCtrl = legendGroup.addCheckBox("Afficher la légende", true);
    const legendPositionCtrl = legendGroup.addComboBox("Position", ["Droite", "Gauche", "Bas"]);
    
    // Format des valeurs
    const valueFormatCtrl = legendGroup.addComboBox("Afficher les valeurs", ["Pourcentage", "Valeur", "Les deux", "Aucun"]);
    
    // === Onglet Avancé pour camembert ===
    const pieGroup = tabs.addGroup("🍩 Options Camembert");
    const radiusCtrl = pieGroup.addUnitValueEditor("Rayon (%)", "", "", 70, 30, 95);
    const doughnutHoleCtrl = pieGroup.addUnitValueEditor("Trou intérieur (%)", "", "", 40, 0, 80);
    const startAngleCtrl = pieGroup.addUnitValueEditor("Angle de départ (°)", "", "", -90, -360, 360);
    
    // === Onglet Avancé pour barres ===
    const barGroup = tabs.addGroup("📊 Options Barres");
    const barWidthRatioCtrl = barGroup.addUnitValueEditor("Largeur des barres (%)", "", "", 70, 30, 90);
    const showValuesOnBarsCtrl = barGroup.addCheckBox("Afficher les valeurs sur les barres", false);
    
    const result = dlg.runModal();
    if (result.value !== DialogResult.Ok.value) return null;
    
    // Récupération des données
    const labelColumn = labelOptions[labelCtrl.selectedIndex];
    const valueColumn = labelOptions[valueCtrl.selectedIndex];
    const labels = csvData.data.map(row => String(row[labelColumn]));
    const values = csvData.data.map(row => {
        const val = row[valueColumn];
        return typeof val === 'number' ? val : parseFloat(val) || 0;
    });
    
    // Palette
    const paletteNames = Object.keys(COLOR_PALETTES);
    const selectedPalette = COLOR_PALETTES[paletteNames[paletteCtrl.selectedIndex]];
    let paletteColors = [...selectedPalette.colors];
    if (reverseColorsCtrl.checked) paletteColors.reverse();
    
    // Type de graphique
    const chartTypeId = Object.values(CHART_TYPES)[chartTypeCtrl.selectedIndex].id;
    
    // Couleur des axes
    const axisColors = {
        "Gris": { r: 150, g: 150, b: 150, alpha: 255 },
        "Noir": { r: 30, g: 30, b: 30, alpha: 255 },
        "Bleu": { r: 18, g: 48, b: 136, alpha: 255 }
    };
    const axisColor = axisColors[axisColorCtrl.text] || axisColors["Gris"];
    
    // Position légende
    const legendPositions = { "Droite": "right", "Gauche": "left", "Bas": "bottom" };
    
    // Format des valeurs
    const valueFormats = {
        "Pourcentage": FORMAT_OPTIONS.PERCENTAGE,
        "Valeur": FORMAT_OPTIONS.VALUE,
        "Les deux": FORMAT_OPTIONS.BOTH,
        "Aucun": null
    };
    
    return {
        chartType: chartTypeId,
        labels: labels,
        values: values,
        palette: paletteColors,
        width: Math.round(widthCtrl.value),
        height: Math.round(heightCtrl.value),
        backgroundColor: bgColorCtrl.checked ? { r: 255, g: 255, b: 255, alpha: 255 } : null,
        showGrid: showGridCtrl.checked,
        showAxes: showAxisCtrl.checked,
        axisColor: axisColor,
        axisWidth: 1,
        gridColor: { r: 220, g: 220, b: 220, alpha: 255 },
        gridWidth: 0.5,
        showLegend: showLegendCtrl.checked,
        legendPosition: legendPositions[legendPositionCtrl.text] || "right",
        legendY: 80,
        legendItemHeight: 25,
        showValues: valueFormats[valueFormatCtrl.text],
        radius: radiusCtrl.value,
        doughnutHole: doughnutHoleCtrl.value,
        startAngle: startAngleCtrl.value,
        barWidthRatio: barWidthRatioCtrl.value / 100,
        showValuesOnBars: showValuesOnBarsCtrl.checked,
        showPoints: true,
        pointSize: 6,
        lineWidth: 2,
        lineColor: paletteColors[0],
        margin: { top: 80, bottom: 80, left: 80, right: 200 }
    };
}

// ============================================================
// GÉNÉRATION PRINCIPALE DU GRAPHIQUE
// ============================================================

function generateChart(config) {
    const doc = Document.current;
    if (!doc) return false;
    
    const builder = AddChildNodesCommandBuilder.create();
    
    // Fond
    if (config.backgroundColor) {
        addRect(builder, 0, 0, config.width, config.height, config.backgroundColor);
    }
    
    // Génération selon le type
    let chartItems = [];
    
    switch (config.chartType) {
        case CHART_TYPES.PIE.id:
        case CHART_TYPES.DOUGHNUT.id:
            chartItems = generatePieChart(builder, config.values, config.labels, config);
            break;
        case CHART_TYPES.BAR.id:
            chartItems = generateBarChart(builder, config.values, config.labels, config);
            break;
        case CHART_TYPES.BAR_HORIZONTAL.id:
            chartItems = generateHorizontalBarChart(builder, config.values, config.labels, config);
            break;
        case CHART_TYPES.LINE.id:
            chartItems = generateLineChart(builder, config.values, config.labels, config);
            break;
        case CHART_TYPES.RADAR.id:
            chartItems = generateRadarChart(builder, config.values, config.labels, config);
            break;
    }
    
    // Légende
    generateLegend(builder, config.labels.map((label, i) => ({
        label: label,
        value: config.values[i],
        color: config.palette[i % config.palette.length]
    })), config);
    
    try {
        const cmd = builder.createCommand(true, NodeChildType.Main);
        doc.executeCommand(cmd);
        return true;
    } catch(e) {
        return false;
    }
}

// ============================================================
// FONCTION PRINCIPALE
// ============================================================

async function main() {
    try {
        // Étape 1: Importer le fichier CSV
        const csvContent = await importCSVFile();
        if (!csvContent) {
            app.alert("Aucun fichier CSV sélectionné.");
            return;
        }
        
        // Étape 2: Parser le CSV
        const csvData = parseCSV(csvContent);
        if (!csvData || csvData.data.length === 0) {
            app.alert("Format CSV invalide. Vérifiez que votre fichier contient des en-têtes et des données.");
            return;
        }
        
        // Étape 3: Configurer le graphique
        const config = showAdvancedConfigDialog(csvData);
        if (!config) return;
        
        // Étape 4: Créer le document
        const opts = NewDocumentOptions.createDefault();
        opts.units = UnitType.Pixel;
        opts.width = config.width;
        opts.height = config.height;
        opts.dpi = 300;
        opts.createArtboard = false;
        
        const doc = Document.create(opts);
        if (!doc) {
            app.alert("Erreur lors de la création du document.");
            return;
        }
        
        // Étape 5: Générer le graphique
        if (generateChart(config)) {
            const chartName = Object.values(CHART_TYPES).find(t => t.id === config.chartType)?.name || config.chartType;
            app.alert(
                "✅ Graphique généré avec succès !\n\n" +
                "📊 Récapitulatif:\n" +
                "• Type: " + chartName + "\n" +
                "• Dimensions: " + config.width + " x " + config.height + " px\n" +
                "• Catégories: " + config.labels.length + "\n" +
                "• Palette: " + (config.palette.length + " couleurs") + "\n\n" +
                "📝 Ajoutez les textes manuellement dans Affinity:\n" +
                "• Les libellés des catégories\n" +
                "• Les valeurs et pourcentages\n" +
                "• Le titre personnalisé\n\n" +
                "💡 Astuce: Utilisez l'outil Texte (T) pour ajouter les labels directement sur les repères colorés."
            );
        } else {
            app.alert("Erreur lors de la génération du graphique.");
        }
    } catch(e) {
        app.alert("Erreur: " + e.message);
    }
}

// Exécution
main();

module.exports.main = main;