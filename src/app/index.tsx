import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { MasonryFlashList } from "@shopify/flash-list";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { faAddressCard } from "@fortawesome/free-regular-svg-icons/faAddressCard";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, paddingTop: insets.top + 16 }}>
      <MasonryFlashList
        data={[
          { id: "1", name: "Ajay" },
          { id: "2", name: "Vijay" },
          { id: "3", name: "Sanjay" },
        ]}
        numColumns={2}
        renderItem={({ item, columnIndex }) => {
          return (
            <View style={{ padding: 8, gap: 1 }}>
              <Text>{item.name}</Text>
              <FontAwesomeIcon icon={"address-card"} />
            </View>
          );
        }}
        estimatedItemSize={200}
      />
    </View>
  );
}
