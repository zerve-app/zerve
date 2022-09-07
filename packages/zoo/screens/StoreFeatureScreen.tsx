import { HomeStackScreenProps } from "../app/Links";
import { ConnectionKeyProvider } from "../app/ConnectionStorage";
import { StoreNavigationProvider } from "../app/StoreNavigationProvider";
import {
  getFeatureIcon,
  getFeatureTitle,
  renderFeature,
} from "../features/StoreFeatures";
import { ModalProvider } from "@zerve/zen";

export default function StoreFeatureScreen({
  route,
}: HomeStackScreenProps<"StoreFeature">) {
  const { connection, storePath, feature } = route.params;
  return (
    <ConnectionKeyProvider value={connection}>
      <StoreNavigationProvider connection={connection} storePath={storePath}>
        <ModalProvider>
          {renderFeature({
            storePath,
            isActive: true,
            feature,
            href: "uh.why.do.you.need.this",
            title: getFeatureTitle(feature),
            icon: getFeatureIcon(feature),
          })}
        </ModalProvider>
      </StoreNavigationProvider>
    </ConnectionKeyProvider>
  );
}
