import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Clavier } from '../components/Clavier'
import { Resultat } from '../components/Resultat'
import type { EntreeHistorique } from '../hooks/useReglages'
import { ErreurCalcul, evaluer, type Jeton, type Operateur } from '../lib/calcul'
import { formaterMm, type Mesure } from '../lib/mesure'
import { estVide, formaterFacteur, formaterSaisie, type Saisie, saisieVide, versMesure } from '../lib/saisie'
import type { PageProps } from './page'

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

export function Calculatrice({ reglages, modifier, ajouterHistorique, ouvrirArrondi, enteteActions }: PageProps) {
  const [elements, setElements] = useState<Element[]>([])
  const [saisie, setSaisie] = useState<Saisie>(saisieVide('po'))
  // Calcul repris de l'historique, affiché en haut au-dessus de son résultat.
  // Taper un chiffre recommence alors un calcul; un opérateur continue avec le résultat.
  const [calculTermine, setCalculTermine] = useState<string | null>(null)
  const [historiqueOuvert, setHistoriqueOuvert] = useState(false)

  const mesureSaisie = versMesure(saisie)
  const precedent = elements[elements.length - 1]
  const texteSaisie = precedent === '×' || precedent === '÷' ? formaterFacteur(saisie) : formaterSaisie(saisie)
  const enCours: Element[] = mesureSaisie ? [...elements, { mesure: mesureSaisie, texte: texteSaisie }] : elements
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
    if (calculTermine !== null && !estVide(s)) {
      setElements([])
      setCalculTermine(null)
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
    setCalculTermine(null)
  }

  // Pas de touche « = » : le résultat est calculé en direct. C range le calcul dans l'historique.
  const effacer = () => {
    if (!erreur && aEvaluer.length >= 3 && calculTermine === null) {
      ajouterHistorique({ expression: texteExpression(aEvaluer), mm })
    }
    setElements([])
    setSaisie(saisieVide(saisie.unite))
    setCalculTermine(null)
  }

  const reutiliser = ({ expression, mm }: EntreeHistorique) => {
    setElements([termeResultat(mm)])
    setSaisie(saisieVide(saisie.unite))
    setCalculTermine(expression)
    setHistoriqueOuvert(false)
  }

  const expression =
    calculTermine !== null
      ? `${calculTermine} =`
      : texteExpression(elements) + (estVide(saisie) ? '' : ` ${texteSaisie}`)

  return (
    <div className="page calculatrice">
      {enteteActions &&
        createPortal(
          <button type="button" className="bouton-entete" onClick={() => setHistoriqueOuvert(true)}>
            Historique
          </button>,
          enteteActions,
        )}

      <div className="ecran">
        <div className="expression" aria-live="polite">
          {expression.trim() || '0'}
        </div>
        {erreur ? (
          <div className="resultat erreur">{erreur}</div>
        ) : (
          <Resultat mm={mm} precision={reglages.precision} direction={reglages.direction} onArrondi={ouvrirArrondi} />
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
                  <button type="button" onClick={() => reutiliser(h)}>
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
