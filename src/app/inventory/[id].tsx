import { useDatabase } from "@/hooks/useDatabase";
import { notesTable } from "@/lib/schema";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { eq } from "drizzle-orm";
import {
  Stack,
  useGlobalSearchParams,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, View, TextInput as VanillaTextInput } from "react-native";
import {
  Button,
  FAB,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { v4 as uuidv4 } from "uuid";
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { FlashList } from "@shopify/flash-list";
import { faSquare } from "@fortawesome/free-regular-svg-icons/faSquare";
import { faSquareCheck } from "@fortawesome/free-regular-svg-icons/faSquareCheck";
import { faXmarkCircle } from "@fortawesome/free-regular-svg-icons/faXmarkCircle";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { atom, useAtom, useSetAtom } from "jotai";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

function ItemView({
  item,
  setItems,
}: {
  item: { id: string; name: string; in_stock: boolean };
  setItems: any;
}) {
  //   const [text, setText] = useState(item.name);
  const theme = useTheme();
  const [noteTexts, setNoteTexts] = useAtom(notesTextAtom);
  function removeItem() {
    setItems((prev: any) => {
      return prev.filter((item2: any) => item2.id !== item.id);
    });
  }

  return (
    <View
      style={{
        paddingVertical: 4,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {item.in_stock ? (
        <Pressable
          style={{}}
          onPress={() => {
            setItems((prev: any) => {
              return prev.map((item2: any) => {
                return item2.id === item.id
                  ? { ...item2, in_stock: false }
                  : item2;
              });
            });
          }}
        >
          <FontAwesomeIcon
            icon={faSquareCheck}
            color={theme.colors.onSurface}
            size={24}
          />
        </Pressable>
      ) : (
        <Pressable
          style={{}}
          onPress={() => {
            setItems((prev: any) => {
              return prev.map((item2: any) => {
                return item2.id === item.id
                  ? { ...item2, in_stock: true }
                  : item2;
              });
            });
          }}
        >
          <FontAwesomeIcon
            icon={faSquare}
            color={theme.colors.onSurface}
            size={24}
          />
        </Pressable>
      )}
      <VanillaTextInput
        style={{
          flexGrow: 1,
          paddingHorizontal: 16,
          paddingVertical: 8,
          fontSize: 16,
          color: theme.colors.onSurface,
        }}
        value={noteTexts.get(item.id)}
        onChangeText={(text) => {
          setNoteTexts((prev) => {
            const next = new Map(prev);
            next.set(item.id, text);
            return next;
          });
        }}
      />
      <ConfirmationModal
        onAction={removeItem}
        cancelButtonText="Cancel"
        actionButtonText="Delete"
        title="Are you sure?"
        body={`Are you sure you want to delete ${item.name}? This action is irreversible.`}
      >
        <View>
          <FontAwesomeIcon
            icon={faXmarkCircle}
            color={theme.colors.onSurface}
            size={24}
          />
        </View>
      </ConfirmationModal>
    </View>
  );
}

const notesTextAtom = atom(new Map<string, string>());

export default function Inventory() {
  const setNoteAtom = useSetAtom(notesTextAtom);
  const db = useDatabase();
  const local = useLocalSearchParams();
  const [title, setTitle] = useState("");
  const router = useRouter();
  const [note, setNote] = useState<any>();
  const [search, setSearch] = useState("");
  // take title -> move title to top and bring in rest of the UI
  const [items, setItems] = useState([
    { id: "1", name: "Apple", in_stock: true },
    { id: "2", name: "Banana", in_stock: false },
    { id: "3", name: "Carrot", in_stock: true },
    { id: "4", name: "Dill", in_stock: false },
    { id: "5", name: "Eggplant", in_stock: true },
    { id: "6", name: "Fennel", in_stock: false },
    { id: "7", name: "Ginger", in_stock: true },
    { id: "8", name: "Honey", in_stock: false },
    { id: "9", name: "Iceberg", in_stock: true },
    { id: "10", name: "Jalapeno", in_stock: false },
    { id: "11", name: "Kale", in_stock: true },
    { id: "12", name: "Lemon", in_stock: false },
    { id: "13", name: "Mango", in_stock: true },
    { id: "14", name: "Nectarine", in_stock: false },
    { id: "15", name: "Orange", in_stock: true },
    { id: "16", name: "Papaya", in_stock: false },
    { id: "17", name: "Quince", in_stock: true },
    { id: "18", name: "Radish", in_stock: false },
    { id: "19", name: "Spinach", in_stock: true },
    { id: "20", name: "Tomato", in_stock: false },
    { id: "21", name: "Ugli", in_stock: true },
    { id: "22", name: "Vanilla", in_stock: false },
    { id: "23", name: "Watermelon", in_stock: true },
    { id: "24", name: "Xylocarp", in_stock: false },
    { id: "25", name: "Yam", in_stock: true },
  ]);
  items.sort((a, b) => a.name.localeCompare(b.name));
  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );
  const in_stock = filtered.filter((item) => item.in_stock);
  const out_of_stock = filtered.filter((item) => !item.in_stock);
  const renderData = [
    `Not in stock (${out_of_stock.length})`,
    ...out_of_stock,
    `In stock (${in_stock.length})`,
    ...in_stock,
  ];

  async function createInventory() {
    try {
      const id = uuidv4();
      await db?.insert(notesTable).values({
        id,
        data: JSON.stringify({}),
        listDisplayView: JSON.stringify({}),
        title,
        type: "Inventory",
      });
      router.setParams({ id });
    } catch (e) {
      console.error(e);
    }
  }

  const syncNote = useCallback(async () => {
    if (!note) return;
    // use atoms, do not trigger re-render on note update
    await db
      ?.update(notesTable)
      .set({
        title,
        data: JSON.stringify(note.data),
        listDisplayView: JSON.stringify({}),
      })
      .where(eq(notesTable.id, note.id));
  }, [note]);

  useEffect(() => {
    if (!local.id || !db || local.id === "create") return;

    db?.select()
      .from(notesTable)
      .where(eq(notesTable.id, local.id as string))
      .limit(1)
      .then((result) => {
        if (result) {
          const [note] = result;
          setNote(note);
          setNoteAtom(
            items.reduce((acc, item) => {
              acc.set(item.id, item.name);
              return acc;
            }, new Map<string, string>())
          );
          setTitle(note.title);
        }
      });
  }, [local.id, db]);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <AnimatedTextInput
        mode="outlined"
        placeholder="Enter name of inventory"
        value={title}
        onChangeText={setTitle}
        left={
          <TextInput.Icon
            icon={({ color, size }) => {
              return (
                <FontAwesomeIcon
                  icon={faChevronLeft}
                  color={color}
                  size={size}
                />
              );
            }}
            onPress={() => {
              router.replace("/");
            }}
          />
        }
      />
      {local.id === "create" && (
        <Button
          onPress={createInventory}
          mode="contained"
          style={{ marginHorizontal: 16, marginVertical: 16 }}
        >
          Create
        </Button>
      )}
      <FlashList
        keyExtractor={(item) => (typeof item === "string" ? item : item.id)}
        contentContainerStyle={{
          padding: 16,
          paddingTop: 16,
          paddingBottom: 100,
        }}
        data={local.id === "create" ? [] : renderData}
        estimatedItemSize={100}
        renderItem={({ item }: any) => {
          if (typeof item === "string") {
            // Rendering header
            return (
              <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 8 }}>
                {item}
              </Text>
            );
          }
          // clicking check uncheck updates note here and syncNote
          // clicking delete removes item from list and syncNote
          // editing text
          return <ItemView item={item} setItems={setItems} />;
        }}
        getItemType={(item) => {
          // To achieve better performance, specify the type based on the item
          return typeof item === "string" ? "sectionHeader" : "row";
        }}
      />
      <FAB
        icon="plus"
        style={{
          position: "absolute",
          margin: 16,
          right: 0,
          bottom: 0,
          zIndex: 1,
        }}
        onPress={() => {}}
      />
    </View>
  );
}
