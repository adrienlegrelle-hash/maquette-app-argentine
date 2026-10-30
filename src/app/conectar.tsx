import { router } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Button, Screen, Texte, Titre } from '@/components/ui'
import { useEtat, useT, type Langue } from '@/lib/etat'
import { Icon, Logo } from '@/lib/icons'
import { espace, rayon, taille, useCouleurs } from '@/lib/theme'

/** Premier écran : ce que fait Roomz, en trois lignes, et un seul bouton. */
export default function Bienvenida() {
  const c = useCouleurs()
  const t = useT()

  const promesses = [
    t('Tus huéspedes te escriben al mismo número, como siempre.', 'Vos voyageurs écrivent au même numéro, comme avant.'),
    t('Alcanza con este celular, no hace falta otro.', 'Ce téléphone suffit, pas besoin d’un second.'),
    t('Listo en dos minutos.', 'Prêt en deux minutes.'),
  ]

  return (
    <Screen pie={<Button icon="whatsapp" onPress={() => router.push('/numero')}>{t('Conectar mi WhatsApp', 'Connecter mon WhatsApp')}</Button>}>
      <View style={s.haut}>
        <Logo size={44} />
        <ChoixLangue />
      </View>
      <View style={s.centre}>
        <Titre grand>{t('Contestá a tus huéspedes en segundos', 'Répondez à vos voyageurs en quelques secondes')}</Titre>
        <Texte>{t('Conectá el WhatsApp de tu alojamiento. Roomz lee los mensajes y te ayuda a contestar y a reservar.',
          'Connectez le WhatsApp de votre établissement. Roomz lit les messages et vous aide à répondre et à réserver.')}</Texte>
        <View style={[s.liste, { backgroundColor: c.surface, borderColor: c.line }]}>
          {promesses.map((p) => (
            <View key={p} style={s.ligne}>
              <View style={[s.puce, { backgroundColor: c.okWash }]}><Icon name="checkPlain" size={15} color={c.ok} /></View>
              <Text style={[s.ligneTexte, { color: c.ink }]}>{p}</Text>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  )
}

function ChoixLangue() {
  const c = useCouleurs()
  const { langue, setLangue } = useEtat()
  const options: { v: Langue; label: string }[] = [{ v: 'es', label: 'Español' }, { v: 'fr', label: 'Français' }]
  return (
    <View style={[s.segment, { backgroundColor: c.surface3 }]} accessibilityRole="radiogroup">
      {options.map((o) => {
        const actif = o.v === langue
        return (
          <Pressable key={o.v} accessibilityRole="radio" accessibilityState={{ selected: actif }}
                     onPress={() => setLangue(o.v)}
                     style={[s.segmentOption, actif && { backgroundColor: c.surface }]}>
            <Text style={[s.segmentTexte, { color: actif ? c.ink : c.muted }]}>{o.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const s = StyleSheet.create({
  haut: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  centre: { flex: 1, justifyContent: 'center', gap: espace[4], paddingVertical: espace[8] },
  liste: { borderRadius: rayon.lg, borderWidth: 1, padding: espace[4], gap: espace[3], marginTop: espace[2] },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: espace[3] },
  puce: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  ligneTexte: { flex: 1, fontSize: taille.body, lineHeight: 22 },
  segment: { flexDirection: 'row', borderRadius: rayon.pill, padding: 3 },
  segmentOption: { minHeight: 36, paddingHorizontal: espace[3], borderRadius: rayon.pill, justifyContent: 'center' },
  segmentTexte: { fontSize: taille.meta, fontWeight: '600' },
})
