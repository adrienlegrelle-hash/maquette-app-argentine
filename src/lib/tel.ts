/**
 * Numéros argentins : on demande l'indicatif régional et le numéro, sans le 0
 * ni le 15. Le +54 9 est affiché à part, on ne le fait jamais taper.
 */
export function telChiffres(saisie: string) {
  return saisie.replace(/\D/g, '').replace(/^0+/, '')
}

export function telComplet(chiffres: string) {
  return chiffres.length === 10
}

/**
 * « +54 9 388 415-7729 » ; Buenos Aires (11) a un indicatif à deux chiffres.
 * Espaces et tiret insécables : un numéro ne se coupe jamais en fin de ligne.
 */
export function telLisible(chiffres: string) {
  const zone = chiffres.startsWith('11') ? 2 : 3
  const a = chiffres.slice(0, zone)
  const b = chiffres.slice(zone)
  const coupe = b.length - 4
  return ['+54', '9', a, `${b.slice(0, coupe)}‑${b.slice(coupe)}`].join(' ')
}
