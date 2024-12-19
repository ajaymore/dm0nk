import "react-native-get-random-values";
import "react-native-url-polyfill/auto";
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { useMigrate } from "@/hooks/useMigrate";
import {
  focusManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { useColorScheme } from "@/hooks/useColorScheme";
import {
  adaptNavigationTheme,
  configureFonts,
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
} from "react-native-paper";
import { AppState, AppStateStatus, Platform } from "react-native";
import { SheetProvider } from "react-native-actions-sheet";
import { useAuth } from "@/hooks/useAuth";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function onAppStateChange(state: AppStateStatus) {
  // React Query already supports in web browser refetch on window focus by default
  if (Platform.OS !== "web") {
    focusManager.setFocused(state === "active");
  }
}

const queryClient = new QueryClient();

const fontConfig = {
  fontFamily: "Inter",
};

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme,
});

const CombinedDefaultTheme = {
  ...MD3LightTheme,
  ...LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...LightTheme.colors,
  },
  fonts: configureFonts({ config: fontConfig }),
};
const CombinedDarkTheme = {
  ...MD3DarkTheme,
  ...DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...DarkTheme.colors,
  },
  fonts: configureFonts({ config: fontConfig }),
};

const theme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
};

export default function RootLayout() {
  const session = useAuth();
  const { success, error } = useMigrate();
  // const colorScheme = useColorScheme();
  const colorScheme = "dark";
  const [loaded] = useFonts({
    Inter: require("../assets/fonts/Inter.ttf"),
  });
  const paperTheme =
    colorScheme === "dark" ? CombinedDarkTheme : CombinedDefaultTheme;

  useEffect(() => {
    if (loaded && session !== "unset") {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  if (!loaded || session == "unset") {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SheetProvider>
        <ThemeProvider value={paperTheme as any}>
          <PaperProvider theme={theme}>
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="sign-in" options={{ headerShown: false }} />
              <Stack.Screen name="sign-up" options={{ headerShown: false }} />
              <Stack.Screen name="settings" options={{ title: "Settings" }} />
              <Stack.Screen name="account" options={{ title: "Account" }} />
              <Stack.Screen
                name="choose-type"
                options={{
                  presentation: "modal",
                }}
              />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </PaperProvider>
        </ThemeProvider>
      </SheetProvider>
    </QueryClientProvider>
  );
}
