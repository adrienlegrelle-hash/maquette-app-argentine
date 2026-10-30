import type { ReactNode } from 'react'
import { Pressable, StyleSheet, Switch, Text, TextInput, View, type TextInputProps } from 'react-native'
import { Icon } from '@/lib/icons'
import { num, useWa } from '@/lib/theme'

/**
 * Les briques du questionnaire de Paramètres, au visuel WhatsApp : gros
 * champs, puces à toucher, interrupteurs. Rien à taper quand on peut choisir.
 */

export function Question({ titre, sous }: { titre: string; sous?: string }) {
  const wa = useWa()
  return (
    <View style={s.question}>
      <Text accessibilityRole="header" style={[s.titre, { color: wa.encre }]}>{titre}</Text>
      {sous && <Text style={[s.sous, { color: wa.gris }]}>{sous}</Text>}
    </View>
  )
}

export function Libelle({ children }: { children: string }) {
  const wa = useWa()
  return <Text style={[s.libelle, { color: wa.gris }]}>{children}</Text>
}

export function Champ({ label, ...props }: TextInputProps & { label: string }) {
  const wa = useWa()
  return (
    <View style={s.champBloc}>
      <Libelle>{label}</Libelle>
      <TextInput placeholderTextColor={wa.gris} accessibilityLabel={label} {...props}
                 style={[s.champ, { backgroundColor: wa.champ, color: wa.encre }, props.editable === false && { opacity: 0.5 }]} />
    </View>
  )
}

export function Puces({ options, valeur, onChange }: { options: string[]; valeur: string | null; onChange: (v: string) => void }) {
  const wa = useWa()
  return (
    <View style={s.puces} accessibilityRole="radiogroup">
      {options.map((o) => {
        const actif = o === valeur
        return (
          <Pressable key={o} onPress={() => onChange(o)} accessibilityRole="radio" accessibilityState={{ selected: actif }}
                     style={[s.puce, actif ? { backgroundColor: wa.vertWash, borderColor: wa.vert } : { borderColor: wa.chipBord }]}>
            <Text style={[s.puceTexte, { color: actif ? wa.vertEncre : wa.encre }]}>{o}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

export function Interrupteur({ label, sous, valeur, onChange, avant }: { label: string; sous?: string; valeur: boolean; onChange: (v: boolean) => void; avant?: ReactNode }) {
  const wa = useWa()
  return (
    <Pressable onPress={() => onChange(!valeur)} accessibilityRole="switch" accessibilityState={{ checked: valeur }} style={s.ligne}>
      {avant}
      <View style={s.flex}>
        <Text style={[s.ligneTexte, { color: wa.encre }]}>{label}</Text>
        {sous && <Text style={[s.ligneSous, { color: wa.gris }]}>{sous}</Text>}
      </View>
      <Switch value={valeur} onValueChange={onChange} trackColor={{ true: wa.vert, false: wa.chipBord }} thumbColor={valeur ? wa.surVert : wa.fond}
              {...({ activeThumbColor: wa.surVert } as object)} />
    </Pressable>
  )
}

export function Coche({ label, sous, valeur, onChange, rond }: { label: string; sous?: string; valeur: boolean; onChange: (v: boolean) => void; rond?: boolean }) {
  const wa = useWa()
  return (
    <Pressable onPress={() => onChange(!valeur)} accessibilityRole={rond ? 'radio' : 'checkbox'} accessibilityState={{ checked: valeur }} style={s.ligne}>
      <View style={[s.case, rond && s.rond, valeur ? { backgroundColor: wa.vert, borderColor: wa.vert } : { borderColor: wa.chipBord }]}>
        {valeur && <Icon name="checkPlain" size={14} color={wa.surVert} trait={3} />}
      </View>
      <View style={s.flex}>
        <Text style={[s.ligneTexte, { color: wa.encre }]}>{label}</Text>
        {sous && <Text style={[s.ligneSous, { color: wa.gris }]}>{sous}</Text>}
      </View>
    </Pressable>
  )
}

export function Compteur({ valeur, onChange, min = 1 }: { valeur: number; onChange: (v: number) => void; min?: number }) {
  const wa = useWa()
  return (
    <View style={s.compteur}>
      <Pressable onPress={() => onChange(Math.max(min, valeur - 1))} accessibilityLabel="Moins" style={[s.compteurBouton, { backgroundColor: wa.champ }]}>
        <Icon name="minus" size={18} color={wa.encre} />
      </Pressable>
      <Text style={[s.compteurValeur, num, { color: wa.encre }]}>{valeur}</Text>
      <Pressable onPress={() => onChange(valeur + 1)} accessibilityLabel="Plus" style={[s.compteurBouton, { backgroundColor: wa.champ }]}>
        <Icon name="plus" size={18} color={wa.encre} />
      </Pressable>
    </View>
  )
}

export function Groupe({ children }: { children: ReactNode }) {
  const wa = useWa()
  return <View style={[s.groupe, { backgroundColor: wa.champ }]}>{children}</View>
}

export function Note({ children, ok }: { children: ReactNode; ok?: boolean }) {
  const wa = useWa()
  return (
    <View style={[s.note, { backgroundColor: ok ? wa.vertWash : wa.champ }]}>
      <Icon name={ok ? 'checkPlain' : 'info'} size={18} color={ok ? wa.vertEncre : wa.gris} />
      <Text style={[s.noteTexte, { color: ok ? wa.vertEncre : wa.gris }]}>{children}</Text>
    </View>
  )
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  question: { gap: 8, marginBottom: 8 },
  titre: { fontSize: 32, fontWeight: '800', lineHeight: 38, letterSpacing: -0.5 },
  sous: { fontSize: 16, lineHeight: 22 },
  libelle: { fontSize: 13, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 8, marginLeft: 4 },
  champBloc: { gap: 6 },
  champ: { minHeight: 52, borderRadius: 16, paddingHorizontal: 16, fontSize: 17 },
  puces: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  puce: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 16, minHeight: 42, justifyContent: 'center' },
  puceTexte: { fontSize: 16, fontWeight: '500' },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingVertical: 8 },
  ligneTexte: { fontSize: 17 },
  ligneSous: { fontSize: 14, marginTop: 2, lineHeight: 19 },
  case: { width: 26, height: 26, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  rond: { borderRadius: 13 },
  compteur: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  compteurBouton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  compteurValeur: { fontSize: 20, fontWeight: '600', minWidth: 24, textAlign: 'center' },
  groupe: { borderRadius: 20, paddingHorizontal: 16 },
  note: { flexDirection: 'row', gap: 10, borderRadius: 12, padding: 12, alignItems: 'flex-start' },
  noteTexte: { flex: 1, fontSize: 15, lineHeight: 21 },
})
