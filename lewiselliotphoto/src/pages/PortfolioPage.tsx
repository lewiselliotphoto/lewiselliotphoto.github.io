import ImageGallery from '../components/ImageGallery';
import portfolioContent from '../content/portfolio.json'

const PortfolioPage = () => {

    const photos = portfolioContent.photos;

    return (
      <>
        {
          Object.entries(photos).map(albumData => {
            return (
              <div
                key={albumData[0]}
              >
                <h2>
                  {albumData[0]}
                </h2>
                <ImageGallery
                  images={albumData[1]}
                />
                <hr/>
              </div>
            );
          })
        }
      </>
    );
};

export default PortfolioPage;