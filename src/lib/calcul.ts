import { type Mesure, versMm } from './mesure'

export type Operateur = '+' | '−' | '×' | '÷'
export type Jeton = Mesure | Operateur

export class ErreurCalcul extends Error {}

const estOperateur = (j: Jeton): j is Operateur => typeof j === 'string'

/**
 * Évalue « mesure op mesure op … » et renvoie le résultat en mm.
 * × et ÷ passent avant + et −.
 *
 * Pour × et ÷, l'opérande de droite est un simple facteur : on prend le nombre
 * tel que tapé, sans son unité. Ainsi 24" ÷ 3 donne 8", et 12 mm × 2 donne 24 mm.
 */
export function evaluer(jetons: Jeton[]): number {
  if (jetons.length === 0) return 0
  if (jetons.length % 2 === 0) throw new ErreurCalcul('Expression incomplète')

  // Premier passage : × et ÷, on garde une somme de termes.
  const termes: number[] = []
  const signes: Operateur[] = []
  let courant = lireMesure(jetons[0])

  for (let i = 1; i < jetons.length; i += 2) {
    const op = jetons[i]
    const droite = jetons[i + 1]
    if (!estOperateur(op) || estOperateur(droite)) throw new ErreurCalcul('Expression invalide')

    if (op === '×') {
      courant *= droite.valeur
    } else if (op === '÷') {
      if (droite.valeur === 0) throw new ErreurCalcul('Division par zéro')
      courant /= droite.valeur
    } else {
      termes.push(courant)
      signes.push(op)
      courant = versMm(droite)
    }
  }
  termes.push(courant)

  // Second passage : + et −.
  return termes.reduce((total, t, i) => (signes[i - 1] === '−' ? total - t : total + t))
}

function lireMesure(j: Jeton): number {
  if (estOperateur(j)) throw new ErreurCalcul('Expression invalide')
  return versMm(j)
}

/** Positions des trous à espacement égal, sans trou aux bouts. */
export function diviserLongueur(longueurMm: number, trous: number) {
  if (!Number.isInteger(trous) || trous < 1) throw new ErreurCalcul('Nombre de trous invalide')
  const espacementMm = longueurMm / (trous + 1)
  const positionsMm = Array.from({ length: trous }, (_, i) => (i + 1) * espacementMm)
  return { espacementMm, positionsMm }
}
