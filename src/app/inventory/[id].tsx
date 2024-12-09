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
import { useCallback, useEffect, useRef, useState } from "react";
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
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons/faMagnifyingGlass";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons/faTrashCan";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { atom, useAtom, useSetAtom } from "jotai";
import { faXmarkCircle } from "@fortawesome/free-solid-svg-icons/faXmarkCircle";
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

function AddItemView({
  setItems,
  inStock,
}: {
  setItems: any;
  inStock: boolean;
}) {
  return (
    <View>
      <Button
        onPress={() => {
          setItems((prev: any) => {
            return prev.concat({
              id: uuidv4(),
              name: "",
              in_stock: inStock,
            });
          });
        }}
      >
        + Add item
      </Button>
    </View>
  );
}

function ItemView({
  item,
  setItems,
}: {
  item: { id: string; name: string; in_stock: boolean };
  setItems: any;
}) {
  //   const [text, setText] = useState(item.name);
  const [hasFocus, setHasFocus] = useState(false);
  const theme = useTheme();
  const [noteTexts, setNoteTexts] = useAtom(notesTextAtom);
  const ref = useRef<any>(null);
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
      <View
        style={{
          width: 48,
          height: 48,
          justifyContent: "center",
          alignItems: "center",
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
      </View>
      <View
        style={{
          position: "relative",
          flexDirection: "row",
          flexGrow: 1,
          flex: 1,
          alignItems: "center",
        }}
      >
        <VanillaTextInput
          onFocus={() => setHasFocus(true)}
          onBlur={() => {
            ref.current = setTimeout(() => {
              setHasFocus(false);
            }, 100);
          }}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            fontSize: 16,
            color: theme.colors.onSurface,
            width: "100%",
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

        <View style={{ position: "absolute", right: 16 }}>
          <ConfirmationModal
            onAction={removeItem}
            cancelButtonText="Cancel"
            actionButtonText="Delete"
            title="Are you sure?"
            body={`Are you sure you want to delete ${item.name}? This action is irreversible.`}
          >
            {hasFocus && (
              <View>
                <FontAwesomeIcon
                  icon={faXmark}
                  color={theme.colors.onSurface}
                  size={24}
                />
              </View>
            )}
          </ConfirmationModal>
        </View>
      </View>
    </View>
  );
}

const notesMapAtom = atom(new Map<string, any>());
const notesListDisplayAtom = atom((get) => {
  const map = get(notesMapAtom);
  return Array.from(map.values()).map((note) => note.title);
});

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
  const [items, setItems] = useState<
    { id: string; name: string; in_stock: boolean }[]
  >([
    // { id: "1", name: "Apple", in_stock: true },
    // { id: "2", name: "Banana", in_stock: false },
    // { id: "3", name: "Carrot", in_stock: true },
    // { id: "4", name: "Dill", in_stock: false },
    // { id: "5", name: "Eggplant", in_stock: true },
    // { id: "6", name: "Fennel", in_stock: false },
    // { id: "7", name: "Ginger", in_stock: true },
    // { id: "8", name: "Honey", in_stock: false },
    // { id: "9", name: "Iceberg", in_stock: true },
    // { id: "10", name: "Jalapeno", in_stock: false },
    // { id: "11", name: "Kale", in_stock: true },
    // { id: "12", name: "Lemon", in_stock: false },
    // { id: "13", name: "Mango", in_stock: true },
    // { id: "14", name: "Nectarine", in_stock: false },
    // { id: "15", name: "Orange", in_stock: true },
    // { id: "16", name: "Papaya", in_stock: false },
    // { id: "17", name: "Quince", in_stock: true },
    // { id: "18", name: "Radish", in_stock: false },
    // { id: "19", name: "Spinach", in_stock: true },
    // { id: "20", name: "Tomato", in_stock: false },
    // { id: "21", name: "Ugli", in_stock: true },
    // { id: "22", name: "Vanilla", in_stock: false },
    // { id: "23", name: "Watermelon", in_stock: true },
    // { id: "24", name: "Xylocarp", in_stock: false },
    // { id: "25", name: "Yam", in_stock: true },
  ]);
  items.sort((a, b) => {
    if (!a.name) return 1;
    if (!b.name) return -1;
    return a.name.localeCompare(b.name);
  });
  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );
  const in_stock = filtered.filter((item) => item.in_stock);
  const out_of_stock = filtered.filter((item) => !item.in_stock);
  const renderData = [
    `Not in stock (${out_of_stock.length})`,
    ...out_of_stock,
    `ADD_NOT_IN_STOCK`,
    `In stock (${in_stock.length})`,
    ...in_stock,
    `ADD_IN_STOCK`,
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
      {local.id !== "create" && (
        <AnimatedTextInput
          mode="outlined"
          placeholder="Search"
          value={search}
          onChangeText={setSearch}
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
          right={
            <TextInput.Icon
              icon={({ color, size }) => {
                return (
                  <FontAwesomeIcon
                    icon={search ? faXmarkCircle : faMagnifyingGlass}
                    color={color}
                    size={size}
                  />
                );
              }}
              onPress={() => {
                search ? setSearch("") : null;
              }}
            />
          }
        />
      )}
      {local.id === "create" && (
        <View>
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
          <Button
            onPress={createInventory}
            mode="contained"
            style={{ marginHorizontal: 16, marginVertical: 16 }}
          >
            Create
          </Button>
        </View>
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
          if (typeof item === "string" && item === "ADD_NOT_IN_STOCK") {
            return <AddItemView setItems={setItems} inStock={false} />;
          } else if (typeof item === "string" && item === "ADD_IN_STOCK") {
            return <AddItemView setItems={setItems} inStock={true} />;
          } else if (typeof item === "string" && item !== "") {
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
    </View>
  );
}

// add item, remove item, edit item, check, uncheck
// search
// persistence
// Home Screen Entry
// Overflow actions on long press through bottom sheet - horizontal scroll color picker
// Delete, Archive, Share, Duplicate, Rename
