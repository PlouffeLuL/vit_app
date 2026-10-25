import { useState } from 'react'
import { Clavier } from '../components/Clavier'
import { Resultat } from '../components/Resultat'
import { diviserLongueur } from '../lib/calcul'
import { texteArrondi, versMm } from '../lib/mesure'
import { formaterSaisie, type Saisie, saisieVide, versMesure } from '../lib/saisie'
import type { PageProps } from './page'

const REPERES_MAX = 99

export function Diviseur({ reglages, ouvrirArrondi }: PageProps) {
  const [saisie, setSaisie] = useState<Saisie>(saisieVide('po'))
  const [reperes, setReperes] = useState(2)

  const mesure = versMesure(saisie)
  const division = mesure && mesure.valeur > 0 ? diviserLongueur(versMm(mesure), reperes) : null
  const { precision, direction } = reglages

  const changerReperes = (n: number) => setReperes(Math.min(REPERES_MAX, Math.max(1, n)))

  return (
    <div className="page diviseur">
      <div className="ecran ecran-diviseur">
        <div className="diviseur-entrees">
          <div className="champ">
            <span className="champ-libelle">Longueur</span>
            <span className="champ-valeur">{formaterSaisie(saisie) || '—'}</span>
          </div>
          <div className="champ">
            <span className="champ-libelle">Repères</span>
            <div className="compteur">
              <button type="button" aria-label="Un repère de moins" onClick={() => changerReperes(reperes - 1)}>
                −
              </button>
              <span className="champ-valeur">{reperes}</span>
              <button type="button" aria-label="Un repère de plus" onClick={() => changerReperes(reperes + 1)}>
                +
              </button>
            </div>
          </div>
        </div>
        <button type="button" className="resultat-note" onClick={ouvrirArrondi}>
          {texteArrondi(precision, direction)}
        </button>

        {division ? (
          <div className="liste-reperes">
            <Resultat libelle="Espacement" mm={division.espacementMm} precision={precision} direction={direction} />
            {division.positionsMm.map((p, i) => (
              <Resultat key={i} libelle={`Repère ${i + 1}`} mm={p} precision={precision} direction={direction} />
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
