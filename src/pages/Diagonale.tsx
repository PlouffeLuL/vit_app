import { useState } from 'react'
import { Clavier } from '../components/Clavier'
import { Resultat } from '../components/Resultat'
import { diagonale, ErreurCalcul } from '../lib/calcul'
import { versMm } from '../lib/mesure'
import { estVide, formaterSaisie, type Saisie, saisieVide, versMesure } from '../lib/saisie'
import type { PageProps } from './page'

type Champ = 'l' | 'w' | 'angle'

const CHAMPS: { id: Champ; libelle: string }[] = [
  { id: 'l', libelle: 'L' },
  { id: 'w', libelle: 'W' },
  { id: 'angle', libelle: 'Angle' },
]

const VIDES: Record<Champ, Saisie> = { l: saisieVide('po'), w: saisieVide('po'), angle: saisieVide('mm') }

// L'angle se tape sur le pavé décimal : sa « valeur mm » est le nombre de degrés.
const texteChamp = (id: Champ, s: Saisie) => (id === 'angle' ? (s.mm ? `${s.mm}°` : '') : formaterSaisie(s))

export function Diagonale({ reglages, ouvrirArrondi }: PageProps) {
  const [saisies, setSaisies] = useState(VIDES)
  const [actif, setActif] = useState<Champ>('l')

  const l = versMesure(saisies.l)
  const w = versMesure(saisies.w)
  const angle = versMesure(saisies.angle)

  let mm: number | null = null
  let erreur = ''
  if (l && w && angle) {
    try {
      mm = diagonale(versMm(l), versMm(w), angle.valeur)
    } catch (e) {
      if (!(e instanceof ErreurCalcul)) throw e
      erreur = e.message
    }
  }

  const changer = (s: Saisie) => setSaisies((tout) => ({ ...tout, [actif]: s }))

  return (
    <div className="page diagonale">
      <div className="ecran ecran-diagonale">
        <div className="champs-diagonale" role="group" aria-label="Valeurs">
          {CHAMPS.map(({ id, libelle }) => (
            <button
              key={id}
              type="button"
              className="champ-choix"
              aria-pressed={actif === id}
              onClick={() => setActif(id)}
            >
              <span className="champ-libelle">{libelle}</span>
              <span className="champ-valeur">{texteChamp(id, saisies[id]) || '—'}</span>
            </button>
          ))}
        </div>
        <p className="aide">Diagonale entre les bouts de L et W, pour obtenir l'angle voulu.</p>

        {erreur ? (
          <div className="resultat erreur">{erreur}</div>
        ) : mm !== null ? (
          <Resultat mm={mm} precision={reglages.precision} direction={reglages.direction} onArrondi={ouvrirArrondi} />
        ) : (
          <p className="vide">Entre L, W et l'angle.</p>
        )}
      </div>

      <Clavier saisie={saisies[actif]} onSaisie={changer} degres={actif === 'angle'}>
        <button
          type="button"
          className="touche-effacer"
          disabled={estVide(saisies[actif])}
          onClick={() => changer(VIDES[actif])}
        >
          C
        </button>
      </Clavier>
    </div>
  )
}
