import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateEmbedding } from "@/lib/openai";

//? DATA Q&A
const yogaData = [
  {
    title: "Lokasi dan Fasilitas KAIA Studio",
    content:
      "KAIA Studio memiliki kapasitas 15 pax. Fasilitas meliputi parkir gratis (motor & mobil), shower (tidak ada air panas), AC, dan properti yoga (matras, block, strap, dll). Harap bawa handuk dan botol minum sendiri. Kolam renang tidak untuk publik. Bisa diakses menggunakan KRL dan turun di stasiun Lenteng Agung.",
    category: "lokasi",
  },
  {
    title: "Lokasi Svasana D'Andara",
    content:
      "Svasana D'Andara berkapasitas 15 pax dan memiliki fasilitas toilet. Harap bawa properti yoga sendiri. Kolam renang dapat diakses. Lokasi ini cocok untuk area Cinere, Depok, Kahfi, Benda, dan Cilandak. Harga 20% lebih murah dengan memasukkan kode YOGADIANDARA di aplikasi Kuyy.",
    category: "lokasi",
  },
  {
    title: "Harga Kelas Dewasa (Adult Class)",
    content:
      "Harga untuk Adult Class adalah: 1 kelas Rp 100.000. Paket 4 kelas Rp 375.000 (valid 30 hari). Paket 8 kelas Rp 700.000 (valid 45 hari). Pembelian dilakukan melalui aplikasi Kuyy. Tidak ada refund, namun tersedia reschedule pass jika batal.",
    category: "harga",
  },
  {
    title: "Harga Kelas Privat dan Anak (Kids Class)",
    content:
      "Harga Kids Class: 1 kelas Rp 135.000, 4 kelas Rp 500.000, 8 kelas Rp 1.000.000. Harga Private Class: 1-2 pax Rp 450.000, 3-15 pax Rp 1.500.000. Kelas privat berlaku di luar jadwal reguler.",
    category: "harga",
  },
  {
    title: "Cara Registrasi dan Reschedule",
    content:
      "Registrasi kelas (Walk-In maupun Pass) dilakukan melalui link https://kuyy.app/home. Pilih kelas dan maksimal mendaftar untuk 6 orang. Kelas akan berjalan dengan minimal 2 peserta. Reschedule maksimal dilakukan 3 jam sebelum kelas dimulai.",
    category: "registrasi",
  },
  {
    title: "Kebijakan Kesehatan dan Medis",
    content:
      "Kelas kami campur antara pria dan wanita. Untuk pertanyaan yang berkaitan dengan penyakit, kesehatan mental, atau keterbatasan fisik, mohon hubungi staf manusia kami secara langsung.",
    category: "kebijakan",
  },
  {
    title: "Jenis Kelas untuk Pemula (0 Bulan Pengalaman)",
    content:
      "Untuk pemula yang belum pernah yoga sama sekali (0 months experience), kami merekomendasikan kelas: Intro to Hatha Yoga (fokus pengenalan), Hatha Flow (fokus kekuatan, mobilitas, fleksibilitas, relaksasi), Yin & Sound Healing (fokus pemulihan dan relaksasi). Untuk kelas non-yoga pemula tersedia Inside Flow, Intro to Capoeira, dan Strength Training.",
    category: "kelas",
  },
  {
    title: "Jenis Kelas Menengah dan Lanjutan (Minimal 1-3 Bulan Pengalaman)",
    content:
      "Untuk yang sudah memiliki pengalaman 1 hingga 3 bulan, tersedia kelas: Hatha Yoga Foundation (fokus kekuatan), Hatha for Flexibility, Power Hatha, Hatha Yoga with Props, Morning Vinyasa, Dynamic Vinyasa, Power Vinyasa, dan Slow Vinyasa & Yin. Untuk kelas non-yoga lanjutan tersedia Capoeira Intermediate (minimal 12 bulan pengalaman).",
    category: "kelas",
  },
  {
    title: "Kelas Khusus: Anak-anak (Kids) dan Ibu Hamil (Prenatal)",
    content:
      "Kami menyediakan Kids Yoga Class untuk anak usia 4.5 sampai 7 tahun dengan metode bermain (70% playful) yang fokus pada kekuatan, mobilitas, dan fleksibilitas. Tersedia juga Prenatal Yoga Class untuk ibu hamil dengan usia kandungan minimal 3 bulan, berfokus pada relaksasi, mobilitas, dan peregangan ringan.",
    category: "kelas",
  },
  {
    title: "Jadwal KAIA Studio (Senin - Rabu)",
    content:
      "Senin: 08.00 Hatha Flow (Ayunda), 19.00 Yin & Sound Healing (Mia). Selasa: 08.00 Prenatal Yoga (Ayunda), 09.15 Morning Vinyasa (Ramadan). Rabu: 09.00 Dynamic Vinyasa (Viyus).",
    category: "jadwal",
  },
  {
    title: "Jadwal KAIA Studio (Kamis - Minggu)",
    content:
      "Kamis: 08.00 Intro to Hatha (Cynthia), 09.00 Hatha Yoga Foundation (Viyus), 15.00 Kids Yoga (Nastiti), 19.00 Slow Vinyasa & Yin (Cynthia). Jumat: 08.00 Inside Flow (Mia), 19.00 Hatha for Flexibility (Movie). Sabtu: 08.00 Dynamic Vinyasa (Viyus), 09.00 Strength Training (Viyus), 16.00 Intro to Capoeira (Cynthia). Minggu: 07.30 Hatha Yoga with Props (Tiara), 08.45 Power Vinyasa (Tiara), 10.00 Capoeira Intermediate (Viyus), 16.30 Power Hatha (Movie).",
    category: "jadwal",
  },
  {
    title: "Jadwal Svasana D'Andara",
    content:
      "Senin: 08.00 Hatha Yoga Foundation (Viyus). Selasa: 08.00 Strength Training (Viyus), 09.00 Vinyasa (Cynthia). Jumat: 08.00 Hatha Yoga Foundation (Viyus). Catatan: Kelas berjalan minimal dengan 2 peserta. Sebelum latihan, cek aplikasi Kuyy atau email untuk status kelas (open/cancel). Jika kelas batal, pelanggan mendapat reschedule pass yang valid 1 bulan.",
    category: "jadwal",
  },
  {
    title: "Jadwal Lengkap Kaia Studio",
    content:
      "Berikut adalah jadwal kelas di Kaia Studio: \n" +
      "- Senin: 08.00 Hatha Flow (Ayunda), 19.00 Yin & Sound Healing (Mia) \n" +
      "- Selasa: 08.00 Prenatal Yoga (Ayunda), 09.15 Morning Vinyasa (Ramadan) \n" +
      "- Rabu: 09.00 Dynamic Vinyasa (Viyus) \n" +
      "- Kamis: 08.00 Intro to Hatha Yoga (Cynthia), 09.00 Hatha Yoga Foundation (Viyus), 15.00 Kids Yoga (Nastiti), 19.00 Slow Vinyasa & Yin (Cynthia) \n" +
      "- Jumat: 08.00 Inside Flow (Mia), 19.00 Hatha for Flexibility (Movie) \n" +
      "- Sabtu: 08.00 Dynamic Vinyasa (Viyus), 09.00 Strength Training (Viyus), 16.00 Intro to Capoeira (Cynthia) \n" +
      "- Minggu: 07.30 Hatha Yoga with Props (Tiara), 08.45 Power Vinyasa (Tiara), 10.00 Capoeira Intermediate (Viyus), 16.30 Power Hatha (Movie). \n" +
      "Link jadwal: https://www.instagram.com/p/DTWg_UBgWTK/",
    category: "jadwal",
  },
  {
    title: "Jadwal Lengkap Svasana D’Andara",
    content:
      "Berikut adalah jadwal kelas di Svasana D’Andara: \n" +
      "- Senin: 08.00 Hatha Yoga Foundation (Viyus) \n" +
      "- Selasa: 08.00 Strength Training (Viyus), 09.00 Vinyasa (Cynthia) \n" +
      "- Jumat: 08.00 Hatha Yoga Foundation (Viyus).",
    category: "jadwal",
  },
];

export async function GET() {
  try {
    // looping data
    for (const item of yogaData) {
      // embedding
      const embedding = await generateEmbedding(
        `${item.title}\n${item.content}`,
      );

      // save to supabase
      const { error } = await supabase.from("knowledge_entries").insert({
        title: item.title,
        content: item.content,
        category: item.category,
        embedding: embedding,
      });

      if (error) {
        console.error(`Error insert: ${(error.message, error.details)}`);
      }
    }

    return NextResponse.json({
      message: "Data Yoga sukses dimasukkan ke Supabase!",
    });
  } catch (error) {
    console.error(`Error seeding data: ${error}`);
    return NextResponse.json({ error: "Gagal masukin data" }, { status: 500 });
  }
}
