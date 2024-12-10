import { Stack, useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import { atom, getDefaultStore, useAtom, useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import { Platform, TextInput, useWindowDimensions, View } from "react-native";
import { IconButton } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { v4 as uuidV4 } from "uuid";
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faChevronLeft,
  faPalette,
  faThumbTack,
} from "@fortawesome/free-solid-svg-icons";
import { useDatabase } from "@/hooks/useDatabase";
import { notesTable } from "@/lib/schema";
import { eq } from "drizzle-orm";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const noteAtom = atom({ title: "", data: "" });

function NewRegularNote() {
  const db = useDatabase();
  const local = useLocalSearchParams();
  const contentHeight = useSharedValue(0);
  const refTitle = useRef<TextInput>(null);
  const refContent = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [note, setNote] = useAtom(noteAtom);
  const keyboard = useAnimatedKeyboard();
  const dims = useWindowDimensions();
  const animatedStylesTextInput = useAnimatedStyle(() => ({
    height: dims.height - 48 * 2 - keyboard.height.value,
  }));

  useEffect(() => {
    if (!local.id || !db) return;
    setNote({ title: "", data: "" });

    db?.select()
      .from(notesTable)
      .where(eq(notesTable.id, local.id as string))
      .limit(1)
      .then((result) => {
        if (result) {
          const [note] = result;
          if (note && (note.data || note.title)) {
            setNote({
              title: note.title || "",
              data: note.data || "",
            });
          }
        }
      });

    const store = getDefaultStore();
    const unsub = store.sub(noteAtom, async () => {
      const updates = store.get(noteAtom);
      const [prev] = await db
        .select()
        .from(notesTable)
        .where(eq(notesTable.id, local.id as string))
        .limit(1);

      if (!updates.title && !updates.data) return;

      if (!prev) {
        await db?.insert(notesTable).values({
          id: local.id as string,
          data: note.data,
          listDisplayView: note.data,
          title: note.title,
          type: "Default",
        });
      } else {
        await db
          ?.update(notesTable)
          .set({
            data: updates.data || "",
            listDisplayView: updates.data.slice(0, 100),
            title: updates.title || "",
          })
          .where(eq(notesTable.id, local.id as string));
      }
    });
    return unsub;
  }, [local.id, db]);

  return (
    <View style={{ paddingTop: insets.top, flex: 1 }}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          height: 48,
          //   backgroundColor: "red",
        }}
      >
        <IconButton
          icon={({ color, size }) => {
            return (
              <FontAwesomeIcon icon={faChevronLeft} color={color} size={size} />
            );
          }}
          size={24}
          onPress={async () => {
            router.replace("/");
          }}
        />
        <View style={{ flexDirection: "row" }}>
          <IconButton
            icon={({ color, size }) => {
              return (
                <FontAwesomeIcon icon={faThumbTack} color={color} size={size} />
              );
            }}
            size={24}
            onPress={() => {}}
          />
          <IconButton
            icon={({ color, size }) => {
              return (
                <FontAwesomeIcon icon={faPalette} color={color} size={size} />
              );
            }}
            size={24}
            onPress={() => {}}
          />
        </View>
      </View>
      <View
        style={{
          height: 48,
          justifyContent: "center",
        }}
      >
        <TextInput
          autoFocus
          ref={refTitle}
          placeholder="Title"
          value={note.title}
          onChangeText={(text) => setNote((prev) => ({ ...prev, title: text }))}
          placeholderTextColor={"rgba(255,255,255,0.7)"}
          style={{
            fontSize: 24,
            color: "#fff",
            textAlignVertical: "top",
            paddingHorizontal: 16,
          }}
        />
      </View>
      <AnimatedTextInput
        ref={refContent}
        editable={true}
        style={[
          {
            fontSize: 16,
            color: "#fff",
            textAlignVertical: "top",
            paddingHorizontal: 16,
          },
          animatedStylesTextInput,
        ]}
        value={note.data}
        onChangeText={(text) => setNote((prev) => ({ ...prev, data: text }))}
        autoCapitalize={"none"}
        autoComplete="off"
        autoCorrect={false}
        multiline
        numberOfLines={4}
        placeholder="Note **You can use markdown**"
        placeholderTextColor="#888"
        onContentSizeChange={(event) => {
          if (Platform.OS === "web") return;
          contentHeight.value = event.nativeEvent.contentSize.height;
        }}
      />
    </View>
  );
}

export default NewRegularNote;
