import React, { useState, useEffect } from 'react';
import './App.css';

const generatePin = () => Math.floor(100 + Math.random() * 900).toString(); // Generates a 3-digit PIN

const App = () => {
  const [numPlayers, setNumPlayers] = useState(2);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [inputPin, setInputPin] = useState('');
  const [showPinScreen, setShowPinScreen] = useState(true);
  const [playerPins, setPlayerPins] = useState({});
  const [gameStarted, setGameStarted] = useState(false);
  const [pinSetupStage, setPinSetupStage] = useState(0);

  const startGame = () => {
    let initialPlayers = [];
    let pins = {};
    for (let i = 0; i < numPlayers; i++) {
      initialPlayers.push({ id: i, name: i === 0 ? 'Dealer' : `Player ${i}`, score: 0 });
      pins[i] = generatePin();
    }
    setPlayers(initialPlayers);
    setPlayerPins(pins);
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
    const nextPlayer = (currentPlayer + 1) % numPlayers;
    setCurrentPlayer(nextPlayer);
    setShowPinScreen(true);
    setInputPin('');
    alert(`Give the computer to ${players[nextPlayer].name}`);
  };

  const handlePlayerAction = (action) => {
    // Placeholder for player action logic (hit, stand, etc.)
    // This function should update the player's score and game state accordingly

    nextTurn();
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
              {/* Display player cards, score, and actions here */}
              <button onClick={() => handlePlayerAction('hit')}>Hit</button>
              <button onClick={() => handlePlayerAction('stand')}>Stand</button>
              {/* Add more game logic as needed */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
