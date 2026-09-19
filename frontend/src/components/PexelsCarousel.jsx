import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, ExternalLink } from 'lucide-react';

export const PexelsCarousel = ({ photos, className = '', onSelectPhoto, selectedPhoto }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return null;
  }

  const handleSelect = (idx) => {
    setCurrentIndex(idx);
    if (onSelectPhoto && photos[idx]) {
      onSelectPhoto(photos[idx]);
    }
  };

  const next = (e) => {
    e?.stopPropagation();
    const newIdx = (currentIndex + 1) % photos.length;
    handleSelect(newIdx);
  };

  const prev = (e) => {
    e?.stopPropagation();
    const newIdx = (currentIndex - 1 + photos.length) % photos.length;
    handleSelect(newIdx);
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl bg-slate-900 group select-none ${className}`}>
      {/* Current Photo */}
      <img
        src={photos[currentIndex]}
        alt={`Pexels match ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-all duration-300"
      />

      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

      {/* Photo Counter Badge & Pexels credit */}
      <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white/90 border border-white/10 shadow-xs">
          {currentIndex + 1} / {photos.length}
        </span>
      </div>

      {/* Previous / Next Arrows (if multiple) */}
      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous photo"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all opacity-80 group-hover:opacity-100 hover:scale-105 z-20 cursor-pointer border border-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next photo"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all opacity-80 group-hover:opacity-100 hover:scale-105 z-20 cursor-pointer border border-white/10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {photos.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`transition-all rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? 'w-4 h-1.5 bg-white'
                    : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PexelsCarousel;
