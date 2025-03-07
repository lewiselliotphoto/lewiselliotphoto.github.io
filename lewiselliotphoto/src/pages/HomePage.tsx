import ImageSlideshow from "../components/ImageSlideshow";
import LazyLoadImage from "../components/LazyLoadImage";

import homeContent from "../content/home.json"

import './home.css'

const HomePage = () => {

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
        className="homeContainer"
      >
        <div
          className="homeContainerInner"
        >
          <hr/>
          <p>
            {homeContent.introduction}
          </p>
          <hr/>
          <div
            className="reviewsContainer"
          >
            {homeContent.quotes.map((quote, quoteIndex) => (
              <div
              key={`quote_${quoteIndex}`}
              className="review"
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
              </div>
            ))}
          </div>
          <hr/>
        </div>
      </div>
    </>
  );
};

export default HomePage;