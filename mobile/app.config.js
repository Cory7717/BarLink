const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
const easProjectId = process.env.EXPO_EAS_PROJECT_ID || "replace-with-eas-project-id";

const config = ({ config }) => ({
  ...config,
  name: "BarLink360",
  slug: "BarLink360",
  scheme: "BarLink360",
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
    package: "com.BarLink360.app",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0b1221",
    },
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.BarLink360.app",
  },
  extra: {
    eas: {
      projectId: easProjectId,
    },
    apiUrl,
  },
});

export default config;
