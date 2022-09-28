import { FeaturePane } from "@zerve/zen/FeaturePane";
import { PageSection } from "@zerve/zen/Page";
import { VStack } from "@zerve/zen/Stack";
import { OrderableButtons } from "@zerve/zen/OrderableButtons";
import { useState } from "react";
import { showToast } from "../zen/Toast";

export function OrderableButtonsPlaygroundFeature() {
  const [items, setItems] = useState(["foo", "bar", "baz"]);
  return (
    <FeaturePane title="OrderableButtons">
      <OrderableButtons
        data={items}
        getIcon={() => "leaf"}
        getKey={(item) => item}
        getName={(item) => item}
        onData={setItems}
        onPress={(item) => {
          showToast(`Pressed "${item}"`);
        }}
      />
    </FeaturePane>
  );
}
export const OrderableButtonsPlayground = {
  Feature: OrderableButtonsPlaygroundFeature,
  icon: "arrows-v",
  name: "OrderableButtons",
  title: "OrderableButtons",
} as const;
