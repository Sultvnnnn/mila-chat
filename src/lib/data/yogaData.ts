// ─────────────────────────────────────────────────────────────────────────────
// MILA Knowledge Base — Q&A Data
// ─────────────────────────────────────────────────────────────────────────────

const yogaData = [
  // ── LOKASI ────────────────────────────────────────────────────────────────

  {
    title: "Lokasi KAIA Studio — alamat dan peta",
    content:
      "KAIA Studio berlokasi di Jakarta. Untuk arah lengkap bisa cek Google Maps: https://maps.app.goo.gl/w1YfWgAvvabFyedq7. Untuk panduan visual cara masuk ke area studio, lihat video IG ini: https://www.instagram.com/reel/DL13lNIB1f5/",
    category: "lokasi",
  },
  {
    title: "Fasilitas KAIA Studio — parkir, shower, matras, AC",
    content:
      "KAIA Studio menyediakan: parkir gratis (motor dan mobil), shower (tidak ada air panas), AC, properti yoga lengkap (matras, block, strap, wheel, bolster), air minum gratis, dan sabun + sampo di kamar mandi. Harap bawa handuk dan botol minum sendiri. Kapasitas 15 pax.",
    category: "lokasi",
  },
  {
    title: "Kolam renang KAIA Studio — apakah boleh dipakai?",
    content:
      "Kolam renang di KAIA Studio tidak tersedia untuk umum/pelanggan. Kolam renang hanya untuk penghuni area.",
    category: "lokasi",
  },
  {
    title: "Transportasi umum ke KAIA Studio — KRL, ojek online",
    content:
      "Untuk ke KAIA Studio bisa naik KRL dan turun di Stasiun Lenteng Agung. Dari stasiun bisa lanjut dengan ojek online (Gojek/Grab). Untuk transportasi lain, kami sarankan menggunakan Gojek atau Grab.",
    category: "lokasi",
  },
  {
    title: "Lokasi Svasana D'Andara — alamat dan peta",
    content:
      "Svasana D'Andara berlokasi di area Depok/Cinere. Peta: https://maps.app.goo.gl/36Tvr916zbQ7nFaY8. Panduan visual cara ke lokasi: https://www.instagram.com/reel/DRG0egrAXrg/. Studio ini cocok untuk kamu yang tinggal di area Cinere, Depok, Kahfi, Benda, atau Cilandak — lebih dekat dan lebih murah!",
    category: "lokasi",
  },
  {
    title: "Fasilitas Svasana D'Andara — apa yang tersedia?",
    content:
      "Svasana D'Andara memiliki fasilitas toilet. Harap bawa properti yoga sendiri (matras, block, dll.) karena studio tidak menyediakan. Kapasitas 15 pax. Suasana studio ini memiliki Bali vibes yang tenang dan nyaman.",
    category: "lokasi",
  },
  {
    title: "Kolam renang Svasana D'Andara — apakah bisa diakses?",
    content:
      "Kolam renang di Svasana D'Andara bisa diakses oleh pelanggan. Untuk detail dan informasi lebih lanjut tentang kolam renang, silakan hubungi Svasana D'Andara secara langsung.",
    category: "lokasi",
  },
  {
    title: "Svasana D'Andara lebih murah — diskon dan kode promo",
    content:
      "Harga kelas di Svasana D'Andara 20% lebih murah dibanding KAIA Studio. Masukkan kode YOGADIANDARA di aplikasi Kuyy saat checkout untuk mendapatkan harga diskon. Cocok banget untuk kamu yang di area Cinere, Depok, Kahfi, Benda, atau Cilandak.",
    category: "lokasi",
  },
  {
    title: "Pilih studio mana — KAIA Studio atau Svasana D'Andara?",
    content:
      "Kalau kamu di area Cinere, Depok, Kahfi, Benda, atau Cilandak: pilih Svasana D'Andara — lebih dekat, 20% lebih murah (kode YOGADIANDARA di Kuyy), dan punya Bali vibes. Kalau kamu di Jakarta Selatan area Lenteng Agung: pilih KAIA Studio — fasilitas lebih lengkap (matras disediakan, parkir gratis, shower).",
    category: "lokasi",
  },

  // ── HARGA ─────────────────────────────────────────────────────────────────

  {
    title: "Harga kelas dewasa — per sesi, paket 4, paket 8",
    content:
      "Harga kelas dewasa (adult class): 1 kelas = Rp 100.000. Paket 4 kelas = Rp 375.000 (valid 30 hari sejak kelas pertama). Paket 8 kelas = Rp 700.000 (valid 45 hari sejak kelas pertama). Semua pembelian melalui aplikasi Kuyy.",
    category: "harga",
  },
  {
    title: "Harga kelas anak-anak (kids yoga)",
    content:
      "Harga Kids Class: 1 kelas = Rp 135.000. Paket 4 kelas = Rp 500.000. Paket 8 kelas = Rp 1.000.000. Kelas ini untuk anak usia 4,5 hingga 7 tahun.",
    category: "harga",
  },
  {
    title: "Harga kelas private yoga",
    content:
      "Harga Private Class: untuk 1-2 orang = Rp 450.000 per sesi. Untuk 3-15 orang = Rp 1.500.000 per sesi. Kelas private diadakan di luar jadwal reguler dan bisa disesuaikan waktunya. Info lebih lanjut: https://tr.ee/GB0fBizP5n",
    category: "harga",
  },
  {
    title: "Cara beli paket kelas — di mana belinya?",
    content:
      "Semua pembelian paket kelas dilakukan melalui aplikasi Kuyy di https://kuyy.app/home. Caranya: buka aplikasi → klik Activity Pass di profil → pilih paket → lanjut ke pembayaran. Pembelian lewat transfer manual dikenakan biaya tambahan 25%.",
    category: "harga",
  },
  {
    title: "Kebijakan refund — apakah bisa dikembalikan?",
    content:
      "Tidak ada refund untuk pembelian kelas atau paket. Namun jika kamu ingin membatalkan kelas, kamu akan mendapat reschedule pass yang bisa digunakan untuk kelas lain (valid 1 bulan). Reschedule hanya bisa dilakukan maksimal 3 jam sebelum kelas dimulai.",
    category: "harga",
  },

  // ── REGISTRASI ────────────────────────────────────────────────────────────

  {
    title: "Cara daftar kelas yoga — langkah-langkah registrasi",
    content:
      "Cara daftar kelas: buka https://kuyy.app/home → pilih kelas yang diinginkan → klik Join → isi pertanyaan umum → klik Continue → bayar. Bisa daftar untuk maksimal 6 orang sekaligus. Panduan visual: https://www.instagram.com/p/DQscjB4El0a/",
    category: "registrasi",
  },
  {
    title: "Cara pakai class pass atau reschedule pass saat daftar",
    content:
      "Saat checkout di Kuyy, setelah mengisi data peserta klik Continue → pilih 'My Pass' atau masukkan kode promo → klik Continue. Reschedule pass bisa dilihat di menu Activity Pass di profil Kuyy kamu.",
    category: "registrasi",
  },
  {
    title: "Cara reschedule atau pindah jadwal kelas",
    content:
      "Untuk reschedule: buka kelas yang sudah kamu join di Kuyy → klik ikon kalender di pojok kanan bawah → klik Reschedule → kamu akan mendapat reschedule pass. Reschedule hanya bisa dilakukan maksimal 3 jam sebelum kelas. Panduan visual: https://www.instagram.com/p/DQscjB4El0a/",
    category: "registrasi",
  },
  {
    title: "Cek apakah kelas jadi atau dibatalkan",
    content:
      "Untuk mengecek apakah kelas jadi atau batal, buka https://kuyy.id/@mulajkt atau cek email yang terdaftar. Kelas berjalan dengan minimal 2 peserta. Jika kelas dibatalkan, kamu otomatis mendapat reschedule pass valid 1 bulan.",
    category: "registrasi",
  },
  {
    title: "Kelas batal — apa yang terjadi jika kelas tidak jadi?",
    content:
      "Jika kelas dibatalkan (karena peserta kurang dari 2 orang), kamu akan otomatis mendapat reschedule pass yang valid selama 1 bulan. Pass ini bisa digunakan untuk kelas mana saja. Kamu akan diberitahu melalui email dan bisa dicek di aplikasi Kuyy.",
    category: "registrasi",
  },

  // ── KELAS ─────────────────────────────────────────────────────────────────

  {
    title: "Kelas yoga untuk pemula — mulai dari mana?",
    content:
      "Untuk pemula yang belum pernah yoga sama sekali, kami rekomendasikan Intro to Hatha Yoga — ini kelas pengenalan khusus untuk yang baru mulai. Selain itu ada Hatha Flow (cocok juga untuk pemula, lebih dinamis) dan Yin & Sound Healing (fokus relaksasi, sangat ramah pemula). Untuk non-yoga: Inside Flow, Intro to Capoeira, dan Strength Training juga terbuka untuk pemula.",
    category: "kelas",
  },
  {
    title: "Kelas Intro to Hatha Yoga — untuk siapa dan fokusnya apa?",
    content:
      "Intro to Hatha Yoga adalah kelas pengenalan yoga yang cocok untuk semua orang, terutama yang baru pertama kali yoga (0 bulan pengalaman). Tipe latihan: 80% static (menahan pose) dan 20% dynamic (gerakan). Fokus: pengenalan dasar yoga. Tidak ada syarat pengalaman sebelumnya.",
    category: "kelas",
  },
  {
    title: "Kelas Hatha Yoga Foundation — untuk siapa dan fokusnya apa?",
    content:
      "Hatha Yoga Foundation cocok untuk yang sudah minimal 1 bulan berlatih yoga. Fokus: kekuatan (strength). Tipe latihan: 80% static, 20% dynamic. Lihat contoh kelas: https://www.instagram.com/reel/DOxFknDgZt5/",
    category: "kelas",
  },
  {
    title: "Kelas Hatha for Flexibility — untuk siapa dan fokusnya apa?",
    content:
      "Hatha for Flexibility cocok untuk yang sudah minimal 3 bulan berlatih yoga. Fokus: fleksibilitas. Tipe latihan: 80% static, 20% dynamic.",
    category: "kelas",
  },
  {
    title: "Kelas Power Hatha — untuk siapa dan fokusnya apa?",
    content:
      "Power Hatha cocok untuk yang sudah minimal 3 bulan berlatih yoga. Fokus: kekuatan dan fleksibilitas. Tipe latihan: 80% static, 20% dynamic.",
    category: "kelas",
  },
  {
    title: "Kelas Hatha Flow — untuk siapa dan fokusnya apa?",
    content:
      "Hatha Flow terbuka untuk semua level (0 bulan pengalaman). Fokus: kekuatan, mobilitas, fleksibilitas, dan relaksasi. Tipe latihan: 40% static, 50% dynamic, 10% relaksasi. Salah satu kelas paling lengkap untuk pemula maupun yang sudah berpengalaman.",
    category: "kelas",
  },
  {
    title: "Kelas Hatha Yoga with Props — untuk siapa dan fokusnya apa?",
    content:
      "Hatha Yoga with Props cocok untuk yang sudah minimal 3 bulan berlatih yoga. Fokus: kekuatan dan fleksibilitas dengan bantuan properti yoga (block, strap, dll.). Tipe latihan: 80% static, 20% dynamic. Lihat contoh: https://www.instagram.com/reel/DPTi3tMgdvD/",
    category: "kelas",
  },
  {
    title: "Kelas Morning Vinyasa — untuk siapa dan fokusnya apa?",
    content:
      "Morning Vinyasa cocok untuk yang sudah minimal 3 bulan berlatih yoga. Fokus: mobilitas. Tipe latihan: 30% static, 70% dynamic. Lihat contoh: https://www.instagram.com/reel/DJOo2jcS5Al/",
    category: "kelas",
  },
  {
    title: "Kelas Dynamic Vinyasa — untuk siapa dan fokusnya apa?",
    content:
      "Dynamic Vinyasa cocok untuk yang sudah minimal 3 bulan berlatih yoga. Fokus: kekuatan dan mobilitas. Tipe latihan: 20% static, 80% dynamic. Kelas ini cukup intens.",
    category: "kelas",
  },
  {
    title: "Kelas Power Vinyasa — untuk siapa dan fokusnya apa?",
    content:
      "Power Vinyasa cocok untuk yang sudah minimal 3 bulan berlatih yoga. Fokus: kekuatan dan mobilitas. Tipe latihan: 50% static, 50% dynamic.",
    category: "kelas",
  },
  {
    title: "Kelas Slow Vinyasa & Yin — untuk siapa dan fokusnya apa?",
    content:
      "Slow Vinyasa & Yin cocok untuk yang sudah minimal 1 bulan berlatih yoga. Fokus: mobilitas dan relaksasi. Tipe latihan: 50% relaksasi, 50% dynamic. Cocok untuk recovery.",
    category: "kelas",
  },
  {
    title: "Kelas Yin & Sound Healing — untuk siapa dan fokusnya apa?",
    content:
      "Yin & Sound Healing terbuka untuk semua level (0 bulan pengalaman). Fokus: pemulihan dan relaksasi mendalam. Tipe latihan: 40% static, 40% relaksasi, 20% fleksibilitas. Sangat cocok untuk yang stres atau butuh recovery. Lihat contoh: https://www.instagram.com/reel/DTRsjeXgd5T/",
    category: "kelas",
  },
  {
    title: "Kelas Kids Yoga — untuk anak usia berapa?",
    content:
      "Kids Yoga Class diperuntukkan untuk anak usia 4,5 hingga 7 tahun. Metode belajar melalui permainan (70% playful). Fokus: kekuatan, mobilitas, dan fleksibilitas. Tipe latihan: 10% static, 70% playful, 20% relaksasi.",
    category: "kelas",
  },
  {
    title: "Kelas Prenatal Yoga — untuk ibu hamil usia berapa?",
    content:
      "Prenatal Yoga Class untuk ibu hamil dengan usia kandungan minimal 3 bulan. Fokus: relaksasi, mobilitas, fleksibilitas, dan kekuatan ringan. Tipe latihan: 40% relaksasi, 40% static, 20% dynamic. Aman dan menyenangkan untuk persiapan persalinan.",
    category: "kelas",
  },
  {
    title: "Kelas Inside Flow — apa itu dan untuk siapa?",
    content:
      "Inside Flow adalah kelas non-yoga yang terbuka untuk semua level (0 bulan pengalaman). Fokus: gerakan dan transisi yang sinkron dengan napas, pikiran, dan niat. Tipe latihan: 80% dynamic, 10% fleksibilitas, 10% mobilitas. Lihat contoh: https://www.instagram.com/reel/DRTV4AcgS9m/",
    category: "kelas",
  },
  {
    title: "Kelas Intro to Capoeira — apa itu dan untuk siapa?",
    content:
      "Intro to Capoeira adalah kelas non-yoga untuk pemula hingga yang sudah 6 bulan berlatih. Capoeira menggabungkan seni bela diri, musik, dan tarian dari Brazil. Fokus: mobilitas, kekuatan, dan fleksibilitas. Tipe latihan: 50% dynamic, 50% mobile. Lihat contoh: https://www.instagram.com/reel/DNFnic5BlKM/",
    category: "kelas",
  },
  {
    title: "Kelas Capoeira Intermediate — untuk siapa?",
    content:
      "Capoeira Intermediate untuk yang sudah minimal 12 bulan berlatih Capoeira. Fokus dan tipe latihan sama dengan Intro to Capoeira tapi dengan teknik yang lebih kompleks.",
    category: "kelas",
  },
  {
    title: "Kelas Strength Training — apa itu dan untuk siapa?",
    content:
      "Strength Training adalah kelas non-yoga yang terbuka untuk semua level (0 bulan pengalaman). Fokus: kekuatan dan mobilitas. Tipe latihan: 50% static, 50% dynamic. Cocok untuk yang ingin meningkatkan kekuatan fisik secara umum.",
    category: "kelas",
  },
  {
    title: "Perbedaan kelas yoga dan non-yoga di MULA",
    content:
      "Kelas yoga di MULA: Intro to Hatha, Hatha Flow, Hatha Foundation, Hatha for Flexibility, Power Hatha, Hatha Yoga with Props, Morning Vinyasa, Dynamic Vinyasa, Power Vinyasa, Slow Vinyasa & Yin, Yin & Sound Healing, Kids Yoga, Prenatal Yoga. Kelas non-yoga: Inside Flow (gerak sinkron dengan musik), Intro to Capoeira, Capoeira Intermediate, Strength Training.",
    category: "kelas",
  },
  {
    title: "Rekomendasi kelas fokus kekuatan (strength)",
    content:
      "Untuk fokus kekuatan (strength): Hatha Yoga Foundation (1+ bulan), Power Hatha (3+ bulan), Hatha Yoga with Props (3+ bulan), Dynamic Vinyasa (3+ bulan), Power Vinyasa (3+ bulan), Strength Training (semua level).",
    category: "kelas",
  },
  {
    title: "Rekomendasi kelas fokus fleksibilitas (flexibility)",
    content:
      "Untuk fokus fleksibilitas: Hatha for Flexibility (3+ bulan), Yin & Sound Healing (semua level), Hatha Yoga with Props (3+ bulan), Slow Vinyasa & Yin (1+ bulan).",
    category: "kelas",
  },
  {
    title: "Rekomendasi kelas fokus relaksasi dan recovery",
    content:
      "Untuk relaksasi dan recovery: Yin & Sound Healing (semua level, sangat direkomendasikan), Slow Vinyasa & Yin (1+ bulan), Prenatal Yoga (khusus ibu hamil 3+ bulan kehamilan), Hatha Flow (semua level).",
    category: "kelas",
  },
  {
    title: "Rekomendasi kelas fokus mobilitas (mobility)",
    content:
      "Untuk fokus mobilitas: Morning Vinyasa (3+ bulan), Dynamic Vinyasa (3+ bulan), Slow Vinyasa & Yin (1+ bulan), Inside Flow (semua level), Intro to Capoeira (semua level).",
    category: "kelas",
  },

  // ── JADWAL KAIA STUDIO — per hari ────────────────────────────────────────

  {
    title: "Jadwal KAIA Studio hari Senin",
    content:
      "Jadwal kelas di KAIA Studio hari Senin: 08.00–09.00 Hatha Flow bersama Ayunda, 19.00–20.00 Yin & Sound Healing bersama Mia.",
    category: "jadwal",
  },
  {
    title: "Jadwal KAIA Studio hari Selasa",
    content:
      "Jadwal kelas di KAIA Studio hari Selasa: 08.00–09.00 Prenatal Yoga bersama Ayunda, 09.15–10.15 Morning Vinyasa bersama Ramadan.",
    category: "jadwal",
  },
  {
    title: "Jadwal KAIA Studio hari Rabu",
    content:
      "Jadwal kelas di KAIA Studio hari Rabu: 09.00–10.00 Dynamic Vinyasa bersama Viyus.",
    category: "jadwal",
  },
  {
    title: "Jadwal KAIA Studio hari Kamis",
    content:
      "Jadwal kelas di KAIA Studio hari Kamis: 08.00–09.00 Intro to Hatha Yoga bersama Cynthia, 09.00–10.00 Hatha Yoga Foundation bersama Viyus, 15.00–16.00 Kids Yoga bersama Nastiti, 19.00–20.00 Slow Vinyasa & Yin bersama Cynthia.",
    category: "jadwal",
  },
  {
    title: "Jadwal KAIA Studio hari Jumat",
    content:
      "Jadwal kelas di KAIA Studio hari Jumat: 08.00–09.00 Inside Flow bersama Mia, 19.00–20.00 Hatha for Flexibility bersama Movie.",
    category: "jadwal",
  },
  {
    title: "Jadwal KAIA Studio hari Sabtu",
    content:
      "Jadwal kelas di KAIA Studio hari Sabtu: 08.00–09.00 Dynamic Vinyasa bersama Viyus, 09.00–10.00 Strength Training bersama Viyus, 16.00–17.00 Intro to Capoeira bersama Cynthia.",
    category: "jadwal",
  },
  {
    title: "Jadwal KAIA Studio hari Minggu",
    content:
      "Jadwal kelas di KAIA Studio hari Minggu: 07.30–08.30 Hatha Yoga with Props bersama Tiara, 08.45–09.45 Power Vinyasa bersama Tiara, 10.00–11.00 Capoeira Intermediate bersama Viyus, 16.30–17.30 Power Hatha bersama Movie.",
    category: "jadwal",
  },

  // ── JADWAL SVASANA D'ANDARA — per hari ────────────────────────────────────

  {
    title: "Jadwal Svasana D'Andara hari Senin",
    content:
      "Jadwal kelas di Svasana D'Andara hari Senin: 08.00–09.00 Hatha Yoga Foundation bersama Viyus.",
    category: "jadwal",
  },
  {
    title: "Jadwal Svasana D'Andara hari Selasa",
    content:
      "Jadwal kelas di Svasana D'Andara hari Selasa: 08.00–09.00 Strength Training bersama Viyus, 09.00–10.00 Vinyasa bersama Cynthia.",
    category: "jadwal",
  },
  {
    title: "Jadwal Svasana D'Andara hari Jumat",
    content:
      "Jadwal kelas di Svasana D'Andara hari Jumat: 08.00–09.00 Hatha Yoga Foundation bersama Viyus.",
    category: "jadwal",
  },
  {
    title: "Jadwal Svasana D'Andara hari Rabu, Kamis, Sabtu, Minggu",
    content:
      "Tidak ada kelas di Svasana D'Andara pada hari Rabu, Kamis, Sabtu, dan Minggu. Untuk hari-hari tersebut, kamu bisa mengikuti kelas di KAIA Studio.",
    category: "jadwal",
  },

  // ── JADWAL GABUNGAN (untuk query umum) ────────────────────────────────────

  {
    title: "Jadwal lengkap semua kelas — link Instagram",
    content:
      "Jadwal lengkap kelas bisa dilihat di: https://www.instagram.com/p/DTWg_UBgWTK/. Kelas berjalan minimal dengan 2 peserta. Sebelum berangkat, cek status kelas di https://kuyy.id/@mulajkt atau email yang terdaftar.",
    category: "jadwal",
  },
  {
    title: "Jadwal lengkap KAIA Studio seminggu",
    content:
      "Jadwal KAIA Studio: Senin: 08.00 Hatha Flow (Ayunda), 19.00 Yin & Sound Healing (Mia). Selasa: 08.00 Prenatal Yoga (Ayunda), 09.15 Morning Vinyasa (Ramadan). Rabu: 09.00 Dynamic Vinyasa (Viyus). Kamis: 08.00 Intro to Hatha (Cynthia), 09.00 Hatha Foundation (Viyus), 15.00 Kids Yoga (Nastiti), 19.00 Slow Vinyasa & Yin (Cynthia). Jumat: 08.00 Inside Flow (Mia), 19.00 Hatha for Flexibility (Movie). Sabtu: 08.00 Dynamic Vinyasa (Viyus), 09.00 Strength Training (Viyus), 16.00 Intro to Capoeira (Cynthia). Minggu: 07.30 Hatha with Props (Tiara), 08.45 Power Vinyasa (Tiara), 10.00 Capoeira Intermediate (Viyus), 16.30 Power Hatha (Movie).",
    category: "jadwal",
  },
  {
    title: "Jadwal lengkap Svasana D'Andara seminggu",
    content:
      "Jadwal Svasana D'Andara: Senin: 08.00 Hatha Yoga Foundation (Viyus). Selasa: 08.00 Strength Training (Viyus), 09.00 Vinyasa (Cynthia). Rabu, Kamis, Sabtu, Minggu: tidak ada kelas. Jumat: 08.00 Hatha Yoga Foundation (Viyus). Gunakan kode YOGADIANDARA di Kuyy untuk harga 20% lebih murah.",
    category: "jadwal",
  },

  // ── KEBIJAKAN & LAIN-LAIN ────────────────────────────────────────────────

  {
    title: "Apakah kelas campur pria dan wanita?",
    content:
      "Ya, semua kelas reguler kami bersifat mixed (campur antara pria dan wanita). Tidak ada kelas khusus wanita atau pria saat ini.",
    category: "kebijakan",
  },
  {
    title: "Pertanyaan tentang penyakit atau kondisi medis",
    content:
      "Untuk pertanyaan yang berkaitan dengan penyakit, kondisi kesehatan mental, atau keterbatasan fisik tertentu, kami tidak bisa memberikan saran medis. Mohon konsultasikan langsung dengan staf kami atau tenaga medis profesional sebelum mengikuti kelas.",
    category: "kebijakan",
  },
  {
    title: "Kerjasama, partnership, atau kolaborasi dengan MULA Yoga",
    content:
      "Untuk pertanyaan seputar kerjasama, partnership, atau kolaborasi, silakan klik link berikut: https://tr.ee/-6b4VVDtJq",
    category: "kebijakan",
  },
  {
    title: "Kelas private — informasi dan pemesanan",
    content:
      "Tertarik dengan kelas private? Bisa untuk 1–2 orang (Rp 450.000) atau grup 3–15 orang (Rp 1.500.000). Kelas private diadakan di luar jadwal reguler. Untuk informasi dan pemesanan, klik: https://tr.ee/GB0fBizP5n",
    category: "kebijakan",
  },
  {
    title: "Apa yang harus dibawa ke kelas yoga?",
    content:
      "Yang perlu dibawa ke kelas: handuk, botol minum (KAIA Studio menyediakan air gratis). Di KAIA Studio semua properti yoga (matras, block, strap, dll.) sudah disediakan. Di Svasana D'Andara harap bawa properti yoga sendiri.",
    category: "kebijakan",
  },
  {
    title: "Apakah MULA Yoga ada Instagram?",
    content:
      "Ya! Follow Instagram kami untuk update jadwal, info promo, dan konten yoga: cari @mulajkt di Instagram. Untuk jadwal lengkap dalam bentuk visual bisa cek https://www.instagram.com/p/DTWg_UBgWTK/",
    category: "kebijakan",
  },
];

export default yogaData;
