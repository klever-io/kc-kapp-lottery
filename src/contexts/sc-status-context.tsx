import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import { ContextProviderProps } from './provider-props';
import { ScStatus } from '../types/sc';

interface ScStatusContextProps {
  scStatus: ScStatus;
  setScStatus: Dispatch<SetStateAction<ScStatus>>;
}

const ScStatusContext = createContext({} as ScStatusContextProps);

export function ScStatusProvider({ children }: ContextProviderProps) {
  const [scStatus, setScStatus] = useState<ScStatus>("FETCHING");

  return (
    <ScStatusContext.Provider value={{ scStatus, setScStatus }}>
      {children}
    </ScStatusContext.Provider>
  );
}

export function useScStatus() {
  return useContext(ScStatusContext);
}
