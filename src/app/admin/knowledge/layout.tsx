import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge Base | MULA Studio",
  description: "Kelola informasi knowledge base untuk MILA AI.",
};

export default function KnowledgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
