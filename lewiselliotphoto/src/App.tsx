import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Layout from './pages/Layout'
import HomePage from './pages/HomePage';
import PortfolioPage from './pages/PortfolioPage';
import VideoPage from './pages/VideoPage';
import ContactPage from './pages/ContactPage';

const App = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/'
          element={<Layout />}
        >
          <Route
            index
            element={<HomePage />}
          />
          <Route
            path='portfolio' 
            element={<PortfolioPage />}
          />
          <Route
            path='video' 
            element={<VideoPage />}
          />
          <Route
            path='contact' 
            element={<ContactPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
