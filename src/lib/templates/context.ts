"use client";

import { createContext, useContext } from "react";
import type { TemplateId } from "./index";

const TemplateContext = createContext<TemplateId>("studio");

export const TemplateProvider = TemplateContext.Provider;

export function useTemplate(): TemplateId {
  return useContext(TemplateContext);
}
