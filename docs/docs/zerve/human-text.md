---
title: Human Text
---

Human Text is still under development.

> Warning: This API may change in the coming months while Zerve is in alpha. Please provide feedback before the API gets fully locked-down

## Schema

The HumanText data is an array of text nodes, and has the following Typescript type:

```ts
export type HumanText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  underline?: boolean;
  code?: boolean;
  linkHref?: string;
}[];
```

> Note: in the future we may augment this data type with additional properties, but the primary structure is unlikely to change

## Component

Render a HumanText component like this:

```tsx
import { HumanText } from "@zerve/react-native-content/HumanText";
...
<HumanText
  value={value}
  style={styles.myText}
  options={{}}
/>
```

### `value` prop

As defined by the [HumanText schema](#schema).

This type can be imported:

```ts
import { HumanText } from "@zerve/react-native-content/Schema";
```

### `style` prop

Any [React Native text style](https://reactnative.dev/docs/text-style-props) can be used here. This includes objects, values of `StyleSheet.create`, or arrays of styles.

Certain styles will be overridden, such as bold/italicized/underlined text.

### `options` prop

Needs words to explain...

```ts
export type HumanTextOptions = {
  style?: TextStyle;
  codeStyle?: TextStyle;
  linkStyle?: TextStyle;
  linkWebTarget?: "_blank" | "" | null;
  linkPressOverride?: LinkPressHandler;
};
```

This type can be imported:

```ts
import { HumanTextOptions } from "@zerve/react-native-content/HumanText";
```

## Context

All of the options may also be configured by providing an options object to `HumanTextContext`
