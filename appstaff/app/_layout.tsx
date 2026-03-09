import { Stack } from 'expo-router';
import { View, StatusBar } from 'react-native';
import { Colors } from '../constants/Colors';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: Colors.black }}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.black} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.black },
          animation: 'slide_from_right',
        }}
      >
        {/* The index is the Login Screen */}
        <Stack.Screen name="index" />
        {/* The home is the Staff Dashboard */}
        <Stack.Screen name="home" />
        <Stack.Screen name="scan" />
        <Stack.Screen name="tasks" />
      </Stack>
    </SafeAreaProvider>
  );
}
