import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Data Knowledge | MULA Studio",
};

export default function EditKnowledgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
