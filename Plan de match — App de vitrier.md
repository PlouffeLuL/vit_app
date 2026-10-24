# Plan de match — App de vitrier

Oct 21, 2026 · @Jonathan

## Vue d'ensemble

On bâtit ce soir une application de vitrier installable sur téléphone, avec deux outils : une calculatrice pouces/millimètres et un diviseur de longueur.

- **Utilisateurs :** Jonathan et ses amis du métier, sur iPhone et Android.
- **Format :** application web installable (PWA), ajoutée à l'écran d'accueil, qui fonctionne sans réseau sur le chantier. Pas d'App Store.
- **Technologie :** React + TypeScript (projet Vite), avec le plugin PWA pour l'installation et le mode hors ligne.
- **Principe :** le clavier, l'affichage du résultat et la logique de calcul sont partagés entre les outils, pour éviter de répéter le code.

## Architecture

Toute mesure est stockée en interne en millimètres (nombre décimal); la conversion en fraction se fait seulement à l'affichage. 1 pouce = 25,4 mm.

```
src/
  lib/
    mesure.ts        // conversions po <-> mm, fractions, arrondi
    calcul.ts        // évaluation d'une expression (+ − × ÷)
    mesure.test.ts   // tests unitaires (Vitest)
  components/
    Clavier.tsx      // clavier 3 pavés + bouton po/mm
    Resultat.tsx     // résultat mm + fraction, arrondi, écart
    ChoixArrondi.tsx // précision + direction
    MenuLateral.tsx  // menu hamburger qui glisse de la gauche
  pages/
    Calculatrice.tsx
    Diviseur.tsx
  hooks/
    useReglages.ts   // arrondi, thème, historique (localStorage)
  App.tsx            // en-tête + menu + page active
```

- **Clavier :** composant réutilisé tel quel dans les deux outils. Il produit une valeur (entier + numérateur/dénominateur, ou millimètres).
- **Resultat :** composant réutilisé pour afficher toute mesure en mm et en fraction.
- **Navigation :** bouton à trois lignes en haut à gauche; un tiroir glisse de la gauche avec la liste des outils et le choix du thème. Ajouter un outil = ajouter une page et une ligne au menu.

## Outil 1 : calculatrice pouces/millimètres

Une calculatrice standard (+, −, ×, ÷) qui accepte des fractions de pouce et des millimètres dans le même calcul, par exemple 1 3/4" + 12 mm.

**Clavier (inspiré de l'image envoyée)**

- Mode pouces : pavé de gauche pour le nombre entier, pavé en haut à droite pour le numérateur, pavé en bas à droite pour le dénominateur. Ex. : 24, puis 3 en haut et 4 en bas = 24 3/4".
- Bouton en haut pour basculer pouces ↔ millimètres. En mode mm, les pavés de fraction disparaissent : un seul pavé avec virgule décimale.
- Rangée du bas : + − × ÷ =, plus effacer (C) et retour arrière.
- Chaque nombre garde son unité à l'écran, ex. « 24 3/4" + 12 mm ».

**Affichage du résultat**

- Une ligne en millimètres et une ligne en fraction.
- À côté de la fraction : précision d'arrondi (1/64, 1/32, 1/16, 1/8, 1/4, 1/2, pouce entier) et direction (vers le haut, vers le bas, au plus proche; par défaut au plus proche).
- L'écart d'arrondi est affiché, ex. « +0,3 mm ».
- La fraction est simplifiée (8/16 devient 1/2).

**Historique**

- Liste des calculs passés (expression + résultat), accessible par un bouton près de l'affichage.
- Toucher une ligne réutilise son résultat; bouton pour vider l'historique.

## Outil 2 : diviseur de longueur

On entre une longueur totale et un nombre de trous; l'application donne la position de chaque trou, à espacement exactement égal, sans trou aux bouts.

- **Entrée :** la longueur avec le même clavier à trois pavés (pouces ou mm), puis le nombre de trous.
- **Calcul :** espacement = longueur ÷ (nombre de trous + 1). Position du trou n = n × espacement, mesurée à partir du début.
- **Exemple :** 20" et 4 trous → espacement 4" → trous à 4, 8, 12 et 16".
- **Sortie :** une liste des positions, chacune en mm et en fraction, avec le même composant d'affichage et le même arrondi que la calculatrice. On affiche aussi l'espacement.
- **Aucune épaisseur** de séparation n'est prise en compte.

## Réglages et mémoire

Les choix de l'utilisateur sont gardés d'une fois à l'autre sur le téléphone (localStorage).

| Réglage | Valeurs | Par défaut |
| --- | --- | --- |
| Précision d'arrondi | 1/64, 1/32, 1/16, 1/8, 1/4, 1/2, 1" | 1/16 |
| Direction d'arrondi | haut, bas, plus proche | plus proche |
| Thème | clair, sombre (tons de gris) | clair |
| Historique | liste des calculs | vide |

Le choix du thème se fait dans le menu latéral.

## Étapes pour ce soir

On commence par la logique de calcul, testée, avant l'interface : c'est là que les erreurs coûtent cher sur un chantier.

- [x] Créer le projet Vite React + TypeScript, ajouter Vitest et le plugin PWA
- [x] Écrire `mesure.ts` (po ↔ mm, fractions, arrondi haut/bas/proche, écart) et ses tests
- [x] Écrire `calcul.ts` (expression mixte po/mm, priorité × ÷ avant + −) et ses tests
- [x] Construire `Clavier` et `Resultat`, puis la page Calculatrice
- [x] Ajouter `ChoixArrondi`, l'historique et la sauvegarde des réglages
- [x] Construire la page Diviseur avec les mêmes composants
- [x] Ajouter le menu latéral et le thème clair/sombre
- [ ] Configurer l'installation (icône, nom, hors ligne) et tester sur iPhone et Android

**Tests à faire passer**

| Entrée | Résultat attendu |
| --- | --- |
| 1 3/4" + 12 mm | 56,45 mm ≈ 2 7/32" (au 1/32) |
| 24 3/4" | 628,65 mm |
| 1" arrondi au 1/16 | 25,4 mm, écart 0 |
| 20" ÷ 4 trous | 4, 8, 12, 16" |
| 0,1" au 1/8, vers le haut | 1/8" |
