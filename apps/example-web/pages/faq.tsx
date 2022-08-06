import { Title } from "@zerve/zen";
import React from "react";

export default function FAQPage({}: {}) {
  return <Title title="Frequently Asked Questions" />;
}

export const getServerSideProps = () => {
  return { props: {} };
};
