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
          height: 'calc(100vh - 140px)',
          maxHeight: 'calc(100vw * 9 / 16)'
        }}
      />
      <div
        style={{
          marginLeft: '10px',
          marginRight: '10px',
        }}
      >
        <p>
          {homeContent.bio}
        </p>
      </div>
    </>
  );
};

export default HomePage;