import React, { useState } from 'react';
import { DigitalCard } from './components/DigitalCard';
import { CardData } from './types';
import { Settings, X, Upload } from 'lucide-react';

// Initial data placeholder
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
  backBgColor: "#546E7A"
};

const App: React.FC = () => {
  const [cardData, setCardData] = useState<CardData>(initialCardData);
  const [isEditing, setIsEditing] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Edit Button */}
      <button 
        onClick={() => setIsEditing(true)}
        className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-md hover:bg-white transition-all text-gray-600 hover:text-blue-600 z-40"
      >
        <Settings size={24} />
      </button>

      {/* Header / Intro */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kartu Bisnis Digital</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Sentuh kartu untuk melihat detail kontak {cardData.company}.
        </p>
      </div>

      {/* Main Card Component */}
      <DigitalCard data={cardData} />

      {/* Footer */}
      <div className="mt-12 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} {cardData.company}.</p>
        <p className="mt-1">Powered by React & Gemini AI</p>
      </div>

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
                
                {/* Branding Section */}
                <div className="space-y-4 border-b pb-6 border-gray-100">
                   <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tampilan & Branding</h3>
                   
                   {/* Logo Upload */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">Logo Perusahaan</label>
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

                   {/* Color Pickers */}
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Warna Depan</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            name="frontBgColor" 
                            value={cardData.frontBgColor} 
                            onChange={handleInputChange} 
                            className="h-10 w-full cursor-pointer rounded border border-gray-300"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Warna Belakang</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            name="backBgColor" 
                            value={cardData.backBgColor} 
                            onChange={handleInputChange} 
                            className="h-10 w-full cursor-pointer rounded border border-gray-300"
                          />
                        </div>
                      </div>
                   </div>
                </div>

                {/* Personal Info */}
                <div className="space-y-4 border-b pb-6 border-gray-100">
                   <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Informasi Personal</h3>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                     <input type="text" name="name" value={cardData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan / Posisi</label>
                     <input type="text" name="title" value={cardData.title} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                   </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-4">
                   <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Detail Kontak</h3>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Nama Perusahaan</label>
                     <input type="text" name="company" value={cardData.company} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                     <input type="text" name="phone" value={cardData.phone} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Email Pribadi / Kerja</label>
                     <input type="email" name="email" value={cardData.email} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Email Umum (Info)</label>
                     <input type="email" name="generalEmail" value={cardData.generalEmail || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                     <input type="text" name="website" value={cardData.website} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn (Username/URL)</label>
                     <input type="text" name="linkedin" value={cardData.linkedin || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">GitHub (Username/URL)</label>
                     <input type="text" name="github" value={cardData.github || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Perusahaan</label>
                     <textarea name="address" rows={3} value={cardData.address} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"></textarea>
                   </div>
                </div>

                <div className="pt-4">
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

export default App;