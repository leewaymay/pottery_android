import React from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { profileRepository } from '../src/repos/profileRepository';
import { useActiveProfileStore } from '../src/state/profileStore';

export default function ProfilesScreen() {
  const { data } = useQuery({ queryKey: ['profiles'], queryFn: profileRepository.listProfiles });
  const [name, setName] = React.useState('');
  const setActiveProfileId = useActiveProfileStore(s => s.setActiveProfileId);
  const activeProfileId = useActiveProfileStore(s => s.activeProfileId);
  const qc = useQueryClient();

  const create = async () => {
    if (!name.trim()) return;
    const id = await profileRepository.createProfile({ name: name.trim() });
    setName('');
    setActiveProfileId(id);
    await qc.invalidateQueries({ queryKey: ['profiles'] });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profiles</Text>
      <FlatList
        data={data ?? []}
        keyExtractor={(p) => String(p.id)}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.row, item.id === activeProfileId && styles.active]} onPress={() => setActiveProfileId(item.id!)}>
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      <View style={styles.newRow}>
        <TextInput value={name} onChangeText={setName} placeholder="New profile name" style={styles.input} />
        <TouchableOpacity onPress={create} style={styles.addBtn}><Text style={{ color: 'white' }}>Add</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: 'white' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 12 },
  row: { padding: 14, borderRadius: 10, backgroundColor: '#f6f6f6', marginBottom: 8 },
  active: { backgroundColor: '#e8f0ff' },
  name: { fontSize: 16 },
  newRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10 },
  addBtn: { backgroundColor: 'black', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
});

