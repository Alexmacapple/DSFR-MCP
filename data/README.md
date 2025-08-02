# 📁 Dossier Data

Ce dossier contient les données utilisées par le serveur MCP DSFR.

## Structure

### 📄 dsfr-index.json
Index principal contenant les métadonnées de tous les composants DSFR extraits du code source officiel.

### 📂 dsfr-source/ (non versionné)
Contient les fichiers sources du DSFR extraits et analysés. Ce dossier n'est pas inclus dans le dépôt Git car il contient des milliers de fichiers.

Pour regénérer ces fichiers :
```bash
# Télécharger et extraire le code source DSFR
npm run build:index
```

## Note importante

Les fichiers dans `dsfr-source/` sont générés automatiquement à partir du code source officiel du DSFR et ne doivent pas être modifiés manuellement.
