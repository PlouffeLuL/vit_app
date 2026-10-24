import { describe, expect, it } from 'vitest'
import { ajouter, type Champ, formaterFacteur, formaterSaisie, retour, type Saisie, saisieVide, versMesure } from './saisie'

function taper(s: Saisie, champ: Champ, texte: string): Saisie {
  return [...texte].reduce((acc, car) => ajouter(acc, champ, car), s)
}

describe('saisie en pouces', () => {
  it('24, puis 3 en haut et 4 en bas = 24 3/4"', () => {
    let s = taper(saisieVide('po'), 'entier', '24')
    s = taper(s, 'num', '3')
    expect(formaterSaisie(s)).toBe('24 3/')
    expect(versMesure(s)).toBeNull()
    s = taper(s, 'den', '4')
    expect(formaterSaisie(s)).toBe('24 3/4"')
    expect(versMesure(s)).toEqual({ valeur: 24.75, unite: 'po' })
  })

  it('5/16 : 5 en haut, puis 1 et 6 en bas', () => {
    const s = taper(taper(saisieVide('po'), 'num', '5'), 'den', '16')
    expect(formaterSaisie(s)).toBe('5/16"')
    expect(versMesure(s)).toEqual({ valeur: 0.3125, unite: 'po' })
  })

  it('entier seul', () => {
    const s = taper(saisieVide('po'), 'entier', '12')
    expect(formaterSaisie(s)).toBe('12"')
    expect(versMesure(s)).toEqual({ valeur: 12, unite: 'po' })
  })

  it('dénominateur sans numérateur', () => {
    const s = taper(taper(saisieVide('po'), 'entier', '3'), 'den', '16')
    expect(formaterSaisie(s)).toBe('3 ?/16"')
    expect(versMesure(s)).toEqual({ valeur: 3, unite: 'po' })
  })

  it('dénominateur nul = incomplet', () => {
    expect(versMesure(taper(taper(saisieVide('po'), 'num', '1'), 'den', '0'))).toBeNull()
  })

  it('pas de zéro en tête, longueur limitée', () => {
    expect(taper(saisieVide('po'), 'entier', '05').entier).toBe('5')
    expect(taper(saisieVide('po'), 'num', '123').num).toBe('12')
    expect(taper(saisieVide('po'), 'den', '128').den).toBe('12')
  })

  it('chaque pavé a son propre retour arrière', () => {
    // 24 3/17 : on corrige le 7 en 6 sans toucher au reste.
    let s = taper(taper(taper(saisieVide('po'), 'entier', '24'), 'num', '3'), 'den', '17')
    s = taper(retour(s, 'den'), 'den', '6')
    expect(formaterSaisie(s)).toBe('24 3/16"')
    s = retour(s, 'entier')
    expect(formaterSaisie(s)).toBe('2 3/16"')
    s = retour(s, 'num')
    expect(formaterSaisie(s)).toBe('2 ?/16"')
  })

  it('retour sur un pavé vide ne change rien', () => {
    const s = taper(saisieVide('po'), 'entier', '5')
    expect(retour(s, 'num')).toEqual(s)
  })
})

describe('formaterFacteur', () => {
  it('sans unité', () => {
    expect(formaterFacteur(taper(saisieVide('mm'), 'mm', '2'))).toBe('2')
    expect(formaterFacteur(taper(taper(taper(saisieVide('po'), 'entier', '1'), 'num', '1'), 'den', '2'))).toBe('1 1/2')
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
    expect(retour(taper(saisieVide('mm'), 'mm', '12,5'), 'mm').mm).toBe('12,')
  })
})
