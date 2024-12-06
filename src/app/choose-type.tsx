import { Link } from "expo-router";
import { ScrollView, View } from "react-native";
import { Text } from "react-native-paper";

function ChooseType() {
  return (
    <ScrollView
      style={{ flex: 1, padding: 16 }}
      contentContainerStyle={{ gap: 16 }}
    >
      <Link href="/" style={{ fontSize: 20 }}>
        <Text>Default</Text>
      </Link>
      <Link
        href={{
          pathname: "/inventory/[id]",
          params: { id: "create" },
        }}
        style={{ fontSize: 20 }}
      >
        <Text>Inventory</Text>
      </Link>
      <Link replace href="/" style={{ fontSize: 20 }}>
        <Text>Ai Generated</Text>
      </Link>
    </ScrollView>
  );
}

export default ChooseType;
