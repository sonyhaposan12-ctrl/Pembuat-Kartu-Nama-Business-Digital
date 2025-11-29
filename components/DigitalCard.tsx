import React, { useState, useRef } from 'react';
import { CardData } from '../types';
import { Phone, Mail, Globe, MapPin, Share2, Sparkles, QrCode, ArrowRightLeft, Linkedin, Github, Inbox, X, Download, Link as LinkIcon, Check, Maximize2, Minimize2, Twitter, MessageCircle, FileText, Image as ImageIcon, FileCode } from 'lucide-react';
import { generateProfessionalBio } from '../services/geminiService';

// Declare global libraries loaded via CDN
declare const html2canvas: any;
declare const jspdf: any;

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

  // Refs for capturing card images
  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);

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

  // --- Capture Helper ---
  const captureCardFace = async (): Promise<HTMLCanvasElement | null> => {
    const targetRef = isFlipped ? backCardRef : frontCardRef;
    if (!targetRef.current) return null;

    const originalNode = targetRef.current;
    const clone = originalNode.cloneNode(true) as HTMLElement;

    // Reset styles on clone for flat rendering
    clone.style.transform = 'none';
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = `${originalNode.offsetWidth}px`;
    clone.style.height = `${originalNode.offsetHeight}px`;
    clone.classList.remove('rotate-y-180', 'backface-hidden', 'absolute', 'shadow-xl', 'rounded-xl');
    clone.classList.add('rounded-none'); // Ensure sharp corners for capture if needed, or keep rounded
    
    document.body.appendChild(clone);

    try {
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false
      });
      document.body.removeChild(clone);
      return canvas;
    } catch (error) {
      console.error("Error capturing card:", error);
      document.body.removeChild(clone);
      return null;
    }
  };

  // --- Share Functionality ---
  const handleDownloadJPEG = async () => {
    const canvas = await captureCardFace();
    if (canvas) {
      const image = canvas.toDataURL("image/jpeg", 0.9);
      const link = document.createElement('a');
      link.href = image;
      link.download = `${data.name.replace(/\s+/g, '_')}_Card_${isFlipped ? 'Back' : 'Front'}.jpg`;
      link.click();
    }
  };

  const handleDownloadPDF = async () => {
    const canvas = await captureCardFace();
    if (canvas) {
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const { jsPDF } = jspdf;
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [90, 55] 
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, 90, 55);
      pdf.save(`${data.name.replace(/\s+/g, '_')}_Card.pdf`);
    }
  };

  const handleDownloadHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name} - Digital Card</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>body{font-family:'Inter',sans-serif;}</style>
