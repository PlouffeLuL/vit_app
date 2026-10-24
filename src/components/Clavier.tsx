import { type ReactNode, useState } from 'react'
import type { Unite } from '../lib/mesure'
import { ajouter, type Champ, retour, type Saisie, saisieVide } from '../lib/saisie'

interface Props {
  saisie: Saisie
  onSaisie: (s: Saisie) => void
  /** Pavé décimal seul, sans choix d'unité (angle en degrés). La saisie est alors en « mm ». */
  degres?: boolean
  /** Rangée du bas propre à chaque outil (opérateurs, effacer…). */
  children?: ReactNode
}

const CHIFFRES = ['7', '8', '9', '4', '5', '6', '1', '2', '3']

const NOMS: Record<Champ, string> = { entier: 'entier', num: 'numérateur', den: 'dénominateur', mm: 'millimètres' }

export function Clavier({ saisie, onSaisie, degres = false, children }: Props) {
  // Le mode affiché est indépendant du nombre en cours : changer d'unité n'efface rien.
  // Taper dans l'autre unité commence un nouveau nombre (normalement après un opérateur).
  const [modeChoisi, setMode] = useState<Unite>(saisie.unite)
  const mode = degres ? 'mm' : modeChoisi
  const taper = (champ: Champ, car: string) =>
    onSaisie(ajouter(saisie.unite === mode ? saisie : saisieVide(mode), champ, car))

  // Chaque pavé : 7-8-9 / 4-5-6 / 1-2-3 / [virgule] 0 ⌫, avec son propre retour arrière.
  const pave = (champ: Champ) => (
    <div className={`pave pave-${champ}`}>
      {CHIFFRES.map((c) => (
        <button key={c} type="button" onClick={() => taper(champ, c)}>
          {c}
        </button>
      ))}
      {champ === 'mm' && (
        <button type="button" onClick={() => taper('mm', ',')}>
          ,
        </button>
      )}
      <button type="button" className={champ === 'mm' ? '' : 'large-2'} onClick={() => taper(champ, '0')}>
        0
      </button>
      <button
        type="button"
        className="touche-retour"
        aria-label={`Effacer le dernier chiffre (${degres ? 'degrés' : NOMS[champ]})`}
        onClick={() => onSaisie(retour(saisie, champ))}
      >
        ⌫
      </button>
    </div>
  )

  return (
    <div className="clavier">
      {degres ? (
        <div className="clavier-haut clavier-titre">Angle en degrés</div>
      ) : (
        <div className="bascule clavier-haut" role="group" aria-label="Unité">
          {(['po', 'mm'] as const).map((u) => (
            <button key={u} type="button" aria-pressed={mode === u} onClick={() => setMode(u)}>
              {u === 'po' ? 'pouces' : 'mm'}
            </button>
          ))}
        </div>
      )}

      {mode === 'po' ? (
        <div className="paves-pouces">
          {pave('entier')}
          <div className="paves-fraction">
            {pave('num')}
            {pave('den')}
          </div>
        </div>
      ) : (
        pave('mm')
      )}

      {children && <div className="clavier-bas">{children}</div>}
    </div>
  )
}
