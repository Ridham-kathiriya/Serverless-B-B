import React from 'react';
import Header from '../Components/Header';
import Footer from '../Components/Footer';

const VisualizationsPage = () => {
  return (
    <>
      <Header />
      <iframe
        title='visualizations'
        width='1200'
        height='400'
        src='https://datastudio.google.com/embed/reporting/94e318a0-0f35-43fb-89c9-d5ecf2d6bcc7/page/p_36j0k01zwc'
        frameBorder='0'
        style={{ border: 0 }}
        allowFullScreen
      ></iframe>
      <Footer />
    </>
  );
};

export default VisualizationsPage;
