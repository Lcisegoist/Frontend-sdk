import React from 'react';
import './app.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
// import { GlobalModal } from '@/src/components/globalModal';
import { routes } from '@/src/router';
import { store } from '@/src/models/store';

import { HttpDetail } from '@/src/components/httpDetail';

const router = createBrowserRouter(routes);

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
      <HttpDetail />
    </Provider>
  );
}

export default App;
