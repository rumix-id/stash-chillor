const STASH_URL = "http://localhost:9999/graphql";

function getHeaders() {
  const token = localStorage.getItem('stash_api_key') || "";
  return {
    "Content-Type": "application/json",
    "ApiKey": token
  };
}

export async function fetchScenes() {
  let allScenes = [];
  let page = 1;
  const perPage = 100;
  let hasMore = true;

  while (hasMore) {
    const query = `
      query {
        findScenes(filter: { page: ${page}, per_page: ${perPage} }) {
          scenes {
            id
            title
            details
            date
            director
            studio { id name }
            tags { id name }
            performers { id name image_path }
            galleries { id title }
            stash_ids { stash_id endpoint }
            paths { screenshot stream preview webp } 
            files {
              path size mod_time duration width height
              frame_rate bit_rate video_codec audio_codec
              fingerprints { type value }
            }
          }
        }
      }
    `;

    try {
      const response = await fetch(STASH_URL, {
        method: "POST", 
        headers: getHeaders(), 
        body: JSON.stringify({ query }),
      });
      const result = await response.json();
      const items = result.data?.findScenes?.scenes || [];
      
      allScenes = [...allScenes, ...items];
      
      // Jika hasil yang didapat kurang dari 100, berarti ini halaman terakhir
      if (items.length < perPage) {
        hasMore = false;
      } else {
        page++;
      }
    } catch (error) {
      hasMore = false;
    }
  }
  return allScenes;
}

export async function fetchGalleries() {
  let allGalleries = [];
  let page = 1;
  const perPage = 100;
  let hasMore = true;

  while (hasMore) {
    const query = `
      query {
        findGalleries(filter: { page: ${page}, per_page: ${perPage} }) {
          galleries {
            id
            title
            image_count
            paths { cover }
            files { path }
            folder { path } 
          }
        }
      }
    `;

    try {
      const response = await fetch(STASH_URL, {
        method: "POST", 
        headers: getHeaders(), 
        body: JSON.stringify({ query }),
      });
      const result = await response.json();
      const items = result.data?.findGalleries?.galleries || [];
      
      allGalleries = [...allGalleries, ...items];
      
      if (items.length < perPage) {
        hasMore = false;
      } else {
        page++;
      }
    } catch (error) {
      hasMore = false;
    }
  }

  return allGalleries.map(g => {
    let cleanTitle = g.title;
    
    if (!cleanTitle || cleanTitle.trim() === "" || cleanTitle.toLowerCase().startsWith("gallery #")) {
      let pathToExtract = "";
      
      if (g.folder && g.folder.path) {
        pathToExtract = g.folder.path;
      } 
      else if (g.files && g.files.length > 0 && g.files[0].path) {
        pathToExtract = g.files[0].path;
      }

      if (pathToExtract) {
        const parts = pathToExtract.split(/[/\\]/).filter(Boolean);
        if (parts.length > 0) {
          const lastPart = parts[parts.length - 1];
          cleanTitle = lastPart.replace(/\.[^/.]+$/, ""); 
        }
      }
    }

    return {
      ...g,
      title: cleanTitle || `Gallery #${g.id}`
    };
  });
}

export async function fetchGalleryImages(galleryId) {
  let allImages = [];
  let page = 1;
  const perPage = 100;
  let hasMore = true;

  while (hasMore) {
    const query = `
      query {
        findImages(image_filter: { galleries: { value: ["${galleryId}"], modifier: INCLUDES } }, filter: { page: ${page}, per_page: ${perPage} }) {
          images {
            id
            title
            paths {
              thumbnail
              image
            }
          }
        }
      }
    `;

    try {
      const response = await fetch(STASH_URL, {
        method: "POST", 
        headers: getHeaders(), 
        body: JSON.stringify({ query }),
      });
      const result = await response.json();
      const items = result.data?.findImages?.images || [];
      
      allImages = [...allImages, ...items];
      
      if (items.length < perPage) {
        hasMore = false;
      } else {
        page++;
      }
    } catch (error) {
      hasMore = false;
    }
  }
  return allImages;
}

export async function fetchStudios() {
  let allStudios = [];
  let page = 1;
  const perPage = 100;
  let hasMore = true;

  while (hasMore) {
    const query = `
      query {
        findStudios(filter: { page: ${page}, per_page: ${perPage} }) {
          studios { id name image_path scene_count }
        }
      }
    `;
    try {
      const response = await fetch(STASH_URL, {
        method: "POST", 
        headers: getHeaders(), 
        body: JSON.stringify({ query }),
      });
      const result = await response.json();
      const items = result.data?.findStudios?.studios || [];
      
      allStudios = [...allStudios, ...items];
      
      if (items.length < perPage) {
        hasMore = false;
      } else {
        page++;
      }
    } catch (error) {
      hasMore = false;
    }
  }
  return allStudios;
}

export async function fetchTags() {
  let allTags = [];
  let page = 1;
  const perPage = 100;
  let hasMore = true;

  while (hasMore) {
    const query = `
      query {
        findTags(filter: { page: ${page}, per_page: ${perPage} }) {
          tags { id name scene_count }
        }
      }
    `;
    try {
      const response = await fetch(STASH_URL, {
        method: "POST", 
        headers: getHeaders(), 
        body: JSON.stringify({ query }),
      });
      const result = await response.json();
      const items = result.data?.findTags?.tags || [];
      
      allTags = [...allTags, ...items];
      
      if (items.length < perPage) {
        hasMore = false;
      } else {
        page++;
      }
    } catch (error) {
      hasMore = false;
    }
  }
  return allTags;
}

export async function fetchPerformers() {
  let allPerformers = [];
  let page = 1;
  const perPage = 100;
  let hasMore = true;

  while (hasMore) {
    const query = `
      query {
        findPerformers(filter: { page: ${page}, per_page: ${perPage} }) {
          performers {
            id
            name
            image_path
            scene_count
          }
        }
      }
    `;
    try {
      const response = await fetch(STASH_URL, {
        method: "POST", 
        headers: getHeaders(), 
        body: JSON.stringify({ query }),
      });
      const result = await response.json();
      const items = result.data?.findPerformers?.performers || [];
      
      allPerformers = [...allPerformers, ...items];
      
      if (items.length < perPage) {
        hasMore = false;
      } else {
        page++;
      }
    } catch (error) {
      hasMore = false;
    }
  }
  return allPerformers;
}