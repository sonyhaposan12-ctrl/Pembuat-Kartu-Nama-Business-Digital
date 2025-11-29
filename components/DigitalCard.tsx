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
    // We capture specific refs regardless of current flip state to ensure we get what we need
    // However, if the element is hidden via 'backface-hidden', html2canvas might have issues.
    // Ideally, we clone the element and render it off-screen.
    
    // Determine which element to capture based on what triggered this. 
    // But for "JPEG" download, we want BOTH.
    // Let's make a generic capturer that captures a specific node.
    return null; // Placeholder, logic moved inside specific handlers or updated below
  };

  const captureElement = async (element: HTMLElement): Promise<HTMLCanvasElement | null> => {
      if (!element) return null;

      const clone = element.cloneNode(true) as HTMLElement;
      
      // Reset styles on clone for flat rendering
      clone.style.transform = 'none';
      clone.style.position = 'fixed'; // Use fixed to ensure it's in viewport if needed, or absolute
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = `${element.offsetWidth}px`;
      clone.style.height = `${element.offsetHeight}px`;
      clone.classList.remove('rotate-y-180', 'backface-hidden', 'absolute', 'shadow-xl', 'rounded-xl', 'transition-all', 'duration-700', 'transform-style-3d');
      clone.classList.add('rounded-none'); 
      
      // Hide UI elements marked with 'export-hide'
      const uiElements = clone.querySelectorAll('.export-hide');
      uiElements.forEach(el => (el as HTMLElement).style.display = 'none');

      document.body.appendChild(clone);

      try {
        const canvas = await html2canvas(clone, {
          scale: 3, // Higher scale for better quality
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
    if (!frontCardRef.current || !backCardRef.current) return;

    // Capture both faces
    const frontCanvas = await captureElement(frontCardRef.current);
    const backCanvas = await captureElement(backCardRef.current);

    if (frontCanvas && backCanvas) {
        const width = Math.max(frontCanvas.width, backCanvas.width);
        const height = frontCanvas.height + backCanvas.height + 40; // 40px gap

        const combinedCanvas = document.createElement('canvas');
        combinedCanvas.width = width;
        combinedCanvas.height = height;
        const ctx = combinedCanvas.getContext('2d');

        if (ctx) {
            // Fill white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);

            // Draw Front
            ctx.drawImage(frontCanvas, 0, 0);
            
            // Draw Back
            ctx.drawImage(backCanvas, 0, frontCanvas.height + 40);

            const image = combinedCanvas.toDataURL("image/jpeg", 0.9);
            const link = document.createElement('a');
            link.href = image;
            link.download = `${data.name.replace(/\s+/g, '_')}_DigitalCard.jpg`;
            link.click();
        }
    }
  };

  const handleDownloadPDF = async () => {
     if (!frontCardRef.current || !backCardRef.current) return;

     const frontCanvas = await captureElement(frontCardRef.current);
     const backCanvas = await captureElement(backCardRef.current);

     if (frontCanvas && backCanvas) {
        const { jsPDF } = jspdf;
        // Standard business card size approx 90mm x 55mm
        // We create a PDF with 2 pages
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [90, 55] 
        });

        // Add Front Page
        const frontImgData = frontCanvas.toDataURL('image/jpeg', 1.0);
        pdf.addImage(frontImgData, 'JPEG', 0, 0, 90, 55);

        // Add Back Page
        pdf.addPage();
        const backImgData = backCanvas.toDataURL('image/jpeg', 1.0);
        pdf.addImage(backImgData, 'JPEG', 0, 0, 90, 55);

        pdf.save(`${data.name.replace(/\s+/g, '_')}_DigitalCard.pdf`);
     }
  };

  const getBase64Image = async (url: string): Promise<string> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn("Could not convert image to base64, using original URL", e);
      return url;
    }
  };

  const handleDownloadHTML = async () => {
    const logoBase64 = await getBase64Image(data.logoUrl);

    // Raw SVG Strings for the HTML template
    const svgs = {
        phone: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
        mail: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>`,
        inbox: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>`,
        globe: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>`,
        linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>`,
        github: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>`,
        mapPin: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
        flip: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 21 5-5-5-5"></path><path d="M21 16H3"></path><path d="m8 3-5 5 5 5"></path><path d="M3 8h18"></path></svg>`,
        qr: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"></rect><rect width="5" height="5" x="14" y="3" rx="1"></rect><rect width="5" height="5" x="14" y="14" rx="1"></rect><rect width="5" height="5" x="3" y="14" rx="1"></rect><path d="M7 17h.01"></path><path d="M17 17h.01"></path><path d="M7 7h.01"></path><path d="M17 7h.01"></path></svg>`
    };

    const contactItemClass = "flex items-center space-x-2 group";
    const iconContainerClass = "p-1 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors flex-shrink-0 flex items-center justify-center text-white";
    
    // Construct Interactive HTML
    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.name} - Digital Card</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .flip-card-inner { transition: transform 0.6s; }
        .flipped { transform: rotateY(180deg); }
    </style>
