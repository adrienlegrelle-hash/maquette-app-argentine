import { Redirect, router } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { Button, Screen, Texte, Titre } from '@/components/ui'
import { useEtat, useT } from '@/lib/etat'
import { Icon } from '@/lib/icons'
import { telLisible } from '@/lib/tel'
import { espace, num, useCouleurs } from '@/lib/theme'

/** WhatsApp a confirmé : on le dit une fois, clairement. */
export default function Listo() {
  const c = useCouleurs()
  const t = useT()
  const { tel } = useEtat()

  if (!tel) return <Redirect href="/" />
  return (
    <Screen pie={<Button onPress={() => { if (router.canDismiss()) router.dismissAll(); router.navigate('/') }}>{t('Ir a mis chats', 'Voir les discussions')}</Button>}>
      <View style={s.centre}>
        <View style={[s.rond, { backgroundColor: c.okWash, borderColor: c.okLine }]}>
          <Icon name="checkPlain" size={44} color={c.ok} />
        </View>
        <Titre grand>{t('¡Listo, conectado!', 'C’est fait, connecté !')}</Titre>
        <Texte>
          {t('Roomz ya recibe los mensajes del ', 'Roomz reçoit maintenant les messages du ')}
          <Text style={[num, { color: c.ink, fontWeight: '600' }]}>{telLisible(tel)}</Text>.
        </Texte>
        <Texte faible>{t('Tus huéspedes no ven ningún cambio, y vos seguís viendo todo en tu WhatsApp.',
          'Vos voyageurs ne voient aucun changement, et vous voyez toujours tout dans votre WhatsApp.')}</Texte>
      </View>
    </Screen>
  )
}

const s = StyleSheet.create({
  centre: { flex: 1, justifyContent: 'center', gap: espace[4] },
  rond: { width: 88, height: 88, borderRadius: 44, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: espace[2] },
})
