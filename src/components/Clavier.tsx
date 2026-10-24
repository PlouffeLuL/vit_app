import type { ReactNode } from 'react'
import type { Unite } from '../lib/mesure'
import { ajouter, type Champ, choisirDen, DENOMINATEURS, retour, type Saisie, saisieVide } from '../lib/saisie'

interface Props {
  saisie: Saisie
  onSaisie: (s: Saisie) => void
  /** Rangée du bas propre à chaque outil (opérateurs, effacer…). */
  children?: ReactNode
}

const CHIFFRES = ['7', '8', '9', '4', '5', '6', '1', '2', '3']

export function Clavier({ saisie, onSaisie, children }: Props) {
  const changerUnite = (unite: Unite) => {
    if (unite !== saisie.unite) onSaisie(saisieVide(unite))
  }

  const pave = (champ: Champ, classe: string, derniers: ReactNode) => (
    <div className={`pave ${classe}`}>
      {CHIFFRES.map((c) => (
        <button key={c} type="button" onClick={() => onSaisie(ajouter(saisie, champ, c))}>
          {c}
        </button>
      ))}
      {derniers}
    </div>
  )

  return (
    <div className="clavier">
      <div className="clavier-haut">
        <div className="bascule" role="group" aria-label="Unité">
          {(['po', 'mm'] as const).map((u) => (
            <button key={u} type="button" aria-pressed={saisie.unite === u} onClick={() => changerUnite(u)}>
              {u === 'po' ? 'pouces' : 'mm'}
            </button>
          ))}
        </div>
        <button type="button" className="touche-retour" aria-label="Retour arrière" onClick={() => onSaisie(retour(saisie))}>
          ⌫
        </button>
      </div>

      {saisie.unite === 'po' ? (
        <div className="paves-pouces">
          {pave(
            'entier',
            'pave-entier',
            <button type="button" className="large" onClick={() => onSaisie(ajouter(saisie, 'entier', '0'))}>
              0
            </button>,
          )}
          <div className="paves-fraction">
            {pave(
              'num',
              'pave-num',
              <button type="button" className="large" onClick={() => onSaisie(ajouter(saisie, 'num', '0'))}>
                0
              </button>,
            )}
            <div className="pave pave-den">
              {DENOMINATEURS.map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={saisie.den === String(d)}
                  onClick={() => onSaisie(choisirDen(saisie, d))}
                >
                  /{d}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        pave(
          'mm',
          'pave-mm',
          <>
            <button type="button" onClick={() => onSaisie(ajouter(saisie, 'mm', ','))}>
              ,
            </button>
            <button type="button" className="large-2" onClick={() => onSaisie(ajouter(saisie, 'mm', '0'))}>
              0
            </button>
          </>,
        )
      )}

      {children && <div className="clavier-bas">{children}</div>}
    </div>
  )
}
