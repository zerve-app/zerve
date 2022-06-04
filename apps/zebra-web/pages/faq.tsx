import { Title } from "@zerve/zen";
import { PageLayout } from "@zerve/zoo/components/PageLayout";
import React from "react";

export default function FAQPage({}: {}) {
  return (
    <PageLayout>
      <Title title="Frequently Asked Questions" />
    </PageLayout>
  );
}

export const getServerSideProps = () => {
  return { props: {} };
};
