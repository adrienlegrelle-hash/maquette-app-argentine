/**
 * Données de démonstration : un petit hôtel de Tilcara, des voyageurs
 * argentins. En attendant le back, c'est la seule source des écrans.
 */

/** La colonne d'une conversation, déduite de son état (CLAUDE.md). */
export type Colonne = 'action' | 'unpaid' | 'paid' | 'other'

/** `hoy` affiche l'heure ; `ayer` et `semaine` se traduisent ; sinon la date telle quelle. */
export type Quand = { jour: 'hoy' | 'ayer'; heure: string } | { jour: 'semaine'; es: string; fr: string } | { jour: 'date'; date: string }

export type Message = {
  de: 'huesped' | 'hotel'
  heure: string
  texte?: string
  /** Durée d'un message vocal, « 0:12 ». */
  vocal?: string
  /** Pour un message de l'hôtel : lu par le voyageur (coches bleues). */
  lu?: boolean
}

export type Conversation = {
  id: string
  nom: string
  tel: string
  colonne: Colonne
  /** L'assistant mène l'échange : devis envoyé, paiement attendu, réponse en cours. */
  enCours?: boolean
  /** L'assistant est en train d'écrire, à l'instant. */
  ecrit?: boolean
  nonLus: number
  epingle?: boolean
  /** Contact enregistré dans le téléphone (banque, fournisseur, équipe…). */
  enregistre?: boolean
  /** Choix manuel : true = « Pour moi », false = confié à l'assistant ; absent = la règle décide. */
  pourMoi?: boolean
  /** L'hôtelier a repris la main : l'assistant ne répond plus sur ce fil. */
  pause?: boolean
  quand: Quand
  messages: Message[]
}

