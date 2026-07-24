export type UserRole = 'admin' | 'supervisor' | 'staff';
export type UserStatus = 'aktif' | 'nonaktif';

export interface User {
  id: string;
  nama: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  last_login?: string;
}

export type StaffJabatan = 'CS' | 'Kapten' | 'Kasir' | 'Supervisor' | 'Admin';
export type StaffShift = 'Pagi' | 'Siang' | 'Malam';

export interface Staff {
  id: string;
  nama_staff: string;
  id_staff: string;
  username: string;
  jabatan: StaffJabatan;
  situs: string;
  shift: StaffShift;
  status: 'aktif' | 'nonaktif';
  created_at: string;
}

export interface Site {
  id: string;
  nama_situs: string;
  kode_situs: string;
  status: 'aktif' | 'nonaktif';
  created_at: string;
}

export interface ErrorCategory {
  id: string;
  nama_kategori: string;
  deskripsi: string;
  status: 'aktif' | 'nonaktif';
  created_at: string;
}

export type ErrorSeverity = 'Rendah' | 'Sedang' | 'Tinggi' | 'Sangat Tinggi';
export type ErrorStatus = 'Belum Ditangani' | 'Diproses' | 'Selesai' | 'Ditolak';

export interface ErrorReport {
  id: string;
  nomor_laporan: string; // e.g. ERR-20260724-0001
  tanggal: string; // YYYY-MM-DD
  jam: string; // HH:mm
  nama_staff: string;
  id_staff: string;
  situs: string;
  kategori_kesalahan: string;
  tingkat_kesalahan: ErrorSeverity;
  deskripsi_kesalahan: string;
  bukti_screenshot?: string; // base64 or url
  link_bukti?: string;
  nama_pelapor: string;
  status: ErrorStatus;
  catatan_admin?: string;
  diselesaikan_oleh?: string;
  tanggal_selesai?: string;
  jam_selesai?: string;
  created_at: string;
  updated_at: string;
}

export type ViewMode =
  | 'dashboard'
  | 'input_kesalahan'
  | 'data_kesalahan'
  | 'data_staff'
  | 'data_situs'
  | 'kategori_kesalahan'
  | 'rekap_kesalahan'
  | 'rekap_per_staff'
  | 'rekap_per_situs'
  | 'statistik'
  | 'export_data'
  | 'pengaturan';

export type ViewType = ViewMode;

export type FilterPeriod = 'hari_ini' | '7_hari' | '30_hari' | 'bulan_ini' | 'bulan_lalu' | 'custom';

export interface DateFilter {
  period: FilterPeriod;
  startDate?: string;
  endDate?: string;
  situs?: string;
  staff?: string;
  kategori?: string;
  tingkat?: string;
  status?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}
