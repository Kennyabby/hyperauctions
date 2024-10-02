import React, { useState } from 'react';
import '../SpecialStyles/Displays.css'

const ToggleSwitch = ({ onColor = '#4CAF50', offColor = '#ccc', size = 60, setToggleState}) => {
  const [isToggled, setIsToggled] = useState(false);  // Manage the toggle state

  const handleToggle = () => {
    setIsToggled(!isToggled);  // Toggle the state
    setToggleState(!isToggled)
  };

  return (
    <div
      className="toggle-switch"
      onClick={handleToggle}
      style={{
        width: `${size}px`,                  // Adjust the width based on size prop
        height: `${size / 2}px`,             // Height is half of the width for circular shape
        backgroundColor: isToggled ? onColor : offColor,  // Dynamic background color
      }}
      title={String(isToggled)}
    >
      <div
        className="togglecircle"
        style={{
          width: `${size / 2.5}px`,          // Adjust circle size relative to switch size
          height: `${size / 2.5}px`,         // Circle height
          transform: isToggled ? `translateX(${size / 2}px)` : 'translateX(0)',  // Move the circle
        }}
        title={String(isToggled)}
      ></div>
    </div>
  );
};

export default ToggleSwitch;
