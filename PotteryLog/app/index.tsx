import React from 'react';
import { Link, router } from 'expo-router';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useActiveProfileStore } from '../src/state/profileStore';
import { pieceRepository } from '../src/repos/pieceRepository';

export default function HomeScreen() {
  const activeProfileId = useActiveProfileStore(s => s.activeProfileId);
  const { data } = useQuery({
    queryKey: ['pieces', activeProfileId],
    queryFn: () => pieceRepository.listPiecesByProfile(activeProfileId),
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pottery</Text>
        <TouchableOpacity onPress={() => router.push('/profiles')}>
          <Text style={styles.link}>Profiles</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={data ?? []}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={{ padding: 12 }}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: '/piece', params: { id: String(item.id) } })}>
            {item.featureImageUri ? (
              <Image source={{ uri: item.featureImageUri }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.placeholder]} />
            )}
            <Text style={styles.cardTitle}>{item.title ?? 'Untitled'}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/piece/new')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '600' },
  link: { color: '#3366ff', fontSize: 16 },
  card: { flex: 1, backgroundColor: '#f6f6f6', borderRadius: 12, overflow: 'hidden' },
  image: { width: '100%', height: 150, backgroundColor: '#ddd' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  cardTitle: { padding: 8, fontSize: 14 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#000', width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  fabText: { color: '#fff', fontSize: 28, marginTop: -2 },
});

