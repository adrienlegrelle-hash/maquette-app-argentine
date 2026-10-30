import { router } from 'expo-router'
import { useState, type ReactNode } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Circle } from 'react-native-svg'
import { TeteBot } from '@/components/Agent'
import { Repere } from '@/components/Repere'
import { AUJOURDHUI } from '@/lib/dates'
import { UNITES, occupation, pesos, sejours, statsMois, tableau } from '@/lib/demo'
import { estPourMoi, useEtat } from '@/lib/etat'
import { Icon, type IconName } from '@/lib/icons'
import { num, useCal, useWa } from '@/lib/theme'

/**
 * Le tableau de bord (onglet Menu), en quatre propositions à comparer.
 * Le sélecteur en haut est provisoire : on garde la variante choisie.
 */
const VARIANTES = [
  { cle: 'briefing', nom: 'Briefing' },
  { cle: 'widgets', nom: 'Widgets' },
  { cle: 'afaire', nom: 'À faire' },
  { cle: 'agent', nom: 'Message' },
] as const
type Variante = (typeof VARIANTES)[number]['cle']

/** Les chiffres du jour, communs aux quatre variantes. */
function useJour() {
  const { convs, config, regleContacts } = useEtat()
  const actives = convs.filter((c) => !estPourMoi(c, regleContacts))
  const arrivees = sejours.filter((s) => s.debut === AUJOURDHUI && s.statut !== 'bloque')
  const departs = sejours.filter((s) => s.fin === AUJOURDHUI && s.statut !== 'bloque')
  const aEncaisser = tableau.aEncaisser.reduce((n, x) => n + x.montant, 0)
  const mois = Object.values(statsMois[statsMois.length - 1].canaux)
    .reduce((n, c) => ({ reservations: n.reservations + c.reservations, montant: n.montant + c.montant }), { reservations: 0, montant: 0 })
  return {
    prenom: config.prenom || 'Hermine',
    action: actives.filter((c) => c.colonne === 'action'),
    enCours: actives.filter((c) => c.enCours && !c.pause).length,
    occ: occupation(AUJOURDHUI),
    arrivees, departs, aEncaisser, mois,
  }
}

export default function Tablero() {
  const wa = useWa()
  const { ouvrirAgent } = useEtat()
  const [question, setQuestion] = useState('')
  const [variante, setVariante] = useState<Variante>('briefing')
  const envoyer = () => { ouvrirAgent(question.trim() || undefined); setQuestion('') }

  return (
    <SafeAreaView edges={['top']} style={[s.flex, { backgroundColor: variante === 'agent' ? wa.papier : wa.fond }]}>
      <ScrollView contentContainerStyle={s.contenu} keyboardShouldPersistTaps="handled">
        <View style={[s.choix, { backgroundColor: wa.champ }]}>
          {VARIANTES.map((v) => (
            <Pressable key={v.cle} onPress={() => setVariante(v.cle)} accessibilityRole="radio" accessibilityState={{ selected: v.cle === variante }}
                       style={[s.choixOption, v.cle === variante && { backgroundColor: wa.fond }]}>
              <Text style={[s.choixTexte, { color: v.cle === variante ? wa.encre : wa.gris }]}>{v.nom}</Text>
            </Pressable>
          ))}
        </View>

        <View style={[s.question, { backgroundColor: variante === 'agent' ? wa.saisie : wa.champ }]}>
          <Icon name="sparkles" size={20} color={wa.vert} plein />
          <TextInput value={question} onChangeText={setQuestion} placeholder="Posez votre question à l’assistant…"
                     placeholderTextColor={wa.gris} returnKeyType="send" accessibilityLabel="Question pour l’assistant Roomz"
                     onSubmitEditing={envoyer} style={[s.questionChamp, { color: wa.encre }]} />
          <Pressable onPress={envoyer} accessibilityRole="button" accessibilityLabel="Envoyer" style={[s.questionEnvoyer, { backgroundColor: wa.vert }]}>
            <Icon name="send" size={16} color={wa.surVert} plein />
          </Pressable>
        </View>

        {variante === 'briefing' && <Briefing />}
        {variante === 'widgets' && <Widgets />}
        {variante === 'afaire' && <AFaire />}
        {variante === 'agent' && <MessageAgent />}
      </ScrollView>
    </SafeAreaView>
  )
}

