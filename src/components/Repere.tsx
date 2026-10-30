import { useEffect, useState, type ReactNode } from 'react'
import { Animated, Platform, StyleSheet, View } from 'react-native'
import { useEtat } from '@/lib/etat'
import { useWa } from '@/lib/theme'

const natif = Platform.OS !== 'web'

/** Un anneau qui pulse autour d'un élément : « c'est ici ». */
export function Halo({ rayon = 14, couleur }: { rayon?: number; couleur?: string }) {
  const wa = useWa()
  const [v] = useState(() => new Animated.Value(0))
  useEffect(() => {
    const boucle = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 700, useNativeDriver: natif }),
      Animated.timing(v, { toValue: 0, duration: 700, useNativeDriver: natif }),
    ]))
    boucle.start()
    return () => boucle.stop()
  }, [v])
  return (
    <Animated.View style={[s.halo, {
      borderRadius: rayon, borderColor: couleur ?? wa.vert,
      opacity: v.interpolate({ inputRange: [0, 1], outputRange: [1, 0.35] }),
      transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }],
    }]} />
  )
}

/**
 * Enveloppe un bouton que l'assistant d'aide peut montrer : quand `montrer`
 * vaut `cle`, un halo l'entoure quelques secondes.
 */
export function Repere({ cle, rayon, children }: { cle: string; rayon?: number; children: ReactNode }) {
  const { montrer, setMontrer } = useEtat()
  const actif = montrer === cle
  useEffect(() => {
    if (!actif) return
    const fin = setTimeout(() => setMontrer(null), 7000)
    return () => clearTimeout(fin)
  }, [actif, setMontrer])
  return (
    <View>
      {children}
      {actif && <Halo rayon={rayon} />}
    </View>
  )
}

const s = StyleSheet.create({
  halo: { position: 'absolute', top: -6, left: -6, right: -6, bottom: -6, borderWidth: 3, pointerEvents: 'none' },
})
