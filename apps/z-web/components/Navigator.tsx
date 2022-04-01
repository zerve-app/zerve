import { useRouter } from "next/router";
import { ScrollView, Text, View } from "react-native";
import { Button, DisclosureSection, Label, useColors, VStack } from "@zerve/ui";

import { useAppDispatch } from "../stores/Dispatch";
import { ReactNode } from "react";

function SmallSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <DisclosureSection header={<Label>{title}</Label>}>
      {children}
    </DisclosureSection>
  );
}

function DocListSection() {
  const { query } = useRouter();
  return null;
  // return isLoading ? null : (
  //   <SmallSection title="Docs">
  //     {data.docs.children.map((childDocName) => (
  //       <View style={{}} key={childDocName}>
  //         <Text
  //           accessibilityRole="link"
  //           // @ts-ignore
  //           href={`/shell/doc/${childDocName}`}
  //           style={{
  //             color: query.docId === childDocName ? "#000" : "blue",
  //           }}
  //         >
  //           {childDocName}
  //         </Text>
  //       </View>
  //     ))}
  //   </SmallSection>
  // );
}

function ActionsSection() {
  return <SmallSection title="Actions">{null}</SmallSection>;
}

export default function Navigator() {
  const dispatch = useAppDispatch();
  const colors = useColors();
  return (
    <View
      style={{
        borderRadius: 8,
        margin: 16,
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 7.65,
        elevation: 8,
      }}
    >
      <ScrollView style={{ flex: 1 }}>
        <DocListSection />
        <ActionsSection />
        <SmallSection title="Server Info">{null}</SmallSection>
      </ScrollView>

      <VStack>
        <Button
          onPress={() => {
            dispatch({});
          }}
          title="Create Doc"
        />
      </VStack>
    </View>
  );
}
