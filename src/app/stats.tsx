import { router } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LogoCanal, type Logo } from '@/components/Logos'
import { pesos, statsMois, type CanalStat } from '@/lib/demo'
import { Icon } from '@/lib/icons'
import { num, useWa } from '@/lib/theme'

const CANAUX: { cle: CanalStat; nom: string; logo?: Logo }[] = [
  { cle: 'whatsapp', nom: 'WhatsApp', logo: 'whatsapp' },
  { cle: 'instagram', nom: 'Instagram', logo: 'instagram' },
  { cle: 'messenger', nom: 'Messenger', logo: 'messenger' },
  { cle: 'booking', nom: 'Booking', logo: 'booking' },
  { cle: 'direct', nom: 'Sur place ou téléphone' },
]

/** Les statistiques, mois par mois : ce qui est arrivé par chaque canal. */
export default function Stats() {
  const wa = useWa()
  const insets = useSafeAreaInsets()
  const [i, setI] = useState(statsMois.length - 1)
  const m = statsMois[i]
  const lignes = CANAUX.map((c) => ({ ...c, ...m.canaux[c.cle] }))
  const total = lignes.reduce((n, l) => ({ reservations: n.reservations + l.reservations, montant: n.montant + l.montant }), { reservations: 0, montant: 0 })
  const max = Math.max(...lignes.map((l) => l.montant))
  const horsBooking = total.montant - m.canaux.booking.montant

  return (
    <View style={[s.flex, { backgroundColor: wa.fond }]}>
      <View style={[s.entete, { paddingTop: insets.top + 6, borderBottomColor: wa.ligne }]}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/menu'))} hitSlop={10}
                   accessibilityRole="button" accessibilityLabel="Retour" style={s.retour}>
          <Icon name="chevL" size={28} color={wa.encre} trait={2.2} />
        </Pressable>
        <Text style={[s.enteteTitre, { color: wa.encre }]}>Statistiques</Text>
      </View>

      <ScrollView contentContainerStyle={[s.contenu, { paddingBottom: insets.bottom + 24 }]}>
        <View style={[s.mois, { backgroundColor: wa.champ }]}>
          <Pressable onPress={() => setI(i - 1)} disabled={i === 0} hitSlop={10} accessibilityLabel="Mois précédent" style={{ opacity: i === 0 ? 0.3 : 1 }}>
            <Icon name="chevL" size={22} color={wa.encre} />
          </Pressable>
          <Text style={[s.moisTexte, { color: wa.encre }]}>{m.mois}</Text>
          <Pressable onPress={() => setI(i + 1)} disabled={i === statsMois.length - 1} hitSlop={10} accessibilityLabel="Mois suivant"
                     style={{ opacity: i === statsMois.length - 1 ? 0.3 : 1 }}>
            <Icon name="chevR" size={22} color={wa.encre} />
          </Pressable>
        </View>

        <View style={s.duo}>
          <Chiffre valeur={String(total.reservations)} label="réservations" />
          <Chiffre valeur={pesos(total.montant)} label="encaissé" />
        </View>

        <View style={s.bloc}>
          <Text style={[s.blocTitre, { color: wa.gris }]}>Par canal</Text>
          <View style={[s.groupe, { backgroundColor: wa.champ }]}>
            {lignes.map((l, k) => (
              <View key={l.cle} style={[s.canal, k < lignes.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: wa.ligne }]}>
                {l.logo ? <LogoCanal nom={l.logo} size={32} /> : <View style={[s.sansLogo, { backgroundColor: wa.fond }]}><Icon name="building" size={18} color={wa.gris} /></View>}
                <View style={s.flex}>
                  <View style={s.canalHaut}>
                    <Text style={[s.canalNom, { color: wa.encre }]}>{l.nom}</Text>
                    <Text style={[s.canalMontant, num, { color: wa.encre }]}>{pesos(l.montant)}</Text>
                  </View>
                  <View style={[s.piste, { backgroundColor: wa.fond }]}>
                    <View style={[s.barre, { width: `${max ? (l.montant / max) * 100 : 0}%`, backgroundColor: wa.vert }]} />
                  </View>
                  <Text style={[s.canalSous, num, { color: wa.gris }]}>{l.reservations} réservation{l.reservations > 1 ? 's' : ''}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={s.bloc}>
          <Text style={[s.blocTitre, { color: wa.gris }]}>L’assistant</Text>
          <View style={s.duo}>
            <Chiffre valeur={String(m.demandes)} label="demandes reçues" />
            <Chiffre valeur={m.reponse} label="temps de réponse moyen" />
          </View>
          <View style={s.duo}>
            <Chiffre valeur={`${m.seul} %`} label="discussions réglées seul" />
            <Chiffre valeur={pesos(horsBooking * 0.15)} label="de commission évitée (15 % Booking)" />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

function Chiffre({ valeur, label }: { valeur: string; label: string }) {
  const wa = useWa()
  return (
    <View style={[s.chiffre, { backgroundColor: wa.champ }]}>
      <Text style={[s.chiffreValeur, num, { color: wa.encre }]}>{valeur}</Text>
      <Text style={[s.chiffreLabel, { color: wa.gris }]}>{label}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  entete: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  retour: { minWidth: 36, minHeight: 44, justifyContent: 'center' },
  enteteTitre: { flex: 1, fontSize: 18, fontWeight: '600' },
  contenu: { padding: 16, gap: 16 },
  mois: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 999, paddingHorizontal: 14, height: 48 },
  moisTexte: { fontSize: 17, fontWeight: '600' },
  duo: { flexDirection: 'row', gap: 10 },
  chiffre: { flex: 1, borderRadius: 14, padding: 14, gap: 2 },
  chiffreValeur: { fontSize: 22, fontWeight: '700' },
  chiffreLabel: { fontSize: 13, lineHeight: 17 },
  bloc: { gap: 8 },
  blocTitre: { fontSize: 13, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3, marginLeft: 4 },
  groupe: { borderRadius: 14, paddingHorizontal: 14 },
  canal: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  sansLogo: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  canalHaut: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  canalNom: { fontSize: 16, fontWeight: '500' },
  canalMontant: { fontSize: 15, fontWeight: '600' },
  piste: { height: 6, borderRadius: 3, marginTop: 6, overflow: 'hidden' },
  barre: { height: 6, borderRadius: 3 },
  canalSous: { fontSize: 13, marginTop: 4 },
})
