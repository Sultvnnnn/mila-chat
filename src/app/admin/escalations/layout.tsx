import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pusat Eskalasi | Admin MULA Studio",
  description:
    "Ambil alih percakapan dari MILA dan tangani kendala pengguna secara langsung.",
};

export default function EscalationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
