import React from 'react';
import styled from '@emotion/styled';
import image4 from '../assets/LandingCover.png';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 128px);
  background-color: #ecd400;
`;

const DefaultLanding = styled.div`
  background-image: url(${image4});
  background-size: contain;
  background-position: center top;
  background-repeat: no-repeat;
  height: 100%;
  margin: none;
`;

const Landing = () => {
  return (
    <Container>
      <DefaultLanding />
    </Container>
  );
};

export default Landing;
