// components/ScrollButtons.jsx
import { ChevronUp, ChevronDown } from 'lucide-react';

const ScrollButtons = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-8 right-8 flex flex-col space-y-2">
      <button
        onClick={scrollToTop}
        className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
        title="Scroll to top"
      >
        <ChevronUp className="h-6 w-6" />
      </button>
      <button
        onClick={scrollToBottom}
        className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
        title="Scroll to bottom"
      >
        <ChevronDown className="h-6 w-6" />
      </button>
    </div>
  );
};

export default ScrollButtons;