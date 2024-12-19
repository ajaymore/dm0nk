import { Container } from "@/components/ui/common";
import { logout } from "@/lib/store";
import { useRouter } from "expo-router";
import { Button, Text } from "react-native-paper";

function Account() {
  const router = useRouter();

  return (
    <Container style={{ gap: 8 }}>
      <Text>Account</Text>
      <Button
        mode="outlined"
        onPress={() => {
          logout();
          router.replace("/sign-in");
        }}
      >
        Logout
      </Button>
    </Container>
  );
}

export default Account;
