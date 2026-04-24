import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MILA Search Tester | Admin MULA Studio",
  description:
    "Uji akurasi Hybrid Search (Vector + Keyword) MILA AI secara real-time.",
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
