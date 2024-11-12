// AppButton.tsx
import React, { ButtonHTMLAttributes } from 'react';
import useSound from '../hooks/useSound';

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const AppButton: React.FC<AppButtonProps> = ({ children, ...props }) => {
  const playClickSound = useSound('/sounds/clickUp.mp3');
  const playReleaseSound = useSound('/sounds/click.mp3');

  return (
    <button
      {...props}
      onMouseDown={(e) => {
        playClickSound();
        props.onMouseDown?.(e); // вызываем оригинальный onMouseDown, если он передан
      }}
      onMouseUp={(e) => {
        playReleaseSound();
        props.onMouseUp?.(e); // вызываем оригинальный onMouseUp, если он передан
      }}
    >
      {children}
    </button>
  );
};

export default AppButton;
