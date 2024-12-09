import { Stack, useLocalSearchParams } from "expo-router";
import { useRouter } from "expo-router";
import { atom, useAtom, useSetAtom } from "jotai";
import { useRef } from "react";
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

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const contentAtom = atom("");
const titleAtom = atom("");

function NewRegularNote() {
  const db = useDatabase();
  const local = useLocalSearchParams();
  const contentHeight = useSharedValue(0);
  const refTitle = useRef<TextInput>(null);
  const refContent = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [note, setNote] = useAtom(contentAtom);
  const [title, setTitle] = useAtom(titleAtom);
  const keyboard = useAnimatedKeyboard();
  const dims = useWindowDimensions();
  const animatedStylesTextInput = useAnimatedStyle(() => ({
    height: dims.height - 48 * 2 - keyboard.height.value,
  }));

  return (
    <View style={{ paddingTop: insets.top, flex: 1 }}>
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
            try {
              if (!note) {
                router.replace("/");
                return;
              }
              await db?.insert(notesTable).values({
                id: local.id as string,
                data: note,
                listDisplayView: JSON.stringify({}),
                title: note,
                type: "Default",
              });
              router.replace("/");
            } catch (e) {
              console.error(e);
            }
            // populate from db
            // update db
            // skip, keep empty don't touch db if not title or content
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
      <View style={{ height: 48, justifyContent: "center" }}>
        <TextInput
          ref={refTitle}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
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
        autoFocus
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
        value={note}
        onChangeText={setNote}
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
