import React, { ComponentProps, ReactNode, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useZNodeValue } from "@zerve/client/Query";
import { SchemaStore } from "@zerve/core";
import { JSONSchemaForm } from "../components/JSONSchemaForm";
import { useSaveFile } from "@zerve/client/Mutation";
import { useMediaQuery } from "react-responsive";
import { NavBar, NavBarSpacer, NavBarZLogo, PageContainer } from "@zerve/zen";
import { AuthHeader } from "../components/AuthHeader";
import { ZerveLogo } from "../components/ZerveLogo";

function ProjectHeader({ name }: { name: string }) {
  return (
    <View
      style={{
        backgroundColor: "#ad47b1",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
      }}
    >
      <FontAwesome name="briefcase" color={"white"} size={18} />
      <Text
        style={{
          color: "white",
          marginLeft: 12,
          fontWeight: "bold",
          fontSize: 16,
        }}
      >
        {name}
      </Text>
    </View>
  );
}

function NavigationBar() {
  return (
    <View
      style={{ backgroundColor: "#decdec", height: 50, flexDirection: "row" }}
    >
      <ZerveLogo />
      <ProjectHeader name="Example Store" />
      <View style={{ flex: 1 }} />
      <AuthHeader />
    </View>
  );
}

function NavSidebar({ children }: { children: ReactNode }) {
  return (
    <View style={{ backgroundColor: "#f9d9fb", width: 300 }}>{children}</View>
  );
}

function StoreFiles() {
  return null;
}

function NavLink({
  onPress,
  title,
  icon,
  active,
}: {
  title: string;
  icon?: ComponentProps<typeof FontAwesome>["name"];
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={{}} onPress={onPress}>
      <View
        style={{
          padding: 10,
          paddingHorizontal: 12,
          flexDirection: "row",
          backgroundColor: active ? "#FFC8FC" : "transparent",
        }}
      >
        {icon && (
          <FontAwesome name={icon} color="#464646" style={{ marginTop: 2 }} />
        )}
        <Text
          style={{
            color: "#464646",
            fontWeight: "bold",
            fontSize: 14,
            marginLeft: 12,
          }}
        >
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

function NavLinkSection({
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

function FeaturePane({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={{ borderRightWidth: 1, borderColor: "#00000033", width: 300 }}>
      <View style={{ minHeight: 80, padding: 16 }}>
        <Text style={{ fontSize: 28, color: "#464646" }}>{title}</Text>
      </View>
      <View style={{ backgroundColor: "#fafafa", flex: 1 }}>{children}</View>
    </View>
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
  const isWide = useMediaQuery({
    query: "(min-width: 600px)",
  });
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
const storePath = ['Auth', 'User' storeId]
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

export function EntityDashboard() {
  const [navState, setNavState] = useState<NavState>({
    section: "files",
    path: [],
  });
  return (
    <PageContainer>
      <NavBar>
        <NavBarZLogo />
        <NavBarSpacer />
        <AuthHeader />
      </NavBar>
      <EntityContent
        entityId={"evv"}
        navState={navState}
        onNavState={setNavState}
      />
    </PageContainer>
  );
}

export function StoreDashboard() {
  const [navState, setNavState] = useState<NavState>({
    section: "files",
    path: [],
  });
  return (
    <PageContainer>
      <NavBar>
        <NavBarZLogo />
        <ProjectHeader name="Example Store" />
        <NavBarSpacer />
        <AuthHeader />
      </NavBar>
      <StoreContent
        navState={navState}
        onNavState={setNavState}
        storeId={"great"}
        entityId={"evv"}
      />
    </PageContainer>
  );
}
