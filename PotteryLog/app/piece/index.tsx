import React from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pieceRepository } from '../../src/repos/pieceRepository';
import { useActiveProfileStore } from '../../src/state/profileStore';

export default function PieceDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const isNew = !params.id;
  const activeProfileId = useActiveProfileStore(s => s.activeProfileId);
  const qc = useQueryClient();

  const { data } = useQuery({
    enabled: !isNew,
    queryKey: ['piece', params.id],
    queryFn: () => pieceRepository.getPieceById(Number(params.id)),
  });

  const [title, setTitle] = React.useState<string>(data?.title ?? '');
  const [featureImageUri, setFeatureImageUri] = React.useState<string | null>(data?.featureImageUri ?? null);
  const [clayType, setClayType] = React.useState<string>(data?.clayType ?? '');
  const [clayGrams, setClayGrams] = React.useState<string>(data?.clayGrams ? String(data.clayGrams) : '');
  const [dates, setDates] = React.useState<{ [k: string]: string }>({
    thrownOn: data?.thrownOn ?? '',
    trimmedOn: data?.trimmedOn ?? '',
    bisqueFiredOn: data?.bisqueFiredOn ?? '',
    glazedOn: data?.glazedOn ?? '',
    glazeFiredOn: data?.glazeFiredOn ?? '',
  });
  const [glaze, setGlaze] = React.useState<string>(data?.glaze ?? '');

  React.useEffect(() => {
    if (data) {
      setTitle(data.title ?? '');
      setFeatureImageUri(data.featureImageUri ?? null);
      setClayType(data.clayType ?? '');
      setClayGrams(data.clayGrams ? String(data.clayGrams) : '');
      setDates({
        thrownOn: data.thrownOn ?? '',
        trimmedOn: data.trimmedOn ?? '',
        bisqueFiredOn: data.bisqueFiredOn ?? '',
        glazedOn: data.glazedOn ?? '',
        glazeFiredOn: data.glazeFiredOn ?? '',
      });
      setGlaze(data.glaze ?? '');
    }
  }, [data]);

  const upsertMutation = useMutation({
    mutationFn: async () => {
      if (!activeProfileId && isNew) {
        Alert.alert('Select profile', 'Please choose a profile before saving.');
        return;
      }
      const payload = {
        id: data?.id ?? 0,
        profileId: activeProfileId ?? null,
        title: title.trim() || 'Untitled',
        featureImageUri,
        clayType: clayType || null,
        clayGrams: clayGrams ? Number(clayGrams) : null,
        thrownOn: dates.thrownOn || null,
        trimmedOn: dates.trimmedOn || null,
        bisqueFiredOn: dates.bisqueFiredOn || null,
        glazedOn: dates.glazedOn || null,
        glazeFiredOn: dates.glazeFiredOn || null,
        glaze: glaze || null,
      };
      if (isNew) return pieceRepository.createPiece(payload);
      return pieceRepository.updatePiece(payload as any);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['pieces', activeProfileId] });
      router.back();
    },
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    const asset = !result.canceled ? result.assets?.[0] : undefined;
    if (asset?.uri) {
      setFeatureImageUri(asset.uri);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ height: 12 }} />
      <TouchableOpacity onPress={pickImage}>
        {featureImageUri ? (
          <Image source={{ uri: featureImageUri }} style={styles.feature} />
        ) : (
          <View style={[styles.feature, styles.featurePlaceholder]}>
            <Text>Add feature photo</Text>
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.row}><Text style={styles.label}>Title</Text><TextInput value={title} onChangeText={setTitle} style={styles.input} placeholder="Bowl / Mug / Vase" /></View>
      <View style={styles.row}><Text style={styles.label}>Clay type</Text><TextInput value={clayType} onChangeText={setClayType} style={styles.input} placeholder="Stoneware / Porcelain" /></View>
      <View style={styles.row}><Text style={styles.label}>Clay grams</Text><TextInput keyboardType="numeric" value={clayGrams} onChangeText={setClayGrams} style={styles.input} placeholder="e.g. 450" /></View>
      <View style={styles.row}><Text style={styles.label}>Thrown</Text><TextInput value={dates.thrownOn} onChangeText={(t)=>setDates(p=>({...p, thrownOn:t}))} style={styles.input} placeholder="YYYY-MM-DD" /></View>
      <View style={styles.row}><Text style={styles.label}>Trimmed</Text><TextInput value={dates.trimmedOn} onChangeText={(t)=>setDates(p=>({...p, trimmedOn:t}))} style={styles.input} placeholder="YYYY-MM-DD" /></View>
      <View style={styles.row}><Text style={styles.label}>Bisque fired</Text><TextInput value={dates.bisqueFiredOn} onChangeText={(t)=>setDates(p=>({...p, bisqueFiredOn:t}))} style={styles.input} placeholder="YYYY-MM-DD" /></View>
      <View style={styles.row}><Text style={styles.label}>Glazed</Text><TextInput value={dates.glazedOn} onChangeText={(t)=>setDates(p=>({...p, glazedOn:t}))} style={styles.input} placeholder="YYYY-MM-DD" /></View>
      <View style={styles.row}><Text style={styles.label}>Glaze fired</Text><TextInput value={dates.glazeFiredOn} onChangeText={(t)=>setDates(p=>({...p, glazeFiredOn:t}))} style={styles.input} placeholder="YYYY-MM-DD" /></View>
      <View style={styles.row}><Text style={styles.label}>Glaze</Text><TextInput value={glaze} onChangeText={setGlaze} style={styles.input} placeholder="e.g. Celadon" /></View>

      <TouchableOpacity style={styles.save} onPress={() => upsertMutation.mutate()}>
        <Text style={{ color: 'white', fontSize: 16 }}>Save</Text>
      </TouchableOpacity>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  feature: { width: '100%', height: 220, borderRadius: 12, backgroundColor: '#eee' },
  featurePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  row: { marginTop: 12 },
  label: { fontSize: 12, color: '#666', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, backgroundColor: 'white' },
  save: { marginTop: 20, backgroundColor: 'black', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
});

