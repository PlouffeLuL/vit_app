// Toute mesure est stockée en millimètres; la fraction n'existe qu'à l'affichage.

export const MM_PAR_POUCE = 25.4

export type Unite = 'po' | 'mm'

/** Nombre tel que saisi : valeur décimale dans son unité d'origine. */
export interface Mesure {
  valeur: number
  unite: Unite
}

/** Dénominateur d'arrondi; 1 = pouce entier. */
export type Precision = 1 | 2 | 4 | 8 | 16 | 32 | 64
export const PRECISIONS: Precision[] = [64, 32, 16, 8, 4, 2, 1]

export type Direction = 'haut' | 'bas' | 'proche'

export interface Fraction {
  negatif: boolean
  entier: number
  num: number
  den: number
}

export interface Arrondi {
  fraction: Fraction
  /** Valeur arrondie, en mm. */
  mm: number
  /** Arrondi moins original, en mm (positif = la fraction est plus longue). */
  ecartMm: number
}

// Absorbe les erreurs de virgule flottante (ex. 395,99999… au lieu de 396).
const EPSILON = 1e-9

export const poucesVersMm = (po: number) => po * MM_PAR_POUCE
export const mmVersPouces = (mm: number) => mm / MM_PAR_POUCE

export function versMm(m: Mesure): number {
  return m.unite === 'po' ? poucesVersMm(m.valeur) : m.valeur
}

/** Ex. (24, 3, 4) → 24,75. Un dénominateur nul ignore la fraction. */
export function fractionVersPouces(entier: number, num: number, den: number): number {
  return den === 0 ? entier : entier + num / den
}

export function pgcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a
}

export function simplifier(num: number, den: number): [number, number] {
  const d = pgcd(num, den) || 1
  return [num / d, den / d]
}

function arrondirEntier(x: number, direction: Direction): number {
  switch (direction) {
    case 'haut':
      return Math.ceil(x - EPSILON)
    case 'bas':
      return Math.floor(x + EPSILON)
    case 'proche':
      return Math.round(x + EPSILON)
  }
}

/** Arrondit une longueur en mm à la fraction de pouce demandée. */
export function arrondirMm(mm: number, precision: Precision, direction: Direction): Arrondi {
  const unites = arrondirEntier(mmVersPouces(mm) * precision, direction)
  const negatif = unites < 0
  const abs = Math.abs(unites)
  const [num, den] = simplifier(abs % precision, precision)
  const mmArrondi = poucesVersMm(unites / precision)
  return {
    fraction: { negatif, entier: Math.floor(abs / precision), num, den },
    mm: mmArrondi,
    ecartMm: mmArrondi - mm,
  }
}

/** Ex. 2 7/32", 1/8", 3", -1 1/2". */
export function formaterFraction(f: Fraction): string {
  const signe = f.negatif ? '-' : ''
  if (f.num === 0) return `${signe}${f.entier}"`
  if (f.entier === 0) return `${signe}${f.num}/${f.den}"`
  return `${signe}${f.entier} ${f.num}/${f.den}"`
}

/** Nombre à la française, sans zéros inutiles : 56,45 ; 25,4 ; 4. */
export function formaterNombre(n: number, decimales = 2): string {
  const arrondi = Number(n.toFixed(decimales))
  return (Object.is(arrondi, -0) ? 0 : arrondi).toString().replace('.', ',')
}

export function formaterMm(mm: number, decimales = 2): string {
  return `${formaterNombre(mm, decimales)} mm`
}

export const textePrecision = (p: Precision) => (p === 1 ? '1"' : `1/${p}`)

const TEXTE_DIRECTION: Record<Direction, string> = {
  proche: 'au plus proche',
  haut: 'vers le haut',
  bas: 'vers le bas',
}

/** Ex. « arrondi au 1/16, au plus proche ». */
export function texteArrondi(precision: Precision, direction: Direction): string {
  return `arrondi au ${textePrecision(precision)}, ${TEXTE_DIRECTION[direction]}`
}

/** Ex. « +0,3 mm », « -1,2 mm », « 0 mm ». */
export function formaterEcart(ecartMm: number, decimales = 2): string {
  const texte = formaterNombre(ecartMm, decimales)
  return `${texte !== '0' && !texte.startsWith('-') ? '+' : ''}${texte} mm`
}
