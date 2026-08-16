import { useRef, useState, useEffect } from 'react';

export default function VideoRow({ title, videos = [], onVideoClick, isGrid = false }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const offset = direction === 'left' ? -clientWidth / 1.5 : clientWidth / 1.5;
      scrollRef.current.scrollTo({ left: scrollLeft + offset, behavior: 'smooth' });
    }
  };

  if (!videos || videos.length === 0) return null;

  return (
    <div className={`px-4 md:px-16 ${isGrid ? 'mt-20 mb-16' : 'py-8'}`}>
      <h2 className="text-2xl font-bold text-white mb-6 capitalize tracking-wide px-2">
        {title}
      </h2>

      {isGrid ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 gap-y-10 md:gap-y-12 px-2">
          {videos.map((video, index) => (
            <CardItem key={index} video={video} onVideoClick={onVideoClick} />
          ))}
        </div>
      ) : (
        <div className="relative group flex items-center">
          
          <button 
            onClick={() => scroll('left')}
            className="absolute -left-4 z-40 bg-neutral-900/90 hover:bg-[#f47521] text-white w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl border-2 border-neutral-700 hover:border-[#f47521] opacity-0 group-hover:opacity-100 hover:scale-110"
            title="Scroll Left"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div 
            ref={scrollRef}
            className="flex gap-4 md:gap-5 overflow-x-auto py-2 px-2 scroll-smooth w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {videos.map((video, index) => (
              <div key={index} className="flex-none w-[180px] md:w-[220px]">
                <CardItem video={video} onVideoClick={onVideoClick} />
              </div>
            ))}
          </div>

          <button 
            onClick={() => scroll('right')}
            className="absolute -right-4 z-40 bg-neutral-900/90 hover:bg-[#f47521] text-white w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl border-2 border-neutral-700 hover:border-[#f47521] opacity-0 group-hover:opacity-100 hover:scale-110"
            title="Scroll Right"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

        </div>
      )}
    </div>
  );
}

function CardItem({ video, onVideoClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);
  const token = localStorage.getItem('stash_api_key') || "";

  const formatUrl = (rawPath) => {
    if (!rawPath) return "";
    let cleanPath = rawPath;
    if (!cleanPath.startsWith('http')) {
      cleanPath = `http://localhost:9999${cleanPath}`;
    }
    const separator = cleanPath.includes('?') ? '&' : '?';
    return `${cleanPath}${separator}apikey=${token}`;
  };

  const rawImage = video.image || video.paths?.screenshot || video.screenshot || video.cover;
  const rawVideo = video.paths?.preview || video.stream;

  const defaultImage = formatUrl(rawImage);
  const previewVideoUrl = formatUrl(rawVideo);

  useEffect(() => {
    let interval = null;
    if (isHovered && videoRef.current && previewVideoUrl) {
      const duration = videoRef.current.duration || 60;
      const randomStart = Math.random() * (duration * 0.7) + (duration * 0.1);
      videoRef.current.currentTime = randomStart;
      videoRef.current.play().catch(() => {});

      interval = setInterval(() => {
        if (videoRef.current) {
          const maxTime = videoRef.current.duration || 60;
          const randomJump = Math.random() * (maxTime * 0.8) + (maxTime * 0.1);
          videoRef.current.currentTime = randomJump;
        }
      }, 1500); 
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
    return () => clearInterval(interval);
  }, [isHovered, previewVideoUrl]);

  return (
    <div 
      className="group cursor-pointer flex flex-col h-full"
      onClick={() => onVideoClick && onVideoClick(video)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-[#141519] transition-all duration-300 border-[3px] border-transparent group-hover:border-[#f47521] rounded-lg shadow-lg">
        
        <img 
          src={defaultImage} 
          alt={video.title || "Video"} 
          className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-300 ${isHovered && previewVideoUrl ? 'opacity-0' : 'opacity-100'}`}
        />
        
        {previewVideoUrl && (
          <video 
            ref={videoRef}
            src={previewVideoUrl}
            muted 
            playsInline
            preload="none"
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
        )}
        
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-30 pointer-events-none">
          <svg className="w-12 h-12 fill-[#f47521] drop-shadow-xl transform group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>

      <div className="mt-3 px-1">
        <h3 className="text-[#c3c3c3] font-semibold text-sm truncate group-hover:text-[#f47521] transition-colors">
          {video.title || "Untitled"}
        </h3>
        <p className="text-[#a0a0a0] text-xs mt-1 font-medium">
          {video.fileInfo?.duration || video.duration || "0:00"}
        </p>
      </div>
    </div>
  );
}