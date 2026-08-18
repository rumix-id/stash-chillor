import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import VideoRow from './components/VideoRow';
import VideoPlayer from './components/VideoPlayer';
import LibraryView from './components/LibraryView';
import { fetchScenes, fetchGalleries, fetchStudios, fetchTags, fetchPerformers } from './stashApi'; 

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('stash_api_key') || '');
  const [tempKey, setTempKey] = useState('');

  const [isChecking, setIsChecking] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [videos, setVideos] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [studios, setStudios] = useState([]);
  const [tags, setTags] = useState([]);
  const [performers, setPerformers] = useState([]);

  const [activeTab, setActiveTab] = useState('home');
  const [activeVideo, setActiveVideo] = useState(null);
  const [recentVideos, setRecentVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const formatImageUrl = (rawPath) => {
    if (!rawPath) return "";
    let cleanPath = rawPath;
    if (!cleanPath.startsWith('http')) {
      cleanPath = `http://localhost:9999${cleanPath}`;
    }
    const token = localStorage.getItem('stash_api_key') || "";
    const separator = cleanPath.includes('?') ? '&' : '?';
    return `${cleanPath}${separator}apikey=${token}`;
  };

  useEffect(() => {
    async function verifyStashSetup() {
      if (!apiKey) {
        setIsChecking(false);
        setIsConfigured(false);
        return;
      }

      try {
        setIsChecking(true);
        setErrorMessage('');

        const stashScenes = await fetchScenes();

        if (stashScenes !== null && stashScenes !== undefined) {
          setIsConfigured(true);
        } else {
          setIsConfigured(false);
          setErrorMessage('Stash responded, but the data is invalid.');
        }
      } catch (error) {
        setIsConfigured(false);
        setErrorMessage('Failed to connect to Stash. Make sure stash.exe is running and the file directory is correct.');
      } finally {
        setIsChecking(false);
      }
    }

    verifyStashSetup();
  }, [apiKey]);

  useEffect(() => {
    if (!isConfigured) return;

    const savedRecents = localStorage.getItem('recentVideos');
    if (savedRecents) {
      try {
        setRecentVideos(JSON.parse(savedRecents));
      } catch (e) {
        
      }
    }

    async function loadData() {
      const [stashScenes, stashGalleries, stashStudios, stashTags, stashPerformers] = await Promise.all([
        fetchScenes(),
        fetchGalleries(),
        fetchStudios(),
        fetchTags(),
        fetchPerformers()
      ]);

      setGalleries(stashGalleries || []);
      setStudios(stashStudios || []);
      setTags(stashTags || []);
      setPerformers(stashPerformers || []);
      
      if (stashScenes && stashScenes.length > 0) {
        const formatted = stashScenes.map(scene => {
          let rawImgUrl = scene.paths?.screenshot || "";
          let imgUrl = formatImageUrl(rawImgUrl);

          const streamPath = scene.paths?.stream || scene.files?.[0]?.path || "";
          
          const file = scene.files?.[0] || {};
          const oshash = file.fingerprints?.find(f => f.type === 'oshash')?.value || "-";
          const fileSize = file.size ? (file.size / (1024 * 1024)).toFixed(0) + " MiB" : "-";
          const modTime = file.mod_time ? new Date(file.mod_time).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'medium' }) : "-";
          const dimensions = file.width && file.height ? `${file.width} x ${file.height}` : "-";
          const frameRate = file.frame_rate ? `${file.frame_rate} fps` : "-";
          const bitRate = file.bit_rate ? `${(file.bit_rate / 1000000).toFixed(2)} mbps` : "-";
          const durationFmt = file.duration ? new Date(file.duration * 1000).toISOString().substr(11, 8) : "-";

          const fileName = file.path ? file.path.split('/').pop().split('\\').pop() : "";

          return {
            id: Number(scene.id),
            code: scene.code || "",
            title: scene.title || scene.code || (fileName ? fileName.replace(/\.[^/.]+$/, "") : `Scene ${scene.id}`),
            image: imgUrl,
            description: scene.details || "-",
            stream: streamPath,
            
            date: scene.date || "-",
            director: scene.director || "-",
            studio: scene.studio?.name || "-",
            tags: scene.tags ? scene.tags.map(t => t.name) : [],
            performers: scene.performers || [],
            galleriesData: scene.galleries || [],
            stashIds: scene.stash_ids?.map(s => `${s.endpoint || 'ID'}: ${s.stash_id}`).join(', ') || "-",
            
            fileInfo: {
              oshash: oshash,
              path: file.path || "-",
              size: fileSize,
              modTime: modTime,
              duration: durationFmt,
              dimensions: dimensions,
              frameRate: frameRate,
              bitRate: bitRate,
              videoCodec: file.video_codec || "-",
              audioCodec: file.audio_codec || "-"
            }
          };
        });

        const sortedVideos = formatted.sort((a, b) => b.id - a.id);
        setVideos(sortedVideos);
      }
      setLoading(false);
    }
    
    loadData();
  }, [isConfigured]);

  const handleSaveKey = (e) => {
    e.preventDefault();
    if (tempKey.trim()) {
      localStorage.setItem('stash_api_key', tempKey.trim());
      setApiKey(tempKey.trim());
    }
  };

  const handleCloseVideo = (video) => {
    if (video) {
      const updated = [video, ...recentVideos.filter(v => v.id !== video.id)].slice(0, 9);
      setRecentVideos(updated);
      localStorage.setItem('recentVideos', JSON.stringify(updated));
    }
    setActiveVideo(null);
  };

  const handleSelectItem = (item) => {
    const keyword = item.name || item.title || "";
    if (keyword) {
      setSearchQuery(keyword);
      setActiveTab('home');
    }
  };

  const query = searchQuery.toLowerCase();

  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(query) ||
    (video.code || "").toLowerCase().includes(query) ||
    video.studio.toLowerCase().includes(query) ||
    video.tags.some(tag => tag.toLowerCase().includes(query)) ||
    video.performers.some(p => p.name.toLowerCase().includes(query))
  );

  const filteredGalleries = galleries.filter(g => (g.title || "").toLowerCase().includes(query));
  const filteredStudios = studios.filter(s => (s.name || "").toLowerCase().includes(query));
  const filteredPerformers = performers.filter(p => (p.name || "").toLowerCase().includes(query));
  const filteredTags = tags.filter(t => (t.name || "").toLowerCase().includes(query));

  if (isChecking && apiKey) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#f47521] mb-4"></div>
        <p className="text-gray-400 text-sm">Checking Stash connection and directory...</p>
      </div>
    );
  }

  if (!apiKey || !isConfigured) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center px-4">
        <div className="bg-[#141519] border border-neutral-800 p-8 rounded-xl max-w-md w-full shadow-2xl text-center">
          <h1 className="text-2xl font-extrabold text-[#f47521] mb-2">Stash Chillor Setup</h1>
          <p className="text-gray-400 text-sm mb-6">
            {errorMessage ? (
              <span className="text-red-400 block mb-3">{errorMessage}</span>
            ) : null}
            Enter your Stash API Key. Make sure the backend <code className="text-white bg-neutral-800 px-1.5 py-0.5 rounded">stash.exe</code> is running.
          </p>
          
          <form onSubmit={handleSaveKey} className="flex flex-col gap-4">
            <input 
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="Paste API Key here..."
              className="w-full bg-[#23252b] border border-neutral-700 text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-[#f47521]"
              required
            />
            <button 
              type="submit"
              className="w-full bg-[#f47521] hover:bg-[#d9651a] text-black font-bold py-2.5 rounded-lg transition-colors shadow-lg"
            >
              Verify & Continue
            </button>
          </form>

          {apiKey && !isConfigured && (
            <button 
              onClick={() => {
                localStorage.removeItem('stash_api_key');
                setApiKey('');
              }}
              className="mt-4 text-xs text-gray-500 hover:text-gray-300 underline"
            >
              Change API Key / Reset
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <Navbar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      {activeVideo && (
        <VideoPlayer 
          video={activeVideo} 
          onClose={() => handleCloseVideo(activeVideo)} 
        />
      )}
      
      {activeTab === 'gallery' ? (
        <LibraryView title="Galleries" items={filteredGalleries} type="gallery" onSelectItem={handleSelectItem} />
      ) : activeTab === 'studio' ? (
        <LibraryView title="Studios" items={filteredStudios} type="studio" onSelectItem={handleSelectItem} />
      ) : activeTab === 'performers' ? (
        <LibraryView title="Performers" items={filteredPerformers} type="performers" onSelectItem={handleSelectItem} />
      ) : activeTab === 'tags' ? (
        <LibraryView title="Tags" items={filteredTags} type="tag" onSelectItem={handleSelectItem} />
      ) : (
        <>
          {!searchQuery && videos.length > 0 && (
            <HeroBanner 
              videos={videos} 
              onPlay={(video) => setActiveVideo(video)} 
            />
          )}

          <div className="max-w-[1600px] mx-auto w-full px-4 md:px-8">
            <div className={`${searchQuery ? 'mt-10' : '-mt-10'} relative z-20`}>
              {loading ? (
                <p className="text-center text-[#f47521] mt-20 font-bold">Loading Stash Collection...</p>
              ) : searchQuery ? (
                <div>
                  <VideoRow 
                    title={`Search Results: "${searchQuery}" (${filteredVideos.length})`}
                    videos={filteredVideos}
                    onVideoClick={(video) => setActiveVideo(video)}
                    isGrid={true}
                  />
                </div>
              ) : videos.length > 0 ? (
                <>
                  {recentVideos.length > 0 && (
                    <VideoRow 
                      title="Recently Played" 
                      videos={recentVideos} 
                      onVideoClick={(video) => setActiveVideo(video)} 
                    />
                  )}
                  
                  <VideoRow 
                    title="My Collection" 
                    videos={videos} 
                    onVideoClick={(video) => setActiveVideo(video)} 
                    isGrid={true}
                  />
                </>
              ) : (
                <p className="text-center text-gray-400 mt-20">No scenes found.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}