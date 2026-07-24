import React, { useState } from 'react';
import { Tag, Plus, Edit2, Trash2, X } from 'lucide-react';
import { ErrorCategory, User } from '../../types';
import { storage } from '../../services/storage';

interface KategoriKesalahanViewProps {
  categoriesList: ErrorCategory[];
  currentUser: User | null;
  onSuccess: (msg: string) => void;
}

export const KategoriKesalahanView: React.FC<KategoriKesalahanViewProps> = ({
  categoriesList,
  currentUser,
  onSuccess
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const isSupervisor = currentUser?.role === 'supervisor';
  const canManage = isAdmin || isSupervisor;
  const canDelete = isAdmin;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ErrorCategory | null>(null);

  const [namaKategori, setNamaKategori] = useState('');
  const [deskripsi, setDeskripsi] = useState('');

  const handleOpenAdd = () => {
    setNamaKategori('');
    setDeskripsi('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cat: ErrorCategory) => {
    setEditingCategory(cat);
    setNamaKategori(cat.nama_kategori);
    setDeskripsi(cat.deskripsi);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKategori) return;

    storage.addCategory({
      nama_kategori: namaKategori,
      deskripsi: deskripsi || 'Deskripsi kategori kesalahan',
      status: 'aktif'
    });

    onSuccess(`Kategori "${namaKategori}" berhasil ditambahkan.`);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    storage.updateCategory({
      ...editingCategory,
      nama_kategori: namaKategori,
      deskripsi
    });

    onSuccess(`Kategori "${namaKategori}" berhasil diperbarui.`);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (cat: ErrorCategory) => {
    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${cat.nama_kategori}"?`)) {
      storage.deleteCategory(cat.id);
      onSuccess(`Kategori "${cat.nama_kategori}" berhasil dihapus.`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="p-5 rounded-2xl glass-panel-gold border border-[#D4AF37]/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black gold-gradient-text uppercase tracking-wider flex items-center gap-2">
            <Tag className="w-6 h-6 text-[#D4AF37]" /> KATEGORI KESALAHAN STAFF
          </h2>
          <p className="text-xs text-[#F5E6C8]/80 mt-1">
            Daftar acuan klasifikasi kesalahan operasional untuk pengkategorian laporan.
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="px-5 py-3 rounded-xl gold-gradient-bg text-[#08110A] font-extrabold text-xs uppercase tracking-wider shadow-xl hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> + TAMBAH KATEGORI
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoriesList.map((cat, index) => (
          <div
            key={cat.id}
            className="p-5 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-xl flex flex-col justify-between space-y-3 hover:border-[#D4AF37]/50 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold text-[#D4AF37] font-mono bg-[#102A0B] px-2 py-0.5 rounded border border-[#D4AF37]/30">
                  KATEGORI #{index + 1}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#F5E6C8]">{cat.nama_kategori}</h3>
              <p className="text-xs text-[#F5E6C8]/70 mt-1.5 leading-relaxed">{cat.deskripsi}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D4AF37]/10">
              {canManage && (
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1.5 rounded-lg bg-[#102A0B] text-amber-300 border border-amber-500/30 cursor-pointer"
                  title="Edit Kategori"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}

              {canDelete && (
                <button
                  onClick={() => handleDeleteCategory(cat)}
                  className="p-1.5 rounded-lg bg-red-900/30 text-red-300 border border-red-500/30 cursor-pointer"
                  title="Hapus Kategori"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
      {(isAddModalOpen || editingCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08110A]/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#0F2012] border border-[#D4AF37]/40 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/20 pb-4">
              <h3 className="text-base font-extrabold gold-gradient-text uppercase">
                {editingCategory ? 'EDIT KATEGORI' : 'TAMBAH KATEGORI'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCategory(null);
                }}
                className="p-2 rounded-xl text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={editingCategory ? handleSaveEdit : handleSaveAdd}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[#D4AF37] font-bold mb-1">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  value={namaKategori}
                  onChange={(e) => setNamaKategori(e.target.value)}
                  placeholder="Contoh: Salah Prosedur"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8]"
                />
              </div>

              <div>
                <label className="block text-[#D4AF37] font-bold mb-1">Deskripsi Kategori</label>
                <textarea
                  rows={3}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Penjelasan singkat indikator kesalahan ini..."
                  className="w-full p-3 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D4AF37]/20">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#102A0B] text-[#F5E6C8]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl gold-gradient-bg text-[#08110A] font-extrabold uppercase"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
