export interface ObservableValue<ValueType> {
  get: () => ValueType;
  subscribe: (handler: (v: ValueType) => void) => () => void;
}
