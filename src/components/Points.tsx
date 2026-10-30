import { useEffect, useState } from 'react'
import { Animated, Platform, View } from 'react-native'

const natif = Platform.OS !== 'web'

/** Les trois points qui sautillent, comme quand quelqu'un écrit dans WhatsApp. */
export function Points({ color, taille = 4 }: { color: string; taille?: number }) {
  const [valeurs] = useState(() => [0, 1, 2].map(() => new Animated.Value(0)))

  useEffect(() => {
    const boucles = valeurs.map((v, i) => Animated.loop(Animated.sequence([
      Animated.delay(i * 160),
      Animated.timing(v, { toValue: 1, duration: 280, useNativeDriver: natif }),
      Animated.timing(v, { toValue: 0, duration: 280, useNativeDriver: natif }),
      Animated.delay((2 - i) * 160 + 200),
    ])))
    boucles.forEach((b) => b.start())
    return () => boucles.forEach((b) => b.stop())
  }, [valeurs])

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: taille * 0.7, height: taille * 2.5 }}>
      {valeurs.map((v, i) => (
        <Animated.View key={i} style={{
          width: taille, height: taille, borderRadius: taille / 2, backgroundColor: color,
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -taille * 0.6] }) }],
        }} />
      ))}
    </View>
  )
}
