import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useRef, useState, type ComponentRef } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Points } from '@/components/Points'
import { aides, suggestionsAide, type Aide } from '@/lib/demo'
import { useEtat } from '@/lib/etat'
import { Icon, Logo } from '@/lib/icons'
import { useWa } from '@/lib/theme'

type Bulle = { de: 'moi' | 'roomz'; texte: string; aide?: Aide; suggestions?: boolean }

const ACCUEIL: Bulle = {
  de: 'roomz', suggestions: true,
  texte: 'Bonjour ! Je suis l’assistant Roomz. Dites-moi ce que vous voulez faire, je vous montre où se trouve le bouton.',
}

/** Sans accents ni majuscules, pour comparer aux mots-clés. */
function simple(texte: string) {
  return texte.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function repondre(question: string): Bulle {
  const q = simple(question)
  const aide = aides.find((a) => a.mots.some((m) => q.includes(simple(m))))
  if (aide) return { de: 'roomz', texte: aide.reponse, aide }
  return { de: 'roomz', suggestions: true, texte: 'Je n’ai pas encore la réponse à ça. Voici ce que je sais vous montrer :' }
}

/**
 * L'assistant d'aide, ouvert depuis le Menu : on lui demande « où est… »,
 * il répond et, d'un toucher, fait clignoter le bon bouton dans l'app.
 */
export default function AideRoomz() {
  const wa = useWa()
  const insets = useSafeAreaInsets()
  const { setMontrer } = useEtat()
  const [bulles, setBulles] = useState<Bulle[]>([ACCUEIL])
  const [texte, setTexte] = useState('')
  const [ecrit, setEcrit] = useState(false)
  const defile = useRef<ComponentRef<typeof ScrollView>>(null)
  const minuteur = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(minuteur.current), [])

  // Question tapée dans la barre du Menu : on la pose tout de suite.
  const { q } = useLocalSearchParams<{ q?: string }>()
  const posee = useRef(false)

  const demander = (question: string) => {
    if (!question.trim() || ecrit) return
    setBulles((bs) => [...bs, { de: 'moi', texte: question.trim() }])
    setTexte('')
    setEcrit(true)
    minuteur.current = setTimeout(() => {
      setBulles((bs) => [...bs, repondre(question)])
      setEcrit(false)
    }, 700)
  }

  useEffect(() => {
    if (q && !posee.current) { posee.current = true; demander(q) }
  })

  const montrer = (a: Aide) => {
    setMontrer(a.repere)
    if (router.canDismiss()) router.dismissAll()
    router.navigate(a.route)
  }

  return (
    <KeyboardAvoidingView style={[s.flex, { backgroundColor: wa.papier }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[s.entete, { paddingTop: insets.top + 6, backgroundColor: wa.barre, borderBottomColor: wa.ligne }]}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/menu'))} hitSlop={10}
                   accessibilityRole="button" accessibilityLabel="Retour" style={s.retour}>
          <Icon name="chevL" size={28} color={wa.encre} trait={2.2} />
        </Pressable>
        <Logo size={36} />
        <View style={s.flex}>
          <Text style={[s.nom, { color: wa.encre }]}>Assistant Roomz</Text>
          <Text style={[s.sous, { color: wa.gris }]}>{ecrit ? 'écrit…' : 'vous guide dans l’app'}</Text>
        </View>
      </View>

      <ScrollView ref={defile} contentContainerStyle={s.fil} keyboardShouldPersistTaps="handled"
                  onContentSizeChange={() => defile.current?.scrollToEnd({ animated: true })}>
        {bulles.map((b, i) => (
          <View key={i} style={[s.bulle, b.de === 'moi' ? s.moi : s.roomz, { backgroundColor: b.de === 'moi' ? wa.bulleOut : wa.bulleIn }]}>
            <Text style={[s.texte, { color: wa.encre }]}>{b.texte}</Text>
            {b.aide && (
              <Pressable onPress={() => montrer(b.aide!)} accessibilityRole="button"
                         style={[s.action, { borderTopColor: wa.ligne }]}>
                <Icon name="search" size={16} color={wa.vert} />
                <Text style={[s.actionTexte, { color: wa.vert }]}>{b.aide.bouton}</Text>
              </Pressable>
            )}
            {b.suggestions && (
              <View style={s.suggestions}>
                {suggestionsAide.map((q) => (
                  <Pressable key={q} onPress={() => demander(q)} accessibilityRole="button"
                             style={[s.suggestion, { borderColor: wa.chipBord }]}>
                    <Text style={[s.suggestionTexte, { color: wa.vertEncre }]}>{q}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        ))}
        {ecrit && (
          <View style={[s.bulle, s.roomz, { backgroundColor: wa.bulleIn }]}>
            <View style={s.points}><Points color={wa.bulleMeta} taille={7} /></View>
          </View>
        )}
      </ScrollView>

      <View style={[s.saisie, { backgroundColor: wa.barre, borderTopColor: wa.ligne, paddingBottom: Math.max(insets.bottom, 8) }]}>
        <TextInput value={texte} onChangeText={setTexte} onSubmitEditing={() => demander(texte)}
                   placeholder="Où est… ? Comment faire… ?" placeholderTextColor={wa.gris}
                   accessibilityLabel="Votre question"
                   style={[s.champ, { backgroundColor: wa.saisie, borderColor: wa.ligne, color: wa.encre }]} />
        <Pressable onPress={() => demander(texte)} accessibilityRole="button" accessibilityLabel="Envoyer"
                   style={[s.envoyer, { backgroundColor: texte.trim() ? wa.vert : wa.chipBord }]}>
          <Icon name="send" size={18} color={wa.surVert} plein />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  entete: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  retour: { minWidth: 36, minHeight: 44, justifyContent: 'center' },
  nom: { fontSize: 17, fontWeight: '600' },
  sous: { fontSize: 12, marginTop: 1 },
  fil: { padding: 10, paddingBottom: 14, gap: 8 },
  bulle: { maxWidth: '85%', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, boxShadow: '0 1px 0.5px rgba(11,20,26,.13)' },
  roomz: { alignSelf: 'flex-start', borderTopLeftRadius: 4 },
  moi: { alignSelf: 'flex-end', borderTopRightRadius: 4 },
  texte: { fontSize: 16, lineHeight: 21 },
  action: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderTopWidth: StyleSheet.hairlineWidth, marginTop: 8, paddingTop: 8, minHeight: 36 },
  actionTexte: { fontSize: 16, fontWeight: '600' },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  suggestion: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  suggestionTexte: { fontSize: 14, fontWeight: '500' },
  points: { paddingVertical: 4, paddingHorizontal: 2 },
  saisie: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth },
  champ: { flex: 1, minHeight: 38, borderRadius: 19, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14, fontSize: 16 },
  envoyer: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
})
