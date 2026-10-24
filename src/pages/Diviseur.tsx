import { useState } from 'react'
import { ChoixArrondi } from '../components/ChoixArrondi'
import { Clavier } from '../components/Clavier'
import { Resultat } from '../components/Resultat'
import type { ReglagesApi } from '../hooks/useReglages'
import { diviserLongueur } from '../lib/calcul'
import { versMm } from '../lib/mesure'
import { formaterSaisie, type Saisie, saisieVide, versMesure } from '../lib/saisie'

const TROUS_MAX = 99

export function Diviseur({ reglages, modifier }: ReglagesApi) {
  const [saisie, setSaisie] = useState<Saisie>(saisieVide('po'))
  const [trous, setTrous] = useState(2)

  const mesure = versMesure(saisie)
  const division = mesure && mesure.valeur > 0 ? diviserLongueur(versMm(mesure), trous) : null
  const { precision, direction } = reglages

  const changerTrous = (n: number) => setTrous(Math.min(TROUS_MAX, Math.max(1, n)))

  return (
    <div className="page diviseur">
      <div className="ecran ecran-diviseur">
        <div className="diviseur-entrees">
          <div className="champ">
            <span className="champ-libelle">Longueur</span>
            <span className="champ-valeur">{formaterSaisie(saisie) || '—'}</span>
          </div>
          <div className="champ">
            <span className="champ-libelle">Trous</span>
            <div className="compteur">
              <button type="button" aria-label="Un trou de moins" onClick={() => changerTrous(trous - 1)}>
                −
              </button>
              <span className="champ-valeur">{trous}</span>
              <button type="button" aria-label="Un trou de plus" onClick={() => changerTrous(trous + 1)}>
                +
              </button>
            </div>
          </div>
          <ChoixArrondi precision={precision} direction={direction} onChange={modifier} />
        </div>

        {division ? (
          <div className="liste-trous">
            <Resultat libelle="Espacement" mm={division.espacementMm} precision={precision} direction={direction} />
            {division.positionsMm.map((p, i) => (
              <Resultat key={i} libelle={`Trou ${i + 1}`} mm={p} precision={precision} direction={direction} />
            ))}
          </div>
        ) : (
          <p className="vide">Entre la longueur totale avec le clavier.</p>
        )}
      </div>

      <Clavier saisie={saisie} onSaisie={setSaisie}>
        <button type="button" className="touche-effacer" onClick={() => setSaisie(saisieVide(saisie.unite))}>
          C
        </button>
      </Clavier>
    </div>
  )
}
