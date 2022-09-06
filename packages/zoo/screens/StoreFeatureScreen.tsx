import { HomeStackScreenProps } from "../app/Links";
import ScreenContainer from "../components/ScreenContainer";
import { ConnectionKeyProvider } from "../app/ConnectionStorage";
import { StoreNavigationProvider } from "../app/StoreNavigationProvider";
import { renderFeature } from "../features/StoreFeatures";

export default function StoreFeatureScreen({
  route,
}: HomeStackScreenProps<"StoreFeature">) {
  const { connection, storePath, feature } = route.params;
  return (
    <ScreenContainer scroll>
      <ConnectionKeyProvider value={connection}>
        <StoreNavigationProvider connection={connection} storePath={storePath}>
          {renderFeature({
            storePath,
            isActive: true,
            feature,
            href: "uh.why.do.you.need.this",
            title: "",
          })}
        </StoreNavigationProvider>
      </ConnectionKeyProvider>
    </ScreenContainer>
  );
}
