import React, { useState } from 'react';
import { Globe, Plus, Edit2, Trash2, Power, X } from 'lucide-react';
import { Site, User } from '../../types';
import { storage } from '../../services/storage';

interface DataSitusViewProps {
  sitesList: Site[];
  currentUser: User | null;
  onSuccess: (msg: string) => void;
}

export const DataSitusView: React.FC<DataSitusViewProps> = ({
  sitesList,
  currentUser,
  onSuccess
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const isSupervisor = currentUser?.role === 'supervisor';
  const canManage = isAdmin || isSupervisor;
  const canDelete = isAdmin;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);

  const [namaSitus, setNamaSitus] = useState('');
  const [kodeSitus, setKodeSitus] = useState('');

  const handleOpenAdd = () => {
    setNamaSitus('');
    setKodeSitus('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (site: Site) => {
    setEditingSite(site);
    setNamaSitus(site.nama_situs);
    setKodeSitus(site.kode_situs);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaSitus) return;

    storage.addSite({
      nama_situs: namaSitus.toUpperCase(),
      kode_situs: kodeSitus.toUpperCase() || namaSitus.substring(0, 3).toUpperCase(),
      status: 'aktif'
    });

    onSuccess(`Situs ${namaSitus} berhasil ditambahkan.`);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSite) return;

    storage.updateSite({
      ...editingSite,
      nama_situs: namaSitus.toUpperCase(),
      kode_situs: kodeSitus.toUpperCase()
    });

    onSuccess(`Data situs ${namaSitus} berhasil diperbarui.`);
    setEditingSite(null);
  };

  const handleToggleStatus = (site: Site) => {
    storage.toggleSiteStatus(site.id);
    onSuccess(
      `Status situs ${site.nama_situs} diubah menjadi ${
        site.status === 'aktif' ? 'Nonaktif' : 'Aktif'
      }.`
    );
  };

  const handleDeleteSite = (site: Site) => {
    if (confirm(`Apakah Anda yakin ingin menghapus situs ${site.nama_situs}?`)) {
      storage.deleteSite(site.id);
      onSuccess(`Situs ${site.nama_situs} berhasil dihapus.`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="p-5 rounded-2xl glass-panel-gold border border-[#D4AF37]/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black gold-gradient-text uppercase tracking-wider flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#D4AF37]" /> DATA SITUS OPERASIONAL
          </h2>
          <p className="text-xs text-[#F5E6C8]/80 mt-1">
            Kelola daftar situs yang dipantau (TOGELON, JUATWANBET, LIGABANDOT, dll).
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="px-5 py-3 rounded-xl gold-gradient-bg text-[#08110A] font-extrabold text-xs uppercase tracking-wider shadow-xl hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> + TAMBAH SITUS
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sitesList.map((site) => (
          <div
            key={site.id}
            className="p-6 rounded-3xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-xl flex flex-col justify-between space-y-4 hover:border-[#D4AF37]/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                  KODE: {site.kode_situs}
                </span>
                <h3 className="text-xl font-black text-[#F5E6C8] mt-0.5">{site.nama_situs}</h3>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                  site.status === 'aktif'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}
              >
                {site.status.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D4AF37]/10">
              {canManage && (
                <>
                  <button
                    onClick={() => handleToggleStatus(site)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      site.status === 'aktif'
                        ? 'bg-red-900/30 text-red-300 border-red-500/30'
                        : 'bg-emerald-900/30 text-emerald-300 border-emerald-500/30'
                    }`}
                    title={site.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(site)}
                    className="p-2 rounded-xl bg-[#102A0B] text-amber-300 border border-amber-500/30 cursor-pointer"
                    title="Edit Situs"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </>
              )}

              {canDelete && (
                <button
                  onClick={() => handleDeleteSite(site)}
                  className="p-2 rounded-xl bg-red-900/30 text-red-300 border border-red-500/30 cursor-pointer"
                  title="Hapus Situs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {!canManage && !canDelete && (
                <span className="text-[11px] text-[#F5E6C8]/40 italic">Akses Read-Only</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT MODAL */}
      {(isAddModalOpen || editingSite) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08110A]/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#0F2012] border border-[#D4AF37]/40 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
              <h3 className="text-base font-extrabold gold-gradient-text uppercase">
                {editingSite ? 'EDIT SITUS' : 'TAMBAH SITUS BARU'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingSite(null);
                }}
                className="p-2 rounded-xl text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={editingSite ? handleSaveEdit : handleSaveAdd}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[#D4AF37] font-bold mb-1">Nama Situs *</label>
                <input
                  type="text"
                  required
                  value={namaSitus}
                  onChange={(e) => setNamaSitus(e.target.value)}
                  placeholder="Contoh: LIGABANDOT"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8] uppercase"
                />
              </div>

              <div>
                <label className="block text-[#D4AF37] font-bold mb-1">Kode Situs</label>
                <input
                  type="text"
                  value={kodeSitus}
                  onChange={(e) => setKodeSitus(e.target.value)}
                  placeholder="Contoh: LBD"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8] uppercase font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingSite(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#102A0B] text-[#F5E6C8]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl gold-gradient-bg text-[#08110A] font-extrabold uppercase"
                >
                  Simpan Situs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
