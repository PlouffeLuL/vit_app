import { describe, expect, it } from 'vitest'
import {
  arrondirMm,
  formaterEcart,
  formaterFraction,
  formaterMm,
  fractionVersPouces,
  poucesVersMm,
  simplifier,
  versMm,
} from './mesure'

describe('conversions', () => {
  it('24 3/4" = 628,65 mm', () => {
    expect(poucesVersMm(fractionVersPouces(24, 3, 4))).toBeCloseTo(628.65, 9)
  })

  it('versMm respecte l’unité', () => {
    expect(versMm({ valeur: 1, unite: 'po' })).toBe(25.4)
    expect(versMm({ valeur: 12, unite: 'mm' })).toBe(12)
  })

  it('dénominateur nul = entier seul', () => {
    expect(fractionVersPouces(5, 3, 0)).toBe(5)
  })
})

describe('simplifier', () => {
  it('8/16 → 1/2', () => expect(simplifier(8, 16)).toEqual([1, 2]))
  it('0/16 reste 0', () => expect(simplifier(0, 16)).toEqual([0, 1]))
})

describe('arrondirMm', () => {
  it('1" au 1/16 : 25,4 mm, écart 0', () => {
    const r = arrondirMm(25.4, 16, 'proche')
    expect(formaterFraction(r.fraction)).toBe('1"')
    expect(r.mm).toBe(25.4)
    expect(r.ecartMm).toBe(0)
  })

  it('56,45 mm ≈ 2 7/32" au 1/32', () => {
    const r = arrondirMm(56.45, 32, 'proche')
    expect(formaterFraction(r.fraction)).toBe('2 7/32"')
  })

  it('0,1" au 1/8 vers le haut → 1/8"', () => {
    const r = arrondirMm(poucesVersMm(0.1), 8, 'haut')
    expect(formaterFraction(r.fraction)).toBe('1/8"')
    expect(r.ecartMm).toBeCloseTo(0.635, 9)
  })

  it('0,1" au 1/8 vers le bas → 0"', () => {
    expect(formaterFraction(arrondirMm(poucesVersMm(0.1), 8, 'bas').fraction)).toBe('0"')
  })

  it('une valeur exacte ne bouge pas, même en haut/bas (flottants)', () => {
    const mm = poucesVersMm(fractionVersPouces(24, 3, 4))
    for (const dir of ['haut', 'bas', 'proche'] as const) {
      expect(formaterFraction(arrondirMm(mm, 16, dir).fraction)).toBe('24 3/4"')
    }
  })

  it('simplifie la fraction (8/16 → 1/2)', () => {
    expect(formaterFraction(arrondirMm(poucesVersMm(1.5), 16, 'proche').fraction)).toBe('1 1/2"')
  })

  it('pouce entier', () => {
    expect(formaterFraction(arrondirMm(poucesVersMm(2.6), 1, 'proche').fraction)).toBe('3"')
  })

  it('négatif', () => {
    expect(formaterFraction(arrondirMm(poucesVersMm(-1.5), 16, 'proche').fraction)).toBe('-1 1/2"')
  })
})

describe('formatage', () => {
  it('mm à la française', () => {
    expect(formaterMm(56.45)).toBe('56,45 mm')
    expect(formaterMm(628.6500000001)).toBe('628,65 mm')
    expect(formaterMm(101.6)).toBe('101,6 mm')
  })

  it('écart signé', () => {
    expect(formaterEcart(0.3)).toBe('+0,3 mm')
    expect(formaterEcart(-1.2)).toBe('-1,2 mm')
    expect(formaterEcart(0)).toBe('0 mm')
    expect(formaterEcart(-0.001)).toBe('0 mm')
  })
})
