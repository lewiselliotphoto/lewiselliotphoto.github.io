import { useEffect, useRef, useState } from "react";

import AnimateOnScroll from "../components/AnimateOnScroll";
import ImageSlideshow from "../components/ImageSlideshow";
import LazyLoadImage from "../components/LazyLoadImage";

import homeContent from "../content/home.json"

import './home.css'

const HomePage = () => {

  const ref = useRef<HTMLDivElement | null>(null);

  const [showScrollHint, setShowScrollHint] = useState<boolean>(true);
  const [scrollHintDismissed, setScrollHintDismissed] = useState<boolean>(false);
    
  // Set visibility state of scroll hint
  useEffect(() => {

    const onViewportChanged = () => {

      if (!ref.current) {
        return;
      }

      const boundingRect = ref.current.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const shouldShow = boundingRect.top >= windowHeight;

      if (showScrollHint && !shouldShow) {
        setScrollHintDismissed(true);
      }

      setShowScrollHint(shouldShow);
    };

    window.removeEventListener('scroll', onViewportChanged);
    window.removeEventListener('resize', onViewportChanged);
    window.addEventListener('scroll', onViewportChanged, { passive: true });
    window.addEventListener('resize', onViewportChanged, { passive: true });
    onViewportChanged();
    
    return () => {
        window.removeEventListener('scroll', onViewportChanged);
        window.removeEventListener('resize', onViewportChanged);
    }

  }, [showScrollHint, scrollHintDismissed, ref]);

  return (
    <>
      <ImageSlideshow
        images={homeContent.photos}
        autoScroll={true}
        hasControls={false}
        style={{
            width: '100%',
            height: 'calc(100vh - 100px)',
            minHeight: 'calc(100vw * 1 / 2.39)',
            maxHeight: 'calc(100vw * 9 / 16)',
        }}
      />
      <div
        className="scrollDownArrow"
        style={{
          bottom: (showScrollHint && !scrollHintDismissed) ? '10px' : '-60px'
        }}
        onClick={() => ref.current?.scrollIntoView({behavior: 'smooth'})}
      >
      </div>
      <div
        className="homeContainer"
      >
        <div
          className="homeContainerInner"
        >
          <hr/>
          <div ref={ref}></div>
          <p>
            {homeContent.introduction}
          </p>
          <hr/>
          <div
            className="reviewsContainer"
          >
            {homeContent.quotes.map((quote, quoteIndex) => (
              <AnimateOnScroll
                  key={`quote${quoteIndex}`}
                  classes={["review"]}
                  style={{}}
              >
                <a
                  className="reviewHeader"
                  href={quote.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <LazyLoadImage
                    preview={`${quote.photo.file_id}.${quote.photo.extension}`}
                    medium={`${quote.photo.file_id}.${quote.photo.extension}`}
                    large={`${quote.photo.file_id}.${quote.photo.extension}`}
                    description={quote.photo.description}
                    style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50px',
                        flexShrink: 0,
                        filter: 'grayscale(100%)'
                    }}
                  />
                  <div
                    className="reviewName"
                  >
                    {quote.name}
                  </div>
                </a>
                <div>
                  {quote.quote}
                </div>
              </AnimateOnScroll>
            ))}
          </div>
          <hr/>
          <div
            className="nameCheckContainer"
          >
            {homeContent.name_checks.map((nameCheck, nameCheckIndex) => (
              <AnimateOnScroll
                  key={`nameCheck${nameCheckIndex}`}
                  classes={["nameCheck"]}
                  style={{
                    height: `${(0.8 + Math.min(2.0, Math.max(0.2, nameCheck.photo.height / nameCheck.photo.width))) * 50}px`,
                    aspectRatio: nameCheck.photo.width / nameCheck.photo.height,
                  }}
              >
                <a
                  href={nameCheck.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <LazyLoadImage
                    preview={`${nameCheck.photo.file_id}.${nameCheck.photo.extension}`}
                    medium={`${nameCheck.photo.file_id}.${nameCheck.photo.extension}`}
                    large={`${nameCheck.photo.file_id}.${nameCheck.photo.extension}`}
                    description={nameCheck.photo.name}
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </a>
              </AnimateOnScroll>
            ))}
          </div>
          <hr/>
        </div>
      </div>
    </>
  );
};

export default HomePage;