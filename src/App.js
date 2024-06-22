import React, { useState, useEffect } from 'react';
import './App.css';
import Card from './Card';

// Create a deck of cards
const createDeck = () => {
  const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace'];
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
  if (card.value === 'Jack' || card.value === 'Queen' || card.value === 'King') {
    return 10;
  } else if (card.value === 'Ace') {
    return 11; // Aces can be 1 or 11, but we'll handle that later
  } else {
    return parseInt(card.value);
  }
};

const App = () => {
  const [numPlayers, setNumPlayers] = useState(2);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(1); // Start with player 1
  const [gameStarted, setGameStarted] = useState(false);
  const [playerCards, setPlayerCards] = useState({});
  const [playerScores, setPlayerScores] = useState({});
  const [playerBets, setBets] = useState({});
  const [deck, setDeck] = useState(shuffleDeck(createDeck()));
  const [surrenders, setSurrenders] = useState([]);
  const [round, setRound] = useState(0);

  const startGame = () => {
    let initialPlayers = [];
    let cards = {};
    let scores = {};
    let bets = {};

    let newDeck = shuffleDeck(createDeck());
    for (let i = 0; i < numPlayers; i++) { // Player 0 is the dealer
      initialPlayers.push({ id: i, name: i === 0 ? 'Dealer' : `Player ${i}`, score: 0 });
      cards[i] = [newDeck.pop(), newDeck.pop()];
      scores[i] = calculateScore(cards[i]);
      bets[i] = 20;
    }
    setPlayers(initialPlayers);
    setPlayerCards(cards);
    setPlayerScores(scores);
    setSurrenders([]);
    setDeck(newDeck);
    setCurrentPlayer(1); // Start with player 1
    setGameStarted(true);
    setRound(round + 1);
    setBets(bets);
  };

  const nextTurn = () => {
    if (currentPlayer === 0) {
      endRound();
    } else {
      const nextPlayer = currentPlayer === numPlayers - 1 ? 0 : currentPlayer + 1;
      setCurrentPlayer(nextPlayer);
    }
  };

  const endRound = () => {
    alert('Round over! Starting next round...');
    startGame();
  };

  const handlePlayerAction = (action) => {
    if (action === "surrender") {
      setSurrenders(prevSurrenders => [currentPlayer, ...prevSurrenders]);
      nextTurn();
      // TODO: Half bet
      return;
    }

    let newCards = { ...playerCards };
    let newScores = { ...playerScores };
    if (action === "hit" || action == "double") {
      const card = deck.pop();
      newCards[currentPlayer].push(card);
      newScores[currentPlayer] = calculateScore(newCards[currentPlayer]);
      setDeck(deck);
    }

    setPlayerCards(newCards);
    setPlayerScores(newScores);

    if (action === 'stand') {
      nextTurn();
    } else if (action === 'double') {
      nextTurn();
      // TODO: Double bet
    } else if (newScores[currentPlayer] > 21) {
      alert("You Busted! Your score is: " + newScores[currentPlayer]);
      nextTurn();
    }
  };

  const calculateScore = (cards) => {
    let score = 0;
    let aceCount = 0;
    for (let card of cards) {
      score += getCardValue(card);
      if (card.value === 'Ace') {
        aceCount++;
      }
    }
    while (score > 21 && aceCount > 0) {
      score -= 10;
      aceCount--;
    }
    return score;
  };

  const handleBet = (amount) => {
    let newBets = { ...playerBets };
    newBets[currentPlayer] += amount;
    setBets(newBets);
  }

  const getCardDisplay = (cards, hideFirst) => {
    return cards.map((card, index) => (
      <Card key={`${card.value}${card.suit}`} card={card} hidden={hideFirst && index === 0} />
    ));
  };
  
  return (
    <div className="App">
      {!gameStarted ? (
        <div>
          <h1>Blackjack Game</h1>
          <label>
            <p style={{marginLeft: 15}}>Number of Players (including dealer)</p>  
            <input
              type="number"
              value={numPlayers}
              onChange={(e) => setNumPlayers(Number(e.target.value))}
              min="2"
              max="12"
              className="number-input"
            />
          </label>
          <button onClick={startGame}>Start Game</button>
        </div>
      ) : (
        <div>
          <div className="Table">
            <h2>{players[currentPlayer].name}'s Turn</h2>
            <div className="players-cards">
              {players.map((player, index) => (
                <div key={index} style={surrenders.includes(player.id) || playerScores[player.id] > 21 ? { opacity : 0.5 } : null} className="player-section">
                  <div className="card-container-label">
                    <h3 style={player.id === currentPlayer ? { fontWeight: 'bold' } : {}}>{player.name}</h3>
                    {surrenders.includes(player.id) ? (<img className = "surrenderFlag" src="/img/surrender.png" alt="Player surrendered." />) : null}
                  </div>
                  <div className="card-container">
                    {getCardDisplay(playerCards[player.id], player.id === 0 && currentPlayer != 0)}
                  </div>
                  <div className="card-container-label">
                    {!(player.id === 0 && currentPlayer != 0) ? (<p>Score: {playerScores[player.id]}</p>) : null}
                    {player.id != 0 ? (<p>Bet: {playerBets[player.id]}</p>) : null}
                  </div>
                </div>
              ))}
            </div>
            <div className="Options"> {/* For round */}
              <button onClick={() => handlePlayerAction('hit')}>Hit</button>
              <button onClick={() => handlePlayerAction('stand')}>Stand</button>
              <button onClick={() => handlePlayerAction('surrender')}>Surrender</button>
              <button onClick={() => handlePlayerAction('double')}>Double</button>
              {playerCards[0][1].value == "Ace" ? <button onClick={() => handlePlayerAction('insurance')}>Insurance (${playerBets[currentPlayer] / 2})</button> : null}
            </div>
            {currentPlayer != 0 ? (
            <div className="Options"> {/* Another row for bets */}
              <p>Default Bet:</p>
              <input
                type="number"
                value={playerBets[currentPlayer]}
                onChange={(event) => {
                  let value = event.target.value;
                  if (value > 20 && value < 100) {
                    let bets = {...playerBets};
                    bets[currentPlayer] = Number(event.target.value);
                    setBets(bets);
                  }
                }}
                min="20"
                max="100"
                className="number-input"
              />
            </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};


export default App;
