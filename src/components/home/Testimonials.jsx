import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const testimonials = [
  {
    id: 1,
    name: 'Dr. James Mwangi',
    role: 'Principal, Sunrise Academy',
    content: 'EduManagerPro revolutionized our school administration. The multi-school isolation feature is perfect for our academy chain.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: 2,
    name: 'Wanjiku Njoroge',
    role: 'Director, Greenfield Schools',
    content: 'Setting up our custom subdomain and branding took minutes. The automated emails and subscription management save us hours.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: 3,
    name: 'Peter Kariuki',
    role: 'ICT Director, Premier School',
    content: 'The branded WebView app with our school colors has been a game-changer. Parents love having the school portal on their phones.',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/67.jpg',
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            What Our <span className="text-primary-600">Clients Say</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from school administrators who transformed their operations
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto relative">
          <div className="overflow-hidden">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
            >
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <FaStar key={i} className="mr-1" />
                  ))}
                </div>
              </div>
              
              <p className="text-lg text-gray-700 mb-6">
                "{testimonials[currentIndex].content}"
              </p>
              
              <div className="flex items-center">
                <img
                  src={testimonials[currentIndex].image}
                  alt={testimonials[currentIndex].name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-lg">{testimonials[currentIndex].name}</h4>
                  <p className="text-gray-600">{testimonials[currentIndex].role}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-600 hover:text-white transition"
          >
            <FaChevronLeft />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-600 hover:text-white transition"
          >
            <FaChevronRight />
          </button>

          {/* Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition ${
                  index === currentIndex ? 'bg-primary-600 w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
