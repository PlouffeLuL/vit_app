import { type Direction, type Precision, PRECISIONS, textePrecision } from '../lib/mesure'

interface Props {
  precision: Precision
  direction: Direction
  onChange: (changement: { precision?: Precision; direction?: Direction }) => void
}

const DIRECTIONS: { valeur: Direction; texte: string }[] = [
  { valeur: 'proche', texte: 'proche' },
  { valeur: 'haut', texte: '↑ haut' },
  { valeur: 'bas', texte: '↓ bas' },
]

export function ChoixArrondi({ precision, direction, onChange }: Props) {
  return (
    <div className="choix-arrondi">
      <div className="bascule bascule-precision" role="group" aria-label="Précision d'arrondi">
        {PRECISIONS.map((p) => (
          <button key={p} type="button" aria-pressed={precision === p} onClick={() => onChange({ precision: p })}>
            {textePrecision(p)}
          </button>
        ))}
      </div>
      <div className="bascule" role="group" aria-label="Direction d'arrondi">
        {DIRECTIONS.map((d) => (
          <button
            key={d.valeur}
            type="button"
            aria-pressed={direction === d.valeur}
            onClick={() => onChange({ direction: d.valeur })}
          >
            {d.texte}
          </button>
        ))}
      </div>
    </div>
  )
}
