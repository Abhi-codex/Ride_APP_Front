import { Stack } from "expo-router";

export default function PatientLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false, title: "Patient Login" }} />
      <Stack.Screen name="profile-setup" options={{ headerShown: false, title: "Profile Setup" }} />
      <Stack.Screen name="index" options={{ headerShown: false, title: "Home" }} />
      <Stack.Screen name="book-ride" options={{ headerShown: false, title: "Book Ride" }} />
      <Stack.Screen name="ride" options={{ headerShown: false }} />
      <Stack.Screen name="tracking" options={{ headerShown: false, title: "Track Ride" }} />
      <Stack.Screen name="medicine" options={{ headerShown: false, title: "Medicine" }} />
      <Stack.Screen name="ai" options={{ headerShown: false, title: "AI Assistant" }} />
    </Stack>
  );
}
