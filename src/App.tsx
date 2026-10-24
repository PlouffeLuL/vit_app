import { useCallback, useEffect, useState } from 'react'
import { MenuLateral } from './components/MenuLateral'
import { useReglages } from './hooks/useReglages'
import { Calculatrice } from './pages/Calculatrice'
import { Diviseur } from './pages/Diviseur'

// Ajouter un outil = ajouter une page et une ligne ici.
const OUTILS = [
  { id: 'calculatrice', nom: 'Calculatrice po/mm', Page: Calculatrice },
  { id: 'diviseur', nom: 'Diviseur de longueur', Page: Diviseur },
]

export default function App() {
  const api = useReglages()
  const [actif, setActif] = useState(OUTILS[0].id)
  const [menuOuvert, setMenuOuvert] = useState(false)
  const fermerMenu = useCallback(() => setMenuOuvert(false), [])

  const { theme } = api.reglages
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
      </header>
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
        <outil.Page {...api} />
      </main>
    </div>
  )
}
