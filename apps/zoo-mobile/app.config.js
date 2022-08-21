export default () => {
  return {
    expo: {
      name: "Zerve",
      slug: "zerve",
      version: "1.0.0",
      orientation: "portrait",
      scheme: "zerve",
      userInterfaceStyle: "automatic",
      backgroundColor: "#806896",
      primaryColor: "#8147b7",
      splash: {
        image: "./assets/images/splash.png",
        resizeMode: "cover",
        backgroundColor: "#0000ff",
      },
      assetBundlePatterns: ["**/*"],
      ios: {
        icon: "./assets/images/icon.png",
        infoPlist: {
          UIViewControllerBasedStatusBarAppearance: true,
        },
        supportsTablet: true,
        bundleIdentifier: "app.zerve.main",
      },
      android: {
        adaptiveIcon: {
          foregroundImage: "./assets/images/AndroidAdaptiveFg.png",
          backgroundImage: "./assets/images/AndroidAdaptiveBg.png",
        },
        splash: {
          resizeMode: "cover",
        },
        package: "app.zerve.main",
      },
      androidStatusBar: {
        translucent: true,
      },
      web: {
        favicon: "./assets/images/favicon.png",
      },
      runtimeVersion: "1.0.0",
    },
  };
};
