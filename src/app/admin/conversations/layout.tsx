import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Interaksi | Admin MULA Studio",
  description:
    "Pantau dan analisis log percakapan mentah dari pengguna MILA AI.",
};

export default function ConversationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
