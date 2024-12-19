import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import { Button, TextInput, Text } from "react-native-paper";
import * as yup from "yup";
import { Link, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { setAuthSessionAtomAndCommitToStorage } from "@/lib/store";
import { trpcClient } from "@/lib/trpc.client";

const schema = yup
  .object({
    email: yup.string().email().label("Email").required(),
    password: yup.string().label("Password").required().min(8),
  })
  .required();
type SignInSchema = yup.InferType<typeof schema>;

export default function SignIn() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const form = useForm<SignInSchema>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (inputs: SignInSchema) => {
    trpcClient.auth.signInEmailPswd
      .mutate(inputs)
      .then((data) => {
        setAuthSessionAtomAndCommitToStorage(data);
        router.replace("/");
      })
      .catch(console.error);
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 32,
        gap: 16,
        paddingTop: insets.top + 64,
      }}
    >
      <View style={{ alignItems: "center" }}>
        <Text variant="displayMedium" style={{ marginBottom: 32 }}>
          dm0nk
        </Text>
        <Text variant="titleLarge">Sign In</Text>
      </View>
      <Controller
        control={form.control}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="Enter your email here"
            label={"Email"}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={!!form.formState.errors.email}
            mode="outlined"
          />
        )}
        name="email"
      />
      {form.formState.errors.email && (
        <Text variant="labelSmall" style={{ color: "red" }}>
          {form.formState.errors.email.message}
        </Text>
      )}
      <Controller
        control={form.control}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="Enter your password here"
            label={"Password"}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={!!form.formState.errors.password}
            secureTextEntry
            mode="outlined"
          />
        )}
        name="password"
      />
      {form.formState.errors.password && (
        <Text variant="labelSmall" style={{ color: "red" }}>
          {form.formState.errors.password.message}
        </Text>
      )}
      <Button mode="contained" onPress={form.handleSubmit(onSubmit)}>
        Sign In
      </Button>
      <Link href={"/sign-up"} style={{ paddingTop: 16, textAlign: "center" }}>
        <Text>
          Don't have an account?{" "}
          <Text
            style={{
              textDecorationStyle: "solid",
              textDecorationLine: "underline",
            }}
          >
            Sign Up.
          </Text>
        </Text>
      </Link>
    </View>
  );
}
