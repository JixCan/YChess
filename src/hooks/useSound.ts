import { useCallback, useRef } from 'react';

const useSound = (url: string) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Загружаем звук один раз при первой отрисовке
  if (!audioRef.current) {
    audioRef.current = new Audio(url);
  }

  const playSound = useCallback(() => {
    audioRef.current?.play();
  }, []);

  return playSound;
};

export default useSound;
