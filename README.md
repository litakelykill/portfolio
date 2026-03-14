# Portfolio – Prénom Nom

> Portfolio personnel développé en HTML · CSS · JavaScript vanilla, déployé sur **GitHub Pages**.

**🔗 Démo live :** [https://tonprofil.github.io/portfolio](https://tonprofil.github.io/portfolio)

---

## ✨ Fonctionnalités

- **One-page** avec navigation fluide et navbar active au scroll
- **Hero** avec photo, accroche et call-to-action
- **Section Projets** en cards avec images et liens GitHub/démo
- **Stack technique** organisée par catégorie
- **Timeline de parcours** (formations + expériences)
- **Contact** avec lien email, GitHub, LinkedIn, CV PDF
- **Responsive** mobile-first (burger menu)
- **Animations** au scroll via `IntersectionObserver` (aucune dépendance)

---

## 🚀 Déployer sur GitHub Pages

1. **Fork ou clone** ce dépôt
2. Va dans **Settings → Pages**
3. Source : `Deploy from a branch` → branche `main` → dossier `/root`
4. Sauvegarde → ton portfolio sera en ligne sous 2 minutes

---

## 📁 Structure du projet

```
portfolio/
├── index.html              # Page principale
├── css/
│   └── style.css           # Tous les styles (CSS variables, responsive)
├── js/
│   └── main.js             # Animations, navbar, burger menu
├── assets/
│   ├── images/
│   │   ├── avatar.jpg      # Ta photo (remplace ce fichier)
│   │   ├── project1.jpg    # Captures de tes projets
│   │   ├── project2.jpg
│   │   └── project3.jpg
│   └── cv.pdf              # Ton CV à télécharger
└── README.md
```

---

## 🎨 Personnalisation rapide

| Ce que tu veux changer | Où le faire |
|---|---|
| Nom, bio, email | `index.html` (cherche `Prénom Nom`) |
| Couleur principale | `css/style.css` → variable `--accent` |
| Polices | balise `<link>` dans le `<head>` de `index.html` |
| Ajouter un projet | Dupliquer un bloc `<article class="project-card">` |
| Photo | Remplace `assets/images/avatar.jpg` |

---

## 🛠️ Choix techniques

- **HTML / CSS / JS vanilla** : zéro dépendance, chargement ultra-rapide, lisible par tout recruteur
- **CSS custom properties** : thème cohérent modifiable en un seul endroit
- **IntersectionObserver** : animations au scroll natives, sans bibliothèque
- **Google Fonts** : Syne (titres) + DM Sans (corps) — lisibles et distinctifs
- **GitHub Pages** : déploiement gratuit, HTTPS automatique

---

## 📄 Licence

MIT — libre d'utilisation et de modification.
