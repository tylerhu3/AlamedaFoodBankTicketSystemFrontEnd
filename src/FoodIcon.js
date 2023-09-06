import React, { useEffect, useRef } from 'react';
import {FaRegLemon, FaCarrot, FaBeer, FaPizzaSlice, FaHamburger, FaIceCream, FaCoffee } from 'react-icons/fa';

const DvdLogo = () => {
  const dvdRef = useRef(null);

  const foodIcons = [FaRegLemon, FaCarrot, FaBeer, FaPizzaSlice, FaHamburger, FaIceCream, FaCoffee];
  const randomIconIndex = Math.floor(Math.random() * foodIcons.length);
  const RandomIcon = foodIcons[randomIconIndex];

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  useEffect(() => {
    const dvdLogo = dvdRef.current;

    let x = 0;
    let y = 0;
    let xVelocity = 2;
    let yVelocity = 2;

    const animate = () => {
      const logoPosition = dvdLogo.getBoundingClientRect();

      x += xVelocity;
      y += yVelocity;

      if (x + logoPosition.width >= window.innerWidth - 3 || x <= 0) {
        xVelocity = -xVelocity;
      }
      if (y + logoPosition.height >= window.innerHeight - 3 || y <= 0) {
        yVelocity = -yVelocity;
      }

      dvdLogo.style.transform = `translate(${x}px, ${y}px)`;

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animate);
    };
  }, []);

  const iconColor = getRandomColor();

  return (
    <div ref={dvdRef} style={{ ...styles.dvdLogo, background: iconColor }}>
      <RandomIcon size={80} style={styles.icon} />
    </div>
  );
};

const styles = {
  dvdLogo: {
    padding: '20px',
    position: 'absolute',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    zIndex: 99, // Make sure it's above other content
  },
  icon: {
    color: 'white',
  },
};

export default DvdLogo;
