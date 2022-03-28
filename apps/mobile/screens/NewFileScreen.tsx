import React from "react";

import { Input, PageTitle, VStack } from "@zerve/ui";
import { HomeStackScreenProps } from "../app/Links";
import { dispatch } from "@zerve/native";
import { AsyncButton } from "../components/Button";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import { postZAction } from "@zerve/query";
import { useConnection } from "../app/Connection";

export default function NewFileScreen({
  navigation,
  route,
}: HomeStackScreenProps<"NewFile">) {
  const conn = useConnection(route.params.connection);

  const [name, setName] = React.useState("");
  return (
    <ScreenContainer scroll>
      <ScreenHeader title="New File" />
      <VStack>
        <Input
          value={name}
          label="Name"
          onValue={setName}
          autoFocus
          placeholder="My File"
        />
        <AsyncButton
          title="Create"
          primary
          onPress={async () => {
            if (conn) {
              await postZAction(conn, ["Store", "Dispatch"], {
                name: "WriteSchemaValue",
                value: {
                  name,
                  schema: { type: "string" },
                  value: "boomed",
                },
              });
            } else {
              await dispatch(name, {
                type: "WriteFile",
                name: "ReadMe.md",
                value: "Welcome to your new File",
              });
            }
            // navigation.replace("Doc", { name, connection: null });
          }}
        />
      </VStack>
    </ScreenContainer>
  );
}
