import { useCallback, useEffect, useState } from 'react'
import { MenuLateral } from './components/MenuLateral'
import { PanneauArrondi } from './components/PanneauArrondi'
import { useReglages } from './hooks/useReglages'
import { textePrecision } from './lib/mesure'
import { Calculatrice } from './pages/Calculatrice'
import { Diagonale } from './pages/Diagonale'
import { Diviseur } from './pages/Diviseur'

// Ajouter un outil = ajouter une page et une ligne ici.
const OUTILS = [
  { id: 'calculatrice', nom: 'Calculatrice', Page: Calculatrice },
  { id: 'diviseur', nom: 'Diviseur de longueur', Page: Diviseur },
  { id: 'diagonale', nom: "Diagonale d'angle", Page: Diagonale },
]

const SYMBOLE_DIRECTION = { proche: '≈', haut: '↑', bas: '↓' }

export default function App() {
  const api = useReglages()
  const [actif, setActif] = useState(OUTILS[0].id)
  const [menuOuvert, setMenuOuvert] = useState(false)
  const [arrondiOuvert, setArrondiOuvert] = useState(false)
  const [enteteActions, setEnteteActions] = useState<HTMLElement | null>(null)
  const fermerMenu = useCallback(() => setMenuOuvert(false), [])
  const ouvrirArrondi = useCallback(() => setArrondiOuvert(true), [])
  const fermerArrondi = useCallback(() => setArrondiOuvert(false), [])

  const { theme, precision, direction } = api.reglages
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    // Couleur de la barre d'état du téléphone, assortie au fond.
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'sombre' ? '#121212' : '#f2f2f2')
  }, [theme])

  const outil = OUTILS.find((o) => o.id === actif) ?? OUTILS[0]

  return (
    <div className="app">
      <header className="entete">
        <button type="button" className="hamburger" aria-label="Ouvrir le menu" onClick={() => setMenuOuvert(true)}>
          <span />
          <span />
          <span />
        </button>
        <h1>{outil.nom}</h1>
        <div className="entete-actions">
          <div className="entete-actions-outil" ref={setEnteteActions} />
          <button
            type="button"
            className="bouton-entete"
            aria-label={`Arrondi : ${textePrecision(precision)}`}
            aria-expanded={arrondiOuvert}
            onClick={() => setArrondiOuvert((o) => !o)}
          >
            {textePrecision(precision)} {SYMBOLE_DIRECTION[direction]}
          </button>
        </div>
      </header>
      <PanneauArrondi ouvert={arrondiOuvert} onFermer={fermerArrondi} reglages={api.reglages} modifier={api.modifier} />
      <MenuLateral
        ouvert={menuOuvert}
        onFermer={fermerMenu}
        outils={OUTILS}
        actif={outil.id}
        onChoisir={setActif}
        theme={theme}
        onTheme={(t) => api.modifier({ theme: t })}
      />
      <main>
        <outil.Page {...api} ouvrirArrondi={ouvrirArrondi} enteteActions={enteteActions} />
      </main>
    </div>
  )
}
