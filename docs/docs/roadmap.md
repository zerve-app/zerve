---
title: Roadmap
---

Zerve is focused on being a robust CMS for JSON data. See the [Zerve Vision](./vision) for long-term plans.

Much of this roadmap is dedicated to simple and common use cases, or expanding the feature-set to entirely support JSON-schema.

### Bugs and Documentation

The highest priority is to improve robustness and expand support for the features that are already in the product.

### Schema Locking

Vital to preventing invalid changes in the Store that can break your app, schema/entry locking will ensure that a value can only become more specific over time.

We may also support a workflow where schemas you use are automatically locked when you commit to your `main` branch. This will allow your development team to move fast (but not break things).

### Array Keys

Address the [keys warning](https://reactjs.org/docs/lists-and-keys.html) in React by automatically adding `$key` properties to objects when they appear in lists.

When a user defines a `key` manually, it will be used as the `$key`, and Zerve will ensure that duplicate keys are never used within an Entry.

### Ref Entries

Allow an Entry to directly refer to the value of another Entry.

### Enums

Support a dropdown of certain values.

### Union Schemas (oneOf)

Allow users to select between several schemas for a given value.

### Tuples

An advanced feature for Lists. Technically this will be implemented with JSON-schema's array `prefixItems`.

### Date / Time / DateTime Schemas

Instead of forcing you to use a string or a number to represent these common value types, Zerve will support an internal schema and accompanying UI for picking dates and times.

### Improvements to "Number"

Support min/max values, along with step. Then numbers may be displayed as a slider.

### Color

A special schema picker that is displayed as a color picker within the Zerve dashboard.

### Template Strings

Important for translation support, allow you to embed values inside strings.

## More Ideas?

Let us know on Twitter or our Discord channel, and they may be added to this list.

If your request is a good idea but not high-enough priority for our immediate focus, we may guide you through the process of implementing it and we will quickly merge your contribution into the product.
