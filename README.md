# TradeCalc

Application de chantier pour les gens de métier (vitriers, menuisiers, ébénistes…) : calculs en pouces et en millimètres, sur le téléphone, même sans réseau.

**Adresse :** https://plouffelul.github.io/vit_app/

C'est une application web installable (PWA). On l'ajoute à l'écran d'accueil depuis le navigateur, sans passer par l'App Store ni le Play Store. Elle s'ouvre ensuite en plein écran comme une vraie application et fonctionne hors ligne.

## Les outils

On passe d'un outil à l'autre avec le menu ☰ en haut à gauche.

### Calculatrice

Calculatrice + − × ÷ qui mélange pouces et millimètres dans le même calcul, par exemple `5 5/16" + 254 mm`.

- **Clavier en pouces :** trois pavés. Celui de gauche pour le nombre entier, celui en haut à droite pour le numérateur et celui en bas à droite pour le dénominateur. Pour 24 5/16" : 2 et 4 à gauche, 5 en haut, puis 1 et 6 en bas.
- **Clavier en mm :** un seul pavé, avec la virgule.
- Le bouton **pouces / mm** change de clavier sans effacer le nombre déjà tapé.
- Chaque pavé a son propre **⌫**, qui efface seulement son dernier chiffre.
- Après × ou ÷, le nombre est un simple multiplicateur sans unité : `24" ÷ 3` donne 8".
- Le résultat s'affiche en direct en **impérial** (fraction simplifiée) et en **métrique**. Pas besoin de touche `=` : pour continuer à partir du résultat, on tape simplement un opérateur.
- **C** efface le calcul et le range dans l'**Historique**. Toucher une ligne de l'historique réutilise son résultat.

### Cacher le clavier

Dans chaque outil, la petite barre en haut du clavier sert de poignée : on la glisse vers le bas pour cacher le clavier et voir plus de résultats, puis vers le haut pour le ramener. Un simple toucher sur la barre fonctionne aussi.

### Diviseur de longueur

On entre une longueur totale et un nombre de repères (trous, montants, marques…). L'application donne l'espacement et la position de chaque repère, mesurée depuis le début, à espacement égal et sans repère aux bouts.

Exemple : 20" et 4 repères donnent un espacement de 4", et des repères à 4, 8, 12 et 16".

### Diagonale d'angle

On entre deux côtés (L et W) et l'angle voulu entre eux. L'application donne la diagonale à mesurer entre les bouts de L et de W pour obtenir cet angle. L'angle doit être entre 0° et 180°.

Exemple : L = 22", W = 31", angle de 120° : la diagonale est de 46 1/8".

## Arrondi

Le bouton en haut à droite (par exemple `1/16 ≈`) choisit comment les fractions sont arrondies :

- **Précision :** 1/64, 1/32, 1/16, 1/8, 1/4, 1/2 ou pouce entier.
- **Direction :** au plus proche, vers le haut ou vers le bas.

Sous chaque résultat, l'**écart** indique la différence entre la fraction affichée et la valeur exacte (par exemple « écart +0,3 mm »). Les millimètres, eux, ne sont jamais arrondis à la fraction.

L'arrondi, le thème (clair ou sombre, dans le menu ☰) et l'historique restent enregistrés sur le téléphone.

## Installer sur le téléphone

Ouvrir l'adresse de l'application une première fois avec du réseau, puis :

- **iPhone :** dans **Safari**, bouton Partager, puis **« Sur l'écran d'accueil »**.
- **Android :** dans **Chrome**, menu ⋮, puis **« Installer l'application »** (ou « Ajouter à l'écran d'accueil »).

L'application fonctionne ensuite hors ligne. Les mises à jour s'installent d'elles-mêmes la prochaine fois qu'elle est ouverte avec du réseau.

## Développement

React + TypeScript avec Vite. `vite-plugin-pwa` gère l'installation et le mode hors ligne, et Vitest les tests.

```sh
npm install
npm run dev      # serveur de développement
npm test         # tests unitaires
npm run build    # version de production dans dist/
npm run preview  # sert la version de production en local
```

Toute mesure est gardée en interne en millimètres (1" = 25,4 mm). La conversion en fraction se fait seulement à l'affichage.

```
src/
  lib/          logique pure, testée : conversions et arrondi (mesure.ts),
                calculs (calcul.ts), saisie au clavier (saisie.ts)
  components/   Clavier, Resultat, ChoixArrondi, PanneauArrondi, MenuLateral
  pages/        un fichier par outil : Calculatrice, Diviseur, Diagonale
  hooks/        useReglages : arrondi, thème et historique (localStorage)
  App.tsx       en-tête, menu et liste des outils
```

Pour ajouter un outil : créer une page dans `src/pages/` et l'ajouter à la liste `OUTILS` dans `App.tsx`.