</head>
<body class="bg-gray-100 flex flex-col items-center justify-center min-h-screen p-4">
    <div class="perspective-1000 w-full max-w-md cursor-pointer group" onclick="this.querySelector('.flip-card-inner').classList.toggle('flipped')">
        <div class="flip-card-inner relative w-full aspect-[1.75/1] transform-style-3d shadow-2xl rounded-xl">
            
            <!-- Front Face -->
            <div class="absolute w-full h-full backface-hidden rounded-xl overflow-hidden border border-gray-200 flex flex-col items-center justify-center p-6 text-center z-10 bg-white" style="background-color: ${data.frontBgColor || '#ffffff'}">
                <div class="absolute top-0 left-0 w-full h-2 bg-[#002f6c]"></div>
                <div class="flex-grow flex flex-col items-center justify-center space-y-4">
                    <div class="w-48 h-auto mb-2 relative flex items-center justify-center">
                        <img src="${logoBase64}" alt="Logo" class="object-contain max-w-full max-h-24">
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800 tracking-tight">${data.name}</h2>
                        <p class="text-[#002f6c] font-medium uppercase text-sm tracking-widest mt-1">${data.title}</p>
                    </div>
                </div>
                <div class="absolute bottom-4 right-4 text-gray-400 animate-pulse">
                   ${svgs.flip}
                </div>
                <div class="absolute bottom-0 right-0 w-16 h-16 bg-blue-50 rounded-tl-full -z-10"></div>
            </div>

            <!-- Back Face -->
            <div class="absolute w-full h-full backface-hidden rotate-y-180 rounded-xl overflow-hidden text-white p-5 flex flex-col shadow-xl" style="background-color: ${data.backBgColor || '#546E7A'}">
                <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none"></div>
                
                <div class="flex justify-between items-center z-10 mb-3 shrink-0">
                    <h3 class="text-base font-bold">${data.company}</h3>
                    <div class="bg-white/10 p-1.5 rounded-lg backdrop-blur-sm text-white">
                        ${svgs.qr}
                    </div>
                </div>

                <div class="flex flex-col z-10 gap-1.5 flex-grow justify-center text-xs">
                    <div class="${contactItemClass}">
                        <div class="${iconContainerClass}">${svgs.phone}</div>
                        <span class="font-light tracking-wide truncate">${data.phone}</span>
                    </div>
                    <div class="${contactItemClass}">
                        <div class="${iconContainerClass}">${svgs.mail}</div>
                        <span class="font-light tracking-wide truncate">${data.email}</span>
                    </div>
                    ${data.generalEmail ? `
                    <div class="${contactItemClass}">
                        <div class="${iconContainerClass}">${svgs.inbox}</div>
                        <span class="font-light tracking-wide truncate opacity-90">${data.generalEmail}</span>
                    </div>` : ''}
                    <div class="${contactItemClass}">
                        <div class="${iconContainerClass}">${svgs.globe}</div>
                        <span class="font-light tracking-wide truncate">${data.website}</span>
                    </div>
                    ${data.linkedin ? `
                    <div class="${contactItemClass}">
                        <div class="${iconContainerClass}">${svgs.linkedin}</div>
                        <span class="font-light tracking-wide truncate">${data.linkedin}</span>
                    </div>` : ''}
                    ${data.github ? `
                    <div class="${contactItemClass}">
                        <div class="${iconContainerClass}">${svgs.github}</div>
                        <span class="font-light tracking-wide truncate">${data.github}</span>
                    </div>` : ''}
                    <div class="flex items-start space-x-2 group">
                        <div class="${iconContainerClass} mt-0.5">${svgs.mapPin}</div>
                        <span class="font-light leading-snug text-[10px] opacity-90 line-clamp-2">${data.address}</span>
                    </div>
                </div>

                <div class="mt-auto pt-2 border-t border-white/20 z-10">
                   <p class="text-[9px] italic opacity-90 leading-relaxed bg-black/20 p-1.5 rounded-lg border-l-2 border-blue-300">
                     "${bio || 'Profesional teknologi berdedikasi.'}"
                   </p>
                </div>
            </div>

        </div>
    </div>
    <div class="mt-8 text-center text-gray-400 text-xs">
        <p>Klik kartu untuk membalik (Depan / Belakang)</p>
        <p class="mt-2">Generated via Seraphim Digital Card</p>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.name.replace(/\s+/g, '_')}_InteractiveCard.html`;
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
                className="mt-1 flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-[10px] font-medium text-blue-50 export-hide"
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
                  <div className="relative group w-fit export-hide">
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