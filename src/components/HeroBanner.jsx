import { useState, useEffect } from 'react';

export default function HeroBanner({ videos, onPlay }) {
  const heroVideos = videos.slice(0, 4);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (heroVideos.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroVideos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroVideos.length]);

  const currentVideo = heroVideos[currentIndex];
  if (!currentVideo) return null;

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] flex items-center bg-[#0a0a0a] overflow-hidden select-none">
      
      <div 
        className="absolute inset-0 bg-cover bg-top bg-no-repeat filter blur-[1px] scale-100 transition-all duration-1000 ease-in-out pointer-events-none"
        style={{ backgroundImage: `url('${currentVideo.image}')` }} 
      >
        <div className="absolute inset-0 bg-black/45"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 px-8 md:px-16 max-w-[1200px] w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-white h-full">
        
        <div className="md:col-span-7 flex flex-col justify-center overflow-hidden">
          
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight tracking-tight max-w-2xl drop-shadow-md truncate">
            {currentVideo.title}
          </h1>
          
          <div className="flex items-center gap-3 text-sm text-gray-300 mb-6 font-semibold">
            <span className="bg-[#23252b] px-2 py-0.5 rounded-sm border border-gray-600">
              {currentVideo.fileInfo?.dimensions?.split('x')[1] || "HD"}p
            </span>
            <span>{currentVideo.fileInfo?.duration || "0:00"}</span>
          </div>
          
          <p className="text-[#c3c3c3] text-sm md:text-base mb-8 line-clamp-3 leading-relaxed max-w-xl drop-shadow">
            {currentVideo.description}
          </p>
          
          <div className="flex gap-4">
            <button 
              onClick={() => onPlay(currentVideo)}
              className="bg-[#f47521] hover:bg-[#df6516] text-black font-bold py-3 px-8 rounded-sm flex items-center gap-2 transition-all uppercase text-sm tracking-widest cursor-pointer shadow-lg"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 4l15 8-15 8z"/></svg>
              PLAY
            </button>
          </div>
        </div>

        <div className="md:col-span-5 flex items-center justify-center">
          <div className="relative w-[180px] md:w-[210px] aspect-[3/4] rounded-lg overflow-hidden shadow-2xl border-2 border-[#f47521]/60 bg-black/60 flex items-center justify-center p-1">
            <img 
              src={currentVideo.image} 
              alt="" 
              draggable="false"
              className="w-full h-full object-cover object-right rounded transition-all duration-1000 ease-in-out"
            />
          </div>
        </div>

      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {heroVideos.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-1 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-10 bg-[#f47521]' : 'w-4 bg-gray-600'}`}
          />
        ))}
      </div>
    </div>
  );
}