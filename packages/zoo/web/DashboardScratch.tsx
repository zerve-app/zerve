import React, { ComponentProps, ReactNode } from "react";
import { View } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useZNodeValue } from "@zerve/client/Query";
import { SchemaStore } from "@zerve/core";
import { JSONSchemaForm } from "../components/JSONSchemaForm";
import { useSaveFile } from "@zerve/client/Mutation";
import { LogoutButton } from "../components/Auth";
import { useConnection } from "@zerve/client/Connection";

export function NavLinkSection({
  title,
  children,
  icon,
  active,
  onPress,
}: {
  title: string;
  children?: ReactNode;
  icon?: ComponentProps<typeof FontAwesome>["name"];
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <>
      <NavLink onPress={onPress} icon={icon} title={title} active={active} />
      {children}
    </>
  );
}

function FileFeaturePane({
  storePath,
  onNavState,
  navState,
}: {
  storePath: Array<string>;
  navState: NavState;
  onNavState: (n: NavState) => void;
}) {
  const fileName = navState.path?.[0];
  if (!fileName) throw new Error("No file path for FileFeaturePane");
  const { data, isLoading } = useZNodeValue([...storePath, "State", fileName]);
  const { data: schemas, isLoading: isSchemasLoading } = useZNodeValue([
    ...storePath,
    "State",
    "$schemas",
  ]);
  const saveFile = useSaveFile(storePath);
  if (isLoading || isSchemasLoading) return null;
  const { schema, value } = data;
  return (
    <FeaturePane title={fileName}>
      <JSONSchemaForm
        schema={schema}
        value={value}
        id={fileName}
        schemaStore={schemas as SchemaStore}
        onValue={async (value) => {
          saveFile.mutate({ name: fileName, value });
        }}
      />
    </FeaturePane>
  );
}

function FilesFeaturePane({
  storePath,
  onNavState,
  navState,
}: {
  storePath: Array<string>;
  navState: NavState;
  onNavState: (n: NavState) => void;
}) {
  const { data, isLoading } = useZNodeValue([...storePath, "State"]);
  if (isLoading) return null;
  const filesList = data && Object.keys(data).filter((f) => f !== "$schemas");
  if (!filesList) return null;
  return (
    <FeaturePane title="Files List">
      {filesList.map((file) => (
        <NavLink
          title={file}
          onPress={() => {
            onNavState({ ...navState, path: [file] });
          }}
        />
      ))}
    </FeaturePane>
  );
}

function EntityContent({
  navState,
  onNavState,
  entityId,
}: {
  navState: NavState;
  onNavState: (n: NavState) => void;
  entityId: string;
}) {
  // const isWide = useMediaQuery({
  //   query: "(min-width: 600px)",
  // });
  const isWide = true;
  const conn = useConnection();
  const session = conn?.session;
  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      {isWide && (
        <NavSidebar>
          <NavLinkSection
            title="Organizations"
            icon="folder-open"
            active={false}
            onPress={() => {}}
          ></NavLinkSection>
          {session && <LogoutButton connection={conn} session={session} />}
        </NavSidebar>
      )}
    </View>
  );
}

function StoreContent({
  navState,
  onNavState,
  entityId,
  storeId,
}: {
  navState: NavState;
  onNavState: (n: NavState) => void;
  entityId: string;
  storeId: string;
}) {
  const isWide = useMediaQuery({
    query: "(min-width: 600px)",
  });
  const storePath = ["Auth", "User", storeId];
  const firstPathTerm = navState.path?.[0];
  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      {isWide && (
        <NavSidebar>
          <NavLinkSection
            title="Files"
            icon="folder-open"
            active={navState.section === "files" && !firstPathTerm}
            onPress={() => {
              onNavState({ section: "files" });
            }}
          >
            {navState.section === "files" && firstPathTerm && (
              <NavLink onPress={() => {}} active title={firstPathTerm} />
            )}
          </NavLinkSection>
          <NavLinkSection
            title="Schemas"
            icon="crosshairs"
            active={navState.section === "schemas"}
            onPress={() => {
              onNavState({ section: "schemas" });
            }}
          ></NavLinkSection>
          <NavLinkSection
            title="Change History"
            icon="history"
            active={navState.section === "history"}
            onPress={() => {
              onNavState({ section: "history" });
            }}
          ></NavLinkSection>
          <NavLinkSection
            title="Project Settings"
            icon="gear"
            active={navState.section === "settings"}
            onPress={() => {
              onNavState({ section: "settings" });
            }}
          ></NavLinkSection>
        </NavSidebar>
      )}
      {navState.section === "files" && !firstPathTerm && (
        <FilesFeaturePane
          storePath={storePath}
          navState={navState}
          onNavState={onNavState}
        />
      )}
      {navState.path?.length ? (
        <FileFeaturePane
          storePath={storePath}
          navState={navState}
          onNavState={onNavState}
        />
      ) : null}
    </View>
  );
}

type NavState = {
  section: "files" | "schemas" | "history" | "settings";
  path?: string[];
};
