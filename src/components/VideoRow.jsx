import { useRef, useState, useEffect } from 'react';

export default function VideoRow({ title, videos = [], onVideoClick, isGrid = false }) {
  const scrollRef = useRef(null);
  const [sortBy, setSortBy] = useState('latest');

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const offset = direction === 'left' ? -clientWidth / 1.5 : clientWidth / 1.5;
      scrollRef.current.scrollTo({ left: scrollLeft + offset, behavior: 'smooth' });
    }
  };

  if (!videos || videos.length === 0) return null;

  const sortedVideos = [...videos].sort((a, b) => {
    if (sortBy === 'latest') {
      return b.id - a.id; 
    } else if (sortBy === 'oldest') {
      return a.id - b.id; 
    } else if (sortBy === 'az') {
      return (a.title || "").localeCompare(b.title || ""); 
    }
    return 0;
  });

  return (
    <div className={`px-4 md:px-16 ${isGrid ? 'mt-20 mb-16' : 'py-8'}`}>
      <style>{`
        .no-select {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 px-2 no-select">
        <h2 className="text-2xl font-bold text-white capitalize tracking-wide">
          {title}
        </h2>

        {isGrid && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => setSortBy('latest')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer border ${
                sortBy === 'latest'
                  ? 'bg-[#f47521] text-black border-[#f47521] shadow-lg shadow-[#f47521]/20'
                  : 'bg-[#141519] text-gray-300 border-neutral-700 hover:border-[#f47521] hover:text-[#f47521]'
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setSortBy('oldest')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer border ${
                sortBy === 'oldest'
                  ? 'bg-[#f47521] text-black border-[#f47521] shadow-lg shadow-[#f47521]/20'
                  : 'bg-[#141519] text-gray-300 border-neutral-700 hover:border-[#f47521] hover:text-[#f47521]'
              }`}
            >
              Oldest
            </button>
            <button
              onClick={() => setSortBy('az')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer border ${
                sortBy === 'az'
                  ? 'bg-[#f47521] text-black border-[#f47521] shadow-lg shadow-[#f47521]/20'
                  : 'bg-[#141519] text-gray-300 border-neutral-700 hover:border-[#f47521] hover:text-[#f47521]'
              }`}
            >
              A-Z
            </button>
          </div>
        )}
      </div>

      {isGrid ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 gap-y-10 md:gap-y-12 px-2 no-select">
          {sortedVideos.map((video, index) => (
            <CardItem key={index} video={video} onVideoClick={onVideoClick} />
          ))}
        </div>
      ) : (
        <div className="relative flex items-center no-select">
          
          <button 
            onClick={() => scroll('left')}
            className="absolute -left-4 z-40 bg-neutral-900/90 hover:bg-[#f47521] text-white w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl border-2 border-neutral-700 hover:border-[#f47521] opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
            title="Scroll Left"
          >
            <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div 
            ref={scrollRef}
            className="flex gap-4 md:gap-5 overflow-x-auto py-2 px-2 scroll-smooth w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {videos.map((video, index) => (
              <div key={index} className="flex-none w-[260px] md:w-[300px]">
                <CardItem video={video} onVideoClick={onVideoClick} />
              </div>
            ))}
          </div>

          <button 
            onClick={() => scroll('right')}
            className="absolute -right-4 z-40 bg-neutral-900/90 hover:bg-[#f47521] text-white w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl border-2 border-neutral-700 hover:border-[#f47521] opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
            title="Scroll Right"
          >
            <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
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

  const performersList = video.performers || video.performer || [];
  const performersString = Array.isArray(performersList)
    ? performersList.map(p => typeof p === 'object' ? p.name : p).join(', ')
    : performersList;

  const videoDate = video.date || video.fileInfo?.date || "";
  const videoDuration = video.fileInfo?.duration || video.duration || "";

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
      className="group cursor-pointer flex flex-col h-full no-select"
      onClick={() => onVideoClick && onVideoClick(video)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-video overflow-hidden bg-[#141519] transition-all duration-300 border-[3px] border-transparent group-hover:border-[#f47521] rounded-lg shadow-lg">
        
        <img 
          src={defaultImage} 
          alt="" 
          draggable="false"
          onError={(e) => { e.currentTarget.style.opacity = 0; }}
          className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-300 pointer-events-none ${isHovered && previewVideoUrl ? 'opacity-0' : 'opacity-100'}`}
        />
        
        {previewVideoUrl && (
          <video 
            ref={videoRef}
            src={previewVideoUrl}
            muted 
            playsInline
            preload="none"
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
          />
        )}
        
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-30 pointer-events-none">
          <svg className="w-12 h-12 fill-[#f47521] drop-shadow-xl transform group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>

        {videoDuration && (
          <div className="absolute bottom-2 right-2 z-30 bg-black/75 text-white text-xs px-1.5 py-0.5 rounded font-medium tracking-wide">
            {videoDuration}
          </div>
        )}
      </div>

      <div className="mt-3 px-1 no-select">
        <h3 className="text-[#c3c3c3] font-semibold text-sm truncate group-hover:text-[#f47521] transition-colors">
          {video.title || "Untitled"}
        </h3>
        
        {(performersString || videoDate) && (
          <div className="flex justify-between items-center text-xs text-[#a0a0a0] mt-1 font-medium gap-2">
            <span className="shrink-0">
              {videoDate}
            </span>
            <span className="truncate max-w-[70%] text-right">
              {performersString}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}