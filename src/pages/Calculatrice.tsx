import { useState } from 'react'
import { ChoixArrondi } from '../components/ChoixArrondi'
import { Clavier } from '../components/Clavier'
import { Resultat } from '../components/Resultat'
import type { ReglagesApi } from '../hooks/useReglages'
import { ErreurCalcul, evaluer, type Jeton, type Operateur } from '../lib/calcul'
import { formaterMm, type Mesure } from '../lib/mesure'
import { estVide, formaterSaisie, type Saisie, saisieVide, versMesure } from '../lib/saisie'

/** Nombre déjà entré, avec le texte tel qu'affiché. */
interface Terme {
  mesure: Mesure
  texte: string
}

type Element = Terme | Operateur

const OPERATEURS: Operateur[] = ['÷', '×', '−', '+']

const estOperateur = (e: Element): e is Operateur => typeof e === 'string'
const versJetons = (els: Element[]): Jeton[] => els.map((e) => (estOperateur(e) ? e : e.mesure))
const texteExpression = (els: Element[]) => els.map((e) => (estOperateur(e) ? e : e.texte)).join(' ')
const termeResultat = (mm: number): Terme => ({ mesure: { valeur: mm, unite: 'mm' }, texte: formaterMm(mm) })

export function Calculatrice({ reglages, modifier, ajouterHistorique }: ReglagesApi) {
  const [elements, setElements] = useState<Element[]>([])
  const [saisie, setSaisie] = useState<Saisie>(saisieVide('po'))
  // Après « = », taper un chiffre recommence un calcul; un opérateur continue avec le résultat.
  const [resultatAffiche, setResultatAffiche] = useState(false)
  const [historiqueOuvert, setHistoriqueOuvert] = useState(false)

  const mesureSaisie = versMesure(saisie)
  const enCours: Element[] = mesureSaisie ? [...elements, { mesure: mesureSaisie, texte: formaterSaisie(saisie) }] : elements
  // Résultat en direct : on ignore un opérateur en attente à la fin.
  const aEvaluer = enCours.length && estOperateur(enCours[enCours.length - 1]) ? enCours.slice(0, -1) : enCours

  let mm = 0
  let erreur = ''
  try {
    mm = evaluer(versJetons(aEvaluer))
  } catch (e) {
    if (!(e instanceof ErreurCalcul)) throw e
    erreur = e.message
  }

  const taper = (s: Saisie) => {
    // Changer d'unité (saisie vide) ne doit pas effacer le résultat.
    if (resultatAffiche && !estVide(s)) {
      setElements([])
      setResultatAffiche(false)
    }
    setSaisie(s)
  }

  const operateur = (op: Operateur) => {
    if (!estVide(saisie) && !mesureSaisie) return // fraction incomplète
    const base = mesureSaisie ? enCours : elements
    if (base.length === 0) return
    const dernier = base[base.length - 1]
    setElements(estOperateur(dernier) ? [...base.slice(0, -1), op] : [...base, op])
    setSaisie(saisieVide(saisie.unite))
    setResultatAffiche(false)
  }

  const egal = () => {
    if (erreur || aEvaluer.length < 3) return
    ajouterHistorique({ expression: texteExpression(aEvaluer), mm })
    setElements([termeResultat(mm)])
    setSaisie(saisieVide(saisie.unite))
    setResultatAffiche(true)
  }

  const effacer = () => {
    setElements([])
    setSaisie(saisieVide(saisie.unite))
    setResultatAffiche(false)
  }

  const reutiliser = (mmHistorique: number) => {
    setElements([termeResultat(mmHistorique)])
    setSaisie(saisieVide(saisie.unite))
    setResultatAffiche(true)
    setHistoriqueOuvert(false)
  }

  const expression = texteExpression(elements) + (estVide(saisie) ? '' : ` ${formaterSaisie(saisie)}`)

  return (
    <div className="page calculatrice">
      <div className="ecran">
        <div className="ecran-haut">
          <button type="button" className="bouton-texte" onClick={() => setHistoriqueOuvert(true)}>
            Historique
          </button>
          <div className="expression" aria-live="polite">
            {expression.trim() || '0'}
          </div>
        </div>
        {erreur ? (
          <div className="resultat erreur">{erreur}</div>
        ) : (
          <Resultat mm={mm} precision={reglages.precision} direction={reglages.direction}>
            <ChoixArrondi precision={reglages.precision} direction={reglages.direction} onChange={modifier} />
          </Resultat>
        )}
      </div>

      <Clavier saisie={saisie} onSaisie={taper}>
        <button type="button" className="touche-effacer" onClick={effacer}>
          C
        </button>
        {OPERATEURS.map((op) => (
          <button key={op} type="button" className="touche-op" onClick={() => operateur(op)}>
            {op}
          </button>
        ))}
        <button type="button" className="touche-egal" onClick={egal}>
          =
        </button>
      </Clavier>

      {historiqueOuvert && (
        <div className="panneau" role="dialog" aria-label="Historique">
          <div className="panneau-entete">
            <h2>Historique</h2>
            <button type="button" className="bouton-texte" onClick={() => modifier({ historique: [] })}>
              Vider
            </button>
            <button type="button" className="bouton-texte" onClick={() => setHistoriqueOuvert(false)}>
              Fermer
            </button>
          </div>
          {reglages.historique.length === 0 ? (
            <p className="vide">Aucun calcul pour l'instant.</p>
          ) : (
            <ul className="historique">
              {reglages.historique.map((h, i) => (
                <li key={i}>
                  <button type="button" onClick={() => reutiliser(h.mm)}>
                    <span className="historique-expression">{h.expression}</span>
                    <span className="historique-resultat">= {formaterMm(h.mm)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
