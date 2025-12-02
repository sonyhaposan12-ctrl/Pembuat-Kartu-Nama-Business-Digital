import React, { useState, useEffect, useRef } from 'react';
import { DigitalCard } from './components/DigitalCard';
import { CardData } from './types';
import { Settings, X, Upload, ScanLine, FileUp } from 'lucide-react';
import { QRScanner } from './components/QRScanner';

const initialCardData: CardData = {
  name: "Alexander Wijaya",
  title: "Chief Technology Officer",
  company: "PT Seraphim Digital Technology",
  phone: "+62 812 3456 7890",
  email: "alexander@seraphim.tech",
  generalEmail: "info@seraphim.tech",
  website: "www.seraphim.tech",
  linkedin: "linkedin.com/in/alexander-seraphim",
  github: "github.com/seraphim-tech",
  address: "Cyber 2 Tower, Jl. H.R. Rasuna Said Blok X-5, Jakarta Selatan 12950",
  logoUrl: "https://files.catbox.moe/kxl80z.png",
  frontBgColor: "#ffffff",
  backBgColor: "#546E7A",
  teamMembers: [
    { name: "Layanan Pelanggan", role: "Support 24/7", phone: "+6281100001", whatsapp: "+6281100001" },
    { name: "Tim Sales", role: "Pertanyaan Bisnis", phone: "+6281100002", whatsapp: "+6281100002" },
    { name: "IT Support", role: "Bantuan Teknis", phone: "+6281100003" }
  ]
};

