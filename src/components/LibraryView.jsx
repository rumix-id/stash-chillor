import { useState, useEffect } from 'react';
import { fetchGalleryImages } from '../stashApi'; 

export default function LibraryView({ title = "Library", items = [], type = "", onSelectItem }) {
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(null);

  const token = localStorage.getItem('stash_api_key') || "";

  useEffect(() => {
    let isMounted = true;
    if (selectedGallery && selectedGallery.id) {
      setLoadingImages(true);
      fetchGalleryImages(selectedGallery.id).then(imgs => {
        if (isMounted) {
          setGalleryImages(imgs || []);
          setLoadingImages(false);
        }
      });
    } else {
      setGalleryImages([]);
    }
    return () => { isMounted = false; };
  }, [selectedGallery]);

  const safeItems = Array.isArray(items) ? items : [];

  if (safeItems.length === 0 && !selectedGallery) {
    return (
      <div className="max-w-[1600px] mx-auto w-full px-4 md:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold mb-3 text-white border-l-4 border-[#f47521] pl-3 inline-block">
          {title}
        </h2>
        <p className="text-gray-400">No {title.toLowerCase()} data found on your Stash server.</p>
      </div>
    );
  }

  const getGalleryName = (item) => {
    if (!item) return "Gallery";
    if (item.title && !item.title.toLowerCase().startsWith("gallery #")) {
      return item.title;
    }
    if (item.files && item.files.length > 0) {
      for (let file of item.files) {
        if (file.path) {
          const parts = file.path.split(/[/\\]/).filter(Boolean);
          if (parts.length >= 2) {
            const folderName = parts[parts.length - 2];
            if (folderName && !['galleries', 'stash', 'root', 'images', 'generated', 'covers'].includes(folderName.toLowerCase())) {
              return folderName;
            }
          }
          if (parts.length > 0) {
            return parts[parts.length - 1].replace(/\.[^/.]+$/, "");
          }
        }
      }
    }
    return `Gallery #${item.id}`;
  };

  let selectedGalleryName = selectedGallery ? getGalleryName(selectedGallery) : "";

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setPreviewIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setPreviewIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
  };

  const formatImageUrl = (rawPath) => {
    if (!rawPath) return "";
    let cleanPath = rawPath;
    if (!cleanPath.startsWith('http')) {
      cleanPath = `http://localhost:9999${cleanPath}`;
    }
    const separator = cleanPath.includes('?') ? '&' : '?';
    return `${cleanPath}${separator}apikey=${token}`;
  };

  if (type === 'gallery' && selectedGallery) {
    return (
      <div className="max-w-[1600px] mx-auto w-full px-4 md:px-8 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => {
              setSelectedGallery(null);
              setGalleryImages([]);
              setPreviewIndex(null);
            }}
            className="bg-neutral-800 hover:bg-[#f47521] text-white hover:text-black px-4 py-2 rounded text-sm font-bold transition-all shadow-md cursor-pointer"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-bold text-white border-l-4 border-[#f47521] pl-3 truncate">
            {selectedGalleryName}
          </h2>
        </div>

        {loadingImages ? (
          <div className="text-center py-20 text-[#f47521] font-bold">Loading image collection...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {galleryImages && galleryImages.length > 0 ? (
              galleryImages.map((img, index) => {
                let thumbUrl = formatImageUrl(img.paths?.thumbnail || img.paths?.image);

                return (
                  <div 
                    key={img.id || index}
                    onClick={() => setPreviewIndex(index)}
                    className="bg-[#141519] rounded-md overflow-hidden cursor-pointer group border border-neutral-800 hover:border-[#f47521] transition-all aspect-square relative shadow-md"
                  >
                    <img 
                      src={thumbUrl} 
                      alt={img.title || "Gallery item"} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="bg-[#f47521] text-black text-xs font-bold px-2.5 py-1 rounded shadow">
                        Preview
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 col-span-full text-center mt-10">No images found in this gallery.</p>
            )}
          </div>
        )}

        {previewIndex !== null && galleryImages.length > 0 && (
          <div 
            onClick={() => setPreviewIndex(null)} 
            className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 cursor-pointer select-none"
          >
            <button 
              onClick={handlePrevImage} 
              className="absolute left-6 text-white bg-neutral-800/80 hover:bg-[#f47521] hover:text-black w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg z-[10000] cursor-pointer"
              title="Previous"
            >
              ❮
            </button>

            <div className="relative max-w-5xl max-h-screen flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <img 
                src={formatImageUrl(galleryImages[previewIndex]?.paths?.image || galleryImages[previewIndex]?.paths?.thumbnail)} 
                alt="Preview Full" 
                className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl mx-auto" 
              />
              <button 
                onClick={() => setPreviewIndex(null)} 
                className="absolute -top-12 right-0 text-white bg-neutral-800 hover:bg-[#f47521] hover:text-black font-bold px-4 py-2 rounded-full transition-colors shadow-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <button 
              onClick={handleNextImage} 
              className="absolute right-6 text-white bg-neutral-800/80 hover:bg-[#f47521] hover:text-black w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg z-[10000] cursor-pointer"
              title="Next"
            >
              ❯
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto w-full px-4 md:px-8 py-8">
      <h2 className="text-2xl font-bold mb-6 text-white border-l-4 border-[#f47521] pl-3">
        {title}
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {safeItems.map((item) => {
          let rawImgUrl = item.image_path || item.paths?.cover || item.images?.[0]?.paths?.thumbnail || "";
          let imgUrl = formatImageUrl(rawImgUrl);

          let displayName = type === 'gallery' 
            ? getGalleryName(item) 
            : (item.name || item.title || `Item #${item.id}`);

          return (
            <div 
              key={item.id}
              onClick={() => {
                if (type === 'gallery') {
                  setSelectedGallery(item);
                } else if (onSelectItem) {
                  onSelectItem(item, type);
                }
              }}
              className="bg-[#141519] rounded-md p-4 border border-neutral-800 hover:border-[#f47521] transition-all cursor-pointer flex flex-col items-center text-center group shadow-md"
            >
              {type === 'studio' && (
                <div className="w-full h-32 rounded overflow-hidden bg-neutral-900 mb-3 border border-neutral-700 relative">
                  {imgUrl ? (
                    <img src={imgUrl} alt={displayName} className="w-full h-full object-cover group-hover:scale-105 transition-transform pointer-events-none" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Image</div>
                  )}
                </div>
              )}

              {type === 'performers' && (
                <div className="w-full aspect-[3/4] rounded overflow-hidden bg-neutral-900 mb-3 border border-neutral-700 relative">
                  {imgUrl ? (
                    <img src={imgUrl} alt={displayName} className="w-full h-full object-cover group-hover:scale-105 transition-transform pointer-events-none" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Image</div>
                  )}
                </div>
              )}

              {type === 'gallery' && (
                <div className="w-full aspect-[3/4] rounded overflow-hidden bg-neutral-900 mb-3 border border-neutral-700 relative">
                  {imgUrl ? (
                    <img src={imgUrl} alt={displayName} className="w-full h-full object-cover group-hover:scale-105 transition-transform pointer-events-none" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No Image</div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-white font-bold border border-neutral-700 shadow pointer-events-none">
                    {item.image_count || 0} Photos
                  </div>
                </div>
              )}

              {type === 'tag' && (
                <div className="w-full h-20 rounded bg-neutral-900 mb-2 border border-neutral-700 flex items-center justify-center px-2">
                  <span className="text-xl font-bold text-[#f47521] truncate w-full text-center">
                    {displayName}
                  </span>
                </div>
              )}

              {type !== 'tag' && (
                <h3 className="text-sm font-semibold text-white truncate w-full group-hover:text-[#f47521] transition-colors" title={displayName}>
                  {displayName}
                </h3>
              )}

              {item.scene_count !== undefined && (
                <p className="text-xs text-gray-400 mt-1">
                  {item.scene_count} Videos
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}