/* ── A. Briefing : une phrase qui résume, puis la journée heure par heure ── */
function Briefing() {
  const wa = useWa()
  const j = useJour()
  const taux = j.occ / UNITES
  const lignes = [
    ...j.departs.map((d) => ({ heure: '10:00', quoi: 'Départ', qui: d.nom, ou: d.chambre, id: d.id })),
    ...j.arrivees.map((a) => ({ heure: '14:00', quoi: 'Arrivée', qui: a.nom, ou: a.chambre, id: a.id })),
  ]
  return (
    <View style={s.bloc}>
      <Text style={[s.salut, { color: wa.encre }]}>Bonjour {j.prenom},</Text>
      <Text style={[s.resume, { color: wa.gris }]}>
        Aujourd’hui, <Gras>{pl(j.arrivees.length, 'arrivée')}</Gras> et <Gras>{pl(j.departs.length, 'départ')}</Gras>. Ce soir, l’hôtel est
        rempli à <Gras>{Math.round(taux * 100)} %</Gras>. <Gras>{pl(j.action.length, 'discussion')}</Gras> vous attendent et
        il reste <Gras>{pesos(j.aEncaisser)}</Gras> à encaisser.
      </Text>

      <View style={[s.jauge, { backgroundColor: wa.champ }]}>
        <View style={[s.jaugePlein, { width: `${taux * 100}%`, backgroundColor: wa.vert }]} />
      </View>
      <Text style={[s.petit, num, { color: wa.gris }]}>{j.occ} unités occupées sur {UNITES} ce soir</Text>

      <Titre>Votre journée</Titre>
      {lignes.map((l) => (
        <Pressable key={l.id + l.quoi} onPress={() => router.push({ pathname: '/reservation/[id]', params: { id: l.id } })} style={s.creneau}>
          <Text style={[s.heure, num, { color: wa.gris }]}>{l.heure}</Text>
          <View style={[s.trait, { backgroundColor: l.quoi === 'Arrivée' ? wa.vert : wa.chipBord }]} />
          <View style={s.flex}>
            <Text style={[s.creneauTitre, { color: wa.encre }]}>{l.quoi} · {l.qui}</Text>
            <Text style={[s.petit, { color: wa.gris }]}>{l.ou}</Text>
          </View>
        </Pressable>
      ))}
      <LienStats />
    </View>
  )
}

/* ── B. Widgets : de grandes tuiles à lire d'un coup d'œil ── */
function Widgets() {
  const wa = useWa()
  const cal = useCal()
  const j = useJour()
  return (
    <View style={s.bloc}>
      <View style={s.grille}>
        <Widget titre="Ce soir" onPress={() => router.navigate('/calendario')}>
          <View style={s.anneauBloc}>
            <Anneau taux={j.occ / UNITES} taille={72} epaisseur={7} />
            <Text style={[s.anneauTexte, num, { color: wa.encre }]}>{j.occ}/{UNITES}</Text>
          </View>
          <Text style={[s.petit, { color: wa.gris }]}>unités occupées</Text>
        </Widget>
        <Widget titre="Vous attendent" onPress={() => router.navigate('/')}>
          <Text style={[s.grosChiffre, num, { color: j.action.length ? wa.vert : wa.encre }]}>{j.action.length}</Text>
          <Text style={[s.petit, { color: wa.gris }]}>discussions · {j.enCours} en cours</Text>
        </Widget>
        <Widget titre="Arrivées" onPress={() => router.navigate('/calendario')}>
          <Text style={[s.grosChiffre, num, { color: wa.encre }]}>{j.arrivees.length}</Text>
          <Text numberOfLines={2} style={[s.petit, { color: wa.gris }]}>{j.arrivees.map((a) => a.nom.split(' ')[0]).join(', ') || 'Personne'}</Text>
        </Widget>
        <Widget titre="À encaisser" onPress={() => router.navigate('/calendario')} repere="aEncaisser">
          <Text style={[s.moyenChiffre, num, { color: wa.encre }]}>{pesos(j.aEncaisser)}</Text>
          <Text style={[s.petit, { color: wa.gris }]}>{tableau.aEncaisser.length} réservations</Text>
        </Widget>
      </View>
      <View style={[s.large, { backgroundColor: wa.champ }]}>
        <Text style={[s.widgetTitre, { color: wa.gris }]}>7 prochains jours</Text>
        <View style={s.semaine}>
          {tableau.semaine.map((n, i) => (
            <View key={i} style={s.semaineJour}>
              <Anneau taux={n.occ / UNITES} taille={34} epaisseur={3.5} />
              <Text style={[s.petit, { color: i === 0 ? cal.aujourdhui : wa.gris }]}>{n.fr}</Text>
            </View>
          ))}
        </View>
      </View>
      <LienStats />
    </View>
  )
}

