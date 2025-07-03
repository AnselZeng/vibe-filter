import React from 'react';

interface ImageModalProps {
  isOpen: boolean;
  imageUrl: string;
  alt?: string;
  onClose: () => void;
}

export default function ImageModal({ isOpen, imageUrl, alt, onClose }: ImageModalProps) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-[80vw] max-h-[80vh] flex items-center justify-center"
        onClick={e => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={alt}
          className="rounded-lg shadow-2xl max-h-[80vh] max-w-[80vw] object-contain bg-white"
        />
        <button
          className="absolute top-2 right-2 text-white bg-orange-500 hover:bg-orange-600 rounded-full p-2 transition"
          onClick={onClose}
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}