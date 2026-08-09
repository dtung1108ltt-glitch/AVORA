import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "AI Career Copilot",
  slug: "ai4a",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "ai4a",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#0ea5e9",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    ...config.ios,
    supportsTablet: true,
    bundleIdentifier: "org.ai4a.app",
    infoPlist: {
      ...config.ios?.infoPlist,
      NSSpeechRecognitionUsageDescription:
        "We need speech recognition for voice input in interviews",
      NSMicrophoneUsageDescription:
        "We need microphone access for voice input in interviews",
    },
  },
  android: {
    ...config.android,
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0ea5e9",
    },
    package: "org.ai4a.app",
    permissions: ["RECORD_AUDIO", "INTERNET", "ACCESS_NETWORK_STATE"],
  },
  web: {
    ...config.web,
    bundler: "metro",
    favicon: "./assets/favicon.png",
  },
  plugins: ["expo-router"],
  experiments: {
    ...config.experiments,
    typedRoutes: true,
  },
});