export const App: React.FC = () => {
  const [cardData, setCardData] = useState<CardData>(initialCardData);
  const [isEditing, setIsEditing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Refs for Parallax Background Elements (Wrappers)
  const bgBlob1Ref = useRef<HTMLDivElement>(null);
  const bgBlob2Ref = useRef<HTMLDivElement>(null);
  const bgBlob3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Apply different speeds to background elements to create depth (Parallax)
      // Note: We apply this to the wrapper div. The inner div handles the blob animation.
      if (bgBlob1Ref.current) {
        // Moves down at 30% of scroll speed
        bgBlob1Ref.current.style.transform = `translate3d(0, ${scrollY * 0.3}px, 0)`;
      }
      if (bgBlob2Ref.current) {
        // Moves up slightly (negative direction) at 10% speed
        bgBlob2Ref.current.style.transform = `translate3d(0, -${scrollY * 0.1}px, 0)`;
      }
      if (bgBlob3Ref.current) {
        // Moves down very slowly at 15% speed
        bgBlob3Ref.current.style.transform = `translate3d(0, ${scrollY * 0.15}px, 0)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCardData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setCardData(prev => ({ ...prev, logoUrl: imageUrl }));
    }
  };

  const handleVCardUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          parseVCard(event.target.result as string);
        }
      };
      
      reader.onerror = () => {
        alert("Gagal membaca file. File mungkin rusak, terkunci, atau format tidak didukung.");
      };
      
      reader.readAsText(file);
    }
  };

  // Basic vCard Parser
  const parseVCard = (vcardData: string) => {
    try {
      if (!vcardData || !vcardData.trim()) {
        throw new Error("File kosong atau tidak dapat dibaca.");
      }

      // Check for vCard header loosely
      if (!vcardData.toUpperCase().includes("BEGIN:VCARD")) {
         throw new Error("Format file tidak valid. Header 'BEGIN:VCARD' tidak ditemukan. Pastikan Anda mengunggah file .vcf yang benar.");
      }

      const lines = vcardData.split(/\r\n|\r|\n/);
      const newData: Partial<CardData> = {};
      let currentKey = '';
      
      lines.forEach(line => {
        if (line.startsWith(' ') && currentKey) return;

        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) return;

        let key = line.substring(0, colonIndex).toUpperCase();
        const value = line.substring(colonIndex + 1);

        if (key.includes(';')) {
          key = key.split(';')[0];
        }

        currentKey = key;

        switch (key) {
          case 'FN': newData.name = value; break;
          case 'TITLE': newData.title = value; break;
          case 'ORG': newData.company = value; break;
          case 'TEL': newData.phone = value; break;
          case 'EMAIL': 
            if (!newData.email) newData.email = value;
            else newData.generalEmail = value;
            break;
          case 'URL': newData.website = value; break;
          case 'ADR':
            const parts = value.split(';');
            newData.address = parts.filter(p => p.trim() !== '').join(', ');
            break;
          case 'X-SOCIALPROFILE':
            if (value.toLowerCase().includes('linkedin')) newData.linkedin = value;
            else if (value.toLowerCase().includes('github')) newData.github = value;
            break;
        }
      });
      
      if (newData.name || newData.email) {
          setCardData(prev => ({ ...prev, ...newData }));
          alert(`Berhasil memindai/impor kontak: ${newData.name || 'Unknown'}`);
      } else {
          throw new Error("Data vCard valid tetapi tidak ditemukan informasi Nama (FN) atau Email yang diperlukan untuk kartu nama.");
      }
    } catch (e) {
      console.error("Failed to parse vCard", e);
      const errorMsg = e instanceof Error ? e.message : 'Kesalahan tidak diketahui.';
      alert(`Gagal Impor Data:\n${errorMsg}`);
    }
  };

  const handleScan = (data: string) => {
    setShowScanner(false);
    if (data.startsWith('BEGIN:VCARD')) {
        parseVCard(data);
    } else {
        try {
            const jsonData = JSON.parse(data);
            if (jsonData.name && jsonData.email) {
                setCardData(prev => ({ ...prev, ...jsonData }));
                alert('Berhasil memuat data kartu digital.');
            } else {
                alert('QR Code berisi teks: ' + data);
            }
        } catch (e) {
            alert('QR Code berisi teks: ' + data);
        }
    }
  };

  // Shared CSS classes
  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const sectionHeaderClass = "text-sm font-semibold text-gray-500 uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden overflow-y-auto">
      
      {/* --- Parallax & Animated Background Elements --- */}
      {/* We wrap the blobs to separate the Scroll Parallax transform (on parent) from the Animation transform (on child) */}
      
      {/* Blob 1 */}
      <div 
        ref={bgBlob1Ref}
        className="absolute top-0 left-0 z-0 pointer-events-none"
        style={{ top: '-5%', left: '-5%' }}
      >
         <div className="w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      </div>
      
      {/* Blob 2 */}
      <div 
        ref={bgBlob2Ref}
        className="absolute bottom-0 right-0 z-0 pointer-events-none"
        style={{ bottom: '-10%', right: '-5%' }}
      >
        <div className="w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      {/* Blob 3 */}
      <div 
        ref={bgBlob3Ref}
        className="absolute top-1/2 right-1/4 z-0 pointer-events-none"
      >
        <div className="w-64 h-64 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* --- Main Content (Relative z-10 to sit above background) --- */}
      <div className="w-full flex flex-col items-center relative z-10">
        
        {/* Action Buttons Top Right - Adjusted for better mobile touch targets */}
        <div className="absolute top-0 right-0 sm:right-4 flex gap-2 sm:gap-3">
            <button 
                onClick={() => setShowScanner(true)}
                className="bg-white/80 backdrop-blur-sm p-2.5 sm:p-3 rounded-full shadow-md hover:bg-white transition-all text-gray-600 hover:text-blue-600 active:scale-95"
                title="Scan QR Code"
            >
                <ScanLine size={20} className="sm:w-6 sm:h-6" />
            </button>
            <button 
                onClick={() => setIsEditing(true)}
                className="bg-white/80 backdrop-blur-sm p-2.5 sm:p-3 rounded-full shadow-md hover:bg-white transition-all text-gray-600 hover:text-blue-600 active:scale-95"
                title="Edit Kartu"
            >
                <Settings size={20} className="sm:w-6 sm:h-6" />
            </button>
        </div>

        <div className="text-center mb-6 sm:mb-8 mt-12 sm:mt-0 px-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">Kartu Bisnis Digital</h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto leading-relaxed">
            Sentuh kartu untuk melihat detail kontak {cardData.company}.
            </p>
        </div>

        <div className="w-full max-w-md">
            <DigitalCard data={cardData} />
        </div>

        <div className="mt-8 sm:mt-12 text-center text-gray-400 text-xs sm:text-sm">
            <p>&copy; {new Date().getFullYear()} {cardData.company}.</p>
            <p className="mt-1">Powered by React & Gemini AI</p>
        </div>
      </div>

      {showScanner && (
        <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Edit Kartu Nama</h2>
                <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">

                {/* Import Section */}
                <div className="border-b pb-6 border-gray-100">
                   <h3 className={sectionHeaderClass}>Impor Data</h3>
                   <div className="mt-3">
                     <label className="cursor-pointer flex items-center justify-center gap-2 bg-green-50 text-green-700 px-4 py-3 rounded-xl hover:bg-green-100 transition-colors text-sm font-medium border border-green-200 border-dashed w-full group active:scale-95">
                       <FileUp size={18} />
                       <span>Upload File vCard (.vcf)</span>
                       <input type="file" className="hidden" accept=".vcf,text/vcard" onChange={handleVCardUpload} />
                     </label>
                     <p className="text-xs text-gray-400 mt-2 text-center">
                       Otomatis isi formulir dari file kontak yang ada.
                     </p>
                   </div>
                </div>
                
                {/* Branding Section */}
                <div className="space-y-4 border-b pb-6 border-gray-100">
                   <h3 className={sectionHeaderClass}>Tampilan & Branding</h3>
                   <div>
                     <label className={labelClass}>Logo Perusahaan</label>
                     <div className="flex items-center gap-4">
                       <div className="w-16 h-16 border rounded-lg p-2 bg-gray-50 flex items-center justify-center">
                         <img src={cardData.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                       </div>
                       <label className="cursor-pointer flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                         <Upload size={16} />
                         Ganti Logo
                         <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                       </label>
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Warna Depan</label>
                        <input type="color" name="frontBgColor" value={cardData.frontBgColor} onChange={handleInputChange} className="h-10 w-full cursor-pointer rounded border border-gray-300 p-1" />
                      </div>
                      <div>
                        <label className={labelClass}>Warna Belakang</label>
                        <input type="color" name="backBgColor" value={cardData.backBgColor} onChange={handleInputChange} className="h-10 w-full cursor-pointer rounded border border-gray-300 p-1" />
                      </div>
                   </div>
                </div>

                {/* Personal Info */}
                <div className="space-y-4 border-b pb-6 border-gray-100">
                   <h3 className={sectionHeaderClass}>Informasi Personal</h3>
                   <div>
                     <label className={labelClass}>Nama Lengkap</label>
                     <input type="text" name="name" value={cardData.name} onChange={handleInputChange} className={inputClass} />
                   </div>
                   <div>
                     <label className={labelClass}>Jabatan / Posisi</label>
                     <input type="text" name="title" value={cardData.title} onChange={handleInputChange} className={inputClass} />
                   </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                   <h3 className={sectionHeaderClass}>Detail Kontak</h3>
                   <div>
                     <label className={labelClass}>Nama Perusahaan</label>
                     <input type="text" name="company" value={cardData.company} onChange={handleInputChange} className={inputClass} />
                   </div>
                   <div>
                     <label className={labelClass}>Nomor Telepon</label>
                     <input type="text" name="phone" value={cardData.phone} onChange={handleInputChange} className={inputClass} />
                   </div>
                   <div>
                     <label className={labelClass}>Email Pribadi / Kerja</label>
                     <input type="email" name="email" value={cardData.email} onChange={handleInputChange} className={inputClass} />
                   </div>
                   <div>
                     <label className={labelClass}>Email Umum (Info)</label>
                     <input type="email" name="generalEmail" value={cardData.generalEmail || ''} onChange={handleInputChange} className={inputClass} />
                   </div>
                   <div>
                     <label className={labelClass}>Website</label>
                     <input type="text" name="website" value={cardData.website} onChange={handleInputChange} className={inputClass} />
                   </div>
                   <div>
                     <label className={labelClass}>LinkedIn (Username/URL)</label>
                     <input type="text" name="linkedin" value={cardData.linkedin || ''} onChange={handleInputChange} className={inputClass} />
                   </div>
                   <div>
                     <label className={labelClass}>GitHub (Username/URL)</label>
                     <input type="text" name="github" value={cardData.github || ''} onChange={handleInputChange} className={inputClass} />
                   </div>
                   <div>
                     <label className={labelClass}>Alamat Perusahaan</label>
                     <textarea name="address" rows={3} value={cardData.address} onChange={handleInputChange} className={`${inputClass} resize-none`}></textarea>
                   </div>
                </div>

                <div className="pt-4 pb-6">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};