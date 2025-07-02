import { Stack } from "expo-router";

export default function UserLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false, title: "Home" }} />
      <Stack.Screen name="book-ride" options={{ headerShown: false, title: "Book Ride" }} />
      <Stack.Screen name="ride" options={{ headerShown: false }} />
      <Stack.Screen name="tracking" options={{ headerShown: false, title: "Track Ride" }} />
      <Stack.Screen name="medicine" options={{ headerShown: false, title: "Medicine" }} />
      <Stack.Screen name="ai" options={{ headerShown: false, title: "AI Assistant" }} />
    </Stack>
  );
}
