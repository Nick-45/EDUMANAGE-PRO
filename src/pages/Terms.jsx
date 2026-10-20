// src/pages/Terms.jsx (same shape for Privacy.jsx)
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ReactMarkdown from 'react-markdown';

const Terms = () => {
  const [content, setContent] = useState('');
  useEffect(() => {
    api.get('/legal/terms').then(({ data }) => setContent(data.content || ''));
  }, []);
  return (
    <div className="min-h-screen bg-navy-gradient pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-3xl prose prose-invert">
        <h1 className="text-3xl font-display font-bold text-white mb-6">Terms of Service</h1>
        <div className="text-sky-100/80 leading-relaxed">
          <ReactMarkdown>{content || '_Terms have not been published yet._'}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
export default Terms;
