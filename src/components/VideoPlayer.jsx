import { useRef, useState, useEffect } from 'react';
import { fetchGalleryImages } from '../stashApi';

export default function VideoPlayer({ video, onClose }) {
  const [galleryImages, setGalleryImages] = useState([]);
  const [loadingGalleryImages, setLoadingGalleryImages] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  useEffect(() => {
    async function loadImages() {
      if (video && video.galleriesData && video.galleriesData.length > 0) {
        setLoadingGalleryImages(true);
        try {
          let allImages = [];
          for (let gal of video.galleriesData) {
            const imgs = await fetchGalleryImages(gal.id);
            if (imgs && imgs.length > 0) {
              allImages = [...allImages, ...imgs];
            }
          }
          setGalleryImages(allImages);
        } catch (e) {
          // Ignored
        }
        setLoadingGalleryImages(false);
      } else {
        setGalleryImages([]);
      }
    }
    loadImages();
  }, [video]);

  if (!video) return null;

  const token = localStorage.getItem('stash_api_key') || "";

  let streamPath = video.stream || "";
  if (!streamPath.startsWith('http')) {
    streamPath = `http://localhost:9999${streamPath}`;
  }

  const cleanStreamPath = streamPath.split('?')[0];
  const videoSrc = `${cleanStreamPath}?apikey=${token}`;

  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const dur = videoRef.current.duration;
      setCurrentTime(current);
      setDuration(dur);
      setProgress((current / dur) * 100 || 0);
    }
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    videoRef.current.currentTime = seekTime;
    setProgress(e.target.value);
  };

  const handleVolumeChange = (e) => {
    const newVol = e.target.value;
    setVolume(newVol);
    videoRef.current.volume = newVol;
    setIsMuted(newVol === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      videoRef.current.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        // Ignored
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setPreviewIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setPreviewIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  };

  const progressStyle = {
    background: `linear-gradient(to right, #f47521 ${progress}%, #525252 ${progress}%)`
  };
  const currentVolumeLevel = isMuted ? 0 : volume * 100;
  const volumeStyle = {
    background: `linear-gradient(to right, #f47521 ${currentVolumeLevel}%, #525252 ${currentVolumeLevel}%)`
  };

  const MetaRow = ({ label, value, multiline, isLink }) => {
    let displayValue = value;
    if (Array.isArray(value)) {
      displayValue = value.join(', ');
    }
    const finalValue = !displayValue || displayValue === "-" ? "-" : displayValue;
    
    return (
      <div className={`flex ${multiline ? 'items-start' : 'items-center'} py-1`}>
        <span className="text-white font-semibold w-24 md:w-32 shrink-0">{label}</span>
        <span className="text-white font-semibold w-4 shrink-0">:</span>
        <span className={`flex-1 min-w-0 ${multiline ? 'leading-relaxed' : 'truncate'} ${isLink ? 'text-blue-400' : 'text-neutral-300'}`}>
          {isLink && finalValue !== "-" ? (
            <a href={finalValue} target="_blank" rel="noreferrer" className="hover:underline">{finalValue}</a>
          ) : (
            finalValue
          )}
        </span>
      </div>
    );
  };

  const tagsText = video.tags && video.tags.length > 0 
    ? video.tags.map(t => `#${t}`).join(', ') 
    : "-";

  return (
    <div className="fixed inset-0 z-50 bg-black/95 overflow-y-auto custom-scrollbar">
      
      <style>{`
        .orange-scrollbar::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
        .orange-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 4px;
        }
        .orange-scrollbar::-webkit-scrollbar-thumb {
          background: #c25b16;
          border-radius: 4px;
        }
        .orange-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #f47521;
        }
      `}</style>

      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex justify-center">
        <button 
          onClick={onClose} 
          className="
            bg-neutral-800/80 
            hover:bg-[#f47521] 
            text-white 
            w-12 h-12 
            rounded-full 
            flex items-center justify-center 
            transition-colors duration-300 
            shadow-lg 
            border border-neutral-600
            hover:border-[#f47521]
          "
          title="Close Player"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="min-h-full flex flex-col items-center px-4 pt-20 pb-12">
        
        <div className="w-full max-w-6xl">
          <div 
            ref={playerContainerRef}
            className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-neutral-800 flex items-center justify-center select-none"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => isPlaying && setShowControls(false)}
          >
            <video 
              ref={videoRef}
              onTimeUpdate={handleTimeUpdate}
              onClick={togglePlay}
              className="w-full h-full object-contain cursor-pointer"
              src={videoSrc}
            >
              Your browser does not support this video playback.
            </video>

            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/60 rounded-full p-4 border border-neutral-700 shadow-xl">
                   <svg className="w-16 h-16 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
            )}

            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col gap-2 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
              
              <div className="w-full flex items-center group/slider cursor-pointer h-4" onClick={(e) => e.stopPropagation()}>
                <input 
                  type="range" min="0" max="100" 
                  value={progress || 0} 
                  onChange={handleSeek} 
                  style={progressStyle}
                  className="w-full h-1 appearance-none rounded-lg cursor-pointer accent-[#f47521] group-hover/slider:h-1.5 transition-all outline-none" 
                />
              </div>

              <div className="flex items-center justify-between text-white" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-4">
                  <button onClick={togglePlay} className="text-white hover:text-[#f47521] transition-colors focus:outline-none p-1">
                    {isPlaying ? (
                      <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    ) : (
                      <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    )}
                  </button>
                  <div className="text-xs md:text-sm font-medium tracking-wider">
                    {formatTime(currentTime)} <span className="text-neutral-400 mx-1">/</span> {formatTime(duration)}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <button onClick={toggleMute} className="text-white hover:text-[#f47521] transition-colors p-1">
                      {isMuted || volume == 0 ? (
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                      ) : (
                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                      )}
                    </button>
                    <input 
                      type="range" min="0" max="1" step="0.05" 
                      value={isMuted ? 0 : volume} 
                      onChange={handleVolumeChange} 
                      style={volumeStyle}
                      className="w-16 md:w-20 h-1 appearance-none rounded-lg cursor-pointer accent-[#f47521] outline-none" 
                    />
                  </div>
                  <button onClick={toggleFullscreen} className="text-white hover:text-[#f47521] transition-colors p-1">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {galleryImages.length > 0 && (
          <div className="w-full max-w-6xl mt-6 text-left">
            <span className="text-white font-semibold block mb-3 text-xs uppercase tracking-wider text-neutral-400">Gallery</span>
            {loadingGalleryImages ? (
              <p className="text-xs text-neutral-400">Loading gallery images...</p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-3 orange-scrollbar">
                {galleryImages.map((img, index) => {
                  let rawThumbUrl = img.paths?.thumbnail || img.paths?.image || "";
                  if (rawThumbUrl && !rawThumbUrl.startsWith('http')) {
                    rawThumbUrl = `http://localhost:9999${rawThumbUrl}`;
                  }
                  const separator = rawThumbUrl.includes('?') ? '&' : '?';
                  let thumbUrl = rawThumbUrl ? `${rawThumbUrl}${separator}apikey=${token}` : "";

                  return (
                    <div 
                      key={img.id} 
                      onClick={() => setPreviewIndex(index)}
                      className="flex-none w-28 h-28 bg-[#141519] rounded-lg overflow-hidden border border-neutral-800 hover:border-[#f47521] transition group shadow-md cursor-pointer relative"
                    >
                      <img src={thumbUrl} alt={img.title || "Gallery image"} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="w-full max-w-6xl mt-6 flex gap-6 text-sm text-left">
          
          {video.performers && video.performers.length > 0 && (
            <div className="w-40 shrink-0">
              <span className="text-white font-semibold block mb-3 text-xs uppercase tracking-wider text-neutral-400 pb-2 border-b border-neutral-800/80 w-[1150px]">Performers</span>
              <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto pr-1 orange-scrollbar pt-1">
                {video.performers.map((perf, i) => {
                  let perfImage = perf.image_path || "";
                  if (perfImage && !perfImage.startsWith('http')) {
                    perfImage = `http://localhost:9999${perfImage}`;
                  }
                  const separator = perfImage.includes('?') ? '&' : '?';
                  perfImage = perfImage ? `${perfImage}${separator}apikey=${token}` : "";
                  
                  return (
                    <div key={i} className="flex flex-col items-center bg-[#141519] rounded-lg overflow-hidden border border-neutral-800 hover:border-[#f47521] transition group p-2.5 w-full shadow-md">
                      {perfImage ? (
                        <img src={perfImage} alt={perf.name} className="w-full h-36 rounded object-cover shrink-0 mb-2" />
                      ) : (
                        <div className="w-full h-36 rounded bg-neutral-900 flex items-center justify-center text-xs text-gray-500 mb-2">No Image</div>
                      )}
                      <p className="text-xs text-white font-medium truncate w-full text-center">{perf.name}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0 flex flex-col pt-1">
            <div className="mt-8">
              <MetaRow label="Title" value={video.title} />
              <MetaRow label="Details" value={video.description} multiline />
              <div className="mt-4 pt-4 flex flex-col">
                <MetaRow label="Studio" value={video.studio} />
                <MetaRow label="Tags" value={tagsText} />
              </div>
            </div>
          </div>

        </div>

        <div className="w-full max-w-6xl mt-8 text-left">
          <span className="text-white font-semibold block mb-2 text-xs uppercase tracking-wider text-neutral-400">File Info</span>
          <div className="w-full border-t border-neutral-800/60 mb-4"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-0 gap-y-1 text-sm">
            
            <div className="flex flex-col min-w-0 pr-0">
              <MetaRow label="Duration" value={video.fileInfo?.duration} />
              <MetaRow label="Dimensions" value={video.fileInfo?.dimensions} />
              <MetaRow label="Frame Rate" value={video.fileInfo?.frameRate} />
              <MetaRow label="Bit Rate" value={video.fileInfo?.bitRate} />
              <MetaRow label="Video Codec" value={video.fileInfo?.videoCodec} />
              <MetaRow label="Audio Codec" value={video.fileInfo?.audioCodec} />
            </div>

            <div className="flex flex-col min-w-0 pl-2 border-l border-neutral-800/30 md:-ml-70">
              <MetaRow label="Stream" value={videoSrc} isLink />
              <MetaRow label="oshash" value={video.fileInfo?.oshash} />
              <MetaRow label="PHash" value={video.fileInfo?.phash || video.fileInfo?.oshash} />
              <MetaRow label="Path" value={video.fileInfo?.path} />
              <MetaRow label="File Size" value={video.fileInfo?.size} />
              <MetaRow label="File Modification Time" value={video.fileInfo?.modTime} />
            </div>

          </div>
        </div>

        {previewIndex !== null && galleryImages.length > 0 && (() => {
          let currentImg = galleryImages[previewIndex];
          let fullUrl = currentImg.paths?.image || currentImg.paths?.thumbnail || "";
          if (fullUrl && !fullUrl.startsWith('http')) fullUrl = `http://localhost:9999${fullUrl}`;
          const separator = fullUrl.includes('?') ? '&' : '?';
          fullUrl = fullUrl ? `${fullUrl}${separator}apikey=${token}` : "";

          return (
            <div onClick={() => setPreviewIndex(null)} className="fixed inset-0 bg-black/95 z-[99] flex items-center justify-center p-4 cursor-pointer select-none">
              
              <button 
                onClick={handlePrevImage} 
                className="absolute left-6 text-white bg-neutral-800/80 hover:bg-[#f47521] hover:text-black w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg z-[100]"
                title="Previous"
              >
                ❮
              </button>

              <div className="relative max-w-5xl max-h-screen flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <img src={fullUrl} alt="Preview Full" className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl mx-auto" />
                <button onClick={() => setPreviewIndex(null)} className="absolute -top-12 right-0 text-white bg-neutral-800 hover:bg-[#f47521] hover:text-black font-bold px-4 py-2 rounded-full transition-colors shadow-lg">✕</button>
              </div>

              <button 
                onClick={handleNextImage} 
                className="absolute right-6 text-white bg-neutral-800/80 hover:bg-[#f47521] hover:text-black w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg z-[100]"
                title="Next"
              >
                ❯
              </button>

            </div>
          );
        })()}

      </div>
    </div>
  );
}