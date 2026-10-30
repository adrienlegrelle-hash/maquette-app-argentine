import { router } from 'expo-router'
import { useState, type ReactNode } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Points } from '@/components/Points'
import { Repere } from '@/components/Repere'
import { pesos, statsMois, tableau } from '@/lib/demo'
import { useEtat, useT } from '@/lib/etat'
import { Icon, type IconName } from '@/lib/icons'
import { num, useCouleurs, useWa } from '@/lib/theme'

/**
 * Le tableau de bord (onglet Menu). Il répond, dans l'ordre, à : qu'est-ce
 * que je dois faire, qui arrive, ai-je de la place, qui doit payer, et ce
 * que Roomz m'a rapporté ce mois-ci.
 */
export default function Tablero() {
  const wa = useWa()
  const c = useCouleurs()
  const t = useT()
  const { convs, ouvrirAgent } = useEtat()
  const nAction = convs.filter((x) => x.colonne === 'action').length
  const nEnCours = convs.filter((x) => x.enCours).length
  const aEncaisser = tableau.aEncaisser.reduce((n, x) => n + x.montant, 0)
  const [question, setQuestion] = useState('')
  const ceMois = Object.values(statsMois[statsMois.length - 1].canaux)
    .reduce((n, c) => ({ reservations: n.reservations + c.reservations, montant: n.montant + c.montant }), { reservations: 0, montant: 0 })

  return (
    <SafeAreaView edges={['top']} style={[s.flex, { backgroundColor: wa.fond }]}>
      <ScrollView contentContainerStyle={s.contenu}>
        <View>
          <Text accessibilityRole="header" style={[s.titre, { color: wa.encre }]}>{t('Tablero', 'Tableau de bord')}</Text>
          <Text style={[s.date, { color: wa.gris }]}>{t('Viernes 30 de octubre', 'Vendredi 30 octobre')}</Text>
        </View>

        <View style={[s.question, { backgroundColor: wa.champ }]}>
          <Icon name="sparkles" size={20} color={wa.vert} plein />
          <TextInput value={question} onChangeText={setQuestion} placeholder="Posez votre question à l’assistant…"
                     placeholderTextColor={wa.gris} returnKeyType="send" accessibilityLabel="Question pour l’assistant Roomz"
                     onSubmitEditing={() => { ouvrirAgent(question.trim() || undefined); setQuestion('') }}
                     style={[s.questionChamp, { color: wa.encre }]} />
          <Pressable onPress={() => { ouvrirAgent(question.trim() || undefined); setQuestion('') }}
                     accessibilityRole="button" accessibilityLabel="Envoyer" style={[s.questionEnvoyer, { backgroundColor: wa.vert }]}>
            <Icon name="send" size={16} color={wa.surVert} plein />
          </Pressable>
        </View>

        <View style={s.duo}>
          <Tuile onPress={() => router.navigate('/')} titre={t('Te toca', 'Action requise')}
                 valeur={String(nAction)} icon="alert" accent={nAction > 0 ? wa.vert : wa.gris} />
          <Tuile onPress={() => router.navigate('/')} titre={t('En curso', 'En cours')}
                 valeur={String(nEnCours)} icon="chat" accent={wa.gris} points />
        </View>

        <Carte titre={t('Hoy', 'Aujourd’hui')}>
          <Ligne icon="arrivee" texte={t('Llegan hoy', 'Arrivent aujourd’hui')} valeur={String(tableau.arrivees.length)} />
          {tableau.arrivees.map((a) => (
            <View key={a.nom} style={s.sousLigne}>
              <View style={s.flex}>
                <Text style={[s.sousNom, { color: wa.encre }]}>{a.nom}</Text>
                <Text style={[s.sousDetail, { color: wa.gris }]}>{t(a.chambre.es, a.chambre.fr)} · {a.nuits} {t('noches', 'nuits')}</Text>
              </View>
              <Statut ok={a.paye} label={a.paye ? t('Pagada', 'Payée') : t('Falta pagar', 'À payer')} />
            </View>
          ))}
          <Ligne icon="depart" texte={t('Se van hoy', 'Partent aujourd’hui')} valeur={String(tableau.departs)} />
        </Carte>

        <Carte titre={t('Libres esta noche', 'Libres ce soir')}>
          {tableau.libres.map((l) => (
            <View key={l.type.es} style={s.libre}>
              <Text style={[s.libreNom, { color: wa.encre }]}>{t(l.type.es, l.type.fr)}</Text>
              <Text style={[s.libreValeur, num, { color: l.libres === 0 ? c.warnInk : wa.encre }]}>
                {l.libres === 0 ? t('Completo', 'Complet') : `${l.libres} ${t('de', 'sur')} ${l.stock}`}
              </Text>
            </View>
          ))}
        </Carte>

        <Repere cle="aEncaisser">
        <Carte titre={t('A cobrar', 'À encaisser')} droite={<Text style={[s.total, num, { color: c.warnInk }]}>{pesos(aEncaisser)}</Text>}>
          {tableau.aEncaisser.map((p) => (
            <View key={p.nom} style={s.libre}>
              <View style={s.flex}>
                <Text style={[s.libreNom, { color: wa.encre }]}>{p.nom}</Text>
                <Text style={[s.sousDetail, { color: wa.gris }]}>{t(p.echeance.es, p.echeance.fr)}</Text>
              </View>
              <Text style={[s.libreValeur, num, { color: wa.encre }]}>{pesos(p.montant)}</Text>
            </View>
          ))}
        </Carte>
        </Repere>

        <Carte titre={t('Ocupación, próximos 7 días', 'Occupation, 7 prochains jours')}>
          <Semaine />
        </Carte>

        <Pressable onPress={() => router.push('/stats')} accessibilityRole="button"
                   style={({ pressed }) => [s.stats, { backgroundColor: wa.champ, opacity: pressed ? 0.7 : 1 }]}>
          <Icon name="trendUp" size={20} color={wa.vert} />
          <Text numberOfLines={1} style={[s.statsTexte, { color: wa.encre }]}>
            Octobre : <Text style={[num, s.gras]}>{ceMois.reservations}</Text> réservations · <Text style={[num, s.gras]}>{pesos(ceMois.montant)}</Text>
          </Text>
          <Icon name="chevR" size={16} color={wa.gris} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

/** Sept barres, une par nuit ; toucher une barre affiche son détail dessous. */
function Semaine() {
  const wa = useWa()
  const t = useT()
  const [choisi, setChoisi] = useState(0)
  const total = tableau.totalUnites
  const j = tableau.semaine[choisi]
  return (
    <View style={s.semaine}>
      <View style={s.barres}>
        {tableau.semaine.map((n, i) => (
          <Pressable key={i} onPress={() => setChoisi(i)} style={s.colonne}
                     accessibilityRole="button" accessibilityLabel={`${t(n.es, n.fr)} : ${n.occ} / ${total}`}>
            <View style={[s.piste, { backgroundColor: wa.champ }]}>
              <View style={[s.barre, { height: `${(n.occ / total) * 100}%`, backgroundColor: wa.vert, opacity: i === choisi ? 1 : 0.55 }]} />
            </View>
            <Text style={[s.jour, { color: i === choisi ? wa.encre : wa.gris, fontWeight: i === choisi ? '600' : '400' }]}>{t(n.es, n.fr)}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[s.legende, { color: wa.gris }]}>
        <Text style={[s.gras, { color: wa.encre }]}>{t(j.es, j.fr)}</Text>
        {' · '}<Text style={num}>{j.occ}</Text>{t(` de ${total} ocupadas`, ` sur ${total} occupées`)}
        {j.occ === total ? t(' · completo', ' · complet') : <>{' · '}<Text style={num}>{total - j.occ}</Text>{t(' libres', ' libres')}</>}
      </Text>
    </View>
  )
}

function Carte({ titre, droite, children }: { titre: string; droite?: ReactNode; children: ReactNode }) {
  const wa = useWa()
  return (
    <View style={s.carteBloc}>
      <View style={s.carteEntete}>
        <Text style={[s.carteTitre, { color: wa.gris }]}>{titre}</Text>
        {droite}
      </View>
      <View style={[s.carte, { backgroundColor: wa.champ }]}>{children}</View>
    </View>
  )
}

function Tuile({ titre, valeur, icon, accent, points, onPress }: { titre: string; valeur: string; icon: IconName; accent: string; points?: boolean; onPress: () => void }) {
  const wa = useWa()
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [s.tuile, { backgroundColor: wa.champ, opacity: pressed ? 0.7 : 1 }]}>
      <View style={s.tuileHaut}>
        <Icon name={icon} size={20} color={accent} />
        {points && <Points color={wa.gris} taille={4} />}
      </View>
      <Text style={[s.tuileValeur, num, { color: wa.encre }]}>{valeur}</Text>
      <Text style={[s.tuileTitre, { color: wa.gris }]}>{titre}</Text>
    </Pressable>
  )
}

function Ligne({ icon, texte, valeur }: { icon: IconName; texte: string; valeur: string }) {
  const wa = useWa()
  return (
    <View style={s.libre}>
      <Icon name={icon} size={20} color={wa.encre} trait={1.7} />
      <Text style={[s.libreNom, s.flex, { color: wa.encre }]}>{texte}</Text>
      <Text style={[s.libreValeur, num, { color: wa.encre }]}>{valeur}</Text>
    </View>
  )
}

/** Les teintes de statut de CLAUDE.md : vert confirmée, ambre en attente. */
function Statut({ ok, label }: { ok: boolean; label: string }) {
  const c = useCouleurs()
  return (
    <View style={[s.statut, { backgroundColor: ok ? c.okWash : c.warnWash }]}>
      <Text style={[s.statutTexte, { color: ok ? c.ok : c.warnInk }]}>{label}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  gras: { fontWeight: '600' },
  contenu: { padding: 16, paddingTop: 56, gap: 20 },
  titre: { fontSize: 34, fontWeight: '700', letterSpacing: 0.3 },
  date: { fontSize: 15, marginTop: 2 },
  question: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 999, paddingLeft: 16, paddingRight: 5, height: 50 },
  questionChamp: { flex: 1, fontSize: 16, height: 48 },
  questionEnvoyer: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, paddingHorizontal: 14, minHeight: 50 },
  statsTexte: { flex: 1, fontSize: 15 },
  duo: { flexDirection: 'row', gap: 12 },
  tuile: { flex: 1, borderRadius: 14, padding: 14, gap: 4 },
  tuileHaut: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 22 },
  tuileValeur: { fontSize: 32, fontWeight: '700' },
  tuileTitre: { fontSize: 15 },
  carteBloc: { gap: 6 },
  carteEntete: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: 4 },
  carteTitre: { fontSize: 13, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3 },
  carte: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 6 },
  libre: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 46 },
  libreNom: { fontSize: 17 },
  libreValeur: { fontSize: 17, fontWeight: '600', marginLeft: 'auto' },
  sousLigne: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 30, paddingBottom: 10 },
  sousNom: { fontSize: 15, fontWeight: '500' },
  sousDetail: { fontSize: 14 },
  statut: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 'auto' },
  statutTexte: { fontSize: 13, fontWeight: '600' },
  total: { fontSize: 15, fontWeight: '700' },
  semaine: { paddingVertical: 10, gap: 10 },
  barres: { flexDirection: 'row', gap: 2, height: 120 },
  colonne: { flex: 1, alignItems: 'center', gap: 6 },
  piste: { flex: 1, width: 22, borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  barre: { width: '100%', borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  jour: { fontSize: 12 },
  legende: { fontSize: 14, textAlign: 'center' },
})
