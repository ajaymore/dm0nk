import React, { FC, ReactNode } from "react";
import {
  View,
  ViewProps,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { useTheme } from "react-native-paper";

interface LayoutProps extends ViewProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * A Row component with horizontal layout.
 * It renders its children in a horizontal row.
 */
export const Row: FC<LayoutProps> = ({ children, style, ...rest }) => {
  const theme = useTheme();
  return (
    <View
      style={[styles.row, { backgroundColor: theme.colors.surface }, style]}
      {...rest}
    >
      {children}
    </View>
  );
};

/**
 * A Column component with vertical layout.
 * It renders its children in a vertical stack.
 * (Note: `flexDirection: 'column'` is the default in RN, but we set it explicitly for clarity.)
 */
export const Column: FC<LayoutProps> = ({ children, style, ...rest }) => {
  const theme = useTheme();
  return (
    <View
      style={[styles.column, { backgroundColor: theme.colors.surface }, style]}
      {...rest}
    >
      {children}
    </View>
  );
};

/**
 * A Container component as a top-level wrapper.
 * Typically you might add padding, backgroundColor or SafeAreaView here.
 * For simplicity, we use a View. Replace with SafeAreaView if needed.
 */
export const Container: FC<LayoutProps> = ({ children, style, ...rest }) => {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center", // Adjust as needed
    justifyContent: "flex-start", // Adjust as needed
  },
  column: {
    flexDirection: "column",
    alignItems: "stretch", // Adjust as needed
    justifyContent: "flex-start", // Adjust as needed
  },
  container: {
    flex: 1,
    padding: 16, // Adjust as needed
  },
});
