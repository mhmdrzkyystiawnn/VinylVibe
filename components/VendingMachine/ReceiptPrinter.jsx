import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";

const Icons = {
  Close: (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Download: (props) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )
};

export default function ReceiptPrinter({ track, isPrinting, onClose }) {
  const receiptRef = useRef(null);

  // Lock scroll ketika modal terbuka
  useEffect(() => {
    if (track || isPrinting) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [track, isPrinting]);

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        allowTaint: true
      });
      const link = document.createElement('a');
      link.download = `Receipt-${track.name.replace(/[^a-z0-9]/gi, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Gagal download gambar", err);
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Jangan render apa-apa kalau tidak ada track dan tidak printing
  if (!track && !isPrinting) return null;

  // Render dengan Portal ke body agar z-index pasti paling atas
  return createPortal(
    <>
      {/* BACKDROP BLUR - Full Screen Overlay */}
      <div 
        className={`fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-500
          ${(track && !isPrinting) ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
        style={{ zIndex: 999998 }}
      />

      {/* MODAL CONTAINER - Centered */}
      <div 
        className={`fixed inset-0 flex items-center justify-center pointer-events-none transition-all duration-700
          ${isPrinting ? 'opacity-100' : ''}
          ${track && !isPrinting ? 'opacity-100' : ''}
        `}
        style={{ zIndex: 999999 }}
      >
        <div className="relative pointer-events-auto">
          
          {/* PRINTING INDICATOR */}
          {isPrinting && (
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-black/90 text-yellow-400 px-6 py-3 rounded-lg text-sm font-mono animate-pulse border-2 border-yellow-400 shadow-2xl">
              🖨️ PRINTING RECEIPT...
            </div>
          )}

          {/* RECEIPT CARD dengan Animasi */}
          <div 
            className={`transition-all duration-1000 ease-out
              ${isPrinting ? 'translate-y-full opacity-0 scale-95' : 'translate-y-0 opacity-100 scale-100'}
              ${!track ? 'translate-y-full opacity-0' : ''}
            `}
            style={{
              transformOrigin: 'bottom center'
            }}
          >
            {/* ACTION BUTTONS */}
            {!isPrinting && track && (
              <div className="absolute top-2 -right-16 flex flex-col gap-3 z-50">
                <button 
                  onClick={handleDownload} 
                  className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full shadow-xl hover:scale-110 hover:rotate-12 transition-all duration-300 border-2 border-white group"
                  aria-label="Download receipt"
                >
                  <Icons.Download className="w-5 h-5 group-hover:animate-bounce" />
                </button>
                <button 
                  onClick={onClose} 
                  className="p-3 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full shadow-xl hover:scale-110 hover:rotate-12 transition-all duration-300 border-2 border-white"
                  aria-label="Close receipt"
                >
                  <Icons.Close className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* RECEIPT PAPER */}
            <div 
              ref={receiptRef}
              className="w-72 md:w-80 bg-gradient-to-b from-[#fffef5] to-[#fffdf0] text-gray-900 font-mono text-xs shadow-2xl relative max-h-[85vh] overflow-y-auto"
              style={{ 
                filter: 'drop-shadow(0px 20px 40px rgba(0,0,0,0.6))',
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 95% 98%, 90% 100%, 85% 98%, 80% 100%, 75% 98%, 70% 100%, 65% 98%, 60% 100%, 55% 98%, 50% 100%, 45% 98%, 40% 100%, 35% 98%, 30% 100%, 25% 98%, 20% 100%, 15% 98%, 10% 100%, 5% 98%, 0 100%)"
              }}
            >
              {/* HEADER */}
              <div className="p-4 flex flex-col items-center border-b-2 border-dashed border-gray-400">
                <div className="font-black text-base tracking-widest mb-1 text-gray-800">MYSTERY MIX</div>
                <div className="text-[9px] opacity-60 text-center mb-1">OFFICIAL MUSIC RECEIPT</div>
                <div className="text-[9px] opacity-50">
                  {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} • {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {track && (
                <div className="p-4 flex flex-col gap-3">
                  {/* ALBUM ARTWORK */}
                  <div className="w-full aspect-square relative border-2 border-black bg-gray-100 overflow-hidden">
                    <img 
                      src={track.album.images[0]?.url} 
                      alt="Album cover"
                      className="w-full h-full object-cover grayscale contrast-125"
                      crossOrigin="anonymous"
                    />
                  </div>

                  {/* TRACK INFO */}
                  <div className="space-y-1.5 text-center px-2">
                    <div className="font-bold text-sm uppercase leading-tight tracking-wide">
                      {truncateText(track.name, 35)}
                    </div>
                    <div className="italic opacity-70 text-xs">
                      {truncateText(track.artists[0].name, 30)}
                    </div>
                  </div>

                  {/* ALBUM & YEAR - FIXED LAYOUT */}
                  <div className="border-y-2 border-black py-2 px-3 text-[10px] space-y-1">
                    <div className="flex justify-between items-start gap-3">
                      <span className="font-bold shrink-0 text-gray-700">ALBUM:</span>
                      <span className="text-right break-words leading-snug">
                        {truncateText(track.album.name, 28)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-3">
                      <span className="font-bold shrink-0 text-gray-700">YEAR:</span>
                      <span className="font-mono">{track.album.release_date?.split('-')[0] || 'N/A'}</span>
                    </div>
                  </div>

                  {/* QR CODE */}
                  <div className="flex flex-col items-center gap-2 pb-1">
                    <div className="bg-white p-2 border-2 border-gray-400 shadow-inner">
                      <QRCodeSVG value={track.uri} size={75} />
                    </div>
                    <div className="text-[9px] text-center uppercase tracking-wide leading-tight font-semibold text-gray-600">
                      SCAN TO LISTEN<br/>ON SPOTIFY
                    </div>
                  </div>
                </div>
              )}

              {/* FOOTER */}
              <div className="px-4 pb-5 pt-2 text-center">
                <div className="text-[9px] opacity-40 mb-1">********************************</div>
                <div className="text-[9px] font-bold tracking-wide text-gray-700">THANKS FOR COLLECTING!</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body // Render langsung ke body
  );
}