/* ── C. À faire : la journée comme une liste à cocher ── */
function AFaire() {
  const wa = useWa()
  const j = useJour()
  const { basculerCheckin, checkins } = useEtat()
  const [faits, setFaits] = useState<string[]>([])
  const taches: { id: string; checkin?: boolean; icon: IconName; titre: string; sous: string; action: () => void; fait: boolean }[] = [
    ...j.action.map((c) => ({ id: `r-${c.id}`, icon: 'chat' as const, titre: `Répondre à ${c.nom}`, sous: 'Discussion en attente',
      action: () => router.push({ pathname: '/chat/[id]', params: { id: c.id } }), fait: faits.includes(`r-${c.id}`) })),
    ...j.departs.map((d) => ({ id: `d-${d.id}`, icon: 'depart' as const, titre: `Départ de ${d.nom}`, sous: `${d.chambre} · avant 10 h`,
      action: () => router.push({ pathname: '/reservation/[id]', params: { id: d.id } }), fait: faits.includes(`d-${d.id}`) })),
    ...j.arrivees.map((a) => ({ id: a.id, checkin: true, icon: 'arrivee' as const, titre: `Accueillir ${a.nom}`, sous: `${a.chambre} · dès 14 h`,
      action: () => router.push({ pathname: '/reservation/[id]', params: { id: a.id } }), fait: checkins.includes(a.id) })),
    ...tableau.aEncaisser.slice(0, 2).map((p) => ({ id: `p-${p.nom}`, icon: 'card' as const, titre: `Relancer ${p.nom}`, sous: `${pesos(p.montant)} · ${p.echeance.fr}`,
      action: () => router.navigate('/'), fait: faits.includes(`p-${p.nom}`) })),
  ]
  const cocher = (t: (typeof taches)[number]) => {
    if (t.checkin) basculerCheckin(t.id)
    else setFaits((f) => (f.includes(t.id) ? f.filter((x) => x !== t.id) : [...f, t.id]))
  }
  const nFaits = taches.filter((t) => t.fait).length
  return (
    <View style={s.bloc}>
      <View style={s.ligneTitre}>
        <Text style={[s.salut, { color: wa.encre }]}>Aujourd’hui</Text>
        <Text style={[s.petit, num, { color: wa.gris }]}>{nFaits} sur {taches.length} faits</Text>
      </View>
      <View style={[s.jauge, { backgroundColor: wa.champ }]}>
        <View style={[s.jaugePlein, { width: `${(nFaits / Math.max(1, taches.length)) * 100}%`, backgroundColor: wa.vert }]} />
      </View>
      <View style={[s.groupe, { backgroundColor: wa.champ }]}>
        {taches.map((t, k) => (
          <View key={t.id} style={[s.tache, k > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: wa.ligne }]}>
            <Pressable onPress={() => cocher(t)} hitSlop={8} accessibilityRole="checkbox" accessibilityState={{ checked: t.fait }}
                       style={[s.case, t.fait ? { backgroundColor: wa.vert, borderColor: wa.vert } : { borderColor: wa.chipBord }]}>
              {t.fait && <Icon name="checkPlain" size={14} color={wa.surVert} trait={3} />}
            </Pressable>
            <Pressable onPress={t.action} style={s.tacheCorps}>
              <View style={s.flex}>
                <Text style={[s.creneauTitre, { color: wa.encre, opacity: t.fait ? 0.45 : 1, textDecorationLine: t.fait ? 'line-through' : 'none' }]}>{t.titre}</Text>
                <Text style={[s.petit, { color: wa.gris }]}>{t.sous}</Text>
              </View>
              <Icon name={t.icon} size={18} color={wa.gris} trait={1.7} />
            </Pressable>
          </View>
        ))}
      </View>
      <LienStats />
    </View>
  )
}

