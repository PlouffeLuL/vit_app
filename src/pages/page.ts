import type { ReglagesApi } from '../hooks/useReglages'

/** Ce que l'App donne à chaque outil. */
export interface PageProps extends ReglagesApi {
  ouvrirArrondi: () => void
  /** Emplacement dans l'en-tête, pour les boutons propres à l'outil. */
  enteteActions: HTMLElement | null
}
