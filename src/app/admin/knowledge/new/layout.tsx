import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tambah Data Knowledge | MULA Studio",
};

export default function NewKnowledgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
