import contactDetails from './content/contact.json'
import homeContent from './content/home.json'
import portfolioContent from './content/portfolio.json'
import videoContent from './content/video.json'

import './DelayedLoadImage'
import DelayedLoadImage from './DelayedLoadImage';

const App = () => {

  return (
    <div className="App">
      <header className="App-header">
        <h1>
          Lewis Elliot Photography
        </h1>
      </header>
      <h2>
        HOME
      </h2>
      <section
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          alignContent: 'center',
          gap: '20px'
        }}
      >
        {
          homeContent.photos.map(imageData => (
            <DelayedLoadImage
              key={imageData.file_id}
              imageId={imageData.file_id}
              extension={imageData.extension}
              fullWidth={imageData.width}
              fullHeight={imageData.height}
              width={640}
              description={imageData.description}
            />
          ))
        }
      </section>
      <section>
        {homeContent.bio}
      </section>
      <section>
        {homeContent.introduction}
      </section>
      <section>
        {
          homeContent.name_checks.map((nameCheck, index) => (
            <div
              key={`nameCheck${index}`}
            >
              <a
                href={nameCheck.url}
                target='_blank'
                rel='noreferrer'
              >
                {nameCheck.name}
              </a>
            </div>
          ))

        }
      </section>
      <section>
        {
          homeContent.quotes.map((quote, index) => (
            <div
              className='quote'
              key={`quote${index}`}
            >
              <i> {quote.quote} </i>
              <br/>
              <sub>
                {quote.name}
              </sub>
            </div>
          ))
        }
      </section>
      <section>
        <table>
          <tbody>
            <tr>
              <th>
                Email
              </th>
              <td>
                {contactDetails.email}
              </td>
            </tr>
            <tr>
              <th>
                Instagram
              </th>
              <td>
                {contactDetails.instagram}
              </td>
            </tr>
          </tbody>
        </table>
      </section>
      <h2>
        PORTFOLIO
      </h2>
      {
        Object.entries(portfolioContent.photos).map(([album, images], index) => (
          <div
            key={`album${index}`}
          >
            <h3>
              {album.toUpperCase()}
            </h3>
            <section
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                alignContent: 'center',
                gap: '20px'
              }}
            >
              {
                images.map(imageData => (
                  <div
                    key={imageData.file_id}
                  >
                    <DelayedLoadImage
                      imageId={imageData.file_id}
                      extension={imageData.extension}
                      fullWidth={imageData.width}
                      fullHeight={imageData.height}
                      width={640}
                      description={imageData.description}
                    />
                    <div
                      style={{
                        textAlign: 'right'
                      }}
                    >
                      <i>
                        {imageData.description}
                      </i>
                    </div>
                  </div>
                ))
              }
            </section>
          </div>
        ))
      }
      <h2>
        VIDEO
      </h2>
    </div>
  );
}

export default App;
