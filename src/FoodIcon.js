import React, { useEffect, useRef } from 'react';
import { FaPizzaSlice, FaHamburger, FaIceCream, FaCoffee } from 'react-icons/fa'; // Importing food-themed icons

const DvdLogo = () => {
  const dvdRef = useRef(null);
  useEffect(() => {
    const dvdLogo = dvdRef.current;

    let x = 0;
    let y = 0;
    let xVelocity = 3; // Horizontal velocity
    let yVelocity = 3; // Vertical velocity

    const animate = () => {
      // Get the current position of the logo
      const logoPosition = dvdLogo.getBoundingClientRect();

      // Update the x and y position based on the velocity
      x += xVelocity;
      y += yVelocity;

      // Check if the logo has hit the screen boundaries and reverse the velocity if necessary
      if (x + logoPosition.width >= window.innerWidth || x <= 0) {
        xVelocity = -xVelocity;
      }
      if (y + logoPosition.height >= window.innerHeight || y <= 0) {
        yVelocity = -yVelocity;
      }

      // Set the new position of the logo
      dvdLogo.style.transform = `translate(${x}px, ${y}px)`;

      // Repeat the animation
      requestAnimationFrame(animate);
    };

    // Start the animation loop
    animate();

    return () => {
      // Clean up the animation frame on component unmount
      cancelAnimationFrame(animate);
    };
  }, []);
  return (
    <div ref={dvdRef} style={styles.dvdLogo}>
      {/* Use the IoCoffeeOutline icon from react-icons/io5 */}
      <FaPizzaSlice size={80} style={styles.icon} />
    </div>
  );
};

const styles = {
    dvdLogo: {
        position: 'absolute',
        width: '80px',
        height: '80px',
        // background: 'red', // Placeholder background color
        // borderRadius: '4px',
      },
  icon: {
    color: 'white', // Color for the coffee icon
  },
};

export default DvdLogo;
