import React, { ReactNode } from "react";
import { DemoPageContainer, Title } from "@zerve/zen";
import { Text, View } from "react-native";
import { useFAQEntries } from "../zerve/DemoStore";

function QuestionAnswerRow({
  question,
  answer,
}: {
  question: string;
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

export default function FAQPage() {
  const { data, isLoading, error } = useFAQEntries();
  return (
    <DemoPageContainer isLoading={isLoading} error={error}>
      <Title title="Frequently Asked Questions" />
      {data?.map((faqEntry) => (
        <QuestionAnswerRow
          question={faqEntry.Question}
          answer={<Text>{faqEntry.Answer}</Text>}
        />
      ))}
    </DemoPageContainer>
  );
}

// prev:

// export default function FAQPage() {
//   return (
//     <DemoPageContainer>
//       <Title title="Frequently Asked Questions" />
//       <QuestionAnswerRow
//         question={"Is Hard-Coded Data Convenient?"}
//         answer={<Text>No. Half my team can't write code!</Text>}
//       />
//       <QuestionAnswerRow
//         question={"Would a Content System Help?"}
//         answer={<Text>Yes, but it should have type safety!</Text>}
//       />
//     </DemoPageContainer>
//   );
// }

// after:

// export default function FAQPage() {
//   const { data, isLoading, error } = useFAQEntries();
//   return (
//     <DemoPageContainer isLoading={isLoading} error={error}>
//       <Title title="Frequently Asked Questions" />
//       {data?.map((faqEntry) => (
//         <QuestionAnswerRow
//           question={faqEntry.Question}
//           answer={faqEntry.Answer}
//         />
//       ))}
//     </DemoPageContainer>
//   );
// }
