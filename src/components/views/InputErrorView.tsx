import React, { useState, useEffect } from 'react';
import {
  FilePlus,
  RotateCcw,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Calendar,
  Clock,
  Building2,
  FileText,
  Zap,
  Sparkles,
  Clipboard,
  Check,
  Layers,
  Trash2,
  Edit2,
  Plus,
  ArrowRight,
  ListChecks,
  ExternalLink
} from 'lucide-react';
import { Staff, Site, ErrorCategory, ErrorSeverity, User, ErrorReport } from '../../types';
import { storage } from '../../services/storage';

interface InputErrorViewProps {
  staffList: Staff[];
  sitesList: Site[];
  categoriesList: ErrorCategory[];
  currentUser: User | null;
  onSuccess: (message: string) => void;
}

export interface ParsedBatchItem {
  id: string;
  nama_staff: string;
  id_staff: string;
  situs: string;
  kategori_kesalahan: string;
  tingkat_kesalahan: ErrorSeverity;
  deskripsi_kesalahan: string;
  link_bukti: string;
  rawLine: string;
}

const SAMPLE_BULK_INPUT = `AYU EKLIN SIHITE E1475795\thttps://prnt.sc/teh5g6kGVcx4\tAsal spam pk
AYU EKLIN SIHITE E1475795\thttps://prnt.sc/pKe2UocFhdJZ\tNote
AYU EKLIN SIHITE E1475795\thttps://prnt.sc/LUianQ0fYDym\tTidak membantu / menyelesaikan kendala dengan benar
AYU EKLIN SIHITE E1475795\thttps://prnt.sc/m4T5Oz2FVksw\tTidak respon
ME CHI X7996838\thttps://prnt.sc/NIvHmpYSzKDQ\tTidak respon
MICHAEL LAYASTA GINTING E2085319\thttps://prnt.sc/F5Ix4ZSxgR51\tNote Pengecekkan tidak berujung
MICHAEL LAYASTA GINTING E2085319\thttps://prnt.sc/UDQhS5AJt8jP\tNote Pengecekkan tidak berujung
MICHAEL LAYASTA GINTING E2085319\thttps://prnt.sc/5ueyHV2lHjf0\tSalah respon
MICHAEL LAYASTA GINTING E2085319\thttps://prnt.sc/pVPfzW-BiNyy\tTidak membantu / menyelesaikan kendala dengan benar
RIZKY TARUNA E0573945\thttps://prnt.sc/1oMgjZpde8vS\tNote Pengecekkan tidak berujung
SIWA RAJ C9035262\thttps://prnt.sc/pQsUpQVF7fkT\tAsal spam pk
YITACHI E9519230\thttps://prnt.sc/wYnvEl_I5rWT\tNote Pengecekkan tidak berujung
YITACHI E9519230\thttps://prnt.sc/aLmFGChPs_68\tNote Pengecekkan tidak berujung
YITACHI E9519230\thttps://prnt.sc/mle5qOtvtS4M\tTidak respon
YITACHI E9519230\thttps://prnt.sc/wqFr52J52HQW\tTidak respon
YITACHI E9519230\thttps://prnt.sc/pJsTYb0VoLnE\tTidak respon`;

