# 📊 Professional Chart Generator for Affinity

[![Version](https://img.shields.io/badge/version-4.0.0-blue.svg)](https://github.com/busclog/affinity-scripts)
[![Affinity](https://img.shields.io/badge/Affinity-2.x-red.svg)](https://affinity.serif.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> Génère des graphiques professionnels (camemberts, barres, lignes, radar) directement dans Affinity Designer/Publisher à partir de fichiers CSV.

![Demo](docs/images/chart-generator-demo.gif)

## ✨ Fonctionnalités

### 📁 Import CSV
- Sélection de fichier via interface graphique
- Support des séparateurs `,` `;` `\t`
- Aperçu des données avant import
- Détection automatique des colonnes

### 📊 6 Types de graphiques

| Type | Icône | Utilisation |
|------|-------|-------------|
| Camembert (Pie) | 🥧 | Distribution en pourcentage |
| Anneau (Doughnut) | 🍩 | Camembert avec trou central |
| Barres verticales | 📊 | Comparaison de valeurs |
| Barres horizontales | 📈 | Idéal pour longues étiquettes |
| Lignes (Line) | 📉 | Évolution temporelle |
| Radar | 🕸️ | Comparaison multi-critères |

### 🎨 6 Palettes de couleurs

| Palette | Style | Idéal pour |
|---------|-------|-------------|
| Chart.js Original | Moderne et dynamique | Dashboards |
| Corporate BUSCOLOG | Bleu & Jaune | Rapports d'entreprise |
| Pastel Doux | Tons doux | Présentations élégantes |
| Vibrant | Couleurs vives | Supports marketing |
| Monochrome | Niveaux de gris | Impressions pro |
| Océan / Sunset | Thématiques | Thèmes spécifiques |

### ⚙️ Réglages avancés

#### Dimensions
- Largeur / Hauteur personnalisables (400-2000px)

#### Axes et grille
- Afficher/cacher la grille
- Afficher/cacher les axes
- Couleur des axes (Gris/Noir/Bleu)

#### Légende
- Position (Droite/Gauche/Bas)
- Format des valeurs (Pourcentage/Valeur/Les deux/Aucun)
- Hauteur ajustable

#### Camembert
- Rayon (30-95%)
- Trou intérieur pour doughnut (0-80%)
- Angle de départ (-360° à 360°)

#### Barres
- Largeur des barres (30-90%)
- Option d'affichage des valeurs

#### Lignes
- Épaisseur du trait
- Taille des points de données

#### Radar
- Nombre d'anneaux ajustable
- Affichage optionnel des points

## 📥 Installation

### Méthode 1 : Installation directe

1. **Téléchargez** le script `chart-generator.js`
2. **Ouvrez** Affinity Designer ou Publisher
3. **Allez dans** `View → Studio → Scripts`
4. **Cliquez sur** "Add Script" et sélectionnez le fichier

### Méthode 2 : Installation via manifeste

```bash
# Clonez le dépôt
git clone https://github.com/busclog/affinity-scripts.git

# Copiez les scripts dans le dossier Affinity
cp affinity-scripts/*.js ~/Library/Application\ Support/Affinity\ Publisher/Scripts/
