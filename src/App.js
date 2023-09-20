//App.js

import React, { useState } from 'react';
import Playground from './Playground';
import './App.css';
import { createPlayer, createGame, getGameById, updateGame, deletePlayer } from './Game'; // Importieren der API-Funktionen

function App() {
  const [showPlayground, setShowPlayground] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [boardSize, setBoardSize] = useState(10);
  const [isComputerOpponent, setIsComputerOpponent] = useState(false);
  const [showFooter, setShowFooter] = React.useState(true);


  const handleStartGame = async () => {
    try {
      const player1 = await createPlayer(playerName, true);
      const placeholderPlayer = await createPlayer("Placeholder", true); // Platzhalter für den zweiten Spieler
  
      const players = [player1.id, placeholderPlayer.id];

      const gameSizeRows = 10;
      const gameSizeColumns = 10;
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
      ];;
  
      const newGame = await createGame(60000, players, gameSizeRows, gameSizeColumns, squares);
  
      setGameId(newGame.id);
      setShowPlayground(true);
    } catch (error) {
      console.error("Ein Fehler ist aufgetreten:", error);
    }
  };
  

  const handleNameChange = (e) => {
    setPlayerName(e.target.value);
  };

  const handleCloseFooter = () => {
    setShowFooter(false);
  };

  const handleJoinGame = async () => {
    try {
      // Laden Sie die aktuellen Spieldaten
      const currentGame = await getGameById(gameId);
      if (!currentGame) {
        alert("Spiel nicht gefunden mit der ID: " + gameId);
        return;
      }
      // Erstellen Sie den neuen Spieler
      const newPlayer = await createPlayer(playerName, true);
  
      // Finden Sie den Platzhalter und ersetzen Sie ihn durch den neuen Spieler
      if (currentGame.players[1].name === "Placeholder") {
        const placeholderId = currentGame.players[1].id;
        // Löschen Sie den Platzhalter-Spieler
        await deletePlayer(placeholderId);
  
        // Ersetzen Sie den Platzhalter durch die neue Spieler-ID
        let updatedPlayers = [...currentGame.players]; // Kopiere das Array
        updatedPlayers[1] = newPlayer.id; // Ändere nur den Platzhalter
  
        // Aktualisieren Sie das Spiel mit den neuen Spielerdaten
        await updateGame({ id: gameId, players: updatedPlayers });
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Game of the Amazons</h1>
      </header>
      <main>
      {!showPlayground ? (
          <div>
            <label htmlFor="Name">Gametag</label>
            <input id="name" value={playerName} onChange={handleNameChange}></input>
            <br />
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
            <label htmlFor="isComputerOpponent">COM</label>
            <input
              type="checkbox"
              id="isComputerOpponent"
              checked={isComputerOpponent}
              onChange={handleIsComputerOpponentChange}
            />
            <br />
            <button id="createGame" onClick={handleStartGame}>Create Game</button>
            <div className="separator"></div> {/* Hier fügen wir den Separator ein */}
            <label htmlFor="GameId">Game ID</label>
            <input id="gameId" value={gameId} onChange={handleGameIdChange}></input>
            <button id="joinGame" onClick={handleJoinGame}>Join Game</button>
          </div>
        ) : (
          <Playground playerName={playerName} gameId={gameId} />
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
