# Mon Programme 🏋️‍♀️

PWA de suivi d'entraînement : on pose son programme type, on coche ce qu'on a vraiment fait, on voit sa semaine.

- **Semaine** : anneau de progression (fait / prévu), séances, minutes, série de jours. Jour par jour repliable, aujourd'hui ouvert par défaut. Une case à cocher = séance validée en un tap (objectif prérempli), re-tap = annulé. Barres de régularité sur 8 semaines.
- **Programme** : les séances types par jour (ou "au choix, sans jour fixe"), avec objectif. 3 modèles de départ (Tout en douceur / Équilibré / Ça pousse) au premier lancement.
- **Journal** : le log réel de chaque séance (valeur, ressenti, note), lié ou non à une séance prévue. Chaque entrée est modifiable.

Détails : thème clair / sombre (auto ou forcé dans les réglages), icônes SVG, suppressions annulables via le toast, cibles tactiles 44px.

Aucun backend : tout reste en `localStorage` sur l'appareil. Export / import JSON dans les réglages pour sauvegarder ou changer d'appareil.

Vanilla JS, pas de build : `index.html` + `app.js` + `style.css`. Servir le dossier statiquement (`python -m http.server`) ou ouvrir `index.html`.