export const conversations: Conversation[] = [
  {
    id: 'torres', nom: 'Familia Torres', tel: '+54 9 387 512-4410', colonne: 'action', nonLus: 3, epingle: true,
    quand: { jour: 'hoy', heure: '13:24' },
    messages: [
      { de: 'huesped', heure: '13:20', texte: '¡Hola! Buenas tardes' },
      { de: 'huesped', heure: '13:22', texte: 'Queríamos ir del 14 al 16 de noviembre' },
      { de: 'huesped', heure: '13:24', texte: 'Somos 6, 4 adultos y 2 nenes. ¿Tienen algo para estar todos juntos?' },
    ],
  },
  {
    id: 'banco', nom: 'Carlos · Banco Macro', tel: '+54 9 388 422-9100', colonne: 'other', nonLus: 1, enregistre: true,
    quand: { jour: 'hoy', heure: '12:10' },
    messages: [{ de: 'huesped', heure: '12:10', texte: 'Buen día Hermine, te paso el resumen de la cuenta. ¿Podemos hablar a la tarde?' }],
  },
  {
    id: 'verduras', nom: 'Don José verduras', tel: '+54 9 388 455-0193', colonne: 'other', nonLus: 0, enregistre: true,
    quand: { jour: 'ayer', heure: '18:02' },
    messages: [{ de: 'huesped', heure: '18:02', texte: 'Mañana te llevo los tomates y la lechuga 👍' }],
  },
  {
    id: 'martin', nom: 'Martín Gómez', tel: '+54 9 11 4823-1190', colonne: 'action', nonLus: 2,
    quand: { jour: 'hoy', heure: '13:21' },
    messages: [
      { de: 'huesped', heure: '13:15', texte: '¡Hola! ¿Tienen lugar del 21 al 24 de noviembre? Somos 2' },
      { de: 'hotel', heure: '13:16', lu: true, texte: '¡Hola Martín! Sí, para esas fechas tenemos una habitación doble libre: $68.000 por noche con desayuno. Son 3 noches, $204.000 en total. ¿Te la reservo?' },
      { de: 'huesped', heure: '13:20', texte: '¿La perrita puede venir? Es chiquita 🐶' },
      { de: 'huesped', heure: '13:21', texte: '¿Y aceptan efectivo?' },
    ],
  },
  {
    id: 'nahuel', nom: 'Nahuel Quispe', tel: '+54 9 388 430-2271', colonne: 'other', enCours: true, ecrit: true, nonLus: 0,
    quand: { jour: 'hoy', heure: '13:25' },
    messages: [
      { de: 'huesped', heure: '13:25', texte: '¡Buenas! ¿A qué hora es el check-in? Llegamos en el bus de las 10 desde Jujuy' },
    ],
  },
  {
    id: 'lucia', nom: 'Lucía Fernández', tel: '+54 9 381 566-0934', colonne: 'unpaid', enCours: true, nonLus: 0,
    quand: { jour: 'hoy', heure: '12:48' },
    messages: [
      { de: 'huesped', heure: '12:30', texte: '¡Buenas! Quería reservar la cabaña para 4 del 15 al 17 de diciembre' },
      { de: 'hotel', heure: '12:31', lu: true, texte: '¡Hola Lucía! La cabaña para 4 está libre del 15 al 17/12: 2 noches, $190.000 en total. ¿Te la reservo?' },
      { de: 'huesped', heure: '12:45', texte: 'Dale, la reservo' },
      { de: 'hotel', heure: '12:48', lu: true, texte: '¡Genial! Te la dejo bloqueada hasta mañana a las 12:48. Para confirmarla, pagá acá con Mercado Pago: mpago.la/2xK9fQ' },
    ],
  },
  {
    id: 'silvia', nom: 'Silvia Ruiz', tel: '+54 9 351 702-4485', colonne: 'paid', nonLus: 0,
    quand: { jour: 'hoy', heure: '11:05' },
    messages: [
      { de: 'huesped', heure: '10:58', texte: 'Listo, ya pagué 🙌' },
      { de: 'hotel', heure: '11:05', lu: true, texte: '¡Recibido, Silvia! Tu reserva está confirmada: habitación doble, del 2 al 4 de noviembre. El check-in es desde las 14 h. ¡Te esperamos!' },
    ],
  },
  {
    id: 'ramon', nom: 'Ramón Díaz', tel: '+54 9 388 619-0072', colonne: 'unpaid', enCours: true, nonLus: 0,
    quand: { jour: 'ayer', heure: '19:30' },
    messages: [
      { de: 'huesped', heure: '19:22', texte: 'Hola, ¿puedo dejar una seña y el resto lo pago al llegar?' },
      { de: 'hotel', heure: '19:30', lu: false, texte: '¡Claro, Ramón! Con una seña de $45.000 te guardamos la habitación. Te mando el link de pago: mpago.la/9Hd2Lm' },
    ],
  },
  {
    id: 'agustina', nom: 'Agustina Vera', tel: '+54 9 11 3391-7720', colonne: 'other', nonLus: 0,
    quand: { jour: 'ayer', heure: '10:12' },
    messages: [
      { de: 'hotel', heure: '09:50', lu: true, texte: '¡Gracias por elegirnos, Agustina! Que tengan buen viaje de vuelta.' },
      { de: 'huesped', heure: '10:12', texte: '¡Gracias por todo! La pasamos re bien, volvemos seguro 💛' },
    ],
  },
  {
    id: 'hilda', nom: 'Hilda Mamani', tel: '+54 9 388 245-8813', colonne: 'paid', nonLus: 0,
    quand: { jour: 'semaine', es: 'miércoles', fr: 'mercredi' },
    messages: [
      { de: 'huesped', heure: '16:02', texte: 'Perfecto, ahí te mandé el pago' },
      { de: 'hotel', heure: '16:10', lu: true, texte: 'Tu reserva quedó confirmada ✅ Del 8 al 10 de noviembre, cabaña para 4.' },
    ],
  },
  {
    id: 'diego', nom: 'Diego Paz', tel: '+54 9 264 488-3105', colonne: 'other', nonLus: 0,
    quand: { jour: 'date', date: '27/10/2026' },
    messages: [
      { de: 'huesped', heure: '18:40', texte: 'Hola, una consulta' },
      { de: 'huesped', heure: '18:41', vocal: '0:12' },
    ],
  },
]

