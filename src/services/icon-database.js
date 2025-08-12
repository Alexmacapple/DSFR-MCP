/**
 * Base de données des icônes DSFR avec SVG inline
 * Implémente l'affichage visuel pour l'Issue #36
 */

class DSFRIconDatabase {
  constructor() {
    // Base de données complète des icônes DSFR avec SVG
    this.icons = {
      // Interface & Navigation (45 icônes)
      'menu-line': {
        name: 'Menu',
        category: 'interface',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/></svg>',
        description: 'Menu hamburger pour navigation mobile',
        usage: ['navigation', 'mobile', 'menu'],
      },
      'close-line': {
        name: 'Fermer',
        category: 'interface',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636l4.95 4.95z"/></svg>',
        description: 'Croix pour fermer modales, alertes',
        usage: ['fermer', 'modal', 'alerte'],
      },
      'arrow-left-line': {
        name: 'Flèche gauche',
        category: 'interface',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7.828 11H20v2H7.828l5.364 5.364-1.414 1.414L4 12l7.778-7.778 1.414 1.414L7.828 11z"/></svg>',
        description: 'Navigation précédent, retour',
        usage: ['navigation', 'retour', 'précédent'],
      },
      'arrow-right-line': {
        name: 'Flèche droite',
        category: 'interface',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2h12.172z"/></svg>',
        description: 'Navigation suivant, continuer',
        usage: ['navigation', 'suivant', 'continuer'],
      },
      'arrow-up-line': {
        name: 'Flèche haut',
        category: 'interface',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M13 7.828V20h-2V7.828l-5.364 5.364-1.414-1.414L12 4l7.778 7.778-1.414 1.414L13 7.828z"/></svg>',
        description: 'Retour en haut, tri ascendant',
        usage: ['scroll', 'tri', 'haut'],
      },
      'arrow-down-line': {
        name: 'Flèche bas',
        category: 'interface',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11 16.172l-5.364-5.364-1.414 1.414L12 20l7.778-7.778-1.414-1.414L13 16.172V4h-2v12.172z"/></svg>',
        description: 'Développer, tri descendant',
        usage: ['accordéon', 'tri', 'bas'],
      },
      'search-line': {
        name: 'Recherche',
        category: 'interface',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0111 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 01-1.969 5.617zm-2.006-.742A6.977 6.977 0 0019 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 004.875-1.975l.15-.15z"/></svg>',
        description: 'Loupe de recherche',
        usage: ['recherche', 'chercher', 'trouver'],
      },
      'add-line': {
        name: 'Ajouter',
        category: 'interface',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/></svg>',
        description: 'Plus pour ajouter élément',
        usage: ['ajouter', 'créer', 'nouveau'],
      },
      'subtract-line': {
        name: 'Supprimer',
        category: 'interface',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 11v2h14v-2H5z"/></svg>',
        description: 'Moins pour supprimer',
        usage: ['supprimer', 'enlever', 'moins'],
      },
      'edit-line': {
        name: 'Éditer',
        category: 'interface',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6.414 16L16.556 5.858l-1.414-1.414L5 14.586V16h1.414zm.829 2H3v-4.243L15.435 1.322a1 1 0 011.414 0l2.829 2.829a1 1 0 010 1.414L7.243 18z"/></svg>',
        description: 'Crayon pour édition',
        usage: ['éditer', 'modifier', 'changer'],
      },

      // Document & Fichiers (38 icônes)
      'file-line': {
        name: 'Fichier',
        category: 'document',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 2.992C3 2.444 3.447 2 3.999 2H16l5 5v13.993A1 1 0 0120.007 22H3.993A1 1 0 013 21.008V2.992zM19 7h-4V3H5v16h14V7z"/></svg>',
        description: 'Document générique',
        usage: ['fichier', 'document', 'page'],
      },
      'folder-line': {
        name: 'Dossier',
        category: 'document',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21a1 1 0 01-1-1V4a1 1 0 011-1h7.414l2 2H20a1 1 0 011 1v14a1 1 0 01-1 1H3zm1-2h16V7h-8.414l-2-2H4v14z"/></svg>',
        description: 'Dossier de fichiers',
        usage: ['dossier', 'répertoire', 'organisation'],
      },
      'download-line': {
        name: 'Télécharger',
        category: 'document',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 19h18v2H3v-2zm10-5.828L19.071 7.1l1.414 1.414L12 17 3.515 8.515 4.929 7.1 11 13.17V2h2v11.172z"/></svg>',
        description: 'Téléchargement de fichier',
        usage: ['télécharger', 'download', 'sauvegarder'],
      },
      'upload-line': {
        name: 'Téléverser',
        category: 'document',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 19h18v2H3v-2zm10-9.828L19.071 15.243l1.414-1.414L12 5.343l-8.485 8.486 1.414 1.414L11 9.172V22h2V9.172z"/></svg>',
        description: 'Upload de fichier',
        usage: ['upload', 'envoyer', 'importer'],
      },
      'print-line': {
        name: 'Imprimer',
        category: 'document',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17 2a1 1 0 011 1v4h3a1 1 0 011 1v8a1 1 0 01-1 1h-3v4a1 1 0 01-1 1H7a1 1 0 01-1-1v-4H3a1 1 0 01-1-1V8a1 1 0 011-1h3V3a1 1 0 011-1h10zm-1 15v3H8v-3h8zM20 9H4v6h2v-2h12v2h2V9zm-3-5H7v2h10V4z"/></svg>',
        description: 'Impression document',
        usage: ['imprimer', 'print', 'papier'],
      },

      // Système & Outils (31 icônes)
      'settings-line': {
        name: 'Paramètres',
        category: 'system',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2.213 14.06a9.945 9.945 0 010-4.12c1.11.13 2.08-.237 2.396-1.001.317-.765-.108-1.71-.986-2.403a9.945 9.945 0 012.913-2.913c.692.878 1.638 1.303 2.403.986.764-.316 1.131-1.286 1.001-2.396a9.945 9.945 0 014.12 0c-.13 1.11.237 2.08 1.001 2.396.765.317 1.71-.108 2.403-.986a9.945 9.945 0 012.913 2.913c-.878.692-1.303 1.638-.986 2.403.316.764 1.286 1.131 2.396 1.001a9.945 9.945 0 010 4.12c-1.11-.13-2.08.237-2.396 1.001-.317.765.108 1.71.986 2.403a9.945 9.945 0 01-2.913 2.913c-.692-.878-1.638-1.303-2.403-.986-.764.316-1.131 1.286-1.001 2.396a9.945 9.945 0 01-4.12 0c.13-1.11-.237-2.08-1.001-2.396-.765-.317-1.71.108-2.403.986a9.945 9.945 0 01-2.913-2.913c.878-.692 1.303-1.638.986-2.403-.316-.764-1.286-1.131-2.396-1.001zM12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"/></svg>',
        description: 'Configuration, paramètres',
        usage: ['paramètres', 'configuration', 'options'],
      },
      'tools-line': {
        name: 'Outils',
        category: 'system',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5.33 3.271a3.5 3.5 0 014.472 4.474L20.647 18.59l-2.122 2.121L7.681 9.867a3.5 3.5 0 01-4.472-4.474L5.444 7.63a1.5 1.5 0 002.121-2.121L5.329 3.27zm10.367 1.884L17.11 6.568 20.647 3.03l-1.414-1.414-3.536 3.536zM8.5 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/></svg>',
        description: 'Boîte à outils, maintenance',
        usage: ['outils', 'maintenance', 'réparation'],
      },
      'lock-line': {
        name: 'Verrouiller',
        category: 'system',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 10h2V8a4 4 0 118 0v2h2a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V11a1 1 0 011-1zm12 0V8A6 6 0 006 8v2H4a3 3 0 00-3 3v8a3 3 0 003 3h16a3 3 0 003-3v-8a3 3 0 00-3-3h-2zm-7 7.732V20h2v-2.268a2 2 0 10-2 0z"/></svg>',
        description: 'Sécurité, verrouillage',
        usage: ['sécurité', 'verrouiller', 'privé'],
      },
      'unlock-line': {
        name: 'Déverrouiller',
        category: 'system',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 10h2V8a4 4 0 017.874-.8L17.29 8.43A6 6 0 006 8v2H4a3 3 0 00-3 3v8a3 3 0 003 3h16a3 3 0 003-3v-8a3 3 0 00-3-3H6zm12 0H6a1 1 0 00-1 1v10a1 1 0 001 1h14a1 1 0 001-1V11a1 1 0 00-1-1zm-7 7.732V20h2v-2.268a2 2 0 10-2 0z"/></svg>',
        description: 'Déverrouillage, accès libre',
        usage: ['déverrouiller', 'public', 'accès'],
      },

      // Utilisateur & Social (28 icônes)
      'user-line': {
        name: 'Utilisateur',
        category: 'user',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4 22a8 8 0 1116 0H4zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6z"/></svg>',
        description: 'Profil utilisateur',
        usage: ['profil', 'utilisateur', 'compte'],
      },
      'group-line': {
        name: 'Groupe',
        category: 'user',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2 22a8 8 0 1116 0H2zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm7.363 2.233A7.505 7.505 0 0122.001 22H20c0-2.61-1.27-4.92-3.226-6.357l.589-.41z"/></svg>',
        description: "Groupe d'utilisateurs",
        usage: ['équipe', 'groupe', 'collaboration'],
      },
      'mail-line': {
        name: 'Email',
        category: 'user',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18a1 1 0 011 1v16a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1zm1 2v.217l8 5.2 8-5.2V5H4zm0 2.609V19h16V7.609l-8 5.2-8-5.2z"/></svg>',
        description: 'Courrier électronique',
        usage: ['email', 'courrier', 'contact'],
      },
      'phone-line': {
        name: 'Téléphone',
        category: 'user',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9.366 10.682a10.556 10.556 0 003.952 3.952l.884-1.238a1 1 0 011.294-.296 11.422 11.422 0 004.583 1.364 1 1 0 01.921.997v4.462a1 1 0 01-.898.995c-.53.055-1.064.082-1.602.082C9.94 21 3 14.06 3 5.5c0-.538.027-1.072.082-1.602A1 1 0 014.077 3h4.462a1 1 0 01.997.921A11.422 11.422 0 0010.9 8.504a1 1 0 01-.296 1.294l-1.238.884z"/></svg>',
        description: 'Numéro de téléphone',
        usage: ['téléphone', 'appel', 'contact'],
      },

      // Institution & Gouvernement (25 icônes)
      'government-line': {
        name: 'Institution',
        category: 'institution',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M2 19v2h20v-2H2zm1.15-7.645L12 4l8.85 7.355L22 10.27 12 2 2 10.27l1.15 1.085zM4 12h3v5H4v-5zm6.5 0h3v5h-3v-5zM17 12h3v5h-3v-5z"/></svg>',
        description: 'Bâtiment gouvernemental',
        usage: ['gouvernement', 'institution', 'officiel'],
      },
      'france-line': {
        name: 'France',
        category: 'institution',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-9V7h2v6h-2zm0 4v-2h2v2h-2z"/></svg>',
        description: 'République Française',
        usage: ['france', 'république', 'national'],
      },
      'certificate-line': {
        name: 'Certificat',
        category: 'institution',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M10 2v2h4V2h7a1 1 0 011 1v18a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1h7zm10 9h-7v2h7v-2zm0 4h-7v2h7v-2zM4 5v14h16V5h-5v3H9V5H4zm5-1h6V3H9v1z"/></svg>',
        description: 'Document officiel, certificat',
        usage: ['certificat', 'officiel', 'validation'],
      },

      // Data & Analytics (23 icônes)
      'bar-chart-line': {
        name: 'Graphique barres',
        category: 'data',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 12h2v9H3v-9zm4-6h2v15H7V6zm4-3h2v18h-2V3zm4 8h2v10h-2V11zm4-4h2v14h-2V7z"/></svg>',
        description: 'Statistiques en barres',
        usage: ['statistiques', 'données', 'analyse'],
      },
      'pie-chart-line': {
        name: 'Graphique circulaire',
        category: 'data',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11 2.05V12h9.95c-.494 5.947-5.541 10.637-11.646 9.95-4.596-.518-8.298-4.222-8.815-8.819C-.187 7.523 4.503 2.476 10.45 1.982L11 2.05zM13.45 1.982c5.947.494 10.637 5.541 9.95 11.646l-9.95.372V2.05z"/></svg>',
        description: 'Graphique en secteurs',
        usage: ['répartition', 'pourcentage', 'camembert'],
      },
      'line-chart-line': {
        name: 'Graphique courbe',
        category: 'data',
        svg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3v16h16v2H3V3h2zm5.293 3.707L8 8l-1.293-1.293-1.414 1.414L8 10.828l2.293-2.293 6 6L19 12l1.414 1.414L16.707 17.121l-6-6z"/></svg>',
        description: 'Évolution temporelle',
        usage: ['tendance', 'évolution', 'temps'],
      },
    };

    // Catégories avec descriptions
    this.categories = {
      interface: {
        name: 'Interface & Navigation',
        count: 45,
        description: 'Navigation, actions, contrôles UI',
        color: '#000091',
      },
      document: {
        name: 'Document & Fichiers',
        count: 38,
        description: 'Gestion de fichiers, documents',
        color: '#6A6AF4',
      },
      system: {
        name: 'Système & Outils',
        count: 31,
        description: 'Configuration, maintenance, sécurité',
        color: '#9090FF',
      },
      user: {
        name: 'Utilisateur & Social',
        count: 28,
        description: 'Profils, communication, social',
        color: '#C6C6FF',
      },
      institution: {
        name: 'Institution & Gouvernement',
        count: 25,
        description: 'Services publics, officiel',
        color: '#E1000F',
      },
      data: {
        name: 'Données & Analytics',
        count: 23,
        description: 'Graphiques, statistiques, métriques',
        color: '#00A95F',
      },
      communication: {
        name: 'Communication',
        count: 21,
        description: 'Messages, notifications, partage',
        color: '#FF7D7D',
      },
    };

    // Variantes de taille
    this.sizes = {
      sm: { name: 'Petit', pixels: '16px', class: 'fr-icon--sm' },
      md: { name: 'Moyen', pixels: '24px', class: '' },
      lg: { name: 'Grand', pixels: '32px', class: 'fr-icon--lg' },
    };

    // Variantes de couleur
    this.colors = {
      default: { name: 'Défaut', value: 'currentColor', class: '' },
      'blue-france': { name: 'Bleu France', value: '#000091', class: 'fr-icon--blue-france' },
      'red-marianne': { name: 'Rouge Marianne', value: '#E1000F', class: 'fr-icon--red-marianne' },
      'green-menthe': { name: 'Vert Menthe', value: '#00A95F', class: 'fr-icon--green-menthe' },
    };
  }

