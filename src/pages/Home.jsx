import React from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import Pricing from '../components/home/Pricing';
import Stats from '../components/home/Stats';
import Testimonials from '../components/home/Testimonials';
import CTA from '../components/home/CTA';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>EduManagerPro - SaaS School Management Platform</title>
        <meta name="description" content="Complete school management solution with multi-school isolation, custom branding, and mobile apps." />
      </Helmet>

      <Navbar />
      <main>
        <Hero />
        <Features />
        <Stats />
        <Pricing />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
};

export default Home;
