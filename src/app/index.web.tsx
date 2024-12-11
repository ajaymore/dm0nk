import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { MasonryFlashList } from "@shopify/flash-list";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons/faPenToSquare";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons/faTrashAlt";
import { useEffect, useState } from "react";

import { notesTable } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { FAB, IconButton, Menu, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { useDatabase } from "@/hooks/useDatabase";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import ActionSheet, {
  registerSheet,
  ScrollView,
  SheetDefinition,
  SheetManager,
  SheetProps,
} from "react-native-actions-sheet";
import {
  faCopy,
  faShare,
  faThumbTack,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

// Use proxy for communication
// Figure migration strategy later or handcraft migrations
// The database should be based on user login

function getRandomNumberAndColor(
  min: number,
  max: number,
  mode: "dark" | "light" = "light"
): {
  number: number;
  color: string;
} {
  const lightColors = [
    "#faafa8",
    "#f39f76",
    "#fff8b8",
    "#e2f6d3",
    "#b4ddd3",
    "#d4e4ed",
    "#aeccdc",
    "#d3bfdb",
    "#f6e2dd",
    "#e9e3d4",
    "#efeff1",
  ];
  const darkColors = [
    "#77172e",
    "#692b17",
    "#7c4a03",
    "#264d3b",
    "#0c625d",
    "#256377",
    "#284255",
    "#472e5b",
    "#6c394f",
    "#4b443a",
    "#232427",
  ];

  const colors = mode === "dark" ? darkColors : lightColors;

  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return {
    number: randomNumber,
    color: randomColor,
  };
}

function DisplayNoteContent({ content }: { content: string }) {
  let height = (content.split(" ").length / 3) * 20;
  let contentModified = content;

  if (height > 180) {
    height = 180;
    contentModified = content.split(" ").slice(0, 18).concat("...").join(" ");
  }

  return (
    <View style={{}}>
      <Text variant="bodyMedium">{contentModified}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const db = useDatabase();
  const [notes, setNotes] = useState<any[]>([]);

  async function getnotes() {
    db!
      .select()
      .from(notesTable)
      // .where(eq(notesTable.email, "john@example.com"))
      .then((data) => {
        setNotes(data);
      });
  }

  useEffect(() => {
    if (db) {
      getnotes();
    }
  }, [db]);

  return (
    <View style={{ flex: 1, paddingTop: insets.top + 16, gap: 4 }}>
      <FAB
        icon="plus"
        style={{
          position: "absolute",
          margin: 16,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
        onPress={async () => {
          router.push("/choose-type");
        }}
      />
      <MasonryFlashList
        contentContainerStyle={{ paddingHorizontal: 4 }}
        data={notes}
        numColumns={2}
        renderItem={({ item, columnIndex }) => {
          return <ListItem item={item} columnIndex={columnIndex} />;
        }}
        estimatedItemSize={200}
      />
      {/* <BottomActionSheet sheetId="actions-sheet" /> */}
    </View>
  );
}

function ListItem({ item, columnIndex }: { item: any; columnIndex: number }) {
  const router = useRouter();
  const { color, number } = getRandomNumberAndColor(150, 200, "dark");
  const borderOpacity = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: "#d4e4ed",
      borderWidth: withTiming(borderOpacity.value * 3, { duration: 200 }),
    };
  });

  return (
    <Pressable
      onPressIn={() => {
        borderOpacity.value = 1;
      }}
      onPressOut={() => {
        borderOpacity.value = 0;
      }}
      onLongPress={() => {
        SheetManager.show("actions-sheet", {
          payload: { id: "Hello World" },
        });
      }}
      onPress={() => {
        if (item.type === "Inventory") {
          router.push({
            pathname: "/inventory/[id]",
            params: { id: item.id },
          });
        } else if (item.type === "Default") {
          router.push({
            pathname: "/regular/[id]",
            params: { id: item.id },
          });
        }
      }}
    >
      <Animated.View
        style={[
          {
            padding: 16,
            gap: 1,
            backgroundColor: color,
            borderRadius: 8,
            margin: 4,
          },
          animatedStyle,
        ]}
      >
        <Text variant="titleMedium" style={{ paddingBottom: 8 }}>
          {item.title}
        </Text>
        <DisplayNoteContent content={item.listDisplayView} />
      </Animated.View>
    </Pressable>
  );
}

declare module "react-native-actions-sheet" {
  interface Sheets {
    "actions-sheet": SheetDefinition<{
      payload: {
        id: string;
      };
    }>;
  }
}

registerSheet("actions-sheet", BottomActionSheet);

function BottomActionSheet(props: SheetProps<"actions-sheet">) {
  console.log("props", props);
  return (
    <ActionSheet id={props.sheetId} gestureEnabled>
      <View style={{ flex: 1 }}>
        <Menu.Item
          style={{ maxWidth: "100%" }}
          leadingIcon={({ color, size }) => {
            return (
              <FontAwesomeIcon icon={faPenToSquare} color={color} size={size} />
            );
          }}
          onPress={() => {}}
          title="Rename"
        />
        <Menu.Item
          style={{ maxWidth: "100%" }}
          leadingIcon={({ color, size }) => {
            return <FontAwesomeIcon icon={faTrash} color={color} size={size} />;
          }}
          onPress={() => {}}
          title="Delete"
        />
        <Menu.Item
          style={{ maxWidth: "100%" }}
          leadingIcon={({ color, size }) => {
            return (
              <FontAwesomeIcon icon={faThumbTack} color={color} size={size} />
            );
          }}
          onPress={() => {}}
          title="Pin"
        />
        {/* <Menu.Item
          style={{ maxWidth: "100%" }}
          leadingIcon="content-copy"
          onPress={() => {}}
          title="Palette"
          disabled
        /> */}
        <ScrollView horizontal>
          {[
            "#77172e",
            "#692b17",
            "#7c4a03",
            "#264d3b",
            "#0c625d",
            "#256377",
            "#284255",
            "#472e5b",
            "#6c394f",
            "#4b443a",
            "#232427",
          ].map((color) => (
            <View
              key={color}
              style={{
                height: 32,
                width: 32,
                backgroundColor: color,
                borderRadius: 32,
                margin: 8,
              }}
            />
          ))}
        </ScrollView>
        <Menu.Item
          style={{ maxWidth: "100%" }}
          leadingIcon="content-paste"
          onPress={() => {}}
          title="Tag"
        />
        <Menu.Item
          style={{ maxWidth: "100%" }}
          leadingIcon={({ color, size }) => {
            return <FontAwesomeIcon icon={faShare} color={color} size={size} />;
          }}
          onPress={() => {}}
          title="Share"
        />
        <Menu.Item
          style={{ maxWidth: "100%" }}
          leadingIcon={({ color, size }) => {
            return <FontAwesomeIcon icon={faCopy} color={color} size={size} />;
          }}
          onPress={() => {}}
          title="Make a copy"
        />
      </View>
    </ActionSheet>
  );
}
