const STASH_URL = "http://localhost:9999/graphql";

function getHeaders() {
  const token = localStorage.getItem('stash_api_key') || "";
  return {
    "Content-Type": "application/json",
    "ApiKey": token
  };
}

export async function fetchScenes() {
  const query = `
    query {
      findScenes {
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
    return result.data?.findScenes?.scenes || [];
  } catch (error) {
    return [];
  }
}

export async function fetchGalleries() {
  const query = `
    query {
      findGalleries(filter: { per_page: -1 }) {
        count
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
    const galleries = result.data?.findGalleries?.galleries || [];

    return galleries.map(g => {
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
  } catch (error) {
    return [];
  }
}

export async function fetchGalleryImages(galleryId) {
  const query = `
    query {
      findImages(image_filter: { galleries: { value: ["${galleryId}"], modifier: INCLUDES } }, filter: { per_page: -1 }) {
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
    return result.data?.findImages?.images || [];
  } catch (error) {
    return [];
  }
}

export async function fetchStudios() {
  const query = `
    query {
      findStudios(filter: { per_page: -1 }) {
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
    return result.data?.findStudios?.studios || [];
  } catch (error) {
    return [];
  }
}

export async function fetchTags() {
  const query = `
    query {
      findTags(filter: { per_page: -1 }) {
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
    return result.data?.findTags?.tags || [];
  } catch (error) {
    return [];
  }
}

export async function fetchPerformers() {
  const query = `
    query {
      findPerformers(filter: { per_page: -1 }) {
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
    return result.data?.findPerformers?.performers || [];
  } catch (error) {
    return [];
  }
}