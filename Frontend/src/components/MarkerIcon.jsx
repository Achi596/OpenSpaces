import React from 'react';
// sourced from https://www.svgrepo.com/svg/231053/placeholder-pin
const MarkerIcon = ({ color = '#000000' }) => (
  <svg
    fill={color}
    height="200px"
    width="200px"
    version="1.1"
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 512 512"
    xmlSpace="preserve"
    stroke="#000000"
    strokeWidth="0.00512"
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      <g>
        <path
          d={`
            M444.233,169.659
            C434.593,72.932,353.671,0,256.011,0
            C151.677,0,66.798,84.878,66.798,189.212
            c0,41.238,12.957,80.324,37.489,113.062
            l137.876,202.356c3.109,4.609,8.293,7.369,13.847,7.369
            c5.554,0,10.738-2.76,13.847-7.369
            l137.496-201.855C435.929,264.831,449.025,217.55,444.233,169.659z
            M256.011,272.689
            c-46.031,0-83.476-37.445-83.476-83.476
            s37.444-83.476,83.476-83.476
            c46.031,0,83.476,37.445,83.476,83.476
            S302.042,272.689,256.011,272.689z
          `}
        />
      </g>
    </g>
  </svg>
);

export default MarkerIcon;
