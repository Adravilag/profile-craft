import { useMemo } from 'react';

interface ReadingTimeOptions {
  wordsPerMinute?: number;
  includeImages?: boolean;
  imageReadingTime?: number;
}

interface ReadingTimeResult {
  minutes: number;
  words: number;
  images: number;
  text: string;
}

const useReadingTime = (
  content: string,
  options: ReadingTimeOptions = {}
): ReadingTimeResult => {
  const {
    wordsPerMinute = 200,
    includeImages = true,
    imageReadingTime = 12 // seconds per image
  } = options;

  return useMemo(() => {
    if (!content) {
      return {
        minutes: 0,
        words: 0,
        images: 0,
        text: '0 min de lectura'
      };
    }

    // Remove HTML tags and get plain text
    const plainText = content.replace(/<[^>]*>/g, '');
    
    // Count words (split by whitespace and filter empty strings)
    const words = plainText
      .split(/\s+/)
      .filter(word => word.length > 0).length;

    // Count images if including them in calculation
    let images = 0;
    if (includeImages) {
      const imageMatches = content.match(/<img[^>]*>/gi);
      images = imageMatches ? imageMatches.length : 0;
    }

    // Calculate reading time
    const wordsTime = words / wordsPerMinute;
    const imagesTime = includeImages ? (images * imageReadingTime) / 60 : 0;
    const totalMinutes = Math.ceil(wordsTime + imagesTime);

    // Format text
    let text = '';
    if (totalMinutes < 1) {
      text = 'Menos de 1 min de lectura';
    } else if (totalMinutes === 1) {
      text = '1 min de lectura';
    } else {
      text = `${totalMinutes} min de lectura`;
    }

    return {
      minutes: totalMinutes,
      words,
      images,
      text
    };
  }, [content, wordsPerMinute, includeImages, imageReadingTime]);
};

export default useReadingTime;
