import { useState } from "react";
import type { VehiclePhoto } from "../types";
import { cleanPhotoUrl, displayPhoto } from "../utils/photos";

interface PhotoGalleryProps {
  photos: VehiclePhoto[];
  title: string;
}

export default function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = photos[activeIndex] ?? photos[0];

  if (!active) {
    return <div className="gallery-main" />;
  }

  return (
    <div>
      <div className="gallery-main">
        <img src={displayPhoto(active)} alt={title} />
      </div>
      {photos.length > 1 && (
        <div className="gallery-thumbs">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              className={`thumb-btn ${index === activeIndex ? "active" : ""}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Foto ${index + 1}`}
            >
              <img src={cleanPhotoUrl(photo.thumb)} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
