import * as Clipboard from 'expo-clipboard'
import { Redirect, router, Stack } from 'expo-router'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Linking, Platform, StyleSheet, Text, View } from 'react-native'
import { Button, Etape, Notice, Screen, Texte, Titre } from '@/components/ui'
import { useEtat, useT } from '@/lib/etat'
import { Icon, type IconName } from '@/lib/icons'
import { telLisible } from '@/lib/tel'
import { espace, num, rayon, taille, useCouleurs } from '@/lib/theme'

/** En démo, WhatsApp « confirme » tout seul au bout de quelques secondes. */
const DELAI_DEMO = 8000

/**
 * Étape 2 : le code d'association. Sur un seul téléphone, on ne peut pas
 * scanner un QR affiché sur son propre écran : c'est le parcours « Vincular
 * con el número de teléfono » de WhatsApp (formulations reprises de la web).
 */
export default function Codigo() {
  const c = useCouleurs()
  const t = useT()
  const { tel, code, connecter } = useEtat()
  const [copie, setCopie] = useState(false)
  const [pasOuvert, setPasOuvert] = useState(false)
  const natif = Platform.OS !== 'web'

  useEffect(() => {
    if (!code) return
    const minuteur = setTimeout(() => { connecter(); router.replace('/listo') }, DELAI_DEMO)
    return () => clearTimeout(minuteur)
  }, [code, connecter])

  // Rechargement de la page : l'état en mémoire est perdu, on repart du début.
  if (!code) return <Redirect href="/" />

  const copierEtOuvrir = async () => {
    await Clipboard.setStringAsync(code.replace('-', ''))
    setCopie(true)
    setTimeout(() => setCopie(false), 2500)
    if (!natif) return
    try { await Linking.openURL('whatsapp://') } catch { setPasOuvert(true) }
  }

  const ouTrouver = Platform.OS === 'ios'
    ? t('Tocá Configuración (abajo a la derecha) → Dispositivos vinculados.', 'Touchez Réglages (en bas à droite) → Appareils connectés.')
    : Platform.OS === 'android'
      ? t('Tocá los tres puntitos ⋮ de arriba → Dispositivos vinculados.', 'Touchez les trois points ⋮ en haut → Appareils connectés.')
      : t('Tocá los tres puntitos ⋮ de arriba (en iPhone: Configuración) → Dispositivos vinculados.',
        'Touchez les trois points ⋮ en haut (sur iPhone : Réglages) → Appareils connectés.')

  const pasos: { icon: IconName; texte: string }[] = [
    { icon: 'whatsapp', texte: t('Abrí WhatsApp en este celular.', 'Ouvrez WhatsApp sur ce téléphone.') },
    { icon: 'more', texte: ouTrouver },
    { icon: 'link', texte: t('Tocá «Vincular un dispositivo» y después, abajo, «Vincular con el número de teléfono».',
      'Touchez « Connecter un appareil », puis, en bas, « Connecter avec le numéro de téléphone ».') },
    { icon: 'edit', texte: t('Escribí este código (o pegalo).', 'Tapez ce code (ou collez-le).') },
  ]

  const libelle = copie
    ? t('Código copiado', 'Code copié')
    : natif ? t('Copiar y abrir WhatsApp', 'Copier et ouvrir WhatsApp') : t('Copiar el código', 'Copier le code')

  return (
    <Screen haut={false} pie={
      <>
        <Button icon={copie ? 'checkPlain' : 'copy'} onPress={() => void copierEtOuvrir()}>{libelle}</Button>
        <Button kind="text" onPress={() => router.back()}>{t('Cambiar el número', 'Changer de numéro')}</Button>
      </>
    }>
      <Stack.Screen options={{ title: t('Conectar WhatsApp', 'Connecter WhatsApp') }} />
      <Etape>{t('Paso 2 de 2', 'Étape 2 sur 2')}</Etape>
      <Titre>{t('Escribí este código en WhatsApp', 'Tapez ce code dans WhatsApp')}</Titre>
      <Texte faible>
        {t('Para el ', 'Pour le ')}<Text style={num}>{telLisible(tel)}</Text>
      </Texte>

      <View style={[s.code, { backgroundColor: c.surface, borderColor: c.line }]}
            accessible accessibilityLabel={t(`Código: ${code.split('').join(' ')}`, `Code : ${code.split('').join(' ')}`)}>
        <Text selectable style={[s.codeTexte, num, { color: c.ink }]}>{code}</Text>
      </View>

      {pasOuvert && (
        <Notice tone="warn" icon="alert">
          {t('No pudimos abrir WhatsApp. Abrilo vos: el código ya está copiado.', 'Impossible d’ouvrir WhatsApp. Ouvrez-le vous-même : le code est déjà copié.')}
        </Notice>
      )}

      <View style={[s.pasos, { backgroundColor: c.surface, borderColor: c.line }]}>
        {pasos.map((p, i) => (
          <View key={i} style={s.paso}>
            <View style={[s.pasoNum, { backgroundColor: c.accentWash }]}>
              <Text style={[s.pasoNumTexte, num, { color: c.onAccentWash }]}>{i + 1}</Text>
            </View>
            <Text style={[s.pasoTexte, { color: c.ink }]}>{p.texte}</Text>
            <Icon name={p.icon} size={20} color={c.muted} />
          </View>
        ))}
      </View>

      <View style={s.espera} accessibilityRole="progressbar" accessibilityLiveRegion="polite">
        <ActivityIndicator color={c.accent} />
        <Text style={[s.esperaTexte, { color: c.ink2 }]}>{t('Esperando que confirmes en WhatsApp…', 'En attente de votre confirmation dans WhatsApp…')}</Text>
      </View>

      <Texte faible>
        {t('¿El WhatsApp del alojamiento está en otro celular? Hacé esto en ese celular y escribí ahí el código.',
          'Le WhatsApp de l’établissement est sur un autre téléphone ? Faites-le sur ce téléphone-là et tapez-y le code.')}
      </Texte>

      <Notice>
        {t('Modo demo: el código es de prueba y se conecta solo en unos segundos.',
          'Mode démo : le code est fictif et la connexion se fait toute seule en quelques secondes.')}
      </Notice>
    </Screen>
  )
}

const s = StyleSheet.create({
  code: { borderRadius: rayon.lg, borderWidth: 1, paddingVertical: espace[6], alignItems: 'center' },
  codeTexte: { fontSize: 36, fontWeight: '700', letterSpacing: 4 },
  pasos: { borderRadius: rayon.lg, borderWidth: 1, padding: espace[4], gap: espace[4] },
  paso: { flexDirection: 'row', alignItems: 'center', gap: espace[3] },
  pasoNum: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  pasoNumTexte: { fontSize: taille.meta, fontWeight: '700' },
  pasoTexte: { flex: 1, fontSize: taille.body, lineHeight: 22 },
  espera: { flexDirection: 'row', alignItems: 'center', gap: espace[3], paddingVertical: espace[2] },
  esperaTexte: { fontSize: taille.body, flex: 1 },
})
