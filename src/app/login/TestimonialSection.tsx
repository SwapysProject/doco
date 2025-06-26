"use client";
import React from 'react';
import Slider from 'react-slick';
import { testimonials, TestimonialData } from './testimonialData';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const TestimonialCard = ({ testimonial }: { testimonial: TestimonialData }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mx-4 h-full">
      <div className="flex flex-col items-center text-center">
        {/* Quote Icon */}
        <div className="text-blue-500 text-4xl mb-4">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
          </svg>
        </div>

        {/* Doctor Image */}
        <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-4 border-blue-100 dark:border-blue-800">
          <img 
            src={testimonial.image} 
            alt={testimonial.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to a default doctor avatar if image fails to load
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face";
            }}
          />
        </div>

        {/* Star Rating */}
        <div className="flex mb-4">
          {[...Array(5)].map((_, index) => (
            <svg
              key={index}
              className={`w-5 h-5 ${
                index < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          ))}
        </div>

        {/* Review Text */}
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 italic">
          "{testimonial.review}"
        </p>

        {/* Doctor Info */}
        <div className="mt-auto">
          <h4 className="font-bold text-gray-900 dark:text-white text-lg">
            {testimonial.name}
          </h4>
          <p className="text-blue-600 dark:text-blue-400 font-medium">
            {testimonial.title}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {testimonial.specialty}
          </p>
        </div>
      </div>
    </div>
  );
};

const TestimonialSection = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  return (
    <section id="testimonials" className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Customers Says
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Trusted by healthcare professionals worldwide. See what doctors are saying about 
            our AI-powered healthcare management platform.
          </p>
        </div>

        {/* Testimonial Slider */}
        <div className="testimonial-slider">
          <Slider {...settings}>
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="px-2">
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {/* Custom Slider Styles */}
      <style jsx global>{`
        .testimonial-slider .slick-dots {
          bottom: -50px;
        }
        
        .testimonial-slider .slick-dots li button:before {
          color: #3B82F6;
          font-size: 12px;
        }
        
        .testimonial-slider .slick-dots li.slick-active button:before {
          color: #1D4ED8;
        }
        
        .testimonial-slider .slick-prev,
        .testimonial-slider .slick-next {
          z-index: 1;
          width: 40px;
          height: 40px;
        }
        
        .testimonial-slider .slick-prev {
          left: -50px;
        }
        
        .testimonial-slider .slick-next {
          right: -50px;
        }
        
        .testimonial-slider .slick-prev:before,
        .testimonial-slider .slick-next:before {
          color: #3B82F6;
          font-size: 20px;
        }
        
        @media (max-width: 768px) {
          .testimonial-slider .slick-prev {
            left: -25px;
          }
          
          .testimonial-slider .slick-next {
            right: -25px;
          }
        }
      `}</style>
    </section>
  );
};

export default TestimonialSection;
