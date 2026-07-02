# Portfolio – Sitraka Ralamboranto

Portfolio personnel — développeur full stack & machine learning, étudiant en M1 Informatique (IT University, Madagascar).

## Stack

- HTML / CSS / JavaScript vanilla (aucune dépendance)
- Typographie : Space Grotesk · Inter · JetBrains Mono (Google Fonts)
- Navigation « page par page » (clavier, molette, tactile, dots)
- Mode clair / sombre persisté en `localStorage`
- Arrière-plan animé en canvas (réseau de particules), désactivé si `prefers-reduced-motion`

## Structure

```
index.html        # Contenu des 6 pages (hero, à propos, projets, compétences, parcours, contact)
css/style.css     # Design system complet (variables, thèmes, responsive)
js/main.js        # Thème, navigation de pages, animations d'entrée, typewriter
js/background.js  # Canvas de particules d'arrière-plan
assets/           # Images et icônes
```

## Lancer en local

Ouvrir `index.html` dans un navigateur, ou servir le dossier :

```sh
npx serve .
```