/* ── D. Message : le point du jour envoyé par l'agent, comme dans WhatsApp ── */
function MessageAgent() {
  const wa = useWa()
  const j = useJour()
  const { ouvrirAgent } = useEtat()
  const reponses = ['Qui arrive aujourd’hui ?', 'Qui doit payer ?', 'Voir mes disponibilités']
  return (
    <View style={s.bloc}>
      <View style={s.agentEntete}>
        <TeteBot size={34} />
        <Text style={[s.creneauTitre, { color: wa.encre }]}>Votre agent · 8:00</Text>
      </View>
      <View style={[s.bulle, { backgroundColor: wa.bulleIn }]}>
        <Text style={[s.bulleTexte, { color: wa.encre }]}>
          Bonjour {j.prenom} ☀️ Voici le point du jour : {pl(j.arrivees.length, 'arrivée')}, {pl(j.departs.length, 'départ')}, {j.occ}/{UNITES} unités
          occupées ce soir.
        </Text>
      </View>
      <View style={[s.bulle, { backgroundColor: wa.bulleIn }]}>
        <LigneBulle icon="chat" texte={`${pl(j.action.length, 'discussion')} vous attendent`} onPress={() => router.navigate('/')} />
        <LigneBulle icon="card" texte={`${pesos(j.aEncaisser)} à encaisser`} onPress={() => ouvrirAgent('Qui doit payer ?')} />
        <LigneBulle icon="trendUp" texte={`Octobre : ${j.mois.reservations} réservations · ${pesos(j.mois.montant)}`} onPress={() => router.push('/stats')} dernier />
      </View>
      <View style={[s.bulle, { backgroundColor: wa.bulleIn }]}>
        <Text style={[s.bulleTexte, { color: wa.encre }]}>Je m’occupe des {j.enCours} autres discussions. Je vous préviens s’il y a besoin de vous.</Text>
      </View>
      <View style={s.reponses}>
        {reponses.map((r) => (
          <Pressable key={r} onPress={() => ouvrirAgent(r)} style={[s.reponse, { backgroundColor: wa.saisie, borderColor: wa.chipBord }]}>
            <Text style={[s.reponseTexte, { color: wa.vertEncre }]}>{r}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

/* ── Briques communes ── */

/** « 1 départ », « 2 départs ». */
function pl(n: number, mot: string) {
  return `${n} ${mot}${n > 1 ? 's' : ''}`
}

function Gras({ children }: { children: ReactNode }) {
  const wa = useWa()
  return <Text style={[s.gras, num, { color: wa.encre }]}>{children}</Text>
}

function Titre({ children }: { children: string }) {
  const wa = useWa()
  return <Text style={[s.titreSection, { color: wa.gris }]}>{children}</Text>
}

function Widget({ titre, children, onPress, repere }: { titre: string; children: ReactNode; onPress: () => void; repere?: string }) {
  const wa = useWa()
  const tuile = (
    <Pressable onPress={onPress} style={({ pressed }) => [s.widget, { backgroundColor: wa.champ, opacity: pressed ? 0.7 : 1 }]}>
      <Text style={[s.widgetTitre, { color: wa.gris }]}>{titre}</Text>
      {children}
    </Pressable>
  )
  return <View style={s.widgetCase}>{repere ? <Repere cle={repere} rayon={20}>{tuile}</Repere> : tuile}</View>
}

function LigneBulle({ icon, texte, onPress, dernier }: { icon: IconName; texte: string; onPress: () => void; dernier?: boolean }) {
  const wa = useWa()
  return (
    <Pressable onPress={onPress} style={[s.ligneBulle, !dernier && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: wa.ligne }]}>
      <Icon name={icon} size={18} color={wa.vert} />
      <Text style={[s.bulleTexte, s.flex, { color: wa.encre }]}>{texte}</Text>
      <Icon name="chevR" size={16} color={wa.gris} />
    </Pressable>
  )
}

/** Anneau d'occupation, mêmes teintes que le calendrier. */
function Anneau({ taux, taille, epaisseur }: { taux: number; taille: number; epaisseur: number }) {
  const cal = useCal()
  const r = (taille - epaisseur) / 2
  const tour = 2 * Math.PI * r
  const teinte = taux >= 1 ? cal.occComplet : taux >= 0.7 ? cal.occTendu : cal.occCalme
  return (
    <Svg width={taille} height={taille}>
      <Circle cx={taille / 2} cy={taille / 2} r={r} stroke={cal.piste} strokeWidth={epaisseur} fill="none" />
      <Circle cx={taille / 2} cy={taille / 2} r={r} stroke={teinte} strokeWidth={epaisseur} fill="none" strokeLinecap="round"
              strokeDasharray={`${tour * Math.min(1, taux)} ${tour}`} transform={`rotate(-90 ${taille / 2} ${taille / 2})`} />
    </Svg>
  )
}

function LienStats() {
  const wa = useWa()
  const j = useJour()
  return (
    <Pressable onPress={() => router.push('/stats')} accessibilityRole="button"
               style={({ pressed }) => [s.stats, { backgroundColor: wa.champ, opacity: pressed ? 0.7 : 1 }]}>
      <Icon name="trendUp" size={20} color={wa.vert} />
      <Text numberOfLines={1} style={[s.statsTexte, { color: wa.encre }]}>
        Octobre : <Text style={[num, s.gras]}>{j.mois.reservations}</Text> réservations · <Text style={[num, s.gras]}>{pesos(j.mois.montant)}</Text>
      </Text>
      <Icon name="chevR" size={16} color={wa.gris} />
    </Pressable>
  )
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  gras: { fontWeight: '700' },
  contenu: { padding: 16, paddingTop: 12, gap: 16, paddingBottom: 32 },
  choix: { flexDirection: 'row', borderRadius: 999, padding: 3 },
  choixOption: { flex: 1, minHeight: 34, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  choixTexte: { fontSize: 13, fontWeight: '600' },
  question: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 999, paddingLeft: 16, paddingRight: 5, height: 50 },
  questionChamp: { flex: 1, fontSize: 16, height: 48 },
  questionEnvoyer: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  bloc: { gap: 12 },
  salut: { fontSize: 28, fontWeight: '700' },
  resume: { fontSize: 17, lineHeight: 25 },
  jauge: { height: 8, borderRadius: 4, overflow: 'hidden' },
  jaugePlein: { height: 8, borderRadius: 4 },
  petit: { fontSize: 13, lineHeight: 18 },
  titreSection: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 8 },
  creneau: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 },
  heure: { width: 44, fontSize: 14, fontWeight: '600' },
  trait: { width: 3, alignSelf: 'stretch', borderRadius: 2 },
  creneauTitre: { fontSize: 16, fontWeight: '600' },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  widgetCase: { flexGrow: 1, flexBasis: '45%' },
  widget: { borderRadius: 20, padding: 14, gap: 6, minHeight: 140 },
  widgetTitre: { fontSize: 13, fontWeight: '600' },
  anneauBloc: { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  anneauTexte: { position: 'absolute', fontSize: 16, fontWeight: '700' },
  grosChiffre: { fontSize: 44, fontWeight: '700', lineHeight: 50 },
  moyenChiffre: { fontSize: 24, fontWeight: '700', marginTop: 12 },
  large: { borderRadius: 20, padding: 14, gap: 10 },
  semaine: { flexDirection: 'row', justifyContent: 'space-between' },
  semaineJour: { alignItems: 'center', gap: 4 },
  ligneTitre: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  groupe: { borderRadius: 16, paddingHorizontal: 14 },
  tache: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60 },
  case: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  tacheCorps: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  agentEntete: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bulle: { alignSelf: 'flex-start', maxWidth: '92%', borderRadius: 14, borderTopLeftRadius: 4, paddingHorizontal: 12, paddingVertical: 10, boxShadow: '0 1px 0.5px rgba(11,20,26,.13)' },
  bulleTexte: { fontSize: 16, lineHeight: 22 },
  ligneBulle: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  reponses: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  reponse: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  reponseTexte: { fontSize: 14, fontWeight: '600' },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, paddingHorizontal: 14, minHeight: 50, marginTop: 4 },
  statsTexte: { flex: 1, fontSize: 15 },
})