/** Le tableau de bord de la démo (onglet Menu), au vendredi 30 octobre. */
export const tableau = {
  arrivees: [
    { nom: 'Agustín Ríos', chambre: { es: 'Doble', fr: 'Double' }, nuits: 2, paye: true },
    { nom: 'Familia Paredes', chambre: { es: 'Cabaña 4', fr: 'Cabane 4' }, nuits: 3, paye: false },
  ],
  departs: 1,
  /** Unités libres ce soir, par type : stock − réservations − blocages. */
  libres: [
    { type: { es: 'Doble', fr: 'Double' }, libres: 1, stock: 3 },
    { type: { es: 'Cabaña 4', fr: 'Cabane 4' }, libres: 0, stock: 2 },
    { type: { es: 'Dormi (camas)', fr: 'Dortoir (lits)' }, libres: 3, stock: 6 },
  ],
  aEncaisser: [
    { nom: 'Lucía Fernández', montant: 190000, echeance: { es: 'vence mañana 12:48', fr: 'expire demain 12:48' } },
    { nom: 'Ramón Díaz', montant: 45000, echeance: { es: 'seña', fr: 'acompte' } },
  ],
  /** Unités occupées sur 11, les sept prochaines nuits. */
  semaine: [
    { es: 'vie', fr: 'ven', occ: 9 }, { es: 'sáb', fr: 'sam', occ: 11 }, { es: 'dom', fr: 'dim', occ: 7 },
    { es: 'lun', fr: 'lun', occ: 3 }, { es: 'mar', fr: 'mar', occ: 4 }, { es: 'mié', fr: 'mer', occ: 5 }, { es: 'jue', fr: 'jeu', occ: 8 },
  ],
  totalUnites: 11,
  mois: {
    reservations: 23,
    encaisse: 4850000,
    reponse: '38 s',
    seul: 81,
  },
}

