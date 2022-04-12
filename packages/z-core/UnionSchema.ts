function getTypeOf(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

export function exploreUnionSchema(schema) {
  // schema has oneOf and we need to understand how children are differentiated
  const optionSchemas = schema.oneOf;
  const aggregateTypeOptions = new Set([]);
  const distinctTypeOptions = new Set([]);
  optionSchemas.forEach((optionSchema, index) => {
    if (!optionSchema) {
      // console.error("Woah, optionSchema missing!", index, optionSchema);
      // usually this means there is at least {oneOf: [undefined]}, but theoreticaly that situation would be ignored
      return;
    }
    let type = optionSchema?.type;
    if (!type && optionSchema?.const !== undefined) {
      type = typeof optionSchema?.const;
    }
    if (!type) {
      throw new Error(
        "cannot handle a union/anyOf with complicated children types"
      );
    }
    if (distinctTypeOptions.has(type)) {
      distinctTypeOptions.delete(type);
      aggregateTypeOptions.add(type);
    } else if (!aggregateTypeOptions.has(type)) {
      distinctTypeOptions.add(type);
    }
  });

  const unionKeys: string[] = [];
  const unionKeyMap = {};
  const unionConstMap = new Map();

  const unionConstProperties = optionSchemas.map(
    (optionSchema, optionSchemaIndex) => {
      if (!optionSchema) return {};
      if (optionSchema.const != null) {
        unionConstMap.set(optionSchema.const, optionSchemaIndex);
        return null;
      }
      const constProperties = {};
      Object.entries(optionSchema.properties || {}).forEach(
        ([childPropName, childPropSchema]) => {
          if (childPropSchema.const !== undefined) {
            constProperties[childPropName] = childPropSchema.const;
          }
        }
      );
      Object.keys(constProperties).forEach((keyName) => {
        if (unionKeys.indexOf(keyName) === -1) unionKeys.push(keyName);
      });
      return constProperties;
    }
  );
  unionConstProperties.forEach((constProperties, optionSchemaIndex) => {
    let walkKeyMap = unionKeyMap;
    unionKeys.forEach((unionKey, unionKeyIndex) => {
      const isLastUnionKey = unionKeyIndex === unionKeys.length - 1;
      const constValue = constProperties?.[unionKey];
      const newNodeValue = isLastUnionKey ? optionSchemaIndex : {};
      const thisKeyMap =
        walkKeyMap[constValue] || (walkKeyMap[constValue] = newNodeValue);
      walkKeyMap = thisKeyMap;
    });
  });

  const isAlwaysObject =
    aggregateTypeOptions.size === 1 &&
    distinctTypeOptions.size === 0 &&
    aggregateTypeOptions.values().next().value === "object";

  function getTitle(optionSchema, optionSchemaIndex) {
    if (optionSchema.const !== undefined) {
      return `${optionSchema.const}`;
    }
    if (
      optionSchema.type === "object" &&
      optionSchema?.properties?.title?.const
    ) {
      return optionSchema?.properties?.title?.const;
    }
    const constsValue = unionKeys
      .map((unionKey) => {
        const value = unionConstProperties[optionSchemaIndex][unionKey];
        if (value === undefined) return false;
        return `${unionKey}: ${value}`;
      })
      .filter(Boolean)
      .join(", ");
    if (isAlwaysObject) return constsValue;
    return `${optionSchema.type} ${constsValue}`;
  }
  const options = optionSchemas.map((optionSchema, optionSchemaIndex) => {
    return {
      title: optionSchema
        ? optionSchema.title || getTitle(optionSchema, optionSchemaIndex)
        : "?",
      value: optionSchemaIndex,
    };
  });
  return {
    options,
    converters: optionSchemas.map((optionSchema, optionSchemaIndex) => {
      return (v: any) => {
        if (!optionSchema) return null;
        if (optionSchema.const !== undefined) return optionSchema.const;
        if (optionSchema.type === "null") return null;
        if (optionSchema.type === "string") return optionSchema.default || "";
        if (optionSchema.type === "number") return optionSchema.default || 0;
        if (optionSchema.type === "integer") return optionSchema.default || 0;
        if (optionSchema.type === "boolean")
          return optionSchema.default || false;
        if (optionSchema.type === "array") return []; // fix to handle array schemas such as tuples that require default values?
        if (optionSchema.type === "object") {
          // todo provide defaults that are specified here in the schema
          return { ...unionConstProperties[optionSchemaIndex] };
        }
      };
    }),
    match: (value: any) => {
      if (unionConstMap.has(value)) return unionConstMap.get(value);
      const observedValueType = getTypeOf(value);
      if (distinctTypeOptions.has(observedValueType)) {
        // this means that we can use the type to find a specific schema.
        const matchedIndex = optionSchemas.findIndex(
          (schema) => schema.type === observedValueType
        );
        if (matchedIndex === -1)
          throw new Error("Failed to match oneOf schema via distinct type");
        return matchedIndex;
      }
      if (value === null) return null;
      if (typeof value === "object") {
        let walkingKeyMap = unionKeyMap || {};
        unionKeys.forEach((unionKey) => {
          if (typeof walkingKeyMap === "number") return;
          const theValue = value[unionKey];
          const nextWalk =
            walkingKeyMap[theValue] == null
              ? walkingKeyMap["undefined"]
              : walkingKeyMap[theValue];

          walkingKeyMap = nextWalk;
        });
        return walkingKeyMap;
      }
      return null;
    },
  };
}
