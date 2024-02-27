import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import { ContextProviderProps } from './provider-props';

interface AuthContextProps {
  address: string;
  setAddress: Dispatch<SetStateAction<string>>;
}

const AuthContext = createContext({} as AuthContextProps);

export function AuthProvider({ children }: ContextProviderProps) {
  const [address, setAddress] = useState("");

  return (
    <AuthContext.Provider value={{ address, setAddress }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
