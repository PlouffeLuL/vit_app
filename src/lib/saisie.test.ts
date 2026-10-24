import { describe, expect, it } from 'vitest'
import { ajouter, type Champ, choisirDen, formaterSaisie, retour, type Saisie, saisieVide, versMesure } from './saisie'

function taper(s: Saisie, champ: Champ, texte: string): Saisie {
  return [...texte].reduce((acc, car) => ajouter(acc, champ, car), s)
}

describe('saisie en pouces', () => {
  it('24, puis 3 en haut et 4 en bas = 24 3/4"', () => {
    let s = taper(saisieVide('po'), 'entier', '24')
    s = taper(s, 'num', '3')
    expect(formaterSaisie(s)).toBe('24 3/')
    expect(versMesure(s)).toBeNull()
    s = choisirDen(s, 4)
    expect(formaterSaisie(s)).toBe('24 3/4"')
    expect(versMesure(s)).toEqual({ valeur: 24.75, unite: 'po' })
  })

  it('fraction seule', () => {
    const s = choisirDen(taper(saisieVide('po'), 'num', '5'), 8)
    expect(formaterSaisie(s)).toBe('5/8"')
    expect(versMesure(s)).toEqual({ valeur: 0.625, unite: 'po' })
  })

  it('entier seul', () => {
    const s = taper(saisieVide('po'), 'entier', '12')
    expect(formaterSaisie(s)).toBe('12"')
    expect(versMesure(s)).toEqual({ valeur: 12, unite: 'po' })
  })

  it('dénominateur sans numérateur', () => {
    const s = choisirDen(taper(saisieVide('po'), 'entier', '3'), 16)
    expect(formaterSaisie(s)).toBe('3 ?/16"')
    expect(versMesure(s)).toEqual({ valeur: 3, unite: 'po' })
  })

  it('pas de zéro en tête, longueur limitée', () => {
    expect(taper(saisieVide('po'), 'entier', '05').entier).toBe('5')
    expect(taper(saisieVide('po'), 'num', '123').num).toBe('12')
  })

  it('retour arrière : den, puis num, puis entier', () => {
    let s = choisirDen(taper(taper(saisieVide('po'), 'entier', '24'), 'num', '3'), 4)
    s = retour(s)
    expect(formaterSaisie(s)).toBe('24 3/')
    s = retour(s)
    expect(formaterSaisie(s)).toBe('24"')
    s = retour(retour(s))
    expect(versMesure(s)).toBeNull()
  })
})

describe('saisie en mm', () => {
  it('décimales avec virgule', () => {
    const s = taper(saisieVide('mm'), 'mm', '12,5')
    expect(formaterSaisie(s)).toBe('12,5 mm')
    expect(versMesure(s)).toEqual({ valeur: 12.5, unite: 'mm' })
  })

  it('virgule en premier et une seule virgule', () => {
    expect(taper(saisieVide('mm'), 'mm', ',5,').mm).toBe('0,5')
  })

  it('virgule finale acceptée', () => {
    expect(versMesure(taper(saisieVide('mm'), 'mm', '12,'))).toEqual({ valeur: 12, unite: 'mm' })
  })

  it('retour arrière', () => {
    expect(retour(taper(saisieVide('mm'), 'mm', '12,5')).mm).toBe('12,')
  })
})
