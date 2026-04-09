import { allFontVariables } from "@/lib/templates/fonts";

export default function PagePreviewLayout({ children }: { children: React.ReactNode }) {
  return <div className={allFontVariables}>{children}</div>;
}
