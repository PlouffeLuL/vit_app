import {
  arrondirMm,
  type Direction,
  formaterEcart,
  formaterFraction,
  formaterMm,
  type Precision,
  texteArrondi,
} from '../lib/mesure'

interface Props {
  mm: number
  precision: Precision
  direction: Direction
  /** Ligne compacte pour les listes (diviseur). */
  libelle?: string
  /** Toucher la note d'arrondi ouvre le choix d'arrondi. */
  onArrondi?: () => void
}

export function Resultat({ mm, precision, direction, libelle, onArrondi }: Props) {
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
    <div className="resultat" aria-live="polite">
      <div className="resultat-rangee">
        <span className="resultat-etiquette">Impérial</span>
        <span className="resultat-fraction">{formaterFraction(fraction)}</span>
      </div>
      <div className="resultat-rangee">
        <span className="resultat-etiquette">Métrique</span>
        <span className="resultat-mm">{formaterMm(mm)}</span>
      </div>
      <button type="button" className="resultat-note" onClick={onArrondi}>
        {texteArrondi(precision, direction)}
        {ecart !== '0 mm' && <> · écart {ecart}</>}
      </button>
    </div>
  )
}
