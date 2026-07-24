import { User, Staff, Site, ErrorCategory, ErrorReport } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-1',
    nama: 'Administrator Head CS',
    username: 'admin',
    email: 'admin@ligabandot.com',
    role: 'admin',
    status: 'aktif',
    created_at: '2026-01-01T08:00:00Z',
    last_login: new Date().toISOString()
  },
  {
    id: 'user-supervisor-1',
    nama: 'Supervisor Monitor',
    username: 'supervisor',
    email: 'spv@ligabandot.com',
    role: 'supervisor',
    status: 'aktif',
    created_at: '2026-01-05T08:00:00Z',
    last_login: new Date().toISOString()
  },
  {
    id: 'user-staff-rian',
    nama: 'RIAN ARIEL HUTAGAOL',
    username: 'rian',
    email: 'rian@ligabandot.com',
    role: 'staff',
    status: 'aktif',
    created_at: '2026-02-10T08:00:00Z',
    last_login: new Date().toISOString()
  }
];

export const INITIAL_SITES: Site[] = [
  {
    id: 'site-1',
    nama_situs: 'TOGELON',
    kode_situs: 'TGL',
    status: 'aktif',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'site-2',
    nama_situs: 'JUATWANBET',
    kode_situs: 'JWB',
    status: 'aktif',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'site-3',
    nama_situs: 'LIGABANDOT',
    kode_situs: 'LBD',
    status: 'aktif',
    created_at: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_CATEGORIES: ErrorCategory[] = [
  {
    id: 'cat-1',
    nama_kategori: 'Salah Respon',
    deskripsi: 'Memberikan jawaban yang tidak relevan dengan pertanyaan member',
    status: 'aktif',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'cat-2',
    nama_kategori: 'Salah Informasi',
    deskripsi: 'Memberikan info promo/jadwal/peraturan yang keliru atau kadaluarsa',
    status: 'aktif',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'cat-3',
    nama_kategori: 'Tidak Respon',
    deskripsi: 'Abaikan chat member lebih dari 3 menit tanpa balasan',
    status: 'aktif',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'cat-4',
    nama_kategori: 'Tidak Membantu / Tidak Menyelesaikan Kendala',
    deskripsi: 'Hanya memberikan template standar tanpa eskalasi kendala teknis',
    status: 'aktif',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'cat-5',
    nama_kategori: 'Tidak Minta User ID',
    deskripsi: 'Proses pengecekan dilakukan tanpa verifikasi User ID member terlebih dahulu',
    status: 'aktif',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'cat-6',
    nama_kategori: 'Note Pengecekan Tidak Berujung',
    deskripsi: 'Mencatat note audit internal tanpa status penyelesaian yang jelas',
    status: 'aktif',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'cat-7',
    nama_kategori: 'Tidak Memahami Permainan',
    deskripsi: 'Gagal menjelaskan aturan permainan togel/slot/livecasino',
    status: 'aktif',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'cat-8',
    nama_kategori: 'Salah Prosedur',
    deskripsi: 'Melanggar SOP verifikasi saldo/deposit/withdraw',
    status: 'aktif',
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'cat-9',
    nama_kategori: 'Lainnya',
    deskripsi: 'Kesalahan operasional lainnya yang tidak tercantum',
    status: 'aktif',
    created_at: '2026-01-01T00:00:00Z'
  }
];

export const INITIAL_STAFF: Staff[] = [
  {
    id: 'st-1',
    nama_staff: 'RIAN ARIEL HUTAGAOL',
    id_staff: 'E7721650',
    username: 'rian_h',
    jabatan: 'CS',
    situs: 'LIGABANDOT',
    shift: 'Pagi',
    status: 'aktif',
    created_at: '2026-01-10T00:00:00Z'
  },
  {
    id: 'st-2',
    nama_staff: 'PUTRA TUA EBENEZER TAMPUBOLON',
    id_staff: 'E967020',
    username: 'putra_t',
    jabatan: 'CS',
    situs: 'TOGELON',
    shift: 'Siang',
    status: 'aktif',
    created_at: '2026-01-10T00:00:00Z'
  },
  {
    id: 'st-3',
    nama_staff: 'ME CHI',
    id_staff: 'X7996838',
    username: 'mechi',
    jabatan: 'Kasir',
    situs: 'JUATWANBET',
    shift: 'Malam',
    status: 'aktif',
    created_at: '2026-01-10T00:00:00Z'
  },
  {
    id: 'st-4',
    nama_staff: 'ANGELLA GANI',
    id_staff: 'E6448689',
    username: 'angella',
    jabatan: 'CS',
    situs: 'LIGABANDOT',
    shift: 'Pagi',
    status: 'aktif',
    created_at: '2026-01-12T00:00:00Z'
  },
  {
    id: 'st-5',
    nama_staff: 'ZEFANYA',
    id_staff: 'E7721339',
    username: 'zefanya',
    jabatan: 'CS',
    situs: 'TOGELON',
    shift: 'Siang',
    status: 'aktif',
    created_at: '2026-01-12T00:00:00Z'
  },
  {
    id: 'st-6',
    nama_staff: 'MUHAMMAD GERY NEIL',
    id_staff: 'C9037099',
    username: 'm_gery',
    jabatan: 'Kapten',
    situs: 'JUATWANBET',
    shift: 'Malam',
    status: 'aktif',
    created_at: '2026-01-15T00:00:00Z'
  },
  {
    id: 'st-7',
    nama_staff: 'SIWA RAJ',
    id_staff: 'C9035262',
    username: 'siwa_raj',
    jabatan: 'CS',
    situs: 'LIGABANDOT',
    shift: 'Pagi',
    status: 'aktif',
    created_at: '2026-01-15T00:00:00Z'
  },
  {
    id: 'st-8',
    nama_staff: 'MEILLY PLICILLYA',
    id_staff: 'E7721779',
    username: 'meilly',
    jabatan: 'CS',
    situs: 'TOGELON',
    shift: 'Siang',
    status: 'aktif',
    created_at: '2026-01-18T00:00:00Z'
  },
  {
    id: 'st-9',
    nama_staff: 'SURYADI SUSILO',
    id_staff: 'C945901',
    username: 'suryadi',
    jabatan: 'Supervisor',
    situs: 'JUATWANBET',
    shift: 'Malam',
    status: 'aktif',
    created_at: '2026-01-18T00:00:00Z'
  },
  {
    id: 'st-10',
    nama_staff: 'AGNES VALERIA PUTRI',
    id_staff: 'E0383492',
    username: 'agnes_v',
    jabatan: 'CS',
    situs: 'LIGABANDOT',
    shift: 'Pagi',
    status: 'aktif',
    created_at: '2026-01-20T00:00:00Z'
  },
  {
    id: 'st-11',
    nama_staff: 'MICHAEL LAUYA STA GINTING',
    id_staff: 'E2085319',
    username: 'michael_g',
    jabatan: 'Kasir',
    situs: 'TOGELON',
    shift: 'Siang',
    status: 'aktif',
    created_at: '2026-01-20T00:00:00Z'
  },
  {
    id: 'st-12',
    nama_staff: 'TUAH ARIFAN',
    id_staff: 'E5380530',
    username: 'tuah_a',
    jabatan: 'CS',
    situs: 'JUATWANBET',
    shift: 'Malam',
    status: 'aktif',
    created_at: '2026-01-22T00:00:00Z'
  },
  {
    id: 'st-13',
    nama_staff: 'AYU EKLIN SIHITE',
    id_staff: 'E1475795',
    username: 'ayu_e',
    jabatan: 'CS',
    situs: 'LIGABANDOT',
    shift: 'Pagi',
    status: 'aktif',
    created_at: '2026-01-22T00:00:00Z'
  },
  {
    id: 'st-14',
    nama_staff: 'RIZKY TARUNA',
    id_staff: 'E0573945',
    username: 'rizky_t',
    jabatan: 'Kapten',
    situs: 'TOGELON',
    shift: 'Siang',
    status: 'aktif',
    created_at: '2026-01-25T00:00:00Z'
  },
  {
    id: 'st-15',
    nama_staff: 'YITACHI',
    id_staff: 'E9519230',
    username: 'yitachi',
    jabatan: 'CS',
    situs: 'JUATWANBET',
    shift: 'Malam',
    status: 'aktif',
    created_at: '2026-01-25T00:00:00Z'
  },
  {
    id: 'st-16',
    nama_staff: 'YENSI NARAWANING',
    id_staff: 'E2367167',
    username: 'yensi_n',
    jabatan: 'CS',
    situs: 'LIGABANDOT',
    shift: 'Pagi',
    status: 'aktif',
    created_at: '2026-01-28T00:00:00Z'
  }
];

// Helper to format dates YYYY-MM-DD
const getFormattedDate = (daysAgo: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const todayStr = getFormattedDate(0);
const yesterdayStr = getFormattedDate(1);
const twoDaysAgoStr = getFormattedDate(2);
const threeDaysAgoStr = getFormattedDate(3);
const fourDaysAgoStr = getFormattedDate(4);

export const INITIAL_ERROR_REPORTS: ErrorReport[] = [
  {
    id: 'err-rep-101',
    nomor_laporan: 'ERR-20260724-0001',
    tanggal: todayStr,
    jam: '09:15',
    nama_staff: 'RIAN ARIEL HUTAGAOL',
    id_staff: 'E7721650',
    situs: 'LIGABANDOT',
    kategori_kesalahan: 'Salah Respon',
    tingkat_kesalahan: 'Tinggi',
    deskripsi_kesalahan: 'CS memberikan informasi bonus new member yang salah kepada member ID #VIP9982, seharusnya min depo 50rb dikatakannya 100rb.',
    link_bukti: 'https://drive.google.com/proof/err01.png',
    nama_pelapor: 'Supervisor Monitor',
    status: 'Belum Ditangani',
    catatan_admin: 'Memerlukan klarifikasi dari CS bersangkutan.',
    created_at: `${todayStr}T09:15:00Z`,
    updated_at: `${todayStr}T09:15:00Z`
  },
  {
    id: 'err-rep-102',
    nomor_laporan: 'ERR-20260724-0002',
    tanggal: todayStr,
    jam: '10:30',
    nama_staff: 'PUTRA TUA EBENEZER TAMPUBOLON',
    id_staff: 'E967020',
    situs: 'TOGELON',
    kategori_kesalahan: 'Tidak Respon',
    tingkat_kesalahan: 'Sedang',
    deskripsi_kesalahan: 'Member mengeluh deposit lambat dan dikacuhkan di livechat selama 8 menit tanpa respon.',
    link_bukti: 'https://drive.google.com/proof/err02.png',
    nama_pelapor: 'Administrator Head CS',
    status: 'Diproses',
    catatan_admin: 'Sedang dilakukan audit log livechat shift pagi.',
    created_at: `${todayStr}T10:30:00Z`,
    updated_at: `${todayStr}T10:45:00Z`
  },
  {
    id: 'err-rep-103',
    nomor_laporan: 'ERR-20260724-0003',
    tanggal: todayStr,
    jam: '11:05',
    nama_staff: 'ME CHI',
    id_staff: 'X7996838',
    situs: 'JUATWANBET',
    kategori_kesalahan: 'Salah Prosedur',
    tingkat_kesalahan: 'Sangat Tinggi',
    deskripsi_kesalahan: 'Proses manual wd member dilakukan tanpa memverifikasi nama rekening penerima.',
    link_bukti: 'https://drive.google.com/proof/err03.png',
    nama_pelapor: 'Supervisor Monitor',
    status: 'Belum Ditangani',
    catatan_admin: 'Segera tahan limit transaksi akun CS ini sementara.',
    created_at: `${todayStr}T11:05:00Z`,
    updated_at: `${todayStr}T11:05:00Z`
  },
  {
    id: 'err-rep-104',
    nomor_laporan: 'ERR-20260723-0001',
    tanggal: yesterdayStr,
    jam: '14:20',
    nama_staff: 'RIAN ARIEL HUTAGAOL',
    id_staff: 'E7721650',
    situs: 'LIGABANDOT',
    kategori_kesalahan: 'Tidak Minta User ID',
    tingkat_kesalahan: 'Rendah',
    deskripsi_kesalahan: 'Proses pengecekan gangguan pasaran HK dilakukan tanpa meminta User ID member.',
    link_bukti: 'https://drive.google.com/proof/err04.png',
    nama_pelapor: 'Supervisor Monitor',
    status: 'Selesai',
    catatan_admin: 'Telah diberikan peringatan tertulis dan teguran L1.',
    diselesaikan_oleh: 'Administrator Head CS',
    tanggal_selesai: yesterdayStr,
    jam_selesai: '16:00',
    created_at: `${yesterdayStr}T14:20:00Z`,
    updated_at: `${yesterdayStr}T16:00:00Z`
  },
  {
    id: 'err-rep-105',
    nomor_laporan: 'ERR-20260723-0002',
    tanggal: yesterdayStr,
    jam: '16:45',
    nama_staff: 'ANGELLA GANI',
    id_staff: 'E6448689',
    situs: 'LIGABANDOT',
    kategori_kesalahan: 'Salah Informasi',
    tingkat_kesalahan: 'Sedang',
    deskripsi_kesalahan: 'CS menginfokan bank BCA offline padahal sedang online normal.',
    link_bukti: 'https://drive.google.com/proof/err05.png',
    nama_pelapor: 'Administrator Head CS',
    status: 'Selesai',
    catatan_admin: 'Sudah briefing pembaharuan status bank operasional.',
    diselesaikan_oleh: 'Administrator Head CS',
    tanggal_selesai: yesterdayStr,
    jam_selesai: '18:10',
    created_at: `${yesterdayStr}T16:45:00Z`,
    updated_at: `${yesterdayStr}T18:10:00Z`
  },
  {
    id: 'err-rep-106',
    nomor_laporan: 'ERR-20260722-0001',
    tanggal: twoDaysAgoStr,
    jam: '08:10',
    nama_staff: 'ZEFANYA',
    id_staff: 'E7721339',
    situs: 'TOGELON',
    kategori_kesalahan: 'Tidak Memahami Permainan',
    tingkat_kesalahan: 'Tinggi',
    deskripsi_kesalahan: 'Tidak bisa menjelaskan perbedaan diskon Togel 4D 3D 2D pada member baru.',
    link_bukti: '',
    nama_pelapor: 'Supervisor Monitor',
    status: 'Selesai',
    catatan_admin: 'Telah dilakukan training ulang aturan Togel.',
    diselesaikan_oleh: 'Supervisor Monitor',
    tanggal_selesai: twoDaysAgoStr,
    jam_selesai: '11:00',
    created_at: `${twoDaysAgoStr}T08:10:00Z`,
    updated_at: `${twoDaysAgoStr}T11:00:00Z`
  },
  {
    id: 'err-rep-107',
    nomor_laporan: 'ERR-20260722-0002',
    tanggal: twoDaysAgoStr,
    jam: '19:30',
    nama_staff: 'MUHAMMAD GERY NEIL',
    id_staff: 'C9037099',
    situs: 'JUATWANBET',
    kategori_kesalahan: 'Note Pengecekan Tidak Berujung',
    tingkat_kesalahan: 'Sedang',
    deskripsi_kesalahan: 'Tiket eskalasi member digantungkan lebih dari 24 jam tanpa update hasil penelusuran.',
    link_bukti: '',
    nama_pelapor: 'Administrator Head CS',
    status: 'Diproses',
    catatan_admin: 'Perlu konfirmasi pihak IT game provider.',
    created_at: `${twoDaysAgoStr}T19:30:00Z`,
    updated_at: `${twoDaysAgoStr}T20:00:00Z`
  },
  {
    id: 'err-rep-108',
    nomor_laporan: 'ERR-20260721-0001',
    tanggal: threeDaysAgoStr,
    jam: '13:15',
    nama_staff: 'SIWA RAJ',
    id_staff: 'C9035262',
    situs: 'LIGABANDOT',
    kategori_kesalahan: 'Tidak Membantu / Tidak Menyelesaikan Kendala',
    tingkat_kesalahan: 'Tinggi',
    deskripsi_kesalahan: 'Member mengalami kendala lag permainan slot dan CS hanya menyuruh clear cache tanpa bantuan lanjut.',
    link_bukti: '',
    nama_pelapor: 'Supervisor Monitor',
    status: 'Selesai',
    catatan_admin: 'Eskalasi kendala ke IT telah diselesaikan.',
    diselesaikan_oleh: 'Administrator Head CS',
    tanggal_selesai: threeDaysAgoStr,
    jam_selesai: '15:30',
    created_at: `${threeDaysAgoStr}T13:15:00Z`,
    updated_at: `${threeDaysAgoStr}T15:30:00Z`
  },
  {
    id: 'err-rep-109',
    nomor_laporan: 'ERR-20260720-0001',
    tanggal: fourDaysAgoStr,
    jam: '21:00',
    nama_staff: 'RIAN ARIEL HUTAGAOL',
    id_staff: 'E7721650',
    situs: 'LIGABANDOT',
    kategori_kesalahan: 'Salah Respon',
    tingkat_kesalahan: 'Sedang',
    deskripsi_kesalahan: 'Member bertanyakan saldo belum masuk, CS merespon jawaban tentang cara pendaftaran akun.',
    link_bukti: '',
    nama_pelapor: 'Supervisor Monitor',
    status: 'Selesai',
    catatan_admin: 'Sudah dikoreksi langsung oleh Kapten Shift.',
    diselesaikan_oleh: 'Supervisor Monitor',
    tanggal_selesai: fourDaysAgoStr,
    jam_selesai: '21:45',
    created_at: `${fourDaysAgoStr}T21:00:00Z`,
    updated_at: `${fourDaysAgoStr}T21:45:00Z`
  }
];
