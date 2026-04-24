import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pengaturan Sistem | Admin MULA Studio",
  description:
    "Kelola konfigurasi AI MILA, pesan sambutan, jam operasional, dan panduan respons.",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
