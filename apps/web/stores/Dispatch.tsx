export const ClientActions = {};

export function useAppDispatch() {
  return (action: any) => {
    console.log("DISPATCHING", action);
  };
}
