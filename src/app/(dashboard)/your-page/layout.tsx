// Focus-mode wrapper for the page builder.
// Removes the dashboard's main padding so the builder gets the full canvas.
export default function YourPageLayout({ children }: { children: React.ReactNode }) {
  return <div className="-m-6 -mt-20 md:-mt-8 p-4 md:p-6">{children}</div>;
}
