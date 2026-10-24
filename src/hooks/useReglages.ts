import { useCallback, useEffect, useState } from 'react'
import { type Direction, type Precision, PRECISIONS } from '../lib/mesure'

export type Theme = 'clair' | 'sombre'

export interface EntreeHistorique {
  expression: string
  mm: number
}

export interface Reglages {
  precision: Precision
  direction: Direction
  theme: Theme
  historique: EntreeHistorique[]
}

const CLE = 'vitrier.reglages'
const HISTORIQUE_MAX = 50

const DEFAUTS: Reglages = { precision: 16, direction: 'proche', theme: 'clair', historique: [] }

// Valide chaque champ : une vieille version ou un stockage abîmé ne doit pas casser l'appli.
function lire(): Reglages {
  try {
    const brut = JSON.parse(localStorage.getItem(CLE) ?? '{}') as Partial<Reglages>
    return {
      precision: PRECISIONS.includes(brut.precision as Precision) ? brut.precision! : DEFAUTS.precision,
      direction: ['haut', 'bas', 'proche'].includes(brut.direction!) ? brut.direction! : DEFAUTS.direction,
      theme: brut.theme === 'sombre' ? 'sombre' : 'clair',
      historique: Array.isArray(brut.historique)
        ? brut.historique.filter((e) => typeof e?.expression === 'string' && Number.isFinite(e?.mm))
        : [],
    }
  } catch {
    return DEFAUTS
  }
}

export function useReglages() {
  const [reglages, setReglages] = useState(lire)

  useEffect(() => {
    try {
      localStorage.setItem(CLE, JSON.stringify(reglages))
    } catch {
      // Stockage indisponible (navigation privée) : les réglages durent le temps de la session.
    }
  }, [reglages])

  const modifier = useCallback((changement: Partial<Reglages>) => {
    setReglages((r) => ({ ...r, ...changement }))
  }, [])

  const ajouterHistorique = useCallback((entree: EntreeHistorique) => {
    setReglages((r) => ({ ...r, historique: [entree, ...r.historique].slice(0, HISTORIQUE_MAX) }))
  }, [])

  return { reglages, modifier, ajouterHistorique }
}

export type ReglagesApi = ReturnType<typeof useReglages>