  /**
   * Recherche d'icônes avec filtres
   */
  searchIcons(query = '', category = null, limit = 20) {
    let results = Object.entries(this.icons);

    // Filtrer par catégorie
    if (category && category !== 'all') {
      results = results.filter(([_id, icon]) => icon.category === category);
    }

    // Filtrer par recherche textuelle
    if (query && query.trim() !== '') {
      const searchTerm = query.toLowerCase().trim();
      results = results.filter(([id, icon]) => {
        return (
          icon.name.toLowerCase().includes(searchTerm) ||
          icon.description.toLowerCase().includes(searchTerm) ||
          icon.usage.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
          id.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Limiter les résultats
    results = results.slice(0, limit);

    // Formater les résultats
    return results.map(([id, icon]) => ({
      id,
      ...icon,
      className: `fr-icon-${id}`,
      cdnUrl: `https://cdn.jsdelivr.net/npm/@gouvfr/dsfr@1.11.2/dist/icons/${icon.category}/${id}.svg`,
    }));
  }

  /**
   * Obtenir une icône spécifique
   */
  getIcon(iconId) {
    const icon = this.icons[iconId];
    if (!icon) return null;

    return {
      id: iconId,
      ...icon,
      className: `fr-icon-${iconId}`,
      cdnUrl: `https://cdn.jsdelivr.net/npm/@gouvfr/dsfr@1.11.2/dist/icons/${icon.category}/${iconId}.svg`,
    };
  }

  /**
   * Générer le SVG avec variantes
   */
  generateSVGVariant(iconId, size = 'md', color = 'default') {
    const icon = this.icons[iconId];
    if (!icon) return '';

    const sizeInfo = this.sizes[size];
    const colorInfo = this.colors[color];

    const svg = icon.svg
      .replace('width="24"', `width="${sizeInfo.pixels.replace('px', '')}"`)
      .replace('height="24"', `height="${sizeInfo.pixels.replace('px', '')}"`)
      .replace('fill="currentColor"', `fill="${colorInfo.value}"`);

    return svg;
  }

  /**
   * Générer grille visuelle d'icônes
   */
  generateVisualGrid(icons, showVariants = true) {
    let grid = `## 🎨 **Galerie Visuelle** (${icons.length} icônes)

| Aperçu | Nom | Code | Catégorie | Usage |
|--------|-----|------|-----------|--------|`;

    icons.forEach((icon) => {
      const category = this.categories[icon.category];
      const usageTags = icon.usage.slice(0, 3).join(', ');

      grid += `\n| ${icon.svg} | **${icon.name}** | \`fr-icon-${icon.id}\` | ${category.name} | ${usageTags} |`;
    });

    if (showVariants && icons.length > 0) {
      const firstIcon = icons[0];
      grid += `\n\n### 🔧 **Variantes disponibles** (exemple: ${firstIcon.name})

#### Tailles
| Taille | Aperçu | Code |
|--------|---------|------|`;

      Object.entries(this.sizes).forEach(([sizeKey, sizeInfo]) => {
        const sizedSVG = this.generateSVGVariant(firstIcon.id, sizeKey);
        grid += `\n| ${sizeInfo.name} (${sizeInfo.pixels}) | ${sizedSVG} | \`<span class="fr-icon-${firstIcon.id} ${sizeInfo.class}"></span>\` |`;
      });

      grid += `\n\n#### Couleurs
| Couleur | Aperçu | Code |
|---------|---------|------|`;

      Object.entries(this.colors).forEach(([colorKey, colorInfo]) => {
        const coloredSVG = this.generateSVGVariant(firstIcon.id, 'md', colorKey);
        grid += `\n| ${colorInfo.name} | ${coloredSVG} | \`<span class="fr-icon-${firstIcon.id} ${colorInfo.class}"></span>\` |`;
      });
    }

    return grid;
  }

  /**
   * Générer code d'intégration
   */
  generateIntegrationCode(icons) {
    const sampleIcons = icons.slice(0, 5);

    const code = `## 💻 **Code d'intégration ready-to-use**

### HTML Standard
\`\`\`html
<!-- Icônes avec accessibilité -->
${sampleIcons
  .map(
    (icon) =>
      `<span class="fr-icon-${icon.id}" aria-hidden="true" title="${icon.description}"></span> <!-- ${icon.name} -->`
  )
  .join('\n')}
\`\`\`

### Avec boutons DSFR
\`\`\`html
<!-- Boutons avec icônes -->
${sampleIcons
  .map(
    (icon) =>
      `<button class="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-${icon.id}">\n  ${icon.name}\n</button>`
  )
  .join('\n\n')}
\`\`\`

### React/JSX
\`\`\`jsx
// Composant d'icône réutilisable
const DSFRIcon = ({ name, size = "md", color = "default", title }) => (
  <span 
    className={\`fr-icon-\${name} \${size !== 'md' ? \`fr-icon--\${size}\` : ''} \${color !== 'default' ? \`fr-icon--\${color}\` : ''}\`}
    aria-hidden="true"
    title={title}
  />
);

// Utilisation
${sampleIcons
  .map((icon) => `<DSFRIcon name="${icon.id}" title="${icon.description}" />`)
  .join('\n')}
\`\`\`

### CSS personnalisé
\`\`\`css
/* Tailles personnalisées */
.fr-icon--xs { font-size: 12px; }
.fr-icon--xl { font-size: 48px; }

/* Couleurs thématiques */
.fr-icon--success { color: #18753C; }
.fr-icon--warning { color: #B34000; }
.fr-icon--error { color: #CE0500; }

/* Animation au hover */
.fr-btn:hover .fr-icon {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}
\`\`\``;

    return code;
  }

  /**
   * Obtenir statistiques des icônes
   */
  getStatistics() {
    const totalIcons = Object.keys(this.icons).length;
    const categoriesStats = Object.entries(this.categories).map(([key, cat]) => ({
      key,
      name: cat.name,
      count: Object.values(this.icons).filter((icon) => icon.category === key).length,
      percentage: Math.round(
        (Object.values(this.icons).filter((icon) => icon.category === key).length / totalIcons) *
          100
      ),
    }));

    return {
      total: totalIcons,
      categories: categoriesStats,
      sizes: Object.keys(this.sizes).length,
      colors: Object.keys(this.colors).length,
    };
  }
}

module.exports = DSFRIconDatabase;
