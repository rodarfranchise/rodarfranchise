import { useEffect, useRef, useState } from "react";
import { fetchTeamActionImages } from "../../services/teamActionService";
import "../../App.css";

export default function TeamActionSlider() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [fadeIn, setFadeIn] = useState(true); // reused as slide trigger
  const [slideDir, setSlideDir] = useState(1); // 1: next (left), -1: prev (right)
  const timerRef = useRef(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchTeamActionImages();
        if (mounted) setItems(data);
      } catch (e) {
        console.error("Failed to load team action images", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    // Pause auto-advance when modal is open or only one image
    if (items.length <= 1 || showModal) return;
    timerRef.current = setInterval(() => {
      setSlideDir(1);
      setFadeIn(false);
      setPrevIndex((i) => (i === null ? index : i));
      setIndex((i) => (i + 1) % items.length);
      setTimeout(() => setPrevIndex(null), 520);
    }, 5000);
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [items.length, showModal, index]);

  // Ensure hooks order is consistent across renders (place before early returns)
  useEffect(() => {
    // trigger fade-in animation on index change
    setFadeIn(false);
    const raf = requestAnimationFrame(() => setFadeIn(true));
    return () => cancelAnimationFrame(raf);
  }, [index]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!items.length) {
    return null;
  }

  const current = items[index];
  const hasMeta = Boolean(current?.heading) || Boolean(current?.description);
  const imgSrc = current.image_data || current.image_url;

  const goTo = (next) => {
    setFadeIn(false);
    setPrevIndex(index);
    setIndex(next);
    // Clear prev after fade duration
    setTimeout(() => setPrevIndex(null), 520);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <div className="relative overflow-hidden rounded-xl shadow-lg group">
        <button
          type="button"
          className="block w-full relative h-[420px]"
          onClick={() => setShowModal(true)}
        >
          {/* Slide transition between prev and current */}
          {prevIndex !== null && (
            <img
              key={`prev-${prevIndex}`}
              src={(items[prevIndex]?.image_data) || (items[prevIndex]?.image_url)}
              alt={(items[prevIndex]?.heading) || "Team action previous"}
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 transform ${fadeIn ? (slideDir === 1 ? '-translate-x-full' : 'translate-x-full') : 'translate-x-0'}`}
            />
          )}
          <img
            key={`cur-${index}`}
            src={imgSrc}
            alt={current.heading || "Team action"}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 transform ${fadeIn ? 'translate-x-0' : (slideDir === 1 ? 'translate-x-full' : '-translate-x-full')}`}
          />
        </button>
        {hasMeta && (
          <div className="absolute inset-0 pointer-events-none bg-black/0 group-hover:bg-black/55 transition-colors">
            <div className="absolute bottom-0 left-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity text-white">
              {current.heading && (
                <h3 className="text-xl font-semibold mb-1">{current.heading}</h3>
              )}
              {current.description && (
                <p className="text-sm leading-relaxed">{current.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <button
          type="button"
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/75 hover:bg-white text-slate-800 rounded-full h-9 w-9 flex items-center justify-center shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          onClick={() => { setSlideDir(-1); goTo((index - 1 + items.length) % items.length); }}
        >
          <span className="sr-only">Previous</span>
          <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M12.7 5.3a1 1 0 010 1.4L9.41 10l3.3 3.3a1 1 0 01-1.42 1.4l-4-4a1 1 0 010-1.4l4-4a1 1 0 011.41 0z"/></svg>
        </button>

        <button
          type="button"
          aria-label="Next slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/75 hover:bg-white text-slate-800 rounded-full h-9 w-9 flex items-center justify-center shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          onClick={() => { setSlideDir(1); goTo((index + 1) % items.length); }}
        >
          <span className="sr-only">Next</span>
          <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M7.3 5.3a1 1 0 000 1.4L10.59 10l-3.3 3.3a1 1 0 001.42 1.4l4-4a1 1 0 000-1.4l-4-4a1 1 0 00-1.41 0z"/></svg>
        </button>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {items.map((_, i) => (
          <button
            key={i}
            aria-label={`Slide ${i + 1}`}
            className={`h-2 w-2 rounded-full ${i === index ? "bg-gray-800" : "bg-gray-300"}`}
            onClick={() => { setSlideDir(i > index ? 1 : -1); goTo(i); }}
          />
        ))}
      </div>

      {/* Image Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowModal(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative bg-black rounded-xl shadow-2xl max-w-6xl w-full">
              <button
                type="button"
                className="absolute top-3 right-3 bg-white/90 text-slate-800 rounded-full h-9 w-9 flex items-center justify-center shadow focus:outline-none"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/></svg>
              </button>
              {/* Modal navigation buttons */}
              <button
                type="button"
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 rounded-full h-10 w-10 flex items-center justify-center shadow focus:outline-none"
                onClick={(e) => { e.stopPropagation(); setSlideDir(-1); setFadeIn(false); setPrevIndex(index); setIndex((i) => (i - 1 + items.length) % items.length); setTimeout(() => setPrevIndex(null), 520); }}
              >
                <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M12.7 5.3a1 1 0 010 1.4L9.41 10l3.3 3.3a1 1 0 01-1.42 1.4l-4-4a1 1 0 010-1.4l4-4a1 1 0 011.41 0z"/></svg>
              </button>
              <button
                type="button"
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 rounded-full h-10 w-10 flex items-center justify-center shadow focus:outline-none"
                onClick={(e) => { e.stopPropagation(); setSlideDir(1); setFadeIn(false); setPrevIndex(index); setIndex((i) => (i + 1) % items.length); setTimeout(() => setPrevIndex(null), 520); }}
              >
                <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M7.3 5.3a1 1 0 000 1.4L10.59 10l-3.3 3.3a1 1 0 001.42 1.4l4-4a1 1 0 000-1.4l-4-4a1 1 0 00-1.41 0z"/></svg>
              </button>
              <img
                src={imgSrc}
                alt={current.heading || "Team action"}
                className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
              />
              {(current.heading || current.description) && (
                <div className="px-4 py-3 text-white">
                  {current.heading && <h3 className="text-lg font-semibold">{current.heading}</h3>}
                  {current.description && <p className="text-sm mt-1 leading-relaxed text-slate-200">{current.description}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
