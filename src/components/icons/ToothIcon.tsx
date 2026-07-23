import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ToothIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
}

const ToothIcon: React.FC<ToothIconProps> = ({ size = 24, color = '#94a3b8', focused = false }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={focused ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 21c-2.5 0-4-2-4-4.5 0-1 0-3-1-4C6.5 11.5 5 10.5 5 8.5 5 5 7.5 3 10.5 3c1 0 1.5.5 1.5 1.5S11.5 6 11.5 7s1 1.5 2 1.5 2-.5 2-1.5-.5-2.5.5-2.5C19 4.5 20 6.5 20 8.5c0 2-1.5 3-2 4-1 1-1 3-1 4 0 2.5-1.5 4.5-5 4.5z" />
      {/* Root line separator */}
      <Path d="M12 14v7" />
    </Svg>
  );
};

export default ToothIcon;
