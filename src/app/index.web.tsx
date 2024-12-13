import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { MasonryFlashList } from "@shopify/flash-list";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons/faPenToSquare";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons/faTrashAlt";
import { useCallback, useEffect, useState } from "react";
import { v4 as uuidV4 } from "uuid";
import { notesTable } from "@/lib/schema";
import { eq, InferSelectModel } from "drizzle-orm";
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
  faCheck,
  faCopy,
  faShare,
  faThumbTack,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { atom, useAtom, useSetAtom } from "jotai";
import { useQuery } from "@tanstack/react-query";
import * as Sharing from "expo-sharing";

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

const notesAtom = atom<InferSelectModel<typeof notesTable>[]>([]);

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const db = useDatabase();
  const [notes, setNotes] = useAtom(notesAtom);

  async function getnotes() {
    db!
      .select()
      .from(notesTable)
      .where(eq(notesTable.is_deleted, 0))
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

function ListItem({
  item,
  columnIndex,
}: {
  item: InferSelectModel<typeof notesTable>;
  columnIndex: number;
}) {
  const router = useRouter();
  // const { color, number } = getRandomNumberAndColor(150, 200, "dark");
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
          payload: { id: item.id },
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
            backgroundColor: item.bg_color,
            borderRadius: 8,
            margin: 4,
          },
          animatedStyle,
        ]}
      >
        <Text variant="titleMedium" style={{ paddingBottom: 8 }}>
          {item.title}
          {item.pinned ? " 📌" : ""}
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

function ConfirmDelete({
  id,
  refreshNotes,
}: {
  id: string;
  refreshNotes: any;
}) {
  const [confirm, setConfrim] = useState(false);
  const db = useDatabase();

  if (confirm) {
    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text>Are you sure?</Text>
        <IconButton
          icon={({ color, size }) => {
            return <FontAwesomeIcon icon={faCheck} color={color} size={size} />;
          }}
          onPress={() => {
            db?.update(notesTable)
              .set({ is_deleted: 1 })
              .where(eq(notesTable.id, id))
              .then(async () => {
                await refreshNotes();
                SheetManager.hide("actions-sheet");
              })
              .catch((err) => {
                console.error(err);
              });
          }}
        />
        <IconButton
          onPress={() => {
            setConfrim(false);
          }}
          icon={({ color, size }) => {
            return <FontAwesomeIcon icon={faXmark} color={color} size={size} />;
          }}
        />
      </View>
    );
  }

  return (
    <Menu.Item
      style={{ maxWidth: "100%" }}
      leadingIcon={({ color, size }) => {
        return <FontAwesomeIcon icon={faTrash} color={color} size={size} />;
      }}
      onPress={() => {
        setConfrim(true);
      }}
      title="Delete"
    />
  );
}

function BottomActionSheet(props: SheetProps<"actions-sheet">) {
  const setNotes = useSetAtom(notesAtom);
  const db = useDatabase();
  const { data, refetch } = useQuery({
    queryKey: ["note", props?.payload?.id],
    queryFn: async () => {
      return await db!
        .select()
        .from(notesTable)
        .where(eq(notesTable.id, props?.payload?.id!))
        .limit(1);
    },
    enabled: Boolean(props?.payload?.id && db),
  });

  const item = data?.[0];

  const refreshNotes = useCallback(async () => {
    await db!
      .select()
      .from(notesTable)
      .where(eq(notesTable.is_deleted, 0))
      .then((data) => {
        setNotes(data);
      });
  }, [db]);

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
        <ConfirmDelete refreshNotes={refreshNotes} id={props?.payload?.id!} />
        <Menu.Item
          style={{ maxWidth: "100%" }}
          leadingIcon={({ color, size }) => {
            return (
              <FontAwesomeIcon icon={faThumbTack} color={color} size={size} />
            );
          }}
          onPress={async () => {
            const item = await db
              ?.select()
              .from(notesTable)
              .where(eq(notesTable.id, props?.payload?.id!))
              .limit(1);
            db?.update(notesTable)
              .set({ pinned: item ? (item[0].pinned ? 0 : 1) : 1 })
              .where(eq(notesTable.id, props?.payload?.id!))
              .then(async () => {
                refetch();
                await refreshNotes();
              });
          }}
          title={item ? (item.pinned ? "Remove pin" : "Pin") : "Pin"}
        />
        <ScrollView horizontal contentContainerStyle={{ paddingVertical: 8 }}>
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
            <Pressable
              onPress={() => {
                db?.update(notesTable)
                  .set({ bg_color: color })
                  .where(eq(notesTable.id, props?.payload?.id!))
                  .then(async () => {
                    await refreshNotes();
                  });
              }}
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
          onPress={() => {
            Sharing.isAvailableAsync().then((available) => {
              if (available) {
                // create a base64 encoded string url
                Sharing.shareAsync("", {
                  dialogTitle: "Share this note",
                });
              }
            });
          }}
          title="Share"
        />
        <Menu.Item
          style={{ maxWidth: "100%" }}
          leadingIcon={({ color, size }) => {
            return <FontAwesomeIcon icon={faCopy} color={color} size={size} />;
          }}
          onPress={() => {
            db?.insert(notesTable)
              .values({
                ...item,
                id: uuidV4(),
                title: `(Copy) ${item?.title}`,
              })
              .then(async () => {
                await refreshNotes();
              });
          }}
          title="Make a copy"
        />
      </View>
    </ActionSheet>
  );
}
