import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Icon, type IconName } from '@/lib/icons'
import { useWa } from '@/lib/theme'

/** Un onglet façon WhatsApp : fond blanc, grand titre en haut. */
export function EcranOnglet({ titre, children }: { titre: string; children: ReactNode }) {
  const wa = useWa()
  return (
    <SafeAreaView edges={['top']} style={[s.flex, { backgroundColor: wa.fond }]}>
      <Text accessibilityRole="header" style={[s.titre, { color: wa.encre }]}>{titre}</Text>
      {children}
    </SafeAreaView>
  )
}

/** « Bientôt » au milieu d'un onglet pas encore dessiné. */
export function Bientot({ icon, texte }: { icon: IconName; texte: string }) {
  const wa = useWa()
  return (
    <View style={s.bientot}>
      <View style={[s.rond, { backgroundColor: wa.champ }]}><Icon name={icon} size={30} color={wa.gris} trait={1.6} /></View>
      <Text style={[s.bientotTexte, { color: wa.gris }]}>{texte}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  titre: { fontSize: 34, fontWeight: '700', letterSpacing: 0.3, paddingHorizontal: 16, marginTop: 56, marginBottom: 10 },
  bientot: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingBottom: 80 },
  rond: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  bientotTexte: { fontSize: 15, textAlign: 'center', paddingHorizontal: 32 },
})
