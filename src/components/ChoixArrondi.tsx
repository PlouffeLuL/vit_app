import { type Direction, type Precision, PRECISIONS } from '../lib/mesure'

interface Props {
  precision: Precision
  direction: Direction
  onChange: (changement: { precision?: Precision; direction?: Direction }) => void
}

const DIRECTIONS: { valeur: Direction; texte: string }[] = [
  { valeur: 'proche', texte: '≈ proche' },
  { valeur: 'haut', texte: '↑ haut' },
  { valeur: 'bas', texte: '↓ bas' },
]

export function ChoixArrondi({ precision, direction, onChange }: Props) {
  return (
    <div className="choix-arrondi">
      <select
        aria-label="Précision d'arrondi"
        value={precision}
        onChange={(e) => onChange({ precision: Number(e.target.value) as Precision })}
      >
        {PRECISIONS.map((p) => (
          <option key={p} value={p}>
            {p === 1 ? '1"' : `1/${p}`}
          </option>
        ))}
      </select>
      <select
        aria-label="Direction d'arrondi"
        value={direction}
        onChange={(e) => onChange({ direction: e.target.value as Direction })}
      >
        {DIRECTIONS.map((d) => (
          <option key={d.valeur} value={d.valeur}>
            {d.texte}
          </option>
        ))}
      </select>
    </div>
  )
}
