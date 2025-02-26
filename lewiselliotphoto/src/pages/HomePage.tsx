import ImageGallery from "../components/ImageGallery";

import homeContent from '../content/home.json'

const HomePage = () => {
  return (
    <>
      <ImageGallery
        images={homeContent.photos}
      />
    </>
  );
};

export default HomePage;