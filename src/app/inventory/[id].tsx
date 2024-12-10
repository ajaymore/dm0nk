import { useDatabase } from "@/hooks/useDatabase";
import { notesTable } from "@/lib/schema";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { eq } from "drizzle-orm";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
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
import {
  atom,
  getDefaultStore,
  useAtom,
  useAtomValue,
  useSetAtom,
} from "jotai";
import { faXmarkCircle } from "@fortawesome/free-solid-svg-icons/faXmarkCircle";
import { faXmark } from "@fortawesome/free-solid-svg-icons/faXmark";
import { faAdd } from "@fortawesome/free-solid-svg-icons";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const focusAtom = atom<string | null>(null);

function AddItemView({ inStock }: { inStock: boolean }) {
  const setNotesMapAtom = useSetAtom(notesMapAtom);
  const theme = useTheme();
  const setFocusAtom = useSetAtom(focusAtom);

  return (
    <Pressable
      style={{ flexDirection: "row", alignItems: "center" }}
      onPress={() => {
        const id = uuidv4();
        setNotesMapAtom((prev) => {
          return new Map([
            ...prev,
            [
              id,
              {
                id,
                name: "",
                in_stock: inStock,
              },
            ],
          ]);
        });
        setFocusAtom(id);
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
        <FontAwesomeIcon
          icon={faAdd}
          color={theme.colors.onSurface}
          size={18}
        />
      </View>
      <Text style={{ paddingHorizontal: 16, fontSize: 16 }}>Add Item</Text>
    </Pressable>
  );
}

function ItemView({
  item,
}: {
  item: { id: string; name: string; in_stock: boolean };
}) {
  const ref = useRef<VanillaTextInput>(null);
  const [focusId, setFocusId] = useAtom(focusAtom);
  const setNotesMapAtom = useSetAtom(notesMapAtom);
  const [noteText, setNoteText] = useState(item.name);
  const [hasFocus, setHasFocus] = useState(false);
  const theme = useTheme();
  function removeItem() {
    setNotesMapAtom((prev) => {
      const next = new Map(prev);
      next.delete(item.id);
      return next;
    });
  }

  useEffect(() => {
    if (noteText === item.name) return;
    const handler = setTimeout(() => {
      setNotesMapAtom((prev) => {
        return new Map(prev).set(item.id, { ...item, name: noteText });
      });
    }, 1000);

    // Cleanup timeout if noteText changes before 500ms
    return () => clearTimeout(handler);
  }, [noteText, setNotesMapAtom, item.id]);

  useEffect(() => {
    if (focusId === item.id) {
      setTimeout(() => {
        ref.current?.focus();
        setFocusId(null);
      }, 100);
    }
  }, [focusId, item.id]);

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
              setNotesMapAtom((prev) => {
                const next = new Map(prev);
                next.set(item.id, { ...item, in_stock: false });
                return next;
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
              setNotesMapAtom((prev) => {
                const next = new Map(prev);
                next.set(item.id, { ...item, in_stock: true });
                return next;
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
          ref={ref}
          onFocus={() => setHasFocus(true)}
          onBlur={() => {
            setTimeout(() => {
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
          value={noteText}
          onChangeText={setNoteText}
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
  return Array.from(get(notesMapAtom).values()).map(
    ({ title, ...rest }: any) => {
      return rest;
    }
  );
});

export default function Inventory() {
  const setNotesMapAtom = useSetAtom(notesMapAtom);
  const items = useAtomValue(notesListDisplayAtom);
  const db = useDatabase();
  const local = useLocalSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );
  const in_stock = filtered.filter((item) => item.in_stock);
  const out_of_stock = filtered.filter((item) => !item.in_stock);
  const renderData = search
    ? [
        `Not in stock (${out_of_stock.length})`,
        ...out_of_stock,
        `In stock (${in_stock.length})`,
        ...in_stock,
      ]
    : [
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

  useEffect(() => {
    if (!local.id || !db || local.id === "create") return;
    setNotesMapAtom(new Map()); // reset first whenever id changes
    db?.select()
      .from(notesTable)
      .where(eq(notesTable.id, local.id as string))
      .limit(1)
      .then((result) => {
        if (result) {
          const [note] = result;
          if (note && note.data) {
            const list = JSON.parse(note.data)?.items || [];
            list.sort((a: any, b: any) => {
              if (!a.name) return 1;
              if (!b.name) return -1;
              return a.name.localeCompare(b.name);
            });
            const mapValue = list.reduce((acc: any, item: any) => {
              return acc.size === 0
                ? new Map([[item.id, item]])
                : new Map([...acc, [item.id, item]]);
            }, new Map<string, string>());
            setNotesMapAtom(mapValue);
          }
        }
      });

    const store = getDefaultStore();
    const unsub = store.sub(notesMapAtom, async () => {
      const updates = Array.from(store.get(notesMapAtom).values());
      const [prev] = await db
        .select()
        .from(notesTable)
        .where(eq(notesTable.id, local.id as string))
        .limit(1);
      const in_stock = updates.filter((item) => item.in_stock);
      const out_of_stock = updates.filter((item) => !item.in_stock);
      await db
        ?.update(notesTable)
        .set({
          data: JSON.stringify({
            ...JSON.parse(prev.data as any),
            items: updates,
          }),
          listDisplayView: `Items in stock (${in_stock.length})\n${in_stock
            .slice(0, 3)
            .map((item) => item.name)
            .join(", ")}\n\nItems out of stock (${
            out_of_stock.length
          })\n${out_of_stock
            .slice(0, 3)
            .map((item) => item.name)
            .join(", ")}
          `,
        })
        .where(eq(notesTable.id, local.id as string));
    });
    return unsub;
  }, [local.id, db]);

  // useEffect(() => {
  //   if (!local.id || !db || local.id === "create") return;
  //   const store = getDefaultStore();
  //   const unsub = store.sub(notesMapAtom, async () => {
  //     const updates = Array.from(store.get(notesMapAtom).values());
  //     const [prev] = await db
  //       .select()
  //       .from(notesTable)
  //       .where(eq(notesTable.id, local.id as string))
  //       .limit(1);
  //     const in_stock = updates.filter((item) => item.in_stock);
  //     const out_of_stock = updates.filter((item) => !item.in_stock);
  //     await db
  //       ?.update(notesTable)
  //       .set({
  //         data: JSON.stringify({
  //           ...JSON.parse(prev.data as any),
  //           items: updates,
  //         }),
  //         listDisplayView: `Items in stock (${in_stock.length})\n${in_stock
  //           .slice(0, 3)
  //           .map((item) => item.name)
  //           .join(", ")}\n\nItems out of stock (${
  //           out_of_stock.length
  //         })\n${out_of_stock
  //           .slice(0, 3)
  //           .map((item) => item.name)
  //           .join(", ")}
  //         `,
  //       })
  //       .where(eq(notesTable.id, local.id as string));
  //   });
  //   return unsub;
  // }, [local.id, db]);

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
            return <AddItemView inStock={false} />;
          } else if (typeof item === "string" && item === "ADD_IN_STOCK") {
            return <AddItemView inStock={true} />;
          } else if (typeof item === "string" && item !== "") {
            return (
              <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 8 }}>
                {item}
              </Text>
            );
          }
          return <ItemView item={item} />;
        }}
        getItemType={(item) => {
          // To achieve better performance, specify the type based on the item
          return typeof item === "string" ? "sectionHeader" : "row";
        }}
      />
    </View>
  );
}

// Disable add when search is on
// Sort first when data fetched later do not

// add item, remove item, edit item, check, uncheck
// search
// persistence
// Home Screen Entry
// Overflow actions on long press through bottom sheet - horizontal scroll color picker
// Delete, Archive, Share, Duplicate, Rename
