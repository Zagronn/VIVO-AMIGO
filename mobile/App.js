import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { APPS } from './src';

export default function App({ initialTarget = 'pay' }) {
  const [target, setTarget] = useState(initialTarget);
  const app = APPS[target] || APPS.pay;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>VIVO AMIGO / MOBILE</Text>
        <Text style={styles.title}>{app.name}</Text>
        <Text style={styles.copy}>A dark-mode native shell for trusted commerce, ready for offline work and protected actions.</Text>
        <View style={styles.switcher}>
          {Object.entries(APPS).map(([key, item]) => (
            <Pressable key={key} onPress={() => setTarget(key)} style={[styles.tab, key === target && styles.activeTab]}>
              <Text style={[styles.tabText, key === target && styles.activeTabText]}>{item.name}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Ready flows</Text>
          {app.flows.map((flow) => <Text key={flow} style={styles.flow}>●  {flow.replaceAll('-', ' ')}</Text>)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#071114' },
  content: { flexGrow: 1, padding: 24, gap: 18 },
  kicker: { color: '#c6ef69', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  title: { color: '#edf5ef', fontSize: 42, fontWeight: '700', marginTop: 18 },
  copy: { color: '#91a4a1', fontSize: 17, lineHeight: 26, maxWidth: 520 },
  switcher: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  tab: { borderColor: '#284044', borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  activeTab: { backgroundColor: '#c6ef69', borderColor: '#c6ef69' },
  tabText: { color: '#91a4a1', fontSize: 12, fontWeight: '800' },
  activeTabText: { color: '#071114' },
  panel: { backgroundColor: '#0e1d20', borderColor: '#284044', borderWidth: 1, marginTop: 24, padding: 20 },
  panelTitle: { color: '#edf5ef', fontSize: 20, fontWeight: '700', marginBottom: 14 },
  flow: { color: '#63d7d1', fontSize: 16, marginTop: 10, textTransform: 'capitalize' }
});
