import galleryProjects from "./content/gallery.json";
import soundProjects from "./content/sound.json";
import videoProjects from "./content/video.json";
import websiteProjects from "./content/website.json";
import communicationContent from "./content/communication.json";
import { publicUrl } from "./urls";

export const categoryMeta = {
  gallery: {
    label: "GALLERY",
    eyebrow: "Still image & visual work",
    description: "Photography, collage, composite imagery, and quiet visual studies.",
    accent: "#d98335",
  },
  sound: {
    label: "SOUND",
    eyebrow: "Recorded media & composition",
    description: "Original composition, sound design, radio, and ambient experiments.",
    accent: "#3477cf",
  },
  video: {
    label: "VIDEO",
    eyebrow: "Film & moving image",
    description: "Experimental film, stop motion, and moving-image studies.",
    accent: "#8b929a",
  },
  website: {
    label: "WEBSITE",
    eyebrow: "Interactive & coded work",
    description: "Browser-based media, creative code, and responsive digital experiences.",
    accent: "#47b553",
  },
};

export const categories = Object.keys(categoryMeta);
export const communication = {
  ...communicationContent,
  cvLink: publicUrl(communicationContent.cvLink),
};

export const projects = [
  ...galleryProjects,
  ...soundProjects,
  ...videoProjects,
  ...websiteProjects,
].map((project) => {
  const result = { ...project };
  for (const key of ["thumbnail", "mediaUrl", "videoUrl", "audioUrl", "websiteUrl", "githubUrl", "externalUrl", "localProjectPath"]) {
    if (result[key]) result[key] = publicUrl(result[key]);
  }
  if (result.images) result.images = result.images.map(publicUrl);
  return result;
});

export function projectsFor(category) {
  return projects
    .filter(
      (project) =>
        project.category === category &&
        project.status === "published",
    )
    .sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0));
}

export function projectBySlug(category, slug) {
  return projects.find(
    (project) =>
      project.category === category &&
      project.slug === slug &&
      project.status === "published",
  );
}

export function youtubeId(url = "") {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&/]+)/,
  );
  return match?.[1] || "";
}

export function youtubeEmbedUrl(url = "") {
  const id = youtubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : "";
}
