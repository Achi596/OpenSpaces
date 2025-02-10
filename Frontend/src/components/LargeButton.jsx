import React from 'react';
import styled from '@emotion/styled';

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  background-blend-mode: multiply;
  background-color: ${props => props.color};
  color: ${props => props.textColor};
  font-size: 24px;
  text-align: center;
  cursor: pointer;
  margin-bottom: 16px;
  transition: transform 0.3s;
  text-decoration: underline;

  &:hover {
    transform: scale(1.05);
  }
`;

function LargeButton({ text, color, image, textColor, onClick }) {
  return (
    <ButtonContainer
      color={color}
      image={image}
      textColor={textColor}
      onClick={onClick}>
      {text}
    </ButtonContainer>
  );
}

export default LargeButton;
