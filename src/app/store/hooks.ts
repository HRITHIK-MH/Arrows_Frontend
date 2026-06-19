import { useSelector } from "react-redux";

/**
 * Project-specific Redux selector hook.
 * Minimal implementation for future Redux integration.
 */
export const useAppSelector = useSelector as unknown as <TSelected = any>(
  selector: (state: any) => TSelected
) => TSelected;

export default useAppSelector;
