import React, { useState, useEffect } from 'react';
import './App.css';

// Create a deck of cards
const createDeck = () => {
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  let deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ value, suit });
    }
  }
  return deck;
};

// Shuffle the deck
const shuffleDeck = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

// Get card value for calculating score
const getCardValue = (card) => {
  if (card.value === 'J' || card.value === 'Q' || card.value === 'K') {
    return 10;
  } else if (card.value === 'A') {
    return 11; // Aces can be 1 or 11, but we'll handle that later
  } else {
    return parseInt(card.value);
  }
};

const generatePin = () => Math.floor(100 + Math.random() * 900).toString(); // Generates a 3-digit PIN

const App = () => {
  const [numPlayers, setNumPlayers] = useState(2);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(1); // Start with player 1
  const [inputPin, setInputPin] = useState('');
  const [showPinScreen, setShowPinScreen] = useState(true);
  const [playerPins, setPlayerPins] = useState({});
  const [gameStarted, setGameStarted] = useState(false);
  const [pinSetupStage, setPinSetupStage] = useState(0);
  const [playerCards, setPlayerCards] = useState({});
  const [playerScores, setPlayerScores] = useState({});
  const [deck, setDeck] = useState(shuffleDeck(createDeck()));

  const startGame = () => {
    let initialPlayers = [];
    let pins = {};
    let cards = {};
    let scores = {};
    let newDeck = shuffleDeck(createDeck());
    for (let i = 0; i < numPlayers; i++) { // Player 0 is the dealer
      initialPlayers.push({ id: i, name: i === 0 ? 'Dealer' : `Player ${i}`, score: 0 });
      pins[i] = generatePin();
      cards[i] = [newDeck.pop(), newDeck.pop()];
      scores[i] = calculateScore(cards[i]);
    }
    setPlayers(initialPlayers);
    setPlayerPins(pins);
    setPlayerCards(cards);
    setPlayerScores(scores);
    setDeck(newDeck);
    setPinSetupStage(1);
    alert('Give the computer to the dealer');
  };

  useEffect(() => {
    if (pinSetupStage > 0 && pinSetupStage <= numPlayers) {
      alert(`PIN: ${playerPins[pinSetupStage - 1]}`);
      if (pinSetupStage < numPlayers) {
        alert(`Give the computer to ${players[pinSetupStage].name}`);
      }
      setPinSetupStage(pinSetupStage + 1);
    } else if (pinSetupStage === numPlayers + 1) {
      alert('Game starts!');
      setGameStarted(true);
      setShowPinScreen(true);
    }
  }, [pinSetupStage, playerPins, players, numPlayers]);

  const handlePinInput = (e) => {
    const pin = e.target.value;
    setInputPin(pin);
    if (pin.length === 3) {
      if (pin === playerPins[currentPlayer]) {
        setShowPinScreen(false);
      } else {
        alert('Incorrect PIN. Try again.');
        setInputPin('');
      }
    }
  };

  const nextTurn = () => {
    const nextPlayer = currentPlayer === numPlayers - 1 ? 0 : currentPlayer + 1;
    setCurrentPlayer(nextPlayer);
    setShowPinScreen(true);
    setInputPin('');
    alert(`Give the computer to ${players[nextPlayer].name}`);
  };

  const handlePlayerAction = (action) => {
    let newCards = { ...playerCards };
    let newScores = { ...playerScores };
    if (action === 'hit') {
      const card = deck.pop();
      newCards[currentPlayer].push(card);
      newScores[currentPlayer] = calculateScore(newCards[currentPlayer]);
      setDeck(deck);
    }
    setPlayerCards(newCards);
    setPlayerScores(newScores);
    if (action === 'stand' || newScores[currentPlayer] >= 21) {
      nextTurn();
    }
  };

  const calculateScore = (cards) => {
    let score = 0;
    let aceCount = 0;
    for (let card of cards) {
      score += getCardValue(card);
      if (card.value === 'A') {
        aceCount++;
      }
    }
    while (score > 21 && aceCount > 0) {
      score -= 10;
      aceCount--;
    }
    return score;
  };

  const getDealerDisplayCards = () => {
    const dealerCards = playerCards[0];
    if (dealerCards.length === 0) return '';
    return [dealerCards[0].value + ' of ' + dealerCards[0].suit, 'X'].join(', ');
  };

  const getCardDisplay = (cards) => {
    return cards.map(card => `${card.value} of ${card.suit}`).join(', ');
  };

  return (
    <div className="App">
      {!gameStarted ? (
        <div>
          <h1>Blackjack Game</h1>
          <label>
            Number of Players (including dealer):
            <input
              type="number"
              value={numPlayers}
              onChange={(e) => setNumPlayers(Number(e.target.value))}
              min="2"
              max="4"
            />
          </label>
          <button onClick={startGame}>Start Game</button>
        </div>
      ) : (
        <div>
          {showPinScreen ? (
            <div>
              <h2>Enter PIN for {players[currentPlayer].name}</h2>
              <input
                type="password"
                value={inputPin}
                onChange={handlePinInput}
                maxLength="3"
              />
            </div>
          ) : (
            <div>
              <h2>{players[currentPlayer].name}'s Turn</h2>
              <div>
                <p>Cards: {currentPlayer === 0 ? getDealerDisplayCards() : getCardDisplay(playerCards[currentPlayer])}</p>
                <p>Score: {playerScores[currentPlayer]}</p>
              </div>
              {currentPlayer !== 0 && (
                <>
                  <button onClick={() => handlePlayerAction('hit')}>Hit</button>
                  <button onClick={() => handlePlayerAction('stand')}>Stand</button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
