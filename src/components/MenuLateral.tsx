import { useEffect } from 'react'
import type { Theme } from '../hooks/useReglages'

interface Props {
  ouvert: boolean
  onFermer: () => void
  outils: { id: string; nom: string }[]
  actif: string
  onChoisir: (id: string) => void
  theme: Theme
  onTheme: (t: Theme) => void
}

export function MenuLateral({ ouvert, onFermer, outils, actif, onChoisir, theme, onTheme }: Props) {
  useEffect(() => {
    if (!ouvert) return
    const echap = (e: KeyboardEvent) => e.key === 'Escape' && onFermer()
    window.addEventListener('keydown', echap)
    return () => window.removeEventListener('keydown', echap)
  }, [ouvert, onFermer])

  return (
    <>
      <div className={`voile ${ouvert ? 'visible' : ''}`} onClick={onFermer} aria-hidden="true" />
      <nav className={`tiroir ${ouvert ? 'ouvert' : ''}`} aria-label="Menu" inert={!ouvert}>
        <h2>Outils</h2>
        <ul>
          {outils.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                aria-current={o.id === actif ? 'page' : undefined}
                onClick={() => {
                  onChoisir(o.id)
                  onFermer()
                }}
              >
                {o.nom}
              </button>
            </li>
          ))}
        </ul>
        <h2>Thème</h2>
        <div className="bascule" role="group" aria-label="Thème">
          {(['clair', 'sombre'] as const).map((t) => (
            <button key={t} type="button" aria-pressed={theme === t} onClick={() => onTheme(t)}>
              {t}
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