</head>
<body class="bg-gray-100 flex items-center justify-center min-h-screen p-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
        <div class="p-6 text-center border-b border-gray-100" style="background-color: ${data.frontBgColor || '#ffffff'}">
            <div class="w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                 <img src="${data.logoUrl}" alt="Logo" class="max-w-full max-h-full object-contain">
            </div>
            <h1 class="text-2xl font-bold text-gray-800">${data.name}</h1>
            <p class="text-blue-800 font-medium uppercase tracking-wider text-sm mt-1">${data.title}</p>
            <p class="text-gray-500 text-xs mt-2">${data.company}</p>
        </div>
        <div class="p-6 text-white space-y-3" style="background-color: ${data.backBgColor || '#546E7A'}">
            <div class="flex items-center space-x-3">
                <span class="font-bold w-20 text-xs opacity-75">Phone</span>
                <span class="text-sm">${data.phone}</span>
            </div>
            <div class="flex items-center space-x-3">
                <span class="font-bold w-20 text-xs opacity-75">Email</span>
                <span class="text-sm">${data.email}</span>
            </div>
            ${data.generalEmail ? `
            <div class="flex items-center space-x-3">
                <span class="font-bold w-20 text-xs opacity-75">Info</span>
                <span class="text-sm">${data.generalEmail}</span>
            </div>` : ''}
            <div class="flex items-center space-x-3">
                <span class="font-bold w-20 text-xs opacity-75">Website</span>
                <span class="text-sm">${data.website}</span>
            </div>
            <div class="flex items-start space-x-3">
                <span class="font-bold w-20 text-xs opacity-75 mt-1">Address</span>
                <span class="text-sm">${data.address}</span>
            </div>
            ${bio ? `<div class="mt-4 pt-3 border-t border-white/20 text-xs italic opacity-90">"${bio}"</div>` : ''}
        </div>
        <div class="p-4 bg-gray-50 text-center text-xs text-gray-400">
            Generated via Seraphim Digital Card
        </div>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.name.replace(/\s+/g, '_')}_Card.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadVCard = () => {
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

  const shareText = `Connect with ${data.name} from ${data.company}`;
  const shareUrl = window.location.href;

  const handleShareLink = async () => {
    const shareData = {
      title: `${data.name} - Digital Business Card`,
      text: shareText,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share canceled', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Reusable classes
  const contactItemClass = "flex items-center space-x-2 group";
  const iconContainerClass = "p-1 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors flex-shrink-0";
  const textClass = "font-light tracking-wide truncate";
  const downloadBtnClass = "flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all gap-2";
  const downloadTextClass = "text-xs font-medium text-gray-700";

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-4 perspective-1000">
      
      {/* Card Container */}
      <div 
        className={`relative w-full aspect-[1.75/1] transition-all duration-700 transform-style-3d cursor-pointer shadow-2xl rounded-xl ${isFlipped ? 'rotate-y-180' : ''}`}
        onClick={handleFlip}
      >
        {/* Front Face */}
        <div 
          ref={frontCardRef}
          className="absolute w-full h-full backface-hidden rounded-xl overflow-hidden border border-gray-200 flex flex-col items-center justify-center p-6 text-center z-10"
          style={{ backgroundColor: data.frontBgColor || '#ffffff' }}
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-[#002f6c]"></div>
          
          <div className="flex-grow flex flex-col items-center justify-center space-y-4">
            <div className="w-48 h-auto mb-2 relative flex items-center justify-center">
                <img 
                  src={data.logoUrl} 
                  alt="Company Logo" 
                  className="object-contain max-w-full max-h-24"
                  crossOrigin="anonymous"
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
          ref={backCardRef}
          className="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl overflow-hidden text-white p-5 flex flex-col shadow-xl"
          style={{ backgroundColor: data.backBgColor || '#546E7A' }}
        >
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none"></div>

          {/* Header Row */}
          <div className="flex justify-between items-start z-10 mb-3 shrink-0">
            <div>
              <h3 className="text-base font-bold">{data.company}</h3>
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
            <div className={contactItemClass}>
              <div className={iconContainerClass}><Phone size={12} /></div>
              <span className={textClass}>{data.phone}</span>
            </div>
            
            <div className={contactItemClass}>
              <div className={iconContainerClass}><Mail size={12} /></div>
              <span className={textClass}>{data.email}</span>
            </div>

            {!isCompact && data.generalEmail && (
              <div className={contactItemClass}>
                <div className={iconContainerClass}><Inbox size={12} /></div>
                <span className={`${textClass} opacity-90`}>{data.generalEmail}</span>
              </div>
            )}

            <div className={contactItemClass}>
              <div className={iconContainerClass}><Globe size={12} /></div>
              <span className={textClass}>{data.website}</span>
            </div>

            {!isCompact && data.linkedin && (
              <div className={contactItemClass}>
                <div className={iconContainerClass}><Linkedin size={12} /></div>
                <span className={textClass}>{data.linkedin}</span>
              </div>
            )}

            {!isCompact && data.github && (
              <div className={contactItemClass}>
                <div className={iconContainerClass}><Github size={12} /></div>
                <span className={textClass}>{data.github}</span>
              </div>
            )}

            <div className="flex items-start space-x-2 group">
              <div className={`${iconContainerClass} mt-0.5`}><MapPin size={12} /></div>
              <span className="font-light leading-snug text-[10px] opacity-90 line-clamp-2">
                {data.address}
              </span>
            </div>
          </div>

          {/* AI Bio Section */}
          {!isCompact && (
            <div className="mt-auto pt-2 border-t border-white/20 z-10">
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
                      
                      <div className="absolute bottom-full left-0 mb-2 w-max max-w-[200px] p-2 bg-gray-900 text-white text-[10px] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-left border border-white/10">
                          Klik untuk membuat deskripsi profesional otomatis menggunakan AI.
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

      {/* Control Buttons */}
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <h3 className="font-semibold text-gray-800">Bagikan Kartu Bisnis</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              
              {/* Copy Link Section */}
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Link & Social</span>
                <div className="space-y-3">
                  <button 
                    onClick={handleShareLink}
                    className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                        {linkCopied ? <Check size={18} /> : <LinkIcon size={18} />}
                      </div>
                      <span className="text-sm font-medium text-gray-700">Salin Link</span>
                    </div>
                  </button>

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handleWhatsAppShare}
                      className="flex items-center justify-center gap-2 p-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-all"
                    >
                      <MessageCircle size={18} className="text-green-600" />
                      <span className="text-sm font-medium text-green-800">WhatsApp</span>
                    </button>
                    <button 
                      onClick={handleTwitterShare}
                      className="flex items-center justify-center gap-2 p-3 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-all"
                    >
                      <Twitter size={18} className="text-sky-600" />
                      <span className="text-sm font-medium text-sky-800">Twitter</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Download Options Section */}
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Download Format</span>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleDownloadVCard} className={downloadBtnClass}>
                    <Download size={24} className="text-gray-600" />
                    <span className={downloadTextClass}>vCard (.vcf)</span>
                  </button>

                  <button onClick={handleDownloadJPEG} className={downloadBtnClass}>
                    <ImageIcon size={24} className="text-purple-600" />
                    <span className={downloadTextClass}>Gambar (JPEG)</span>
                  </button>

                  <button onClick={handleDownloadPDF} className={downloadBtnClass}>
                    <FileText size={24} className="text-red-600" />
                    <span className={downloadTextClass}>Dokumen (PDF)</span>
                  </button>

                  <button onClick={handleDownloadHTML} className={downloadBtnClass}>
                    <FileCode size={24} className="text-orange-600" />
                    <span className={downloadTextClass}>Web File (HTML)</span>
                  </button>
                </div>
              </div>

            </div>

            <div className="p-4 bg-gray-50 text-center text-xs text-gray-400 border-t border-gray-100 shrink-0">
              PT Seraphim Digital Technology
            </div>
          </div>
        </div>
      )}

    </div>
  );
};