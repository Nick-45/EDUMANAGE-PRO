import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import { legalService } from '../services/api';

const Privacy = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    legalService
      .get()
      .then((data) => setContent(data?.privacy || ''))
      .catch(() => setContent(''))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-navy-gradient pt-24 pb-12">
      <Helmet>
        <title>Privacy Policy — EduPriva</title>
      </Helmet>
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-display font-bold text-white mb-6">Privacy Policy</h1>
        <div className="text-sky-100/80 leading-relaxed prose prose-invert">
          {loading ? (
            <p className="text-sky-200/50">Loading…</p>
          ) : content ? (
            <ReactMarkdown>{content}</ReactMarkdown>
          ) : (
            <p className="text-sky-200/50">
              Our Privacy Policy has not been published yet. Please check back soon.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Privacy;
