import ImageSlideshow from "../components/ImageSlideshow";

import homeContent from "../content/home.json"

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
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '50px',
            marginLeft: '10px',
            marginRight: '10px',
        }}
      >
        <div
          style={{
            maxWidth: '1000px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '50px'
          }}
        >
          <div
            style={{
              fontSize: 'large',
              border: '1px solid #313133',
              borderLeft: 'none',
              borderRight: 'none',
              paddingTop: '50px',
              paddingBottom: '50px',
            }}
          >
            {homeContent.introduction}
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'stretch',
              gap: '10px'
            }}
          >
            {homeContent.quotes.map((quote, quoteIndex) => (
              <div
                key={`quote_${quoteIndex}`}
                style={{
                  padding: '10px',
                  backgroundColor: 'rgba(49, 49, 51, 0.05)',
                  // TODO use css and make this responsive
                  width: '100%',
                  maxWidth: '450px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  justifyContent: 'center',
                }}
              >
                {quote.quote}
                <sub>
                  {quote.name}
                </sub>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;