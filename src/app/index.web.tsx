import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { MasonryFlashList } from "@shopify/flash-list";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons/faPenToSquare";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons/faTrashAlt";
import { useEffect, useState } from "react";

import { notesTable } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { FAB, IconButton, Text } from "react-native-paper";
import { useRouter } from "expo-router";
import { useDatabase } from "@/hooks/useDatabase";

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

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const db = useDatabase();
  const [notes, setNotes] = useState<any[]>([]);

  console.log(notes, " notes");

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
          // await db?.insert(notesTable).values({
          //   name: `John Doe ${new Date().getTime()}`,
          //   email: `john-${new Date().getTime()}@example.com`,
          // });
          // getnotes();
        }}
      />
      <MasonryFlashList
        contentContainerStyle={{ paddingHorizontal: 4 }}
        data={notes}
        numColumns={2}
        renderItem={({ item, columnIndex }) => {
          const { color, number } = getRandomNumberAndColor(80, 200, "dark");
          return (
            <Pressable
              onPress={() => {
                if (item.type === "Inventory") {
                  router.push({
                    pathname: "/inventory/[id]",
                    params: { id: item.id },
                  });
                }
              }}
            >
              <View
                style={{
                  padding: 8,
                  gap: 1,
                  backgroundColor: color,
                  height: number,
                  borderRadius: 8,
                  margin: 4,
                }}
              >
                <View style={{ flexDirection: "row" }}>
                  <IconButton
                    icon={({ color, size }) => {
                      return (
                        <FontAwesomeIcon
                          icon={faPenToSquare}
                          color={color}
                          size={size}
                        />
                      );
                    }}
                    size={20}
                    onPress={async () => {}}
                  />
                  <IconButton
                    icon={({ color, size }) => {
                      return (
                        <FontAwesomeIcon
                          icon={faTrashAlt}
                          color={color}
                          size={size}
                        />
                      );
                    }}
                    size={20}
                    onPress={async () => {
                      await db
                        ?.delete(notesTable)
                        .where(eq(notesTable.id, item.id));
                      getnotes();
                    }}
                  />
                </View>
                <Text variant="titleMedium">{item.title}</Text>
                <Text variant="labelSmall">{item.listDisplayView}</Text>
              </View>
            </Pressable>
          );
        }}
        estimatedItemSize={200}
      />
    </View>
  );
}
