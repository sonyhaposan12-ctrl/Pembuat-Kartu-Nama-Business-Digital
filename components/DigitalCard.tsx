import React, { useState } from 'react';
import { CardData } from '../types';
import { Phone, Mail, Globe, MapPin, Share2, Sparkles, QrCode, ArrowRightLeft, Linkedin, Github, Inbox, X, Download, Link as LinkIcon, Copy, Check, Maximize2, Minimize2 } from 'lucide-react';
import { generateProfessionalBio } from '../services/geminiService';

interface DigitalCardProps {
  data: CardData;
}

export const DigitalCard: React.FC<DigitalCardProps> = ({ data }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [bio, setBio] = useState<string>("");
  const [isLoadingBio, setIsLoadingBio] = useState(false);
  
  // View Mode State: 'detail' (false) or 'compact' (true)
  const [isCompact, setIsCompact] = useState(false);
  
  // Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleGenerateBio = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent flipping when clicking the AI button
    setIsLoadingBio(true);
    const generatedBio = await generateProfessionalBio(data.name, data.title, data.company);
    setBio(generatedBio);
    setIsLoadingBio(false);
  };

  const toggleViewMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCompact(!isCompact);
  };

  // --- Share Functionality ---

  const handleDownloadVCard = () => {
    // Construct vCard 3.0 content
    const vCardContent = `BEGIN:VCARD
VERSION:3.0
FN:${data.name}
N:${data.name.split(' ').reverse().join(';')};;;
ORG:${data.company}
TITLE:${data.title}
TEL;TYPE=CELL:${data.phone}
EMAIL;TYPE=WORK,INTERNET:${data.email}
${data.generalEmail ? `EMAIL;TYPE=GEN,INTERNET:${data.generalEmail}` : ''}
URL:${data.website}
ADR;TYPE=WORK:;;${data.address.replace(/,/g, '\\,')};;;;
${data.linkedin ? `X-SOCIALPROFILE;type=linkedin:${data.linkedin}` : ''}
${data.github ? `X-SOCIALPROFILE;type=github:${data.github}` : ''}
END:VCARD`;

    const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${data.name.replace(/\s+/g, '_')}_Contact.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareLink = async () => {
    const shareData = {
      title: `${data.name} - Digital Business Card`,
      text: `Connect with ${data.name} from ${data.company}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      // Fallback to copy clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-4 perspective-1000">
      {/* Card Container */}
      <div 
        className={`relative w-full aspect-[1.75/1] transition-all duration-700 transform-style-3d cursor-pointer shadow-2xl rounded-xl ${isFlipped ? 'rotate-y-180' : ''}`}
        onClick={handleFlip}
      >
        
        {/* Front Face */}
        <div 
          className="absolute w-full h-full backface-hidden rounded-xl overflow-hidden border border-gray-200 flex flex-col items-center justify-center p-6 text-center z-10"
          style={{ backgroundColor: data.frontBgColor || '#ffffff' }}
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-[#002f6c]"></div> {/* Accent Bar Top */}
          
          <div className="flex-grow flex flex-col items-center justify-center space-y-4">
            <div className="w-48 h-auto mb-2 relative">
                <img 
                  src={data.logoUrl} 
                  alt="Company Logo" 
                  className="object-contain w-full h-full"
                />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{data.name}</h2>
              <p className="text-[#002f6c] font-medium uppercase text-sm tracking-widest mt-1">{data.title}</p>
            </div>
          </div>

          <div className="absolute bottom-4 right-4 text-gray-400 animate-pulse">
            <ArrowRightLeft size={20} />
          </div>
          
          <div className="absolute bottom-0 right-0 w-16 h-16 bg-blue-50 rounded-tl-full -z-10"></div>
        </div>

        {/* Back Face */}
        <div 
          className="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl overflow-hidden text-white p-5 flex flex-col shadow-xl"
          style={{ backgroundColor: data.backBgColor || '#546E7A' }}
        >
          {/* Background Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none"></div>

          {/* Header Row */}
          <div className="flex justify-between items-start z-10 mb-3 shrink-0">
            <div>
              <h3 className="text-base font-bold">{data.company}</h3>
              
              {/* Toggle View Mode Button */}
              <button 
                onClick={toggleViewMode}
                className="mt-1 flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-[10px] font-medium text-blue-50"
              >
                {isCompact ? <Maximize2 size={10} /> : <Minimize2 size={10} />}
                <span>{isCompact ? "Mode Detail" : "Mode Ringkas"}</span>
              </button>
            </div>
            <div className="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm shrink-0">
                <QrCode size={24} className="text-white" />
            </div>
          </div>

          {/* Contact Details Grid */}
          <div className={`flex flex-col z-10 text-xs ${isCompact ? 'gap-2 justify-center flex-grow' : 'gap-1.5'}`}>
            <div className="flex items-center space-x-2 group">
              <div className="p-1 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors flex-shrink-0">
                <Phone size={12} />
              </div>
              <span className="font-light tracking-wide truncate">{data.phone}</span>
            </div>
            
            <div className="flex items-center space-x-2 group">
              <div className="p-1 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors flex-shrink-0">
                <Mail size={12} />
              </div>
              <span className="font-light tracking-wide truncate">{data.email}</span>
            </div>

            {/* Hidden in Compact Mode */}
            {!isCompact && data.generalEmail && (
              <div className="flex items-center space-x-2 group animate-in fade-in duration-300">
                <div className="p-1 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors flex-shrink-0">
                  <Inbox size={12} />
                </div>
                <span className="font-light tracking-wide truncate opacity-90">{data.generalEmail}</span>
              </div>
            )}

            <div className="flex items-center space-x-2 group">
              <div className="p-1 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors flex-shrink-0">
                <Globe size={12} />
              </div>
              <span className="font-light tracking-wide truncate">{data.website}</span>
            </div>

            {/* Hidden in Compact Mode */}
            {!isCompact && data.linkedin && (
              <div className="flex items-center space-x-2 group animate-in fade-in duration-300">
                <div className="p-1 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors flex-shrink-0">
                  <Linkedin size={12} />
                </div>
                <span className="font-light tracking-wide truncate">{data.linkedin}</span>
              </div>
            )}

            {/* Hidden in Compact Mode */}
            {!isCompact && data.github && (
              <div className="flex items-center space-x-2 group animate-in fade-in duration-300">
                <div className="p-1 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors flex-shrink-0">
                  <Github size={12} />
                </div>
                <span className="font-light tracking-wide truncate">{data.github}</span>
              </div>
            )}

            <div className="flex items-start space-x-2 group">
              <div className="p-1 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors mt-0.5 flex-shrink-0">
                <MapPin size={12} />
              </div>
              <span className="font-light leading-snug text-[10px] opacity-90 line-clamp-2">
                {data.address}
              </span>
            </div>
          </div>

          {/* AI Bio Section (Back of card) - Hidden in Compact Mode */}
          {!isCompact && (
            <div className="mt-auto pt-2 border-t border-white/20 z-10 animate-in fade-in duration-300">
               {!bio ? (
                  <div className="relative group w-fit">
                      <button 
                        onClick={handleGenerateBio}
                        disabled={isLoadingBio}
                        className="flex items-center space-x-2 text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded-full transition-all w-fit"
                      >
                        <Sparkles size={10} className={isLoadingBio ? "animate-spin" : ""} />
                        <span>{isLoadingBio ? "Sedang membuat profil..." : "Buat Profil Singkat (AI)"}</span>
                      </button>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-0 mb-2 w-max max-w-[200px] p-2 bg-gray-900 text-white text-[10px] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-left border border-white/10">
                          Klik untuk membuat deskripsi profesional otomatis menggunakan AI.
                          {/* Tooltip Arrow */}
                          <div className="absolute top-full left-4 -mt-[1px] border-4 border-transparent border-t-gray-900"></div>
                      </div>
                  </div>
               ) : (
                 <p className="text-[9px] italic opacity-90 leading-relaxed bg-black/20 p-1.5 rounded-lg border-l-2 border-blue-300">
                   "{bio}"
                 </p>
               )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <button 
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-800 transition-transform hover:scale-105 active:scale-95"
        >
          <Share2 size={18} />
          <span className="text-sm font-medium">Bagikan Kartu</span>
        </button>
        <button 
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-transform hover:scale-105 active:scale-95"
        >
          <ArrowRightLeft size={18} />
          <span className="text-sm font-medium">Balik Kartu</span>
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowShareModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800">Bagikan Kartu Bisnis</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <button 
                onClick={handleShareLink}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-full group-hover:scale-110 transition-transform">
                    {linkCopied ? <Check size={20} /> : <LinkIcon size={20} />}
                  </div>
                  <div className="text-left">
                    <span className="block font-medium text-gray-800">Bagikan Link</span>
                    <span className="text-xs text-gray-500">
                      {linkCopied ? "Link tersalin!" : "Salin atau bagikan URL"}
                    </span>
                  </div>
                </div>
                {linkCopied ? (
                  <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">Tersalin</span>
                ) : (
                  <Copy size={16} className="text-gray-400 group-hover:text-blue-500" />
                )}
              </button>

              <button 
                onClick={handleDownloadVCard}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-200 rounded-xl transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 text-green-600 p-2 rounded-full group-hover:scale-110 transition-transform">
                    <Download size={20} />
                  </div>
                  <div className="text-left">
                    <span className="block font-medium text-gray-800">Simpan Kontak</span>
                    <span className="text-xs text-gray-500">Download file vCard (.vcf)</span>
                  </div>
                </div>
              </button>
            </div>

            <div className="p-4 bg-gray-50 text-center text-xs text-gray-400 border-t border-gray-100">
              PT Seraphim Digital Technology
            </div>
          </div>
        </div>
      )}

    </div>
  );
};