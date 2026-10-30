import { useMemo, useState, type ReactNode } from 'react'
import { Animated, PanResponder, Platform, StyleSheet, Text, View } from 'react-native'
import { Icon, type IconName } from '@/lib/icons'
import { useWa } from '@/lib/theme'

const natif = Platform.OS !== 'web'
const SEUIL = 80
const MAX = 120

/**
 * Glisser une ligne vers la gauche, comme « Archiver » dans WhatsApp : l'action
 * apparaît derrière, et part si on lâche au-delà du seuil.
 */
export function Glisser({ children, label, icon, couleur, onAction }: { children: ReactNode; label: string; icon: IconName; couleur: string; onAction: () => void }) {
  const wa = useWa()
  const [x] = useState(() => new Animated.Value(0))
  const repondeur = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
    onPanResponderMove: (_, g) => x.setValue(Math.max(-MAX, Math.min(0, g.dx))),
    onPanResponderRelease: (_, g) => {
      if (g.dx < -SEUIL) onAction()
      Animated.spring(x, { toValue: 0, useNativeDriver: natif, bounciness: 0 }).start()
    },
    onPanResponderTerminate: () => Animated.spring(x, { toValue: 0, useNativeDriver: natif }).start(),
  }), [x, onAction])

  return (
    <View style={s.cadre}>
      <View style={[s.derriere, { backgroundColor: couleur }]}>
        <Icon name={icon} size={22} color={wa.surVert} />
        <Text style={[s.label, { color: wa.surVert }]}>{label}</Text>
      </View>
      <Animated.View {...repondeur.panHandlers} style={[s.devant, { transform: [{ translateX: x }], backgroundColor: wa.fond }]}>
        {children}
      </Animated.View>
    </View>
  )
}

const s = StyleSheet.create({
  cadre: { overflow: 'hidden' },
  derriere: { position: 'absolute', top: 0, bottom: 0, right: 0, width: MAX, alignItems: 'center', justifyContent: 'center', gap: 4 },
  label: { fontSize: 12, fontWeight: '600' },
  // Sur ordinateur, glisser à la souris ne doit pas sélectionner le texte.
  devant: { userSelect: 'none' },
})
