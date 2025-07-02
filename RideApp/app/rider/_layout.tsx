import { Stack } from "expo-router";

export default function RiderLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false, title: "Rider Mode" }} />
      <Stack.Screen name="dashboard" options={{ headerShown: false, title: "Driver Dashboard" }} />
    </Stack>
  );
}
