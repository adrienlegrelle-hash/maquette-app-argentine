import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Repere } from '@/components/Repere'
import { AUJOURDHUI, INITIALES, JOURS_COURTS, MOIS, casesDuMois, date, ecart } from '@/lib/dates'
import { sejours, type Sejour } from '@/lib/demo'
import { useEtat } from '@/lib/etat'
import { Icon } from '@/lib/icons'
import { num, useCal, type CouleursCal } from '@/lib/theme'

/** Les séjours présents le `jour` : arrivées, nuits en cours et départs. */
function duJour(jour: string) {
  return sejours.filter((s) => s.debut <= jour && jour <= s.fin)
}

function dateCourte(jour: string) {
  const d = date(jour)
  return `${JOURS_COURTS[d.getUTCDay()]} ${d.getUTCDate()} ${MOIS[d.getUTCMonth()].slice(0, 4)}.`
}

/**
 * Le calendrier, présenté comme Google Agenda : le mois reste en haut, la
 * journée touchée s'affiche dessous, avec une loupe pour chercher par nom.
 */
export default function Calendrier() {
  const cal = useCal()
  const aujourdhui = date(AUJOURDHUI)
  const [mois, setMois] = useState({ annee: aujourdhui.getUTCFullYear(), mois: aujourdhui.getUTCMonth() })
  const [choisi, setChoisi] = useState(AUJOURDHUI)
  const [cherche, setCherche] = useState(false)
  const [q, setQ] = useState('')

  const changerMois = (sens: number) => {
    const m = mois.mois + sens
    setMois({ annee: mois.annee + Math.floor(m / 12), mois: ((m % 12) + 12) % 12 })
  }
  const allerA = (jour: string) => {
    setChoisi(jour)
    const d = date(jour)
    setMois({ annee: d.getUTCFullYear(), mois: d.getUTCMonth() })
  }

  const requete = q.trim().toLowerCase()
  const resultats = requete ? sejours.filter((s) => s.statut !== 'bloque' && s.nom.toLowerCase().includes(requete)) : []
  const jour = duJour(choisi)
  const d = date(choisi)

  return (
    <SafeAreaView edges={['top']} style={[s.flex, { backgroundColor: cal.fond }]}>
      <View style={s.entete}>
        <Repere cle="moisCalendrier" rayon={10}>
          <Text style={[s.titre, { color: cal.encre }]}>{MOIS[mois.mois]}{mois.annee !== aujourdhui.getUTCFullYear() ? ` ${mois.annee}` : ''}</Text>
        </Repere>
        <Pressable onPress={() => allerA(AUJOURDHUI)} accessibilityRole="button" accessibilityLabel="Aujourd’hui"
                   style={[s.boutonJour, { borderColor: cal.encre }]}>
          <Text style={[s.boutonJourTexte, num, { color: cal.encre }]}>{aujourdhui.getUTCDate()}</Text>
        </Pressable>
      </View>

      <GrilleMois cal={cal} annee={mois.annee} mois={mois.mois} choisi={choisi} onChoisir={allerA} onMois={changerMois} />

      <View style={[s.journee, { borderTopColor: cal.ligne }]}>
        <View style={s.journeeEntete}>
          {cherche ? (
            <View style={[s.recherche, { borderColor: cal.ligne }]}>
              <Icon name="search" size={16} color={cal.gris} />
              <TextInput value={q} onChangeText={setQ} autoFocus placeholder="Nom de la réservation"
                         placeholderTextColor={cal.gris} style={[s.rechercheChamp, { color: cal.encre }]} />
              <Pressable onPress={() => { setCherche(false); setQ('') }} hitSlop={10} accessibilityLabel="Fermer la recherche">
                <Icon name="x" size={18} color={cal.gris} />
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={[s.journeeTitre, { color: choisi === AUJOURDHUI ? cal.aujourdhui : cal.encre }]}>
                {choisi === AUJOURDHUI ? 'Aujourd’hui · ' : ''}{JOURS_COURTS[d.getUTCDay()]} {d.getUTCDate()} {MOIS[d.getUTCMonth()]}
              </Text>
              <Text style={[s.journeeCompte, { color: cal.gris }]}>{jour.length} réservation{jour.length > 1 ? 's' : ''}</Text>
              <Pressable onPress={() => setCherche(true)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Chercher une réservation">
                <Icon name="search" size={18} color={cal.gris} trait={1.7} />
              </Pressable>
            </>
          )}
        </View>

        <ScrollView contentContainerStyle={s.liste} keyboardShouldPersistTaps="handled">
          {requete ? (
            resultats.length
              ? resultats.map((e) => <Carte key={e.id} cal={cal} e={e} detail={`${dateCourte(e.debut)} → ${dateCourte(e.fin)}`} />)
              : <Text style={[s.rien, { color: cal.gris }]}>Aucune réservation à ce nom.</Text>
          ) : (
            jour.length
              ? jour.map((e) => <Carte key={e.id} cal={cal} e={e} detail={moment(e, choisi)} />)
              : <Text style={[s.rien, { color: cal.gris }]}>Rien de prévu ce jour-là.</Text>
          )}
          <View style={s.basDePage} />
        </ScrollView>
      </View>

      <View style={s.fabZone}>
        <Repere cle="calendrierAjouter" rayon={18}>
          <Pressable accessibilityRole="button" accessibilityLabel="Nouvelle réservation"
                     style={({ pressed }) => [s.fab, { backgroundColor: cal.fab, opacity: pressed ? 0.85 : 1 }]}>
            <Icon name="plus" size={26} color={cal.surFab} trait={2.4} />
          </Pressable>
        </Repere>
      </View>
    </SafeAreaView>
  )
}

/** Où en est le séjour ce jour-là. */
function moment(e: Sejour, jour: string) {
  const nuits = ecart(e.debut, e.fin)
  if (jour === e.debut) return `Arrivée · ${nuits} ${nuits > 1 ? 'nuits' : 'nuit'}`
  if (jour === e.fin) return 'Départ aujourd’hui'
  return `Nuit ${ecart(e.debut, jour) + 1} sur ${nuits}`
}

function Carte({ cal, e, detail }: { cal: CouleursCal; e: Sejour; detail: string }) {
  const { checkins } = useEtat()
  const titre = e.statut === 'bloque' ? `Bloqué · ${e.chambre}` : `${e.nom} · ${e.chambre}`
  const statut = e.statut === 'bloque' ? `Calendrier ${e.source}` : e.statut === 'attente' ? 'À payer' : checkins.includes(e.id) ? 'Arrivé ✓' : null
  return (
    <Pressable onPress={() => router.push({ pathname: '/reservation/[id]', params: { id: e.id } })} accessibilityRole="button"
               style={({ pressed }) => [s.carte, { backgroundColor: couleur(cal, e), opacity: pressed ? 0.85 : 1 }]}>
      <View style={s.flex}>
        <Text numberOfLines={1} style={[s.carteTitre, { color: cal.surEvenement }]}>{titre}</Text>
        <Text numberOfLines={1} style={[s.carteDetail, { color: cal.surEvenement }]}>
          {[statut, detail, e.statut !== 'bloque' ? `${e.adultes + e.enfants} pers.` : null].filter(Boolean).join(' · ')}
        </Text>
      </View>
      <Icon name="chevR" size={18} color={cal.surEvenement} />
    </Pressable>
  )
}

function GrilleMois({ cal, annee, mois, choisi, onChoisir, onMois }: {
  cal: CouleursCal; annee: number; mois: number; choisi: string; onChoisir: (j: string) => void; onMois: (sens: number) => void
}) {
  const cases = casesDuMois(annee, mois)
  return (
    <View style={s.grille}>
      <View style={s.grilleEntete}>
        <Pressable onPress={() => onMois(-1)} hitSlop={10} accessibilityLabel="Mois précédent"><Icon name="chevL" size={20} color={cal.gris} /></Pressable>
        <View style={s.initiales}>
          {INITIALES.map((l, i) => <Text key={i} style={[s.initiale, { color: cal.gris }]}>{l}</Text>)}
        </View>
        <Pressable onPress={() => onMois(1)} hitSlop={10} accessibilityLabel="Mois suivant"><Icon name="chevR" size={20} color={cal.gris} /></Pressable>
      </View>
      <View style={s.cases}>
        {cases.map((j, i) => {
          if (!j) return <View key={i} style={s.case} />
          const estAujourdhui = j === AUJOURDHUI
          const estChoisi = j === choisi
          const points = duJour(j).slice(0, 3)
          return (
            <Pressable key={j} onPress={() => onChoisir(j)} style={s.case} accessibilityRole="button"
                       accessibilityLabel={`${date(j).getUTCDate()} ${MOIS[mois]}, ${duJour(j).length} réservation(s)`}>
              <View style={[s.rondJour, estChoisi && !estAujourdhui && { backgroundColor: cal.choisi }, estAujourdhui && { backgroundColor: cal.aujourdhui }]}>
                <Text style={[s.numJour, num, { color: estAujourdhui ? cal.surAujourdhui : cal.encre, fontWeight: estChoisi ? '700' : '400' }]}>{date(j).getUTCDate()}</Text>
              </View>
              <View style={s.points}>
                {points.map((p) => <View key={p.id} style={[s.point, { backgroundColor: couleur(cal, p) }]} />)}
              </View>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

function couleur(cal: CouleursCal, e: Sejour) {
  return e.statut === 'confirmee' ? cal.confirmee : e.statut === 'attente' ? cal.attente : cal.bloque
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  entete: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 52 },
  titre: { fontSize: 22, fontWeight: '500', textTransform: 'capitalize', paddingHorizontal: 4 },
  boutonJour: { width: 26, height: 26, borderWidth: 2, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  boutonJourTexte: { fontSize: 12, fontWeight: '700' },
  grille: { paddingHorizontal: 8, paddingBottom: 6 },
  grilleEntete: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 },
  initiales: { flex: 1, flexDirection: 'row' },
  initiale: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '500' },
  cases: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 24 },
  case: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 2, height: 42 },
  rondJour: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  numJour: { fontSize: 14 },
  points: { flexDirection: 'row', gap: 2, height: 6, alignItems: 'center' },
  point: { width: 4, height: 4, borderRadius: 2 },
  journee: { flex: 1, borderTopWidth: StyleSheet.hairlineWidth },
  journeeEntete: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, minHeight: 52 },
  journeeTitre: { flex: 1, fontSize: 17, fontWeight: '600' },
  journeeCompte: { fontSize: 13 },
  recherche: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, height: 38 },
  rechercheChamp: { flex: 1, fontSize: 16, height: 36 },
  liste: { paddingHorizontal: 16, gap: 8 },
  rien: { fontSize: 15, paddingTop: 16, textAlign: 'center' },
  carte: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  carteTitre: { fontSize: 15, fontWeight: '600' },
  carteDetail: { fontSize: 13, marginTop: 2 },
  basDePage: { height: 90 },
  fabZone: { position: 'absolute', right: 16, bottom: 16 },
  fab: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,.18)' },
})
