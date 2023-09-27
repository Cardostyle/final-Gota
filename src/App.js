import React, { useState, useEffect } from "react";
import Playground from "./Playground";
import "./App.css";
import {
  createPlayer,
  createGame,
  getGameById,
  resetAll,
  getAllGames,
} from "./Game"; // Importieren der API-Funktionen

function App() {
  // Zustandsvariablen mit ihren Anfangswerten
  const [showPlayground, setShowPlayground] = useState(false); // Ob das Spielfeld angezeigt wird oder nicht
  const [gameId, setGameId] = useState(""); // Die ID des aktuellen Spiels
  const [boardSize, setBoardSize] = useState(10); // Größe des Spielfelds
  const [isComputerOpponent, setIsComputerOpponent] = useState(false); // Ob ein Computer der Gegner ist
  const [showFooter, setShowFooter] = React.useState(true); // Ob der Footer angezeigt wird oder nicht
  const [currentPlayer, setCurrentPlayer] = useState(null); // Der aktuelle Spieler ("White" oder "Black")
  const [currentPlayerID, setCurrentPlayerID] = useState(null); // Die ID des aktuellen Spielers
  const [timePerTurn, setTimePerTurn] = useState(30); // Zeit pro Zug in Sekunden
  const [gamesList, setGamesList] = useState([]); // Liste aller Spiele
  const [numOfAmazons, setNumOfAmazons] = useState(1); // Anzahl der Amazonen (Spielfiguren) pro Spieler
  let [customBoard, setCustomBoard] = useState(  // Zustandsvariablen für das benutzerdefinierte Spielfeld
    Array.from({ length: boardSize }, () =>
      Array.from({ length: boardSize }, () => -1),
    ),
  );
  const [isCustomBoard, setIsCustomBoard] = useState(false); // Ob ein benutzerdefiniertes Spielfeld verwendet wird oder nicht
  const [bg, setBg] = useState(// Zustandsvariable für den Hintergrund des Spielfelds
    Array.from({ length: boardSize }, (_, i) =>
      Array.from({ length: boardSize }, (_, j) => ((i + j) % 2 === 0 ? 0 : -1)),
    ),
  );




  useEffect(() => {
    fetchGames();
    if (isCustomBoard) {
      // Erstellen Sie ein benutzerdefiniertes Spielfeld
      const newCustomBoard = Array.from({ length: boardSize }, () =>
        Array.from({ length: boardSize }, () => -1),
      );
      setCustomBoard(newCustomBoard);
    } else {
      // Erstellen eines Standard-Spielfeld
      setCustomBoard(
        Array.from({ length: boardSize }, () =>
          Array.from({ length: boardSize }, () => -1),
        ),
      );
      //kariertes Muster erstellen
      setBg(
        Array.from({ length: boardSize }, (_, i) =>
          Array.from({ length: boardSize }, (_, j) =>
            (i + j) % 2 === 0 ? 0 : -1,
          ),
        ),
      );
    }
  }, [isCustomBoard, boardSize, numOfAmazons]); //wann die Funktion ausgelöst wird.

  const handleStartGame = async () => {
    // Überprüfe, ob das benutzerdefinierte Spielfeld die richtige Anzahl an Amazonen hat
    if (isCustomBoard && !validateCustomBoard()) {
      alert(
        "Falsche Anzahl an Damen auf dem Feld. Achte darauf, dass du " +
          numOfAmazons +
          " Amazonen auf beiden Seiten platziert haben musst.",
      );
      return;
    }
    try {
      // Erstelle den ersten Spieler (Weiß)
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

      // Dynamische Erstellung des Squares Arrays
      const squares = isCustomBoard
        ? customBoard
        : Array.from({ length: gameSizeRows }, (_, rowIndex) =>
            Array.from({ length: gameSizeColumns }, (_, colIndex) => {
              // Platzieren der Amazonen und Giftpfeile
              if (rowIndex === 0 && colIndex < numOfAmazons) {
                return 1; // Amazone des Spielers mit Index 1
              } else if (
                rowIndex === gameSizeRows - 1 &&
                colIndex < numOfAmazons
              ) {
                return 0; // Amazone des Spielers mit Index 0
              } else {
                return -1; // leeres Feld
              }
            }),
          );

      // Erstelle ein neues Spiel mit den gesammelten Daten
      const newGame = await createGame(
        timePerTurn * 1000,
        players,
        gameSizeRows,
        gameSizeColumns,
        squares,
      );

      // Aktualisiere den Zustand der App mit den neuen Spielinformationen
      setCustomBoard(squares);
      setGameId(newGame.id);
      setCurrentPlayer("White"); // Setzen des aktuellen Spielers auf "White"
      setShowPlayground(true);
      setCurrentPlayerID(player1.id);
    } catch (error) {
      console.error("Ein Fehler ist aufgetreten:", error);
    }
  };

  //schließt den Footer
  const handleCloseFooter = () => {
    setShowFooter(false);
  };

  const handleJoinGame = async () => {
    try {
      // Hole das Spiel mit der eingegebenen ID
      const currentGame = await getGameById(gameId);
      if (!currentGame) {
        alert("Spiel nicht gefunden mit der ID: " + gameId);
        return;
      }

      // Überprüfe, ob es schon zwei Spieler im Spiel gibt
      if (currentGame.players && currentGame.players.length > 1) {
        // Überprüfe, ob der zweite Spieler "controllable" ist
        if (currentGame.players[1].controllable) {
          // Setze die Spiel-ID und den aktuellen Spieler auf "Black"
          setGameId(currentGame.id);
          setCurrentPlayer("Black");

          // Lade das Spielfeld des beizutretenden Spiels in die customBoard-Zustandsvariable
          setCustomBoard(currentGame.board.squares);

          // Zeige das Spielfeld an
          setShowPlayground(true);

          // Setze die ID des aktuellen Spielers
          setCurrentPlayerID(currentGame.players[1].id);
        } else {
          alert("Spiel ist nicht Multiplayer.");
        }
      } else {
        // Wenn der zweite Spieler im Spiel eine KI ist, zeige die Fehlermeldung
        alert("Es gibt keinen zweiten Spieler im Spiel.");
      }
    } catch (error) {
      if (error.message.includes("400")) {
        alert("Spiel nicht gefunden mit der ID: " + gameId);
      } else {
        alert("Ein Fehler ist aufgetreten: " + error.message);
      }
    }
  };

  //setzt die GameId
  const handleGameIdChange = (e) => {
    setGameId(e.target.value);
  };

  //setzt die BoardSize
  const handleBoardSizeChange = (e) => {
    const newBoardSize = parseInt(e.target.value);
    setBoardSize(parseInt(e.target.value));

    //passt die Anzahl der Amazonen auf einen Angenehmen Wert an und lässt Glitches nicht zu
    // Überprüfen, ob numOfAmazons größer als die neue boardSize ist
    if (numOfAmazons > newBoardSize) {
      setNumOfAmazons(newBoardSize);
    }
  };

  //setzt ComputerOpponent auf KI oder Spieler
  const handleIsComputerOpponentChange = (e) => {
    setIsComputerOpponent(e.target.checked);
  };

  //setzt die Spiel-Zug-Zeit
  const handleTimePerTurnChange = (e) => {
    setTimePerTurn(parseInt(e.target.value));
  };

  //setzt alles zurück - nicht von nöten für das normale Spiel
  const handleResetAll = async () => {
    try {
      await resetAll();
      alert("Alles wurde zurückgesetzt.");
    } catch (error) {
      console.error("Ein Fehler ist aufgetreten:", error);
    }
  };

  //Zeigt die vollständige Liste an von verfügbaren Spielen
  const fetchGames = async () => {
    try {
      const games = await getAllGames();
      setGamesList(games);
    } catch (error) {
      console.error("Ein Fehler ist aufgetreten:", error);
    }
  };

  //lässt Amazonen auf dem Custom board platzieren
  const handleCustomBoardClick = (rowIndex, cellIndex) => {
    if (!isCustomBoard) return;

    // Überprüfen, ob die Anzahl der Zeilen ungerade ist und ob die aktuelle Zeile die mittlere Zeile ist
    if (boardSize % 2 !== 0 && rowIndex === Math.floor(boardSize / 2)) {
      return; // In diesem Fall nichts tun
    }

    const newCustomBoard = [...customBoard];

    // Überprüfen, ob an der geklickten Stelle bereits eine Amazone ist
    if (newCustomBoard[rowIndex][cellIndex] !== -1) {
      newCustomBoard[rowIndex][cellIndex] = -1; // Leeres Feld setzen
    } else {
      if (rowIndex < Math.floor(boardSize / 2)) {
        newCustomBoard[rowIndex][cellIndex] = 1; // Schwarze Dame
      } else {
        newCustomBoard[rowIndex][cellIndex] = 0; // Weiße Dame
      }
    }

    setCustomBoard(newCustomBoard);
  };

  // Die validateCustomBoard Funktion überprüft, ob die Anzahl der Amazonen für beide Spieler korrekt ist.
  // Sie zählt die Anzahl der Amazonen für den weißen und den schwarzen Spieler und vergleicht sie mit der vorgegebenen Anzahl (numOfAmazons).
  // Wenn die Anzahl für beide Spieler korrekt ist, gibt die Funktion true zurück, sonst false.
  const validateCustomBoard = () => {
    const whiteCount = customBoard.flat().filter((x) => x === 0).length;
    const blackCount = customBoard.flat().filter((x) => x === 1).length;

    return whiteCount === numOfAmazons && blackCount === numOfAmazons;
  };

  // Funktion zum Rendern der Zellen für das benutzerdefinierte Spielfeld
  const renderCustomCell = (rowIndex, cellIndex, value, cell) => {
    let displayValue = value;
    switch (value) {
      case -1:
        displayValue = " "; // Leer
        break;
      case 0:
        displayValue = "♕"; // 0 wird zu "♕"
        break;
      case 1:
        displayValue = "♛"; // 1 wird zu "♛"
        break;
      default:
        displayValue = value;
    }

    //macht das CSS in die Tabelle rein damit es aussieht wie ein Schachbrett
    return (
      <td
        key={cellIndex}
        className={cell === -1 ? "w" : cell === 0 ? "b" : "text"}
        onClick={() => handleCustomBoardClick(rowIndex, cellIndex)}
      >
        {displayValue}
      </td>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Game of the Amazons</h1>
      </header>
      <main>
        {/* Bedingung, ob die Sachen in der Klammer angezeigt werden. - Nur wenn PLayground nicht angezeigt wird*/}
        {!showPlayground ? (
          /* Eingabefelder und Schieberegler für die Spielfeldgröße */
          <div>
            {/* Eingabefelder und Schieberegler für die Spielfeldgröße */}
            {!isCustomBoard && (
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
                {boardSize > 10 && (
                  <div className="warning-box">
                    Warnung: Für mobile kleine Geräte wird nur die 10er
                    Spielfeldgröße empfohlen
                  </div>
                )}
                <br />
              </div>
            )}
            {/* Eingabefelder und Schieberegler für die Zeit pro Zug */}
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

            {/* Eingabefelder und Schieberegler für die Anzahl der Amazonen */}
            <label htmlFor="numOfAmazons">Anzahl der Amazonen</label>
            <input
              type="range"
              id="numOfAmazons"
              min="1"
              max={boardSize}
              value={numOfAmazons}
              onChange={(e) => setNumOfAmazons(parseInt(e.target.value))}
            />
            <span>{numOfAmazons}</span>
            <br />

            {/* Checkbox für die Wahl, ob ein Computer der Gegner ist */}
            <label htmlFor="isComputerOpponent">COM</label>
            <input
              type="checkbox"
              id="isComputerOpponent"
              checked={isComputerOpponent}
              onChange={handleIsComputerOpponentChange}
            />
            <br />
            {/* Checkbox für die Wahl, ob ein benutzerdefiniertes Spielfeld verwendet wird */}
            <label htmlFor="isCustomBoard">Benutzerdefiniertes Spielfeld</label>
            <input
              type="checkbox"
              id="isCustomBoard"
              checked={isCustomBoard}
              onChange={(e) => setIsCustomBoard(e.target.checked)}
              disabled={showPlayground}
            />
            <br />
            {/* Anzeige des Custom Boards solange die Checkbox getickt ist */}
            {isCustomBoard && (
              <div className="custom-board">
                <table>
                  <tbody>
                    {bg.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) =>
                          renderCustomCell(
                            rowIndex,
                            cellIndex,
                            customBoard[rowIndex][cellIndex],
                            cell,
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Button zum Erstellen eines neuen Spiels */}
            <button id="createGame" onClick={handleStartGame}>
              Create Game
            </button>
            {/* Linie um Join und Create zu trennen*/}
            <div className="separator"></div>
            {/* Eingabefeld für die Game ID und Button zum Beitreten eines Spiels */}
            <label htmlFor="GameId">Game ID</label>
            <input
              id="gameId"
              value={gameId}
              onChange={handleGameIdChange}
            ></input>
            <button id="joinGame" onClick={handleJoinGame}>
              Join Game
            </button>
            {/* Liste der offenen Spiele */}
            <ul>
              <h3>Offene Spiele:</h3>
              {gamesList && Array.isArray(gamesList.games) ? (
                gamesList.games.length > 0 ? (
                  gamesList.games.map((game, index) => (
                    <li key={index}>Game ID: {game.id}</li>
                  ))
                ) : (
                  <li>Keine offenen Spiele verfügbar.</li>
                )
              ) : (
                <li>Fehler: Spieleliste konnte nicht geladen werden.</li>
              )}
            </ul>
          </div>
        ) : (
          /* Komponente für das Spielfeld, wenn das Spiel gestartet ist */
          <Playground
            playerName={currentPlayer}
            gameId={gameId}
            currentPlayerID={currentPlayerID}
            size={boardSize}
            numOfAmazons={numOfAmazons}
            customBoard={customBoard}
          />
        )}
        <div className="help">
          <details className="help">
            {/* Hilfe Objekte zur Erklärung des Spiels */}
            <summary>
              <h2>Hilfe</h2>
            </summary>
            <details>
              <summary>
                <h3>Spielanleitung</h3>
              </summary>
              <ol>
                <li>Eigene Dame wählen.</li>
                <li>
                  Wählen wohin die Dame gesetzt werden
                  soll(Horizontal,Vertikal,Diagonal).
                </li>
                <li>
                  Wählen welches Feld für alle Spieler gesperrt werden
                  soll(Horizontal,Vertikal,Diagonal).
                </li>
              </ol>
            </details>
            <details>
              <summary>
                <h3>Wie man ein Spiel erstellt</h3>
              </summary>
              <div>
                <ol>
                  <li>
                    (optional) Du kannst die Spielfeldgröße nach belieben
                    anpassen.
                  </li>
                  <li>
                    (optional)Du kannst die Zeit die der jeweilige Spieler hat
                    einstellen.
                  </li>
                  <li>
                    (optional) Du kannst die Anzahl der Amazonen einstellen,
                    welche deine Spielsteine sein werden.
                  </li>
                  <li>
                    (nicht implementiert) du kannst gegen KI spielen wenn der
                    Haken gedrückt ist.
                  </li>
                  <li>
                    (optional) Du kannst die Amazonen auf der jeweiligen
                    Spielhälfte der jeweiligen Spieler platzieren. Achte darauf,
                    dass jeder Spieler die richtige Anzahl an Amazonen bekommt.
                    Das Spiel soll ja Fair bleiben.Wenn du dies nicht machst
                    werden Sie in der letzten bzw ersten Reihe aufgestellt.
                  </li>
                  <li>
                    Drücke wenn alles nach belieben eingestellt wurde den Knopf
                    "Create Game" und das Spiel startet.
                  </li>
                </ol>
              </div>
            </details>
            <details>
              <summary>
                <h3>Wie man einem Spiel beitritt</h3>
              </summary>
              <div>
                <ol>
                  <li>
                    Lasse dir eine Game ID von deinem Freund geben. (Steht unter
                    dem Spielfeld)
                  </li>
                  <li>Schreibe die ID in das Vorgegebene Textfeld.</li>
                  <li>
                    Drücke auf den Knopf "Join Game" und schon bist du in einem
                    Spiel mit deinem Freund.
                  </li>
                </ol>
              </div>
            </details>
            <details>
              <summary>
                <h3>Wie man gewinnt</h3>
              </summary>
              <div>
                <p>
                  Blocke die gegnerischen Spielfiguren, sodass sie kein Feld
                  mehr haben sich zu bewegen bevor es mit deinen Figuren
                  passiert
                </p>
              </div>
            </details>
            <details>
              <summary>
                <h3>Wie bewegen sich die Spielfiguren?</h3>
              </summary>
              <p>
                Vertikal, Horizontal und Diagonal in alle Richtungen, jedoch
                kann man nicht durch blockierte und besetzte Felder
                hindurchgehen.
              </p>
            </details>
            <details>
              <summary>
                <h3>Bugs?</h3>
              </summary>
              <p>
                Es gibt keine Bugs, sondern nur neue Spielmechaniken von uns den
                tollen Developers ;D
              </p>
            </details>
          </details>
        </div>
      </main>
      {/* Footer-Bereich der Anwendung mit Daten solange es nicht wegeklickt wird */}
      {showFooter && (
        <footer className="footer">
          <button className="close-button" onClick={handleCloseFooter}>
            &times;
          </button>
          <p>
            Diese Website wurde im Auftrag von der Hochschule Anhalt unter der
            Aufsicht von Toni Barth entwickelt.
            <br />
            Autoren: Sophie Schmeiduch, Paul Hanemann, Franz Georgi, Ricardo
            Hoppe
          </p>
        </footer>
      )}

      {/* Button zum Zurücksetzen aller Einstellungen, nur sichtbar, wenn das Spielfeld nicht angezeigt wird und hinter dem Footer */}
      {!showPlayground && (
        <button className="reset-button" onClick={handleResetAll}>
          Reset everything
        </button>
      )}
    </div>
  );
}

export default App;
