import { Container } from "@/components/ui/common";
import { logout } from "@/lib/store";
import { trpcClient } from "@/lib/trpc.client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Button, Text } from "react-native-paper";

function Account() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: () => {
      return trpcClient.auth.me.query();
    },
  });

  return (
    <Container style={{ gap: 8 }}>
      <Text>Account</Text>
      {data?.email && <Text>{data.email}</Text>}
      {data?.name && <Text>{data.name}</Text>}
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
