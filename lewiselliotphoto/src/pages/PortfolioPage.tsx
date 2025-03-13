import Footer from '../components/Footer';
import ImageGallery from '../components/ImageGallery';
import portfolioContent from '../content/portfolio.json'

const PortfolioPage = () => {

    const photos = portfolioContent.photos;

    return (
      <>
      <div
        style={{
          margin: '10px',
        }}
      >
        {
          Object.entries(photos).map(albumData => {
            return (
              <div
                key={albumData[0]}
              >
                <hr/>
                <h2>
                  {albumData[0]}
                </h2>
                <hr/>
                <ImageGallery
                  images={albumData[1]}
                />
              </div>
            );
          })
        }
      </div>
      <Footer />
      </>
    );
};

export default PortfolioPage;