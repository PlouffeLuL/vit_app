import { describe, expect, it } from 'vitest'
import { diagonale, diviserLongueur, ErreurCalcul, evaluer, type Jeton } from './calcul'
import { arrondirMm, formaterFraction, mmVersPouces, poucesVersMm } from './mesure'

const po = (valeur: number) => ({ valeur, unite: 'po' }) as const
const mm = (valeur: number) => ({ valeur, unite: 'mm' }) as const

describe('evaluer', () => {
  it('1 3/4" + 12 mm = 56,45 mm ≈ 2 7/32"', () => {
    const r = evaluer([po(1.75), '+', mm(12)])
    expect(r).toBeCloseTo(56.45, 9)
    expect(formaterFraction(arrondirMm(r, 32, 'proche').fraction)).toBe('2 7/32"')
  })

  it('un seul nombre', () => {
    expect(evaluer([po(24.75)])).toBeCloseTo(628.65, 9)
  })

  it('expression vide = 0', () => {
    expect(evaluer([])).toBe(0)
  })

  it('soustraction', () => {
    expect(evaluer([mm(100), '−', mm(30), '−', mm(20)])).toBeCloseTo(50, 9)
  })

  it('× et ÷ prennent le nombre de droite comme facteur', () => {
    expect(mmVersPouces(evaluer([po(24), '÷', po(3)]))).toBeCloseTo(8, 9)
    expect(evaluer([mm(12), '×', po(2)])).toBeCloseTo(24, 9)
  })

  it('× ÷ avant + −', () => {
    // 10 mm + 2" × 3 = 10 + 152,4
    expect(evaluer([mm(10), '+', po(2), '×', mm(3)])).toBeCloseTo(162.4, 9)
    // 100 mm − 50 mm ÷ 2 = 75
    expect(evaluer([mm(100), '−', mm(50), '÷', mm(2)])).toBeCloseTo(75, 9)
  })

  it('division par zéro', () => {
    expect(() => evaluer([po(1), '÷', mm(0)])).toThrow(ErreurCalcul)
  })

  it('expressions invalides', () => {
    expect(() => evaluer([po(1), '+'] as Jeton[])).toThrow(ErreurCalcul)
    expect(() => evaluer(['+'] as Jeton[])).toThrow(ErreurCalcul)
    expect(() => evaluer([po(1), po(2), po(3)])).toThrow(ErreurCalcul)
  })
})

describe('diagonale', () => {
  const enPouces = (a: number, b: number, angle: number) =>
    mmVersPouces(diagonale(poucesVersMm(a), poucesVersMm(b), angle))

  it('22" et 31" à 90° → 38,01" (Pythagore)', () => {
    expect(enPouces(22, 31, 90)).toBeCloseTo(Math.sqrt(22 ** 2 + 31 ** 2), 9)
  })

  it('22" et 31" à 120° → √2127 ≈ 46,12"', () => {
    expect(enPouces(22, 31, 120)).toBeCloseTo(Math.sqrt(2127), 9)
  })

  it('côtés égaux à 60° → triangle équilatéral', () => {
    expect(enPouces(10, 10, 60)).toBeCloseTo(10, 9)
  })

  it('angle hors de 0–180°', () => {
    expect(() => diagonale(100, 100, 0)).toThrow(ErreurCalcul)
    expect(() => diagonale(100, 100, 180)).toThrow(ErreurCalcul)
  })
})

describe('diviserLongueur', () => {
  it('20" et 4 trous → 4, 8, 12, 16"', () => {
    const { espacementMm, positionsMm } = diviserLongueur(poucesVersMm(20), 4)
    expect(formaterFraction(arrondirMm(espacementMm, 16, 'proche').fraction)).toBe('4"')
    expect(positionsMm.map((p) => formaterFraction(arrondirMm(p, 16, 'proche').fraction))).toEqual([
      '4"',
      '8"',
      '12"',
      '16"',
    ])
  })

  it('nombre de trous invalide', () => {
    expect(() => diviserLongueur(500, 0)).toThrow(ErreurCalcul)
    expect(() => diviserLongueur(500, 1.5)).toThrow(ErreurCalcul)
  })
})
