/** Dates de la maquette, en ISO « 2026-10-30 », calculées en UTC pour ne pas dériver. */

/** La démo vit le vendredi 30 octobre 2026. */
export const AUJOURDHUI = '2026-10-30'

export const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
export const JOURS_COURTS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.']
/** En-tête de la grille du mois, lundi en premier. */
export const INITIALES = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export function date(iso: string) {
  const [a, m, j] = iso.split('-').map(Number)
  return new Date(Date.UTC(a, m - 1, j))
}

export function iso(d: Date) {
  return d.toISOString().slice(0, 10)
}

export function plusJours(jour: string, n: number) {
  const d = date(jour)
  d.setUTCDate(d.getUTCDate() + n)
  return iso(d)
}

/** Nombre de jours de `a` à `b`. */
export function ecart(a: string, b: string) {
  return Math.round((date(b).getTime() - date(a).getTime()) / 86_400_000)
}

/** Les cases d'un mois, lundi en premier, `null` pour compléter les semaines. */
export function casesDuMois(annee: number, mois: number) {
  const premier = new Date(Date.UTC(annee, mois, 1))
  const decalage = (premier.getUTCDay() + 6) % 7
  const nb = new Date(Date.UTC(annee, mois + 1, 0)).getUTCDate()
  const cases: (string | null)[] = Array(decalage).fill(null)
  for (let j = 1; j <= nb; j++) cases.push(iso(new Date(Date.UTC(annee, mois, j))))
  while (cases.length % 7) cases.push(null)
  return cases
}
