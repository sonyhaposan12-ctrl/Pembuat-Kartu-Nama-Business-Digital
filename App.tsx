import React, { useState } from 'react';
import { DigitalCard } from './components/DigitalCard';
import { CardData } from './types';
import { Settings, X, Upload, ScanLine } from 'lucide-react';
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

  // Basic vCard Parser
  const parseVCard = (vcardData: string) => {
    try {
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
          alert(`Berhasil memindai kartu kontak: ${newData.name || 'Unknown'}`);
      } else {
          alert('Format QR Code tidak dikenali atau bukan vCard valid.');
      }
    } catch (e) {
      console.error("Failed to parse vCard", e);
      alert('Gagal memproses data QR Code.');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
      
      {/* Action Buttons Top Right - Adjusted for better mobile touch targets */}
      <div className="absolute top-4 right-4 flex gap-2 sm:gap-3 z-40">
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

      <div className="text-center mb-6 sm:mb-8 mt-4 sm:mt-0 px-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Kartu Bisnis Digital</h1>
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

      {showScanner && (
        <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Edit Kartu Nama</h2>
                <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                
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