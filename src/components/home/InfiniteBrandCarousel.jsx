import React from 'react'
import SketchUnderline from './SketchUnderline'

// Dynamically import all images from brands folder
const imageModules = import.meta.glob('../../assets/brands/*.{png,jpg,jpeg,svg}', { eager: true })
const images = Object.values(imageModules).map(mod => mod.default)

export default function InfiniteBrandCarousel() {
  // Repeat images to ensure infinite effect
  const repeatedImages = Array(8).fill(images).flat()
  return (
    <div className="w-full py-12">
  <h2 className="text-center text-2xl md:text-3xl font-bold mb-2 text-white tracking-tight">Brands that trust us</h2>
  <SketchUnderline width={240} height={18} strokeWidth={6} tilt={-2} className="mb-8" />
      <div className="relative overflow-hidden">
        <div
          className="carousel-track flex gap-16 animate-scroll-infinite"
          style={{ animationPlayState: 'running' }}
        >
          {repeatedImages.map((src, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 flex items-center justify-center group transition-transform duration-300"
              style={{ transition: 'transform 0.3s' }}
            >
              <img
                src={src}
                alt="Brand logo"
                className="max-h-40 max-w-[16rem] object-contain group-hover:scale-110 transition-transform duration-300"
                style={{ transition: 'transform 0.3s' }}
              />
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes scroll-infinite {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .carousel-track {
          width: 800%;
          animation: scroll-infinite 120s linear infinite;
        }
        .carousel-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
