import { v4 as uuidv4 } from "uuid";
import { Link, LinkProps, Stack } from "expo-router";
import { ScrollView, View } from "react-native";
import { Text } from "react-native-paper";

function ChooseType() {
  const id = uuidv4();

  return (
    <ScrollView
      style={{ flex: 1, padding: 16 }}
      contentContainerStyle={{ gap: 16 }}
    >
      <Stack.Screen
        options={{
          title: "Choose Type",
        }}
      />
      <Link
        href={{
          pathname: "/regular/[id]",
          params: { id },
        }}
        style={{ fontSize: 20 }}
      >
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
      <Link replace href="/" style={{ fontSize: 20 }}>
        <Text>Checklist</Text>
      </Link>
      <Link replace href="/" style={{ fontSize: 20 }}>
        <Text>Memory Card</Text>
        {/* choose memory deck while creating */}
      </Link>
      <Link replace href="/" style={{ fontSize: 20 }}>
        <Text>Trip (Expenses, Itinerary)</Text>
      </Link>
      <Link replace href="/" style={{ fontSize: 20 }}>
        <Text>Document Collection</Text>
      </Link>
      {/* Preexisting note types */}
      <Link replace href="/" style={{ fontSize: 20 }}>
        <Text>Feeds</Text>
        {/* Add subscriptions | Hackernews, Bluesky etc. */}
      </Link>
      <Link replace href="/" style={{ fontSize: 20 }}>
        <Text>Weblink</Text>
      </Link>
      <Link replace href="/" style={{ fontSize: 20 }}>
        <Text>Ledger</Text>
      </Link>
      <Link replace href="/" style={{ fontSize: 20 }}>
        <Text>Workout</Text>
      </Link>
    </ScrollView>
  );
}

export default ChooseType;