export const InputErrorView: React.FC<InputErrorViewProps> = ({
  staffList,
  sitesList,
  categoriesList,
  currentUser,
  onSuccess
}) => {
  const activeStaff = staffList.filter((s) => s.status === 'aktif');
  const activeSites = sitesList.filter((s) => s.status === 'aktif');
  const activeCats = categoriesList.filter((c) => c.status === 'aktif');

  // Default Date and Time
  const now = new Date();
  const defaultDate = now.toISOString().split('T')[0];
  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  // Mode: 'single' (1 per 1) or 'batch' (massal)
  const [inputMode, setInputMode] = useState<'single' | 'batch'>('single');

  // Single Input Form States
  const [tanggal, setTanggal] = useState(defaultDate);
  const [jam, setJam] = useState(defaultTime);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [namaStaff, setNamaStaff] = useState('');
  const [idStaff, setIdStaff] = useState('');
  const [situs, setSitus] = useState('');
  const [kategoriKesalahan, setKategoriKesalahan] = useState('');
  const [tingkatKesalahan, setTingkatKesalahan] = useState<ErrorSeverity>('Sedang');
  const [deskripsiKesalahan, setDeskripsiKesalahan] = useState('');
  const [linkBukti, setLinkBukti] = useState('');
  const [buktiScreenshot, setBuktiScreenshot] = useState<string>('');
  const [catatanAdmin, setCatatanAdmin] = useState('');

  // Quick Paste Single State
  const [quickPasteText, setQuickPasteText] = useState('');
  const [pasteStatus, setPasteStatus] = useState<string | null>(null);

  // Bulk / Batch Input States
  const [bulkRawText, setBulkRawText] = useState('');
  const [batchSiteOverride, setBatchSiteOverride] = useState('');
  const [batchCatOverride, setBatchCatOverride] = useState('');
  const [parsedBatchItems, setParsedBatchItems] = useState<ParsedBatchItem[]>([]);
  const [editingBatchIndex, setEditingBatchIndex] = useState<number | null>(null);
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string | null>(null);

  // Generated Next Report Number preview
  const [nextReportNo, setNextReportNo] = useState('');

  useEffect(() => {
    setNextReportNo(storage.generateNextReportNumber(tanggal));
  }, [tanggal]);

  // --- SINGLE PASTE PROCESSOR ---
  const processQuickPaste = (inputText: string) => {
    if (!inputText.trim()) {
      setPasteStatus(null);
      return;
    }

    // Check if multi-line pasted -> switch to batch mode automatically
    if (inputText.includes('\n')) {
      setInputMode('batch');
      setBulkRawText(inputText);
      processBatchText(inputText, batchSiteOverride, batchCatOverride);
      return;
    }

    const text = inputText.trim();

    // 1. Detect URL
    const urlRegex = /(https?:\/\/[^\s\t]+|prnt\.sc\/[^\s\t]+|imgur\.com\/[^\s\t]+|drive\.google\.com\/[^\s\t]+)/gi;
    const urlMatches = text.match(urlRegex);
    let extractedUrl = '';
    if (urlMatches && urlMatches.length > 0) {
      extractedUrl = urlMatches[0];
      if (!extractedUrl.startsWith('http://') && !extractedUrl.startsWith('https://')) {
        extractedUrl = 'https://' + extractedUrl;
      }
    }

    let parts: string[] = [];
    if (text.includes('\t')) {
      parts = text.split('\t').map((p) => p.trim()).filter(Boolean);
    } else if (text.includes('|')) {
      parts = text.split('|').map((p) => p.trim()).filter(Boolean);
    } else {
      parts = [text];
    }

    let foundStaff: Staff | undefined;
    let extractedStaffName = '';
    let extractedStaffId = '';
    let extractedDesc = '';

    for (const s of activeStaff) {
      const matchId = s.id_staff && text.toLowerCase().includes(s.id_staff.toLowerCase());
      const matchName = s.nama_staff && text.toLowerCase().includes(s.nama_staff.toLowerCase());
      if (matchId || matchName) {
        foundStaff = s;
        break;
      }
    }

    if (parts.length >= 2) {
      parts.forEach((part) => {
        if (part.match(urlRegex)) {
          // URL
        } else {
          let isStaffPart = false;
          for (const s of activeStaff) {
            if (
              (s.id_staff && part.toLowerCase().includes(s.id_staff.toLowerCase())) ||
              (s.nama_staff && part.toLowerCase().includes(s.nama_staff.toLowerCase()))
            ) {
              foundStaff = s;
              isStaffPart = true;
              break;
            }
          }

          if (!isStaffPart) {
            const idPatternMatch = part.match(/([A-Za-z0-9]{5,12})$/);
            if (!foundStaff && idPatternMatch && !extractedStaffName) {
              extractedStaffId = idPatternMatch[1];
              extractedStaffName = part.replace(idPatternMatch[1], '').trim();
            } else if (!extractedDesc) {
              extractedDesc = part;
            } else {
              extractedDesc += ' ' + part;
            }
          }
        }
      });
    }

    if (!extractedDesc) {
      let cleaned = text;
      if (extractedUrl) cleaned = cleaned.replace(urlRegex, '');
      if (foundStaff) {
        cleaned = cleaned.replace(new RegExp(foundStaff.nama_staff, 'gi'), '');
        cleaned = cleaned.replace(new RegExp(foundStaff.id_staff, 'gi'), '');
      } else if (extractedStaffId) {
        cleaned = cleaned.replace(extractedStaffId, '');
        if (extractedStaffName) cleaned = cleaned.replace(extractedStaffName, '');
      }
      cleaned = cleaned.replace(/[\t|]+/g, ' ').replace(/\s+/g, ' ').trim();
      extractedDesc = cleaned;
    }

    if (foundStaff) {
      setSelectedStaffId(foundStaff.id);
      setNamaStaff(foundStaff.nama_staff);
      setIdStaff(foundStaff.id_staff);
      setSitus(foundStaff.situs);
    } else if (extractedStaffName || extractedStaffId) {
      setNamaStaff(extractedStaffName || 'Staff CS');
      setIdStaff(extractedStaffId || 'ID-AUTO');
      if (activeSites.length > 0 && !situs) {
        setSitus(activeSites[0].nama_situs);
      }
    }

    if (extractedUrl) setLinkBukti(extractedUrl);
    if (extractedDesc) {
      setDeskripsiKesalahan(extractedDesc);
      const descLower = extractedDesc.toLowerCase();
      const matchedCat = activeCats.find((c) =>
        descLower.includes(c.nama_kategori.toLowerCase())
      );
      if (matchedCat) {
        setKategoriKesalahan(matchedCat.nama_kategori);
      } else if (activeCats.length > 0 && !kategoriKesalahan) {
        setKategoriKesalahan(activeCats[0].nama_kategori);
      }
    }

    const matchedStaffLabel = foundStaff
      ? `${foundStaff.nama_staff} (${foundStaff.id_staff})`
      : extractedStaffName
      ? `${extractedStaffName} (${extractedStaffId})`
      : 'Tersambung';

    setPasteStatus(
      `Form Berhasil Diisi! Staff: ${matchedStaffLabel} | Link: ${extractedUrl ? 'Terdeteksi' : 'Tidak ada'}`
    );
  };

  // --- BATCH MULTI-LINE PROCESSOR ---
  const processBatchText = (text: string, siteOverride = batchSiteOverride, catOverride = batchCatOverride) => {
    if (!text.trim()) {
      setParsedBatchItems([]);
      return;
    }

    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const urlRegex = /(https?:\/\/[^\s]+|prnt\.sc\/[^\s]+|imgur\.com\/[^\s]+|drive\.google\.com\/[^\s]+)/gi;

    const items: ParsedBatchItem[] = lines.map((line, idx) => {
      let parts: string[] = [];
      if (line.includes('\t')) {
        parts = line.split('\t').map((p) => p.trim()).filter(Boolean);
      } else if (line.includes('|')) {
        parts = line.split('|').map((p) => p.trim()).filter(Boolean);
      } else {
        parts = [line];
      }

      let urlFound = '';
      let staffNameFound = '';
      let staffIdFound = '';
      let descFound = '';

      // Extract URL
      const urlMatches = line.match(urlRegex);
      if (urlMatches && urlMatches.length > 0) {
        urlFound = urlMatches[0];
        if (!urlFound.startsWith('http://') && !urlFound.startsWith('https://')) {
          urlFound = 'https://' + urlFound;
        }
      }

      // Check staff database match
      const matchedStaff = activeStaff.find(
        (s) =>
          (s.id_staff && line.toLowerCase().includes(s.id_staff.toLowerCase())) ||
          (s.nama_staff && line.toLowerCase().includes(s.nama_staff.toLowerCase()))
      );

      if (parts.length >= 3) {
        const part0 = parts[0];
        const part1 = parts[1];
        const part2 = parts.slice(2).join(' ');

        if (part1.match(urlRegex)) {
          urlFound = part1;
          if (!urlFound.startsWith('http://') && !urlFound.startsWith('https://')) {
            urlFound = 'https://' + urlFound;
          }
        }
        descFound = part2;

        if (matchedStaff) {
          staffNameFound = matchedStaff.nama_staff;
          staffIdFound = matchedStaff.id_staff;
        } else {
          const idMatch = part0.match(/([A-Za-z0-9]{5,12})$/);
          if (idMatch) {
            staffIdFound = idMatch[1];
            staffNameFound = part0.replace(idMatch[1], '').trim();
          } else {
            staffNameFound = part0;
            staffIdFound = 'ID-AUTO';
          }
        }
      } else if (parts.length === 2) {
        const part0 = parts[0];
        const part1 = parts[1];

        if (part1.match(urlRegex)) {
          urlFound = part1;
          if (!urlFound.startsWith('http://') && !urlFound.startsWith('https://')) {
            urlFound = 'https://' + urlFound;
          }
        } else {
          descFound = part1;
        }

        if (matchedStaff) {
          staffNameFound = matchedStaff.nama_staff;
          staffIdFound = matchedStaff.id_staff;
        } else {
          const idMatch = part0.match(/([A-Za-z0-9]{5,12})$/);
          if (idMatch) {
            staffIdFound = idMatch[1];
            staffNameFound = part0.replace(idMatch[1], '').trim();
          } else {
            staffNameFound = part0;
            staffIdFound = 'ID-AUTO';
          }
        }
      } else {
        if (matchedStaff) {
          staffNameFound = matchedStaff.nama_staff;
          staffIdFound = matchedStaff.id_staff;
        } else {
          const idMatch = line.match(/([A-Za-z0-9]{5,12})/);
          if (idMatch) {
            staffIdFound = idMatch[1];
            staffNameFound = line.replace(idMatch[1], '').replace(urlRegex, '').trim();
          } else {
            staffNameFound = 'Staff CS';
            staffIdFound = 'ID-AUTO';
          }
        }
        let cleanLine = line.replace(urlRegex, '');
        if (staffNameFound) cleanLine = cleanLine.replace(staffNameFound, '');
        if (staffIdFound) cleanLine = cleanLine.replace(staffIdFound, '');
        descFound = cleanLine.replace(/[\t|]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Detail kesalahan';
      }

      // Determine Situs
      const finalSitus =
        siteOverride ||
        matchedStaff?.situs ||
        (activeSites.length > 0 ? activeSites[0].nama_situs : 'LIGABANDOT');

      // Category detection
      let finalCat = catOverride;
      if (!finalCat) {
        const descLower = (descFound + ' ' + line).toLowerCase();
        const matchedCategory = activeCats.find((c) =>
          descLower.includes(c.nama_kategori.toLowerCase())
        );
        if (matchedCategory) {
          finalCat = matchedCategory.nama_kategori;
        } else {
          finalCat = activeCats[0]?.nama_kategori || 'Kinerja CS';
        }
      }

      return {
        id: `parsed-${idx}-${Date.now()}`,
        nama_staff: staffNameFound || 'STAFF CS',
        id_staff: staffIdFound || 'E10000',
        situs: finalSitus,
        kategori_kesalahan: finalCat,
        tingkat_kesalahan: 'Sedang' as ErrorSeverity,
        deskripsi_kesalahan: descFound || 'Detail kesalahan',
        link_bukti: urlFound,
        rawLine: line
      };
    });

    setParsedBatchItems(items);
  };

  // Image Upload File Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setBuktiScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetSingle = () => {
    setTanggal(defaultDate);
    setJam(defaultTime);
    setSelectedStaffId('');
    setNamaStaff('');
    setIdStaff('');
    setSitus('');
    setKategoriKesalahan('');
    setTingkatKesalahan('Sedang');
    setDeskripsiKesalahan('');
    setLinkBukti('');
    setBuktiScreenshot('');
    setCatatanAdmin('');
    setQuickPasteText('');
    setPasteStatus(null);
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaStaff || !idStaff) {
      alert('Silakan isi Nama dan ID Staff.');
      return;
    }
    if (!situs) {
      alert('Silakan pilih Situs.');
      return;
    }
    if (!kategoriKesalahan) {
      alert('Silakan pilih Kategori Kesalahan.');
      return;
    }
    if (!deskripsiKesalahan.trim()) {
      alert('Deskripsi kesalahan tidak boleh kosong.');
      return;
    }

    const reportData = {
      tanggal,
      jam,
      nama_staff: namaStaff,
      id_staff: idStaff,
      situs,
      kategori_kesalahan: kategoriKesalahan,
      tingkat_kesalahan: tingkatKesalahan,
      deskripsi_kesalahan: deskripsiKesalahan,
      link_bukti: linkBukti,
      bukti_screenshot: buktiScreenshot,
      nama_pelapor: currentUser?.nama || 'Administrator',
      status: 'Belum Ditangani' as const,
      catatan_admin: catatanAdmin
    };

    storage.addReport(reportData);
    onSuccess(`Data kesalahan berhasil disimpan dengan nomor ${nextReportNo}.`);
    handleResetSingle();
  };

  // Submit Batch Reports
  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (parsedBatchItems.length === 0) {
      alert('Belum ada data kesalahan yang diekstrak. Silakan tempel data terlebih dahulu.');
      return;
    }

    const reportsToSave = parsedBatchItems.map((item) => ({
      tanggal,
      jam,
      nama_staff: item.nama_staff,
      id_staff: item.id_staff,
      situs: item.situs,
      kategori_kesalahan: item.kategori_kesalahan,
      tingkat_kesalahan: item.tingkat_kesalahan,
      deskripsi_kesalahan: item.deskripsi_kesalahan,
      link_bukti: item.link_bukti,
      bukti_screenshot: '',
      nama_pelapor: currentUser?.nama || 'Administrator',
      status: 'Belum Ditangani' as const,
      catatan_admin: 'Input Massal'
    }));

    const saved = storage.addReportsBatch(reportsToSave);
    const count = saved.length;
    onSuccess(`Berhasil menyimpan ${count} laporan kesalahan sekaligus!`);

    setBulkRawText('');
    setParsedBatchItems([]);
    setBulkSuccessMsg(`🎉 ${count} Laporan Kesalahan Berhasil Disimpan Sekaligus!`);
    setTimeout(() => setBulkSuccessMsg(null), 5000);
  };

  const handleRemoveBatchItem = (index: number) => {
    setParsedBatchItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateBatchItem = (index: number, field: keyof ParsedBatchItem, value: any) => {
    setParsedBatchItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in pb-12">
      {/* HEADER CARD */}
      <div className="p-6 rounded-2xl glass-panel-gold border border-[#D4AF37]/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black gold-gradient-text uppercase tracking-wider flex items-center gap-2.5">
            <FilePlus className="w-6 h-6 text-[#D4AF37]" /> FORM INPUT KESALAHAN STAFF
          </h2>
          <p className="text-xs text-[#F5E6C8]/80 mt-1">
            Input laporan kesalahan staff secara langsung 1 per 1 atau input massal sekaligus dari Excel / Chat.
          </p>
        </div>

        <div className="hidden sm:block text-right shrink-0">
          <div className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">
            Nomor Laporan Berikutnya
          </div>
          <div className="text-sm font-extrabold font-mono text-[#F5E6C8] bg-[#102A0B] px-3 py-1 rounded-xl border border-[#D4AF37]/40 inline-block mt-0.5">
            {nextReportNo}
          </div>
        </div>
      </div>

      {currentUser?.role === 'staff' && (
        <div className="p-4 rounded-2xl bg-[#0F2012] border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold flex items-center gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
          <div>
            <strong className="block font-bold uppercase text-white">Perhatian (Akses Role Staff)</strong>
            <span>Role Staff ditujukan untuk melihat laporan kesalahan diri sendiri. Penginputan laporan baru diproses oleh Supervisor atau Admin.</span>
          </div>
        </div>
      )}

      {/* MODE TOGGLE BUTTONS */}
      <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-[#08110A] border border-[#D4AF37]/30 shadow-lg">
        <button
          type="button"
          onClick={() => setInputMode('single')}
          className={`py-3.5 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            inputMode === 'single'
              ? 'gold-gradient-bg text-[#08110A] shadow-xl scale-[1.01]'
              : 'text-[#F5E6C8]/70 hover:text-[#D4AF37] hover:bg-[#102A0B]'
          }`}
        >
          <FilePlus className="w-4 h-4" /> 📝 INPUT SATUAN (1 PER 1)
        </button>

        <button
          type="button"
          onClick={() => setInputMode('batch')}
          className={`py-3.5 px-4 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
            inputMode === 'batch'
              ? 'gold-gradient-bg text-[#08110A] shadow-xl scale-[1.01]'
              : 'text-[#F5E6C8]/70 hover:text-[#D4AF37] hover:bg-[#102A0B]'
          }`}
        >
          <Layers className="w-4 h-4" /> ⚡ INPUT MASSAL (BANYAK SEKALIGUS)
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-400 text-black shadow animate-pulse">
            CEPAT
          </span>
        </button>
      </div>

      {/* ==================== MODE 2: INPUT MASSAL (BATCH) ==================== */}
      {inputMode === 'batch' && (
        <div className="space-y-6 animate-in fade-in">
          {/* BATCH CONFIG & TEXTAREA CARD */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-[#D4AF37]/40 shadow-2xl space-y-6 bg-gradient-to-br from-[#102A0B]/90 via-[#0F2012] to-[#08110A]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#D4AF37]/20">
              <div className="flex items-center gap-3">
                <span className="p-3 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] shadow-lg">
                  <Zap className="w-6 h-6 text-[#D4AF37] animate-pulse" />
                </span>
                <div>
                  <h3 className="text-base font-black text-[#D4AF37] uppercase tracking-wider">
                    INPUT MASSAL KESALAHAN STAFF (SEKALI INPUT BANYAK)
                  </h3>
                  <p className="text-xs text-[#F5E6C8]/80 mt-0.5">
                    Tempel daftar kesalahan bertingkat langsung dari Excel, Chat, atau Catatan.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setBulkRawText(SAMPLE_BULK_INPUT);
                  processBatchText(SAMPLE_BULK_INPUT, batchSiteOverride, batchCatOverride);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#102A0B] hover:bg-[#1B4D1A] border border-[#D4AF37]/40 text-[#D4AF37] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shrink-0 transition-all shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5" /> ISI CONTOH DATA (16 DATA)
              </button>
            </div>

            {/* Batch Common Options: Date, Time, Site Override, Category Override */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#08110A]/80 border border-[#D4AF37]/25">
              <div>
                <label className="block text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Tanggal
                </label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={(e) => {
                    setTanggal(e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2012] border border-[#D4AF37]/30 text-[#F5E6C8] text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Jam
                </label>
                <input
                  type="time"
                  value={jam}
                  onChange={(e) => setJam(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2012] border border-[#D4AF37]/30 text-[#F5E6C8] text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> Default Situs (Opsional)
                </label>
                <select
                  value={batchSiteOverride}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBatchSiteOverride(val);
                    if (bulkRawText) processBatchText(bulkRawText, val, batchCatOverride);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2012] border border-[#D4AF37]/30 text-[#F5E6C8] text-xs focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="">-- Otomatis Mengikuti Staff --</option>
                  {activeSites.map((st) => (
                    <option key={st.id} value={st.nama_situs}>
                      {st.nama_situs}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider mb-1">
                  Default Kategori (Opsional)
                </label>
                <select
                  value={batchCatOverride}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBatchCatOverride(val);
                    if (bulkRawText) processBatchText(bulkRawText, batchSiteOverride, val);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#0F2012] border border-[#D4AF37]/30 text-[#F5E6C8] text-xs focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="">-- Auto Detect dari Text --</option>
                  {activeCats.map((c) => (
                    <option key={c.id} value={c.nama_kategori}>
                      {c.nama_kategori}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TEXTAREA FOR MULTI-LINE PASTE */}
            <div>
              <label className="block text-xs font-extrabold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clipboard className="w-4 h-4" /> Area Tempel Data Massal (Paste Here) *
                </span>
                <span className="text-[11px] text-[#F5E6C8]/60 lowercase font-mono">
                  {bulkRawText.split(/\r?\n/).filter((l) => l.trim()).length} baris terdeteksi
                </span>
              </label>

              <textarea
                rows={9}
                value={bulkRawText}
                onChange={(e) => {
                  setBulkRawText(e.target.value);
                  processBatchText(e.target.value);
                }}
                placeholder={`Tempel baris data kesalahan di sini, contoh format:\nAYU EKLIN SIHITE E1475795\thttps://prnt.sc/teh5g6kGVcx4\tAsal spam pk\nME CHI X7996838\thttps://prnt.sc/NIvHmpYSzKDQ\tTidak respon\nMICHAEL LAYASTA GINTING E2085319\thttps://prnt.sc/F5Ix4ZSxgR51\tNote Pengecekkan tidak berujung`}
                className="w-full p-4 rounded-2xl bg-[#08110A] border-2 border-[#D4AF37]/40 text-[#F5E6C8] font-mono text-xs placeholder:text-[#F5E6C8]/30 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 shadow-inner leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-[#F5E6C8]/70 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Sistem mendukung pemisah Tab (Excel) atau spasi.</span>
              </div>

              {bulkRawText && (
                <button
                  type="button"
                  onClick={() => {
                    setBulkRawText('');
                    setParsedBatchItems([]);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-red-900/30 hover:bg-red-800/50 text-red-300 border border-red-500/30 text-xs font-bold uppercase transition-all cursor-pointer"
                >
                  Bersihkan
                </button>
              )}
            </div>
          </div>

          {/* BULK SUCCESS BANNER */}
          {bulkSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-sm font-bold flex items-center justify-between shadow-xl animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{bulkSuccessMsg}</span>
              </div>
            </div>
          )}

          {/* PREVIEW TABLE OF PARSED ITEMS */}
          {parsedBatchItems.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0F2012] border border-[#D4AF37]/30 shadow-2xl space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#D4AF37]/20">
                <div>
                  <h3 className="text-base font-extrabold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-[#D4AF37]" /> PREVIEW HASIL EKSTRAKSI ({parsedBatchItems.length} LAPORAN)
                  </h3>
                  <p className="text-xs text-[#F5E6C8]/80 mt-0.5">
                    Periksa kembali data yang diekstrak sebelum disimpan ke database.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleBatchSubmit}
                  className="px-7 py-3 rounded-xl gold-gradient-bg text-[#08110A] font-black text-xs uppercase tracking-wider shadow-2xl hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <CheckCircle2 className="w-4.5 h-4.5" /> 🚀 SIMPAN SEMUA ({parsedBatchItems.length} LAPORAN)
                </button>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto rounded-2xl border border-[#D4AF37]/20">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#08110A] text-[#D4AF37] uppercase font-bold text-[11px] tracking-wider border-b border-[#D4AF37]/20">
                      <th className="py-3 px-3 text-center w-10">NO</th>
                      <th className="py-3 px-3">NAMA STAFF</th>
                      <th className="py-3 px-3">ID STAFF</th>
                      <th className="py-3 px-3">SITUS</th>
                      <th className="py-3 px-3">KATEGORI</th>
                      <th className="py-3 px-3">DESKRIPSI KESALAHAN</th>
                      <th className="py-3 px-3">LINK BUKTI</th>
                      <th className="py-3 px-3 text-center w-12">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4AF37]/10 bg-[#08110A]/40 text-[#F5E6C8]">
                    {parsedBatchItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-[#102A0B]/60 transition-colors">
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-[#D4AF37]">
                          {index + 1}
                        </td>

                        {/* NAMA STAFF */}
                        <td className="py-2.5 px-3 font-semibold">
                          <input
                            type="text"
                            value={item.nama_staff}
                            onChange={(e) => handleUpdateBatchItem(index, 'nama_staff', e.target.value)}
                            className="w-full px-2 py-1 rounded bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8] text-xs focus:outline-none focus:border-[#D4AF37]"
                          />
                        </td>

                        {/* ID STAFF */}
                        <td className="py-2.5 px-3 font-mono font-bold text-[#D4AF37]">
                          <input
                            type="text"
                            value={item.id_staff}
                            onChange={(e) => handleUpdateBatchItem(index, 'id_staff', e.target.value)}
                            className="w-24 px-2 py-1 rounded bg-[#08110A] border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-mono font-bold focus:outline-none focus:border-[#D4AF37]"
                          />
                        </td>

                        {/* SITUS */}
                        <td className="py-2.5 px-3">
                          <select
                            value={item.situs}
                            onChange={(e) => handleUpdateBatchItem(index, 'situs', e.target.value)}
                            className="px-2 py-1 rounded bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8] text-xs focus:outline-none"
                          >
                            {activeSites.map((st) => (
                              <option key={st.id} value={st.nama_situs}>
                                {st.nama_situs}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* KATEGORI */}
                        <td className="py-2.5 px-3">
                          <select
                            value={item.kategori_kesalahan}
                            onChange={(e) => handleUpdateBatchItem(index, 'kategori_kesalahan', e.target.value)}
                            className="w-36 px-2 py-1 rounded bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8] text-xs focus:outline-none"
                          >
                            {activeCats.map((c) => (
                              <option key={c.id} value={c.nama_kategori}>
                                {c.nama_kategori}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* DESKRIPSI */}
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={item.deskripsi_kesalahan}
                            onChange={(e) => handleUpdateBatchItem(index, 'deskripsi_kesalahan', e.target.value)}
                            className="w-full px-2 py-1 rounded bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8] text-xs focus:outline-none focus:border-[#D4AF37]"
                          />
                        </td>

                        {/* LINK BUKTI */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={item.link_bukti}
                              onChange={(e) => handleUpdateBatchItem(index, 'link_bukti', e.target.value)}
                              placeholder="https://..."
                              className="w-32 px-2 py-1 rounded bg-[#08110A] border border-[#D4AF37]/30 text-emerald-300 text-[11px] font-mono focus:outline-none"
                            />
                            {item.link_bukti && (
                              <a
                                href={item.link_bukti}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded bg-[#102A0B] text-[#D4AF37] hover:text-white"
                                title="Buka Link"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* DELETE ROW */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveBatchItem(index)}
                            className="p-1.5 rounded-lg bg-red-900/30 hover:bg-red-800/50 text-red-300 border border-red-500/30 transition-all cursor-pointer"
                            title="Hapus Baris Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* BOTTOM SUBMIT BUTTON */}
              <div className="flex items-center justify-between pt-3 border-t border-[#D4AF37]/20">
                <div className="text-xs text-[#F5E6C8]/80">
                  Total: <strong className="text-[#D4AF37]">{parsedBatchItems.length}</strong> Laporan Kesalahan Siap Disimpan
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setParsedBatchItems([]);
                      setBulkRawText('');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#102A0B] hover:bg-[#1B4D1A] text-[#F5E6C8]/80 text-xs font-bold uppercase transition-all cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    type="button"
                    onClick={handleBatchSubmit}
                    className="px-7 py-3 rounded-xl gold-gradient-bg text-[#08110A] font-black text-xs uppercase tracking-wider shadow-2xl hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> 🚀 SIMPAN SEMUA ({parsedBatchItems.length} LAPORAN SEKALIGUS)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== MODE 1: INPUT SATUAN (SINGLE) ==================== */}
      {inputMode === 'single' && (
        <div className="space-y-6 animate-in fade-in">
          {/* QUICK PASTE BOX / SEKALI TEMPEL FOR SINGLE */}
          <div className="p-5 sm:p-6 rounded-3xl glass-panel border border-[#D4AF37]/40 shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#102A0B]/90 via-[#0F2012] to-[#08110A]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] shadow-lg">
                  <Zap className="w-5 h-5 text-[#D4AF37] animate-pulse" />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                    FITUR TEMPEL CEPAT (SEKALI TEMPEL)
                  </h3>
                  <p className="text-[11px] text-[#F5E6C8]/80 mt-0.5">
                    Tempel data langsung dari Excel/Chat. Jika menempel banyak baris, sistem akan otomatis beralih ke Input Massal!
                  </p>
                </div>
              </div>
              <span className="hidden md:inline-flex px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37]">
                Auto-Detect
              </span>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={quickPasteText}
                  onChange={(e) => {
                    setQuickPasteText(e.target.value);
                    processQuickPaste(e.target.value);
                  }}
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData('text');
                    setQuickPasteText(pasted);
                    processQuickPaste(pasted);
                  }}
                  placeholder="Contoh: AYU EKLIN SIHITE E1475795	https://prnt.sc/QRIAeFfLaQ6U	Tidak melakukan pengecekan"
                  className="w-full px-4 py-3.5 pr-28 rounded-2xl bg-[#08110A] border-2 border-[#D4AF37]/50 text-[#F5E6C8] text-sm font-mono placeholder:text-[#F5E6C8]/30 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => processQuickPaste(quickPasteText)}
                  className="absolute right-2 top-2 bottom-2 px-4 rounded-xl gold-gradient-bg text-[#08110A] font-extrabold text-xs uppercase tracking-wider hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" /> TEMPEL
                </button>
              </div>

              {pasteStatus && (
                <div className="p-3 rounded-xl bg-[#102A0B] border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-green-400 shrink-0" />
                  <span>{pasteStatus}</span>
                </div>
              )}

              <div className="text-[11px] text-[#F5E6C8]/70 flex items-center gap-2 pt-0.5">
                <Clipboard className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Format yang didukung: <code className="text-[#D4AF37] bg-[#08110A] px-1.5 py-0.5 rounded border border-[#D4AF37]/20">NAMA_STAFF ID_STAFF [TAB] LINK_BUKTI [TAB] DESKRIPSI</code></span>
              </div>
            </div>
          </div>

          {/* SINGLE FORM */}
          <form onSubmit={handleSingleSubmit} className="p-6 sm:p-8 rounded-3xl bg-[#0F2012] border border-[#D4AF37]/20 shadow-2xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tanggal & Jam */}
              <div>
                <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Tanggal *
                </label>
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8] text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Jam *
                </label>
                <input
                  type="time"
                  required
                  value={jam}
                  onChange={(e) => setJam(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8] text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Nama Staff Input */}
              <div>
                <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" /> Nama Staff *
                </label>
                <input
                  type="text"
                  required
                  value={namaStaff}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNamaStaff(val);
                    const matched = activeStaff.find(
                      (s) =>
                        s.nama_staff.toLowerCase() === val.toLowerCase() ||
                        s.id_staff.toLowerCase() === val.toLowerCase()
                    );
                    if (matched) {
                      setIdStaff(matched.id_staff);
                      setSitus(matched.situs);
                      setSelectedStaffId(matched.id);
                    }
                  }}
                  placeholder="Masukkan atau tempel Nama Staff..."
                  className="w-full px-4 py-3 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8] text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* ID Staff */}
              <div>
                <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2">
                  ID Staff *
                </label>
                <input
                  type="text"
                  required
                  value={idStaff}
                  onChange={(e) => setIdStaff(e.target.value)}
                  placeholder="Contoh: E1475795"
                  className="w-full px-4 py-3 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#D4AF37] font-mono text-sm font-bold focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Situs Dropdown */}
              <div>
                <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" /> Situs *
                </label>
                <select
                  required
                  value={situs}
                  onChange={(e) => setSitus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8] text-sm focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="">-- Pilih Situs --</option>
                  {activeSites.map((st) => (
                    <option key={st.id} value={st.nama_situs}>
                      {st.nama_situs}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kategori Kesalahan */}
              <div>
                <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2">
                  Kategori Kesalahan *
                </label>
                <select
                  required
                  value={kategoriKesalahan}
                  onChange={(e) => setKategoriKesalahan(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8] text-sm focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="">-- Pilih Kategori --</option>
                  {activeCats.map((c) => (
                    <option key={c.id} value={c.nama_kategori}>
                      {c.nama_kategori}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tingkat Kesalahan */}
              <div>
                <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2">
                  Tingkat Kesalahan *
                </label>
                <select
                  required
                  value={tingkatKesalahan}
                  onChange={(e) => setTingkatKesalahan(e.target.value as ErrorSeverity)}
                  className="w-full px-4 py-3 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8] text-sm focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="Rendah">Rendah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Tinggi">Tinggi</option>
                  <option value="Sangat Tinggi">Sangat Tinggi</option>
                </select>
              </div>

              {/* Pelapor (Auto) */}
              <div>
                <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2">
                  Nama Pelapor (Otomatis)
                </label>
                <input
                  type="text"
                  readOnly
                  value={currentUser?.nama || 'Administrator'}
                  className="w-full px-4 py-3 rounded-xl bg-[#08110A]/50 border border-[#D4AF37]/20 text-[#F5E6C8]/70 text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Deskripsi Kesalahan */}
            <div>
              <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Deskripsi Kesalahan *
              </label>
              <textarea
                required
                rows={4}
                value={deskripsiKesalahan}
                onChange={(e) => setDeskripsiKesalahan(e.target.value)}
                placeholder="Jelaskan detail kronologi kesalahan staff secara rinci..."
                className="w-full p-4 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8] text-sm focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Link & File Screenshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <LinkIcon className="w-4 h-4" /> Link Bukti Screenshot (Opsional URL)
                </label>
                <input
                  type="url"
                  value={linkBukti}
                  onChange={(e) => setLinkBukti(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-3 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8] text-sm focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Upload className="w-4 h-4" /> Upload File Screenshot
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-[#F5E6C8]/80 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-[#102A0B] file:text-[#D4AF37] hover:file:bg-[#1B4D1A] cursor-pointer"
                />
                {buktiScreenshot && (
                  <div className="mt-2 relative inline-block">
                    <img
                      src={buktiScreenshot}
                      alt="Preview Bukti"
                      className="h-20 w-auto rounded-lg border border-[#D4AF37]/40 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setBuktiScreenshot('')}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 text-[10px]"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Catatan Admin */}
            <div>
              <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2">
                Catatan Admin (Opsional)
              </label>
              <textarea
                rows={2}
                value={catatanAdmin}
                onChange={(e) => setCatatanAdmin(e.target.value)}
                placeholder="Catatan tambahan untuk tindak lanjut..."
                className="w-full p-4 rounded-xl bg-[#08110A] border border-[#D4AF37]/30 text-[#F5E6C8] text-sm focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D4AF37]/20">
              <button
                type="button"
                onClick={handleResetSingle}
                className="px-5 py-3 rounded-xl bg-[#102A0B] hover:bg-[#1B4D1A] text-[#F5E6C8]/80 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> RESET
              </button>

              <button
                type="submit"
                className="px-7 py-3 rounded-xl gold-gradient-bg text-[#08110A] font-extrabold text-xs uppercase tracking-wider shadow-xl hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" /> + SIMPAN KESALAHAN
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
