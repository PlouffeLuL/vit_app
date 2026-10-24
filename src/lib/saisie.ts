// Nombre en cours de frappe au clavier, gardé tel que tapé (texte) jusqu'à ce qu'il soit utilisé.

import { fractionVersPouces, type Mesure, type Unite } from './mesure'

export interface Saisie {
  unite: Unite
  entier: string
  num: string
  den: string
  /** Texte décimal en mode mm, avec virgule. */
  mm: string
}

export type Champ = 'entier' | 'num' | 'den' | 'mm'

const LONGUEUR_MAX: Record<Champ, number> = { entier: 5, num: 2, den: 2, mm: 8 }

export const saisieVide = (unite: Unite): Saisie => ({ unite, entier: '', num: '', den: '', mm: '' })

export function estVide(s: Saisie): boolean {
  return s.unite === 'po' ? !s.entier && !s.num && !s.den : !s.mm
}

/** Ajoute un chiffre (ou la virgule en mode mm) au champ donné. */
export function ajouter(s: Saisie, champ: Champ, car: string): Saisie {
  const actuel = s[champ]
  if (actuel.length >= LONGUEUR_MAX[champ]) return s
  if (car === ',') {
    if (champ !== 'mm' || actuel.includes(',')) return s
    return { ...s, mm: (actuel || '0') + ',' }
  }
  // Pas de zéro inutile en tête : « 0 » puis « 5 » donne « 5 ».
  return { ...s, [champ]: actuel === '0' ? car : actuel + car }
}

/** Retour arrière dans un seul pavé : efface son dernier caractère. */
export function retour(s: Saisie, champ: Champ): Saisie {
  return { ...s, [champ]: s[champ].slice(0, -1) }
}

/** null si la saisie est vide ou incomplète (numérateur sans dénominateur, dénominateur nul). */
export function versMesure(s: Saisie): Mesure | null {
  if (estVide(s)) return null
  if (s.unite === 'mm') {
    const valeur = Number(s.mm.replace(',', '.'))
    return Number.isFinite(valeur) ? { valeur, unite: 'mm' } : null
  }
  const den = Number(s.den || 0)
  if (s.den && den === 0) return null
  if (s.num && !den) return null
  return { valeur: fractionVersPouces(Number(s.entier || 0), Number(s.num || 0), den), unite: 'po' }
}

/** Ex. « 24 3/4" », « 24 3/ » (en cours), « 12,5 mm ». */
export function formaterSaisie(s: Saisie): string {
  if (estVide(s)) return ''
  if (s.unite === 'mm') return `${s.mm} mm`
  if (!s.num && !s.den) return `${s.entier}"`
  const frac = `${s.num || '?'}/${s.den}`
  const texte = s.entier ? `${s.entier} ${frac}` : frac
  return s.den ? `${texte}"` : texte
}

/** Après × ou ÷, le nombre est un simple facteur : on l'affiche sans unité (« 2 », « 1 1/2 »). */
export function formaterFacteur(s: Saisie): string {
  return s.unite === 'mm' ? s.mm : formaterSaisie(s).replace(/"$/, '')
}
