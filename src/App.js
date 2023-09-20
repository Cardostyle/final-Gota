import React, { useState } from 'react';
import Playground from './Playground';
import './App.css';
import { createPlayer, createGame, getGameById, deletePlayer } from './Game'; // Importieren der API-Funktionen

function App() {
  const [showPlayground, setShowPlayground] = useState(false);
  const [gameId, setGameId] = useState('');
  const [boardSize, setBoardSize] = useState(10);
  const [isComputerOpponent, setIsComputerOpponent] = useState(false);
  const [showFooter, setShowFooter] = React.useState(true);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentPlayerID, setCurrentPlayerID] = useState(null);
  const [timePerTurn, setTimePerTurn] = useState(30); 


  const handleStartGame = async () => {
    try {
      const player1 = await createPlayer("White", true);
      let player2;
  
      if (isComputerOpponent) {
        player2 = await createPlayer("COM", false); // KI als zweiter Spieler
      } else {
        player2 = await createPlayer("Black", true); // Menschlicher Spieler als zweiter Spieler
      }
  
      const players = [player1.id, player2.id];
      const gameSizeRows = boardSize; // Verwenden des boardSize Zustands
      const gameSizeColumns = boardSize; // Verwenden des boardSize Zustands
      const squares = [
        [0, -1, 0, -1, 0, -1, 0, -1, 0, -1],
        [0, -1, -1, -1, -1, -1, -1, -1, -1, 0],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        [1, -1, -1, -1, -1, -1, -1, -1, -1, 1],
        [1, -1, 1, -1, 1, -1, 1, -1, 1, -1]
      ];
  
      const newGame = await createGame(timePerTurn*1000, players, gameSizeRows, gameSizeColumns, squares);
  
      setGameId(newGame.id);
      setCurrentPlayer("White"); // Setzen des aktuellen Spielers auf "White"
      setShowPlayground(true);
      setCurrentPlayerID(player1.id);
    } catch (error) {
      console.error("Ein Fehler ist aufgetreten:", error);
    }
  };

  const handleCloseFooter = () => {
    setShowFooter(false);
  };

  const handleJoinGame = async () => {
    try {
      const currentGame = await getGameById(gameId);
      if (!currentGame) {
        alert("Spiel nicht gefunden mit der ID: " + gameId);
        return;
      }
  
      // Überprüfen, ob der zweite Spieler bereits existiert
      if (currentGame.players[1]) {
        // Setzen Sie die ID des zweiten Spielers, um den Platz einzunehmen
        setGameId(currentGame.id);
        setCurrentPlayer("Black"); // Setzen des aktuellen Spielers auf "Black"
        setShowPlayground(true);
        setCurrentPlayerID(currentGame.player[1].id);
      } else {
        alert("Es gibt keinen zweiten Spieler im Spiel.");
      }
    } catch (error) {
      console.log("Ein Fehler ist aufgetreten:", error);
    }
  };

  const handleGameIdChange = (e) => {
    setGameId(e.target.value);
  };

  const handleBoardSizeChange = (e) => {
    setBoardSize(e.target.value);
  };

  const handleIsComputerOpponentChange = (e) => {
    setIsComputerOpponent(e.target.checked);
  };

  const handleTimePerTurnChange = (e) => {
    setTimePerTurn(e.target.value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Game of the Amazons</h1>
      </header>
      <main>
      {!showPlayground ? (
          <div>
            <label htmlFor="boardSize">Spielfeldgröße</label>
            <input
              type="range"
              id="boardSize"
              min="10"
              max="20"
              value={boardSize}
              onChange={handleBoardSizeChange}
            />
            <span>{boardSize}</span>
            <br />
            <label htmlFor="timePerTurn">Zeit pro Zug</label>
              <input
                type="range"
                id="timePerTurn"
                min="30"
                max="600"
                value={timePerTurn}
                onChange={handleTimePerTurnChange}
              />
              <span>{timePerTurn}</span>
              <br />
            <label htmlFor="isComputerOpponent">COM</label>
            <input
              type="checkbox"
              id="isComputerOpponent"
              checked={isComputerOpponent}
              onChange={handleIsComputerOpponentChange}
            />
            <br />
            <button id="createGame" onClick={handleStartGame}>Create Game</button>
            <div className="separator"></div>
            <label htmlFor="GameId">Game ID</label>
            <input id="gameId" value={gameId} onChange={handleGameIdChange}></input>
            <button id="joinGame" onClick={handleJoinGame}>Join Game</button>
          </div>
        ) : (
          <Playground playerName={currentPlayer} gameId={gameId} currentPlayerID={currentPlayerID} />
        )}
         <div className="help">
            <details className="help">  {/* Hilfe Objekte zur Erklärung des Spiels */}
              <summary ><h2>Hilfe</h2></summary>
              <details>
                <summary><h3>Spielanleitung</h3></summary>
                <ol>
                  <li>Eigene Dame wählen.</li>
                  <li>Wählen wohin die Dame gesetzt werden soll(Horizontal,Vertikal,Diagonal).</li>
                  <li>Wählen welches Feld für alle Spieler gesperrt werden soll(Horizontal,Vertikal,Diagonal).</li>
                </ol>
              </details>
              <details>
                <summary><h3>Wie man gewinnt</h3></summary>
                <div><p> Blocke die gegnerischen Spielfiguren, sodass sie kein Feld mehr haben sich zu bewegen bevor es mit deinen Figuren passiert</p></div>
              </details>
              <details>
                <summary><h3>Wie bewegen sich die Spielfiguren?</h3></summary>
                <p>
                  Vertikal, Horizontal und Diagonal in alle Richtungen, jedoch kann man nicht durch blockierte und besetzte Felder hindurchgehen.
                </p>
              </details>
              <details>
                <summary><h3>Bugs?</h3></summary>
                <p>
                  Es gibt keine Bugs, sondern nur neue Spielmechaniken von uns den tollen Developers ;D
                </p>
              </details>
            </details>
            </div>
        </main>
      {showFooter && (
        <footer className="footer">
          <button className="close-button" onClick={handleCloseFooter}>&times;</button>
          <p>
            Diese Website wurde im Auftrag von der Hochschule Anhalt unter der Aufsicht von Toni Barth entwickelt.<br />
            Autoren: Sophie Schmeiduch, Paul Hanemann, Franz Georgi, Ricardo Hoppe
          </p>
        </footer>
      )}
    </div>
  );
}

export default App;
