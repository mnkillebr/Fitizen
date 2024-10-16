import React, { useState, useEffect, useCallback } from 'react';
import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react';
import { DotButton, useDotButton } from "./CarouselDotButton"
import clsx from 'clsx';

type CarouselProps = {
  slides: React.ReactNode[];
  options?: EmblaOptionsType;
}

const CustomCarousel = ({ slides, options }: CarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ dragFree: false, containScroll: 'trimSnaps' });
  // const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // const scrollTo = useCallback((index) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi)

  // const onSelect = useCallback(() => {
  //   if (!emblaApi) return;
  //   setSelectedIndex(emblaApi.selectedScrollSnap());
  // }, [emblaApi, setSelectedIndex]);

  // useEffect(() => {
  //   if (!emblaApi) return;
  //   onSelect();
  //   emblaApi.on('select', onSelect);
  //   return () => emblaApi.off('select', onSelect);
  // }, [emblaApi, onSelect]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // Tailwind's 'lg' breakpoint
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div className="w-full">
      <div className={`overflow-hidden ${isLargeScreen ? 'hidden' : ''}`} ref={emblaRef}>
        <div className="flex">
          {slides.map((item, index) => (
            <div className="flex-[0_0_100%] min-w-0 px-1" key={index}>
              {item}
            </div>
          ))}
        </div>
      </div>
      
      {isLargeScreen && (
        <div className="flex gap-4">
          {slides.map((item, index) => (
            <div className="flex-1" key={index}>
              {item}
            </div>
          ))}
        </div>
      )}
      
      {!isLargeScreen && (
        <div className="flex justify-center mb-3">
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              className={clsx(
                "size-2 rounded-full mx-1",
                index === selectedIndex ? 'bg-primary' : 'bg-gray-300'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomCarousel;