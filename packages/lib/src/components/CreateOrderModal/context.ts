import { createContext, useContext } from "react";
import { CreateOrderModalArgs } from "../../types";

export const CreateOrderModalContext = createContext({} as CreateOrderModalArgs)

export const useCreateOrderModalContext =  () => useContext(CreateOrderModalContext)