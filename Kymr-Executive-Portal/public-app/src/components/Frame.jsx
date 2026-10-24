import { useState } from "react";
import { srcSetFor } from "@/data/media";

// A media well.
//
// Reserves its aspect box before the file loads, so any manifest slot
// can be swapped for artwork with a different subject or crop without
// moving a pixel of surrounding layout.
//
// A slot whose file is missing degrades to the well plus its label
// rather than a broken image icon, which matters while the real assets
// are still being produced.
//
// `ratioClass` art-directs the crop per breakpoint. When it is given,
// the inline aspect-ratio is dropped so the classes are not fighting a
// higher-specificity inline value: a phone can hold a 3:2 crop of the
// same slot the desktop shows at 16:9, without a second image.
export default function Frame({
  media,
  alt,
  priority = false,
  sizes = "100vw",
  ratio,
  ratioClass,
  className = "",
  style,
  children,
}) {
  const [missing, setMissing] = useState(false);

  return (
    <div
      className={`well ${ratioClass ?? ""} ${className}`}
      data-missing={missing ? "true" : undefined}
      data-label={media.label}
      style={{
        aspectRatio: ratioClass ? undefined : ratio ?? media.ratio,
        "--focal": media.focal,
        ...style,
      }}
    >
      <img
        src={media.src}
        srcSet={srcSetFor(media)}
        sizes={sizes}
        alt={alt}
        width={media.w}
        height={media.h}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        draggable={false}
        onError={() => setMissing(true)}
      />
      {children}
    </div>
  );
}
