import { Stack } from 'expo-router';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useHydrateActiveProfile } from '../src/state/profileStore';

const queryClient = new QueryClient();

export default function Layout() {
  useHydrateActiveProfile();
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

