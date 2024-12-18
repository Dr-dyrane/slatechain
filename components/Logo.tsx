import { useTheme } from 'next-themes'; // Import the useTheme hook
import { useEffect, useState } from 'react';

export function Logo() {
  const { theme } = useTheme(); // Get the current theme (either 'light' or 'dark')

  const [fillColor, setFillColor] = useState('#000000'); // Default color

  useEffect(() => {
    // Set the fill color based on the theme after the component mounts
    if (theme === 'dark') {
      setFillColor('#ffffff');
    } else {
      setFillColor('#000000');
    }
  }, [theme]); // This effect runs whenever the theme changes


  return (
    <svg width="32px" height="32px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill={fillColor}>
      <g fill={fillColor}>
        <path
          d="M6 9.714v4.076l9.895 5.715 6.42-3.715v3.315l3.456 2.038V9.714l-9.885 5.715z"
        />
        <path opacity=".7"
          d="M15.886 4L6 9.714v11.429l9.886 5.714 9.857-5.714-3.495-2.038-6.362 3.676-6.39-3.676v-7.353l6.39-3.676 6.362 3.676 3.495-2.038z" />
      </g>
    </svg>
  );
}
