export function useAppDispatch() {
  return (action: any) => {
    console.log("DISPATCHING", action);
  };
}
