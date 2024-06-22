// src/Card.js
import React from 'react';

const getCardImage = (card) => {
  const suitMap = {
    'Hearts': 'h',
    'Diamonds': 'd',
    'Clubs': 'c',
    'Spades': 's'
  };
  const valueMap = {
    'Jack': '11',
    'Queen': '12',
    'King': '13',
    'Ace': '1'
  };
  const suit = suitMap[card.suit];
  const value = valueMap[card.value] || card.value;
  return `/img/card/${suit}${value}.png`;
};

const Card = ({ card, hidden }) => {
  const cardImage = getCardImage(card);
  if (hidden) {
    return (
      <img src="/img/card/hidden.png" alt="Hidden card.." className="card" />
    );
  } else {
    return (
      <img src={cardImage} alt={`${card.value} of ${card.suit}`} className="card" />
    );
  }
};

export default Card;
