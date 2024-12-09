import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import { Button, Dialog, Portal, Text } from "react-native-paper";

export function ConfirmationModal({
  children,
  title,
  body,
  onAction,
  cancelButtonText = "Cancel",
  actionButtonText = "Confirm",
}: {
  children: React.ReactNode;
  title: string;
  body: string;
  onAction: () => void;
  cancelButtonText: string;
  actionButtonText: string;
}) {
  const [visible, setVisible] = useState(false);
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  return (
    <>
      <Pressable style={{ zIndex: 1 }} onPress={showDialog}>
        {children}
      </Pressable>
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{body}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>{cancelButtonText}</Button>
            <Button
              onPress={async () => {
                await onAction();
                hideDialog();
              }}
            >
              {actionButtonText}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}
