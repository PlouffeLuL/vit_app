import { type KeyboardEvent, type PointerEvent, type ReactNode, useRef, useState } from 'react'
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

// Distance de glissement qui suffit pour replier ou déplier.
const SEUIL_GLISSEMENT = 40

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

  // Poignée en haut : glisser vers le bas replie le clavier, vers le haut le déplie; toucher bascule.
  const [replie, setReplie] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const glisse = useRef<{ y: number; depart: number; min: number; max: number; bouge: boolean } | null>(null)

  const debutGlisse = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    e.currentTarget.setPointerCapture(e.pointerId)
    // Mesure les deux hauteurs (replié / déplié) sans rien afficher entre les deux.
    el.classList.add('glisse')
    const depart = el.offsetHeight
    el.classList.toggle('replie', !replie)
    const autre = el.offsetHeight
    el.classList.toggle('replie', replie)
    glisse.current = { y: e.clientY, depart, min: Math.min(depart, autre), max: Math.max(depart, autre), bouge: false }
  }

  const suiteGlisse = (e: PointerEvent<HTMLDivElement>) => {
    const g = glisse.current
    if (!g || !ref.current) return
    const dy = e.clientY - g.y
    if (Math.abs(dy) > 4) g.bouge = true
    ref.current.style.height = `${Math.min(g.max, Math.max(g.min, g.depart - dy))}px`
  }

  const finGlisse = (e: PointerEvent<HTMLDivElement>, annule = false) => {
    const g = glisse.current
    const el = ref.current
    if (!g || !el) return
    glisse.current = null
    el.classList.remove('glisse')
    el.style.height = ''
    const dy = e.clientY - g.y
    if (annule) return
    if (!g.bouge) setReplie((r) => !r)
    else if (dy > SEUIL_GLISSEMENT) setReplie(true)
    else if (dy < -SEUIL_GLISSEMENT) setReplie(false)
  }

  const clavierPoignee = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setReplie((r) => !r)
    }
  }

  return (
    <div className={`clavier ${replie ? 'replie' : ''}`} ref={ref}>
      <div
        className="clavier-poignee"
        role="button"
        tabIndex={0}
        aria-expanded={!replie}
        aria-label={replie ? 'Afficher le clavier' : 'Cacher le clavier'}
        onPointerDown={debutGlisse}
        onPointerMove={suiteGlisse}
        onPointerUp={(e) => finGlisse(e)}
        onPointerCancel={(e) => finGlisse(e, true)}
        onKeyDown={clavierPoignee}
      >
        <span />
      </div>

      <div className="clavier-contenu" inert={replie}>
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
    </div>
  )
}
