import { Text, View } from "react-native";
import React, { ReactNode } from "react";
import { DemoPageContainer } from "@zerve/zen/Page";
import { Title } from "@zerve/zen/Text";
import { useFAQEntries } from "./zerve/DemoStore";
import { QueryClient, QueryClientProvider } from "react-query";
import { HumanText } from "@zerve/react-native-content/HumanText";

function QuestionAnswerRow({
  question,
  answer,
}: {
  question?: string;
  answer: ReactNode;
}) {
  return (
    <View style={{ marginTop: 24 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 8,
          color: "#444",
        }}
      >
        {question}
      </Text>
      {answer}
    </View>
  );
}

export function FAQPage() {
  const { data, isLoading, error } = useFAQEntries();
  return (
    <DemoPageContainer isLoading={isLoading} error={error}>
      <Title title="Frequently Asked Questions" />
      {data?.map((faqEntry) => (
        <QuestionAnswerRow
          question={faqEntry.Question}
          answer={<HumanText value={[]} />}
        />
      ))}
    </DemoPageContainer>
  );
}

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FAQPage />
    </QueryClientProvider>
  );
}
