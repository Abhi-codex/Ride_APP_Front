import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="ride" options={{ headerShown: false }} />
      <Stack.Screen
        name="dashboard"
        options={{ headerShown: false, title: "Driver Dashboard" }}
      />
      <Stack.Screen name="tracking" options={{ headerShown: false }} />
      <Stack.Screen name="medicine" options={{ headerShown: false }} />
      <Stack.Screen name="ai" options={{ headerShown: false }} />
    </Stack>
  );
}