/** « $ 190.000 » : pesos, séparateur de milliers à l'argentine. */
export function pesos(n: number) {
  return '$ ' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/** Un séjour du calendrier : arrivée `debut`, départ `fin` (la nuit de `fin` n'est pas comptée). */
export type Sejour = {
  id: string
  nom: string
  chambre: string
  debut: string
  fin: string
  statut: 'confirmee' | 'attente' | 'bloque'
  /** Pour un blocage importé par iCal. */
  source?: 'Booking' | 'Airbnb'
  /** Par où la réservation est arrivée, et la discussion à rouvrir. */
  canal: 'whatsapp' | 'instagram' | 'booking' | 'airbnb'
  convId?: string
  tel?: string
  adultes: number
  enfants: number
  options: string[]
  montant: number
  paye: number
}

export const sejours: Sejour[] = [
  { id: 's1', nom: 'Agustina Vera', chambre: 'Double', debut: '2026-10-27', fin: '2026-10-29', statut: 'confirmee', canal: 'whatsapp', convId: 'agustina', tel: '+54 9 11 3391-7720', adultes: 2, enfants: 0, options: ['Petit-déjeuner'], montant: 136000, paye: 136000 },
  { id: 's2', nom: 'Agustín Ríos', chambre: 'Double', debut: '2026-10-30', fin: '2026-11-01', statut: 'confirmee', canal: 'instagram', adultes: 2, enfants: 0, options: ['Petit-déjeuner', 'Arrivée tardive (22 h)'], montant: 136000, paye: 136000 },
  { id: 's3', nom: 'Familia Paredes', chambre: 'Cabane 4', debut: '2026-10-30', fin: '2026-11-02', statut: 'attente', canal: 'whatsapp', tel: '+54 9 387 440-1278', adultes: 2, enfants: 2, options: ['Lit bébé'], montant: 285000, paye: 85500 },
  { id: 's4', nom: 'Booking', chambre: 'Double', debut: '2026-10-31', fin: '2026-11-02', statut: 'bloque', source: 'Booking', canal: 'booking', adultes: 2, enfants: 0, options: [], montant: 0, paye: 0 },
  { id: 's5', nom: 'Nahuel Quispe', chambre: 'Dortoir', debut: '2026-10-31', fin: '2026-11-01', statut: 'confirmee', canal: 'whatsapp', convId: 'nahuel', tel: '+54 9 388 430-2271', adultes: 1, enfants: 0, options: [], montant: 18000, paye: 18000 },
  { id: 's6', nom: 'Silvia Ruiz', chambre: 'Double', debut: '2026-11-02', fin: '2026-11-04', statut: 'confirmee', canal: 'whatsapp', convId: 'silvia', tel: '+54 9 351 702-4485', adultes: 2, enfants: 0, options: ['Petit-déjeuner'], montant: 136000, paye: 136000 },
  { id: 's7', nom: 'Airbnb', chambre: 'Dortoir', debut: '2026-11-06', fin: '2026-11-09', statut: 'bloque', source: 'Airbnb', canal: 'airbnb', adultes: 1, enfants: 0, options: [], montant: 0, paye: 0 },
  { id: 's8', nom: 'Ramón Díaz', chambre: 'Double', debut: '2026-11-07', fin: '2026-11-09', statut: 'attente', canal: 'whatsapp', convId: 'ramon', tel: '+54 9 388 619-0072', adultes: 2, enfants: 1, options: ['Animal (chien)'], montant: 136000, paye: 0 },
  { id: 's9', nom: 'Hilda Mamani', chambre: 'Cabane 4', debut: '2026-11-08', fin: '2026-11-10', statut: 'confirmee', canal: 'whatsapp', convId: 'hilda', tel: '+54 9 388 245-8813', adultes: 3, enfants: 1, options: ['Petit-déjeuner', 'Parking'], montant: 190000, paye: 190000 },
  { id: 's10', nom: 'Juan Pérez', chambre: 'Double', debut: '2026-11-12', fin: '2026-11-15', statut: 'confirmee', canal: 'instagram', adultes: 2, enfants: 0, options: [], montant: 204000, paye: 204000 },
  { id: 's11', nom: 'Carla Méndez', chambre: 'Dortoir', debut: '2026-11-20', fin: '2026-11-22', statut: 'confirmee', canal: 'whatsapp', tel: '+54 9 11 5520-3348', adultes: 1, enfants: 0, options: [], montant: 36000, paye: 36000 },
  { id: 's12', nom: 'Booking', chambre: 'Cabane 4', debut: '2026-11-27', fin: '2026-11-30', statut: 'bloque', source: 'Booking', canal: 'booking', adultes: 4, enfants: 0, options: [], montant: 0, paye: 0 },
  { id: 's13', nom: 'Lucía Fernández', chambre: 'Cabane 4', debut: '2026-12-15', fin: '2026-12-17', statut: 'attente', canal: 'whatsapp', convId: 'lucia', tel: '+54 9 381 566-0934', adultes: 4, enfants: 0, options: [], montant: 190000, paye: 0 },
]

/** Ce que l'assistant d'aide sait montrer : des mots-clés, une réponse, et où aller. */
export type Aide = { mots: string[]; reponse: string; route: '/' | '/calendario' | '/menu' | '/ajustes'; repere: string; bouton: string }

export const aides: Aide[] = [
  { mots: ['reserv', 'nouvelle', 'ajouter un client', 'booker'], route: '/', repere: 'nouvelleReservation', bouton: 'Me montrer',
    reponse: 'Pour créer une réservation vous-même, touchez le + vert en haut à droite des Discussions. Vous pouvez aussi le faire depuis le Calendrier, avec le + en bas à droite.' },
  { mots: ['categor', 'liste', 'filtre', 'ranger', 'trier'], route: '/', repere: 'categorie', bouton: 'Me montrer',
    reponse: 'Touchez le + à droite des filtres (Action requise, En cours, Toutes). Donnez un nom, cochez les discussions : c’est fait.' },
  { mots: ['dispo', 'libre', 'place', 'calendrier', 'planning', 'occup', 'agenda'], route: '/calendario', repere: 'moisCalendrier', bouton: 'Ouvrir le calendrier',
    reponse: 'Le Calendrier montre toutes les réservations, jour par jour. Touchez le nom du mois en haut pour voir le mois entier.' },
  { mots: ['prix', 'tarif', 'chambre', 'stock'], route: '/ajustes', repere: 'chambres', bouton: 'Me montrer',
    reponse: 'Vos chambres et vos prix se règlent dans Paramètres, à la ligne « Chambres et prix ».' },
  { mots: ['mercado', 'paiement en ligne', 'lien de paiement', 'lier'], route: '/ajustes', repere: 'mercadopago', bouton: 'Me montrer',
    reponse: 'Dans Paramètres, ligne « Mercado Pago », touchez « Lier mon compte ». Les liens de paiement partiront ensuite tout seuls.' },
  { mots: ['qui doit', 'impay', 'encaiss', 'argent', 'acompte', 'payer'], route: '/menu', repere: 'aEncaisser', bouton: 'Me montrer',
    reponse: 'Le tableau de bord, dans l’onglet Menu, liste qui doit encore payer, avec le montant et l’échéance.' },
  { mots: ['style', 'ton', 'ecri', 'comme moi', 'parle'], route: '/ajustes', repere: 'style', bouton: 'Me montrer',
    reponse: 'Dans Paramètres, ligne « Style d’écriture », choisissez les discussions dont l’assistant s’inspire pour écrire comme vous.' },
  { mots: ['instagram', 'insta', 'messenger', 'facebook', 'booking', 'mail', 'canal', 'canaux', 'airbnb'], route: '/ajustes', repere: 'canaux', bouton: 'Me montrer',
    reponse: 'Dans Paramètres, ligne « Autres canaux » : cochez Instagram, Messenger, Booking ou Mail. Tout arrivera dans Discussions.' },
  { mots: ['action', 'urgent', 'repondre', 'attend'], route: '/', repere: 'filtreAction', bouton: 'Me montrer',
    reponse: 'Les discussions qui vous attendent sont dans Discussions, sous le premier filtre : « Action requise ».' },
  { mots: ['whatsapp', 'numero', 'telephone', 'connect'], route: '/ajustes', repere: 'whatsapp', bouton: 'Me montrer',
    reponse: 'Dans Paramètres, ligne « WhatsApp » : vous y voyez le numéro branché et pouvez le changer.' },
]

export const suggestionsAide = ['Créer une réservation', 'Voir mes disponibilités', 'Changer mes prix', 'Lier Mercado Pago', 'Qui doit payer ?', 'Créer une catégorie']

/** Les types de chambre « trouvés » sur le site de l'hôtel, en démo. */
export const chambresDuSite = [
  { id: 'c1', nom: 'Double', stock: 3, prix: '68000' },
  { id: 'c2', nom: 'Cabane 4', stock: 2, prix: '95000' },
  { id: 'c3', nom: 'Dortoir (lit)', stock: 6, prix: '18000' },
]

/** Les statistiques par mois et par canal (écran Statistiques, depuis le Menu). */
export type CanalStat = 'whatsapp' | 'instagram' | 'messenger' | 'booking' | 'direct'
export const statsMois: { mois: string; reponse: string; seul: number; demandes: number; canaux: Record<CanalStat, { reservations: number; montant: number }> }[] = [
  { mois: 'Août 2026', reponse: '1 min 10', seul: 64, demandes: 96,
    canaux: { whatsapp: { reservations: 9, montant: 1530000 }, instagram: { reservations: 3, montant: 420000 }, messenger: { reservations: 1, montant: 136000 }, booking: { reservations: 6, montant: 1105000 }, direct: { reservations: 2, montant: 260000 } } },
  { mois: 'Septembre 2026', reponse: '52 s', seul: 73, demandes: 118,
    canaux: { whatsapp: { reservations: 13, montant: 2210000 }, instagram: { reservations: 4, montant: 560000 }, messenger: { reservations: 2, montant: 254000 }, booking: { reservations: 5, montant: 940000 }, direct: { reservations: 1, montant: 136000 } } },
  { mois: 'Octobre 2026', reponse: '38 s', seul: 81, demandes: 142,
    canaux: { whatsapp: { reservations: 16, montant: 3380000 }, instagram: { reservations: 4, montant: 830000 }, messenger: { reservations: 1, montant: 190000 }, booking: { reservations: 4, montant: 760000 }, direct: { reservations: 2, montant: 450000 } } },
]
