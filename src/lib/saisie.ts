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

export type Champ = 'entier' | 'num' | 'mm'

export const DENOMINATEURS = [2, 4, 8, 16, 32, 64]

const LONGUEUR_MAX: Record<Champ, number> = { entier: 5, num: 2, mm: 8 }

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

export function choisirDen(s: Saisie, den: number): Saisie {
  return { ...s, den: String(den) }
}

/** Retour arrière : dénominateur, puis numérateur, puis entier. */
export function retour(s: Saisie): Saisie {
  if (s.unite === 'mm') return { ...s, mm: s.mm.slice(0, -1) }
  if (s.den) return { ...s, den: '' }
  if (s.num) return { ...s, num: s.num.slice(0, -1) }
  return { ...s, entier: s.entier.slice(0, -1) }
}

/** null si la saisie est vide ou incomplète (numérateur sans dénominateur). */
export function versMesure(s: Saisie): Mesure | null {
  if (estVide(s)) return null
  if (s.unite === 'mm') {
    const valeur = Number(s.mm.replace(',', '.'))
    return Number.isFinite(valeur) ? { valeur, unite: 'mm' } : null
  }
  if (s.num && !s.den) return null
  const num = s.num ? Number(s.num) : 0
  return { valeur: fractionVersPouces(Number(s.entier || 0), num, Number(s.den || 0)), unite: 'po' }
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
