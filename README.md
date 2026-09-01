# Mon Programme 🏋️‍♀️

PWA de suivi d'entraînement : on pose son programme type, on coche ce qu'on a vraiment fait, on voit sa semaine.

- **Semaine** : anneau de progression (fait / prévu), séances, minutes, série de jours. Jour par jour repliable, aujourd'hui ouvert par défaut. Une case à cocher = séance validée en un tap (objectif prérempli), re-tap = annulé. Barres de régularité sur 8 semaines.
- **Programme** : les séances types par jour, "au choix sans jour fixe", ou **ponctuelles à une date précise** (une rando le 12, un cours d’essai). 3 modèles de départ (Tout en douceur / Équilibré / Ça pousse) au premier lancement.
- **Journal** : le log réel de chaque séance (valeur, ressenti, note), lié ou non à une séance prévue. Chaque entrée est modifiable.

On peut naviguer librement vers les semaines suivantes pour planifier à l’avance : la semaine future affiche le plan (séances et volume visés) au lieu du score, et les séances à venir ne sont pas cochables tant que le jour n’est pas arrivé.

Les activités (emoji, nom, unité, couleur) se créent, se modifient et se suppriment depuis Réglages > Gérer mes activités. Supprimer une activité supprime en cascade ce qui l’utilise, avec annulation possible.

Détails : thème clair / sombre (auto ou forcé dans les réglages), icônes SVG, suppressions annulables via le toast, cibles tactiles 44px.

Aucun backend : tout reste en `localStorage` sur l'appareil. Export / import JSON dans les réglages pour sauvegarder ou changer d'appareil.

Vanilla JS, pas de build : `index.html` + `app.js` + `style.css`. Servir le dossier statiquement (`python -m http.server`) ou ouvrir `index.html`.
