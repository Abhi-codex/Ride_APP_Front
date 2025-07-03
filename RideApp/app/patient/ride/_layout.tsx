import { Stack } from "expo-router";

export default function RideLayout() {
  return (
    <Stack>
      <Stack.Screen name="[rideId]" options={{ headerShown: false, title: "Ride Details" }} />
    </Stack>
  );
}
