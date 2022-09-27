import {
  AnyError,
  displayStoreFileName,
  isEmptySchema,
  prepareStoreFileName,
} from "@zerve/zed";
import {
  getValueExport,
  HumanTextInput,
  JSONSchemaEditor,
  JSONSchemaEditorContext,
  Label,
  showToast,
  Title,
  useAsyncHandler,
  useTextInputFormModal,
  VSpaced,
  VStack,
} from "@zerve/zen";
import { memo, useContext, useMemo } from "react";
import {
  useDeleteEntry,
  useRenameEntry,
  useSaveEntry,
} from "@zerve/zoo-client/Mutation";
import {
  StoreDashboardContext,
  StoreFeatureLinkButton,
  StoreFeatureProps,
} from "../context/StoreDashboardContext";
import { Notice } from "@zerve/zen/Notice";
import { useStoreNavigation } from "../app/useStoreNavigation";
import { useUnsavedDeepValue } from "../app/Unsaved";
import { SaveOrDiscardFooter } from "../components/SaveOrDiscardFooter";
import { BackToSaveButton } from "../components/BackToSaveButton";
import { useStoreEntry } from "../app/StoreClient";
import { extractErrorMessage } from "@zerve/zen/ErrorHandling";
import { NotFoundSymbol } from "@zerve/zoo-client/Connection";
import { ErrorRow } from "../components/Error";
import { EmptyContentRow } from "../components/Empty";
import { FeaturePane } from "@zerve/zen/FeaturePane";

function EmptyEntryContent({
  entryName,
  path,
}: {
  entryName: string;
  path: Array<string>;
}) {
  return (
    <VStack padded>
      <EmptyContentRow message="This Entry is Empty" />
      <Label>You can modify the schema here:</Label>
      <StoreFeatureLinkButton
        title="Set Schema"
        icon="crosshairs"
        to={{
          key: "entries",
          entryName,
          path,
          child: "schema",
        }}
      />
    </VStack>
  );
}

function StoreEntriesEntry({
  storePath,
  entryName,
  path,
  title,
  icon,
  onBack,
  isActive,
}: StoreFeatureProps & { entryName: string; path: Array<string> }) {
  const saveEntry = useSaveEntry(storePath);
  const {
    openEntry,
    backToEntry,
    openEntrySchema,
    backToEntries,
    replaceToEntry,
  } = useStoreNavigation();
  // const schemasQuery = useStoreSchemas(storePath);
  const editorContext = useMemo(() => {
    return {
      OverrideFieldComponents: {
        "https://type.zerve.link/HumanText": HumanTextInput,
      },
      openChildEditor: (key: string) => {
        openEntry(entryName, [...path, key]);
      },
    };
  }, []);
  const entryQuery = useStoreEntry(storePath, entryName, editorContext);

  const exportValue = useMemo(() => {
    return getValueExport(editorContext.OverrideFieldComponents);
  }, [editorContext.OverrideFieldComponents]);

  const deleteEntry = useDeleteEntry(
    storePath,
    useMemo(
      () => ({
        onSuccess: () =>
          showToast(`"${displayStoreFileName(entryName)}" Deleted`),
      }),
      [entryName],
    ),
  );
  const renameEntry = useRenameEntry(storePath);
  const renameEntryPrompt = useTextInputFormModal<string>(
    (prevName: string) => {
      return {
        inputLabel: "New Entry Name",
        defaultValue: prevName,
        onValue: (inputName: string) => {
          const formattedName = prepareStoreFileName(inputName);
          replaceToEntry(formattedName);
          renameEntry.mutate({ prevName: entryName, newName: formattedName });
        },
      };
    },
  );
  const dirtyId = `entry-${entryName}`;
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
    savedValue: entryQuery.data?.value,
    fullSchema: entryQuery.data?.schema,
    // onImport: importValue,
    dirtyId,
  });
  const fragmentContext = useContext(StoreDashboardContext);
  const activeFragment = fragmentContext?.fragment;
  let hasChildActive =
    !!activeFragment &&
    activeFragment.key === "entries" &&
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
  const doSave = useAsyncHandler<void, AnyError>(async () => {
    const internalValue = getDirty();
    const schema = entryQuery.data?.schema;
    if (!schema)
      throw new Error("Cannot save if schema is not properly loaded.");
    const exportedValue = exportValue(internalValue, schema);
    await saveEntry.mutateAsync({
      name: entryName,
      schema,
      value: exportedValue,
    });
    releaseDirty();
  });
  let content = null;
  if (entryQuery.data?.value === NotFoundSymbol) {
    content = (
      <VStack padded>
        <Notice message={`"${entryName}" entry is not here.`} />
      </VStack>
    );
  } else if (
    !!entryQuery.data?.schema &&
    isEmptySchema(entryQuery.data?.schema)
  ) {
    content = <EmptyEntryContent entryName={entryName} path={path} />;
  } else if (entryQuery.data?.value !== undefined && entryQuery.data?.schema) {
    content = (
      <JSONSchemaEditorContext.Provider value={editorContext}>
        <VStack padded>
          {doSave.error ? (
            <Notice
              danger
              message={extractErrorMessage(doSave.error)}
              icon="exclamation-circle"
            />
          ) : null}
          <JSONSchemaEditor
            id={`${dirtyId}-${path.join("-")}`}
            onValue={onPathValue}
            value={pathValue}
            activeChild={activeChild}
            comparisonValue={savedPathValue}
            schema={pathSchema}
            schemaStore={entryQuery.data?.schemaStore}
          />
        </VStack>
      </JSONSchemaEditorContext.Provider>
    );
  }
  return (
    <FeaturePane
      title={title}
      icon={icon}
      isActive={isActive}
      onBack={onBack}
      spinner={saveEntry.isLoading || entryQuery.isFetching}
      footer={
        isDirty ? (
          path.length ? (
            <BackToSaveButton
              onPress={() => {
                backToEntry(entryName, path);
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
          )
        ) : null
      }
      actions={[
        {
          key: "Refresh",
          title: "Refresh",
          icon: "refresh",
          onPress: () => {
            entryQuery.refetch();
            entryQuery.refetch();
          },
        },
        {
          key: "EditSchema",
          title: "Edit Schema",
          icon: "crosshairs",
          onPress: () => {
            openEntrySchema(entryName);
          },
        },
        {
          key: "RenameEntry",
          title: "Rename Entry",
          icon: "edit",
          onPress: () => {
            renameEntryPrompt(entryName);
          },
        },
        {
          key: "delete",
          title: "Delete",
          icon: "trash",
          danger: true,
          onPress: async () => {
            await deleteEntry.mutateAsync(entryName);
            backToEntries();
          },
        },
      ]}
    >
      {entryQuery.error ? (
        <ErrorRow message={"Could not Load: " + entryQuery.error.message} />
      ) : null}
      {content}
    </FeaturePane>
  );
}

export const StoreEntriesEntryFeature = memo(StoreEntriesEntry);
