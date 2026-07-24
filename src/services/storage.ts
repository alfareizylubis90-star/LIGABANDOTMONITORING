import {
  User,
  Staff,
  Site,
  ErrorCategory,
  ErrorReport,
  ErrorStatus
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_STAFF,
  INITIAL_SITES,
  INITIAL_CATEGORIES,
  INITIAL_ERROR_REPORTS
} from '../data/seedData';

const STORAGE_KEYS = {
  USERS: 'tem_ligabandot_users_v1',
  STAFF: 'tem_ligabandot_staff_v1',
  SITES: 'tem_ligabandot_sites_v1',
  CATEGORIES: 'tem_ligabandot_categories_v1',
  REPORTS: 'tem_ligabandot_reports_v1',
  CURRENT_USER: 'tem_ligabandot_current_user_v1',
  SOUND_ENABLED: 'tem_ligabandot_sound_enabled_v1'
};

type Listener = () => void;

class StorageService {
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.initDatabase();
  }

  // Initialize DB with Seed Data if empty
  private initDatabase() {
    try {
      if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.STAFF)) {
        localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF));
      }
      if (!localStorage.getItem(STORAGE_KEYS.SITES)) {
        localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(INITIAL_SITES));
      }
      if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      }
      if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_ERROR_REPORTS));
      }
    } catch (e) {
      console.error('Storage initialization failed:', e);
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // Helper to parse JSON
  private get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Failed to load ${key}:`, e);
      return defaultValue;
    }
  }

  // Helper to set JSON
  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify();
    } catch (e) {
      console.error(`Failed to save ${key}:`, e);
    }
  }

  // --- CURRENT SESSION USER ---
  public getCurrentUser(): User | null {
    return this.get<User | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]); // Default to admin for instant preview or null
  }

  public setCurrentUser(user: User | null): void {
    if (user) {
      user.last_login = new Date().toISOString();
      this.updateUser(user);
    }
    this.set(STORAGE_KEYS.CURRENT_USER, user);
  }

  public logout(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.notify();
  }

  public getSoundEnabled(): boolean {
    return this.get<boolean>(STORAGE_KEYS.SOUND_ENABLED, true);
  }

  public setSoundEnabled(enabled: boolean): void {
    this.set(STORAGE_KEYS.SOUND_ENABLED, enabled);
  }

  // --- USERS ---
  public getUsers(): User[] {
    return this.get<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public addUser(user: Omit<User, 'id' | 'created_at'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: `usr-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    users.unshift(newUser);
    this.set(STORAGE_KEYS.USERS, users);
    return newUser;
  }

  public updateUser(user: User): void {
    const users = this.getUsers().map((u) => (u.id === user.id ? user : u));
    this.set(STORAGE_KEYS.USERS, users);
  }

  public deleteUser(id: string): void {
    const users = this.getUsers().filter((u) => u.id !== id);
    this.set(STORAGE_KEYS.USERS, users);
  }

  // --- STAFF ---
  public getStaff(): Staff[] {
    return this.get<Staff[]>(STORAGE_KEYS.STAFF, INITIAL_STAFF);
  }

  public addStaff(staffData: Omit<Staff, 'id' | 'created_at'>): Staff {
    const staffList = this.getStaff();
    const newStaff: Staff = {
      ...staffData,
      id: `st-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    staffList.unshift(newStaff);
    this.set(STORAGE_KEYS.STAFF, staffList);
    return newStaff;
  }

  public updateStaff(staff: Staff): void {
    const staffList = this.getStaff().map((s) => (s.id === staff.id ? staff : s));
    this.set(STORAGE_KEYS.STAFF, staffList);
  }

  public deleteStaff(id: string): void {
    const staffList = this.getStaff().filter((s) => s.id !== id);
    this.set(STORAGE_KEYS.STAFF, staffList);
  }

  public toggleStaffStatus(id: string): void {
    const staffList = this.getStaff().map((s) => {
      if (s.id === id) {
        return { ...s, status: s.status === 'aktif' ? ('nonaktif' as const) : ('aktif' as const) };
      }
      return s;
    });
    this.set(STORAGE_KEYS.STAFF, staffList);
  }

  // --- SITES ---
  public getSites(): Site[] {
    return this.get<Site[]>(STORAGE_KEYS.SITES, INITIAL_SITES);
  }

  public addSite(siteData: Omit<Site, 'id' | 'created_at'>): Site {
    const sites = this.getSites();
    const newSite: Site = {
      ...siteData,
      id: `site-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    sites.push(newSite);
    this.set(STORAGE_KEYS.SITES, sites);
    return newSite;
  }

  public updateSite(site: Site): void {
    const sites = this.getSites().map((s) => (s.id === site.id ? site : s));
    this.set(STORAGE_KEYS.SITES, sites);
  }

  public deleteSite(id: string): void {
    const sites = this.getSites().filter((s) => s.id !== id);
    this.set(STORAGE_KEYS.SITES, sites);
  }

  public toggleSiteStatus(id: string): void {
    const sites = this.getSites().map((s) => {
      if (s.id === id) {
        return { ...s, status: s.status === 'aktif' ? ('nonaktif' as const) : ('aktif' as const) };
      }
      return s;
    });
    this.set(STORAGE_KEYS.SITES, sites);
  }

  // --- CATEGORIES ---
  public getCategories(): ErrorCategory[] {
    return this.get<ErrorCategory[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }

  public addCategory(catData: Omit<ErrorCategory, 'id' | 'created_at'>): ErrorCategory {
    const categories = this.getCategories();
    const newCat: ErrorCategory = {
      ...catData,
      id: `cat-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    categories.push(newCat);
    this.set(STORAGE_KEYS.CATEGORIES, categories);
    return newCat;
  }

  public updateCategory(cat: ErrorCategory): void {
    const categories = this.getCategories().map((c) => (c.id === cat.id ? cat : c));
    this.set(STORAGE_KEYS.CATEGORIES, categories);
  }

  public deleteCategory(id: string): void {
    const categories = this.getCategories().filter((c) => c.id !== id);
    this.set(STORAGE_KEYS.CATEGORIES, categories);
  }

  // --- ERROR REPORTS ---
  public getReports(): ErrorReport[] {
    return this.get<ErrorReport[]>(STORAGE_KEYS.REPORTS, INITIAL_ERROR_REPORTS);
  }

  public generateNextReportNumber(dateStr?: string): string {
    const today = dateStr || new Date().toISOString().split('T')[0];
    const cleanDate = today.replace(/-/g, '');
    const reports = this.getReports();

    // Filter reports from the same day
    const sameDayReports = reports.filter((r) => r.tanggal === today);
    const count = sameDayReports.length + 1;
    const formattedCount = String(count).padStart(4, '0');

    return `ERR-${cleanDate}-${formattedCount}`;
  }

  public addReport(
    reportData: Omit<ErrorReport, 'id' | 'nomor_laporan' | 'created_at' | 'updated_at'>
  ): ErrorReport {
    const reports = this.getReports();
    const nomor_laporan = this.generateNextReportNumber(reportData.tanggal);
    const now = new Date().toISOString();

    const newReport: ErrorReport = {
      ...reportData,
      id: `err-${Date.now()}`,
      nomor_laporan,
      created_at: now,
      updated_at: now
    };

    reports.unshift(newReport);
    this.set(STORAGE_KEYS.REPORTS, reports);
    return newReport;
  }

  public addReportsBatch(
    reportsDataList: Omit<ErrorReport, 'id' | 'nomor_laporan' | 'created_at' | 'updated_at'>[]
  ): ErrorReport[] {
    const reports = this.getReports();
    const createdReports: ErrorReport[] = [];
    const baseTime = Date.now();

    // Loop through each item to generate correct sequential report numbers
    reportsDataList.forEach((data, index) => {
      const today = data.tanggal;
      const cleanDate = today.replace(/-/g, '');
      const sameDayCount = reports.filter((r) => r.tanggal === today).length + 1;
      const formattedCount = String(sameDayCount).padStart(4, '0');
      const nomor_laporan = `ERR-${cleanDate}-${formattedCount}`;
      const nowIso = new Date().toISOString();

      const newReport: ErrorReport = {
        ...data,
        id: `err-${baseTime}-${index}-${Math.random().toString(36).substring(2, 6)}`,
        nomor_laporan,
        created_at: nowIso,
        updated_at: nowIso
      };

      reports.unshift(newReport);
      createdReports.push(newReport);
    });

    this.set(STORAGE_KEYS.REPORTS, reports);
    return createdReports;
  }

  public updateReport(report: ErrorReport): void {
    const reports = this.getReports().map((r) => {
      if (r.id === report.id) {
        return {
          ...report,
          updated_at: new Date().toISOString()
        };
      }
      return r;
    });
    this.set(STORAGE_KEYS.REPORTS, reports);
  }

  public updateReportStatus(
    id: string,
    status: ErrorStatus,
    catatan_admin?: string,
    diselesaikan_oleh?: string
  ): void {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const reports = this.getReports().map((r) => {
      if (r.id === id) {
        const updated: ErrorReport = {
          ...r,
          status,
          updated_at: now.toISOString()
        };
        if (catatan_admin !== undefined) {
          updated.catatan_admin = catatan_admin;
        }
        if (status === 'Selesai') {
          updated.diselesaikan_oleh = diselesaikan_oleh || 'Administrator';
          updated.tanggal_selesai = dateStr;
          updated.jam_selesai = timeStr;
        }
        return updated;
      }
      return r;
    });
    this.set(STORAGE_KEYS.REPORTS, reports);
  }

  public deleteReport(id: string): void {
    const reports = this.getReports().filter((r) => r.id !== id);
    this.set(STORAGE_KEYS.REPORTS, reports);
  }

  // --- SYSTEM UTILS & BACKUP ---
  public resetToSeedData(): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(INITIAL_STAFF));
    localStorage.setItem(STORAGE_KEYS.SITES, JSON.stringify(INITIAL_SITES));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(INITIAL_ERROR_REPORTS));
    this.notify();
  }

  public exportBackupJSON(): string {
    const backupData = {
      users: this.getUsers(),
      staff: this.getStaff(),
      sites: this.getSites(),
      categories: this.getCategories(),
      reports: this.getReports(),
      exported_at: new Date().toISOString()
    };
    return JSON.stringify(backupData, null, 2);
  }

  public importBackupJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.users && data.staff && data.sites && data.categories && data.reports) {
        this.set(STORAGE_KEYS.USERS, data.users);
        this.set(STORAGE_KEYS.STAFF, data.staff);
        this.set(STORAGE_KEYS.SITES, data.sites);
        this.set(STORAGE_KEYS.CATEGORIES, data.categories);
        this.set(STORAGE_KEYS.REPORTS, data.reports);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }
}

export const storage = new StorageService();
