import {
  JSONSchemaEditor,
  JSONSchemaEditorContext,
  useAsyncHandler,
  VStack,
} from "@zerve/zen";
import { memo, useContext, useMemo } from "react";
import { FeaturePane } from "../components/FeaturePane";
import { useSaveEntrySchema } from "@zerve/zoo-client/Mutation";
import {
  StoreDashboardContext,
  StoreFeatureLink,
  StoreFeatureProps,
} from "../context/StoreDashboardContext";
import { AnyError } from "@zerve/zed";
import { useStoreNavigation } from "../app/useStoreNavigation";
import { useUnsavedDeepValue } from "../app/Unsaved";
import { SaveOrDiscardFooter } from "../components/SaveOrDiscardFooter";
import { BackToSaveButton } from "../components/BackToSaveButton";
import { useStoreEntrySchema } from "../app/StoreClient";
import { ErrorRow } from "../components/Error";

function StoreEntriesSchema({
  storePath,
  entryName,
  path,
  title,
  onBack,
  icon,
  isActive,
}: StoreFeatureProps & { entryName: string; path: Array<string> }) {
  const entrySchemaQuery = useStoreEntrySchema(storePath, entryName);
  const saveSchema = useSaveEntrySchema(
    storePath,
    entrySchemaQuery.data?.schemaStore,
  );
  const { openEntrySchema, backToEntrySchema } = useStoreNavigation();
  const editorContext = useMemo(() => {
    const ctx: JSONSchemaEditorContext = {
      openChildEditor: (key: string) => {
        openEntrySchema(entryName, [...path, key]);
      },
    };
    return ctx;
  }, []);
  const fragmentContext = useContext(StoreDashboardContext);
  const activeFragment = fragmentContext?.fragment;
  let hasChildActive =
    !!activeFragment &&
    activeFragment.key === "entries" &&
    activeFragment.child === "schema" &&
    activeFragment.entryName === entryName;
  const activeChild =
    (!!activeFragment &&
      activeFragment.key === "entries" &&
      activeFragment.path &&
      activeFragment.path.find(
        (pathTerm: string, index: number, activePath: string[]) => {
          if (path.length < activePath.length)
            return hasChildActive && path.length === index;
          if (path[index] !== pathTerm) hasChildActive = false;
          return false;
        },
      )) ||
    undefined;

  const dirtyId = `entry-schema-${entryName}`;

  const {
    pathValue,
    savedPathValue,
    pathSchema,
    onPathValue,
    releaseDirty,
    getDirty,
    isDirty,
  } = useUnsavedDeepValue({
    isActive,
    path,
    savedValue: entrySchemaQuery.data?.schema,
    fullSchema: entrySchemaQuery.data?.schemaSchema,
    dirtyId,
  });

  const doSave = useAsyncHandler<void, AnyError>(async () => {
    await saveSchema.mutateAsync({
      name: entryName,
      schema: getDirty(),
    });
    releaseDirty();
  });
  return (
    <FeaturePane
      title={title}
      onBack={onBack}
      icon={icon}
      isActive={isActive}
      spinner={doSave.isLoading || entrySchemaQuery.isFetching}
      footer={
        isDirty &&
        (path.length ? (
          <BackToSaveButton
            onPress={() => {
              backToEntrySchema(entryName, path);
            }}
          />
        ) : (
          <SaveOrDiscardFooter
            onSave={doSave.handle}
            onDiscard={() => {
              doSave.reset();
              releaseDirty();
            }}
          />
        ))
      }
    >
      {entrySchemaQuery.error ? (
        <ErrorRow
          message={"Could not Load: " + entrySchemaQuery.error.message}
        />
      ) : null}
      <JSONSchemaEditorContext.Provider value={editorContext}>
        {entrySchemaQuery.data ? (
          <VStack padded>
            <JSONSchemaEditor
              id={`${dirtyId}-${path.join("-")}`}
              onValue={onPathValue}
              value={pathValue}
              activeChild={activeChild}
              comparisonValue={savedPathValue}
              schema={pathSchema}
              schemaStore={entrySchemaQuery.data?.schemaStore}
            />
          </VStack>
        ) : null}
      </JSONSchemaEditorContext.Provider>
    </FeaturePane>
  );
}

export const StoreEntriesSchemaFeature = memo(StoreEntriesSchema);
