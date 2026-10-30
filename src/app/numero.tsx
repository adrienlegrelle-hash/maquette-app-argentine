import { router, Stack } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { Button, Etape, Notice, Screen, Texte, Titre } from '@/components/ui'
import { useEtat, useT } from '@/lib/etat'
import { telChiffres, telComplet } from '@/lib/tel'
import { espace, num, rayon, tap, taille, useCouleurs } from '@/lib/theme'

/** Étape 1 : le numéro WhatsApp de l'établissement. */
export default function Numero() {
  const c = useCouleurs()
  const t = useT()
  const { demanderCode } = useEtat()
  const [saisie, setSaisie] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)

  const valider = () => {
    const chiffres = telChiffres(saisie)
    if (!telComplet(chiffres)) {
      setErreur(t('Escribí el número completo: código de área y número, sin 0 ni 15.',
        'Indiquez le numéro complet : indicatif régional et numéro, sans le 0 ni le 15.'))
      return
    }
    demanderCode(chiffres)
    router.push('/codigo')
  }

  return (
    <Screen haut={false}>
      <Stack.Screen options={{ title: t('Conectar WhatsApp', 'Connecter WhatsApp') }} />
      <Etape>{t('Paso 1 de 2', 'Étape 1 sur 2')}</Etape>
      <Titre>{t('¿Cuál es el WhatsApp de tu alojamiento?', 'Quel est le WhatsApp de votre établissement ?')}</Titre>
      <Texte faible>{t('El número donde te escriben los huéspedes.', 'Le numéro où vous écrivent les voyageurs.')}</Texte>

      <View style={[s.champ, { backgroundColor: c.surface, borderColor: erreur ? c.bad : c.lineStrong }]}>
        <Text style={[s.prefixe, num, { color: c.ink2, borderRightColor: c.line }]}>🇦🇷 +54 9</Text>
        <TextInput
          value={saisie}
          onChangeText={(v) => { setSaisie(v); setErreur(null) }}
          onSubmitEditing={valider}
          placeholder="388 415 7729"
          placeholderTextColor={c.muted}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          autoFocus
          maxLength={16}
          accessibilityLabel={t('Número de WhatsApp', 'Numéro WhatsApp')}
          style={[s.input, num, { color: c.ink }]}
        />
      </View>
      {erreur && <Text style={[s.erreur, { color: c.bad }]}>{erreur}</Text>}

      <Button icon="whatsapp" onPress={valider}>{t('Pedir el código', 'Recevoir le code')}</Button>

      <Notice tone="warn" icon="alert">
        {t('Usá el WhatsApp del alojamiento, no el personal: Roomz va a leer todos los chats de este número (menos los grupos).',
          'Utilisez le WhatsApp de l’établissement, pas votre numéro personnel : Roomz lira toutes les discussions de ce numéro (sauf les groupes).')}
      </Notice>
    </Screen>
  )
}

const s = StyleSheet.create({
  champ: { flexDirection: 'row', alignItems: 'center', minHeight: tap.field, borderWidth: 1, borderRadius: rayon.md, overflow: 'hidden' },
  prefixe: { fontSize: taille.label, paddingHorizontal: espace[3], borderRightWidth: 1, alignSelf: 'stretch', textAlignVertical: 'center', lineHeight: tap.field },
  input: { flex: 1, fontSize: taille.label, paddingHorizontal: espace[3], minHeight: tap.field },
  erreur: { fontSize: taille.meta, lineHeight: 21, marginTop: -espace[2] },
})
