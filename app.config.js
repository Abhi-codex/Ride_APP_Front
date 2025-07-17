import 'dotenv/config';

export default {
  expo: {
    name: "InstaAid",
    slug: "InstaAid",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "instaaid",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    developmentClient: {
      silentLaunch: true
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "This app uses location to show your position on the map and to help you find rides nearby.",
        ITSAppUsesNonExemptEncryption: false
      },
      bundleIdentifier: "com.dhruva12.InstaAid"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ],
      package: "com.dhruva12.InstaAid",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/icon.png"
    },
    plugins: [
      "expo-dev-client",
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {},
      eas: {"projectId": "23de7421-7980-423d-9c0e-b6487e58ba41"},
      EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
    }
  }
};
