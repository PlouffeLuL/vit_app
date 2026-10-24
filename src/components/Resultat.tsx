import type { ReactNode } from 'react'
import { arrondirMm, type Direction, formaterEcart, formaterFraction, formaterMm, type Precision } from '../lib/mesure'

interface Props {
  mm: number
  precision: Precision
  direction: Direction
  /** Ligne compacte pour les listes (diviseur). */
  libelle?: string
  /** Affiché à côté de la fraction (ex. choix d'arrondi). */
  children?: ReactNode
}

export function Resultat({ mm, precision, direction, libelle, children }: Props) {
  const { fraction, ecartMm } = arrondirMm(mm, precision, direction)
  const ecart = formaterEcart(ecartMm)

  if (libelle) {
    return (
      <div className="resultat-ligne">
        <span className="resultat-libelle">{libelle}</span>
        <span className="resultat-fraction">{formaterFraction(fraction)}</span>
        <span className="resultat-mm">{formaterMm(mm)}</span>
        <span className="resultat-ecart">{ecart !== '0 mm' && ecart}</span>
      </div>
    )
  }

  return (
    <div className="resultat">
      <div className="resultat-mm grand">{formaterMm(mm)}</div>
      <div className="resultat-fraction-ligne">
        <span className="resultat-fraction grand">{formaterFraction(fraction)}</span>
        {children}
      </div>
      <div className="resultat-ecart">écart {ecart}</div>
    </div>
  )
}
