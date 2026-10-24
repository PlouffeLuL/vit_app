import { useEffect } from 'react'
import type { ReglagesApi } from '../hooks/useReglages'
import { ChoixArrondi } from './ChoixArrondi'

interface Props {
  ouvert: boolean
  onFermer: () => void
  reglages: ReglagesApi['reglages']
  modifier: ReglagesApi['modifier']
}

/** Petit panneau sous l'en-tête; reste ouvert pour choisir précision et direction d'un coup. */
export function PanneauArrondi({ ouvert, onFermer, reglages, modifier }: Props) {
  useEffect(() => {
    if (!ouvert) return
    const echap = (e: KeyboardEvent) => e.key === 'Escape' && onFermer()
    window.addEventListener('keydown', echap)
    return () => window.removeEventListener('keydown', echap)
  }, [ouvert, onFermer])

  if (!ouvert) return null

  return (
    <>
      <div className="voile visible voile-arrondi" onClick={onFermer} aria-hidden="true" />
      <div className="panneau-arrondi" role="dialog" aria-label="Arrondi">
        <div className="panneau-arrondi-entete">
          <h2>Arrondi</h2>
          <button type="button" className="bouton-texte" onClick={onFermer}>
            OK
          </button>
        </div>
        <ChoixArrondi precision={reglages.precision} direction={reglages.direction} onChange={modifier} />
      </div>
    </>
  )
}
