const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
const easProjectId = process.env.EXPO_EAS_PROJECT_ID || "replace-with-eas-project-id";

export default ({ config }) => ({
  ...config,
  name: "BarLink",
  slug: "barlink",
  scheme: "barlink",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#0b1221",
  },
  experiments: {
    typedRoutes: true,
  },
  android: {
    package: "com.barlink.app",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0b1221",
    },
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.barlink.app",
  },
  extra: {
    eas: {
      projectId: easProjectId,
    },
    apiUrl,
  },
});
