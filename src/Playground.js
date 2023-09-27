//Playground.js
import React from "react";
import {
  deletePlayer,
  getGameById,
  deleteGame,
  makeMove,
  resetGameBoard,
} from "./Game";

//Konstruktor
class Playground extends React.Component {
  constructor(props) {
    super(props);
    const size = this.props.size; // Größe vom Parent (App.js) erhalten
    this.state = {
      activePlayer: "White",
      phase: "select",
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      shotX: 0,
      shotY: 0,
      legal: false,
      remainingTurnTime: 999999999,
      gameOver: false,
      tableData: this.props.customBoard,
      originalTableData: JSON.parse(JSON.stringify(this.props.customBoard)), // Deep Copy
      bg: Array.from({ length: size }, (_, i) =>
        Array.from({ length: size }, (_, j) => ((i + j) % 2 === 0 ? 0 : -1)),
      ),
    };
    this.handleReset = this.handleReset.bind(this);
  }

  // Die Funktion initializeTableDataAndBg initialisiert die Spielfeld-Daten und den Hintergrund des Spielfelds.
  initializeBg = (size) => {
    // Erstellt ein Array für den Hintergrund des Spielfelds.
    let bg = Array.from({ length: size }, (_, i) =>
      Array.from({ length: size }, (_, j) => ((i + j) % 2 === 0 ? 0 : -1)),
    );
    // Aktualisiert den Zustand der Komponente mit den neuen tableData und bg Arrays.
    this.setState({ bg });
  };

  async componentDidMount() {
    //Intervall für das Abrufen des Zugs des Gegners einrichten
    this.interval = setInterval(() => {
      // Überprüfen, ob der aktuelle Spieler nicht am Zug ist
      if (this.props.playerName !== this.state.activePlayer) {
        // Zug des Gegners abrufen
        this.fetchOpponentMove();
        console.log("fetching");
      }
    }, 2000);

    // Intervall für das Abrufen der verbleibenden Zugzeit einrichten
    this.timeInterval = setInterval(async () => {
      try {
        const game = await getGameById(this.props.gameId);
        this.setState({ remainingTurnTime: game.remainingTurnTime });
        this.WinAfterTime();
      } catch (error) {
        console.error("Fehler beim Abrufen der verbleibenden Zugzeit:", error);
      }
    }, 1000); // Aktualisiert jede halbe Sekunde

    //Initialisierung des Hintergrunds
    this.initializeBg(this.props.size);
  }

  //Testet ob ein Punkt beschossen oder dahin bewegt werden kann (Diagonale/Vertikale/Senkrechte)
  checkIfFree(startX, startY, endX, endY) {
    const { tableData } = this.state;
    let legal = false;

    if (startX === endX && startY === endY) {
      return legal;
    }

    // Überprüfe, ob der Endpunkt frei ist
    if (tableData[endX][endY] !== -1) {
      return legal;
    }

    if (
      startX < 0 ||
      startX >= tableData.length ||
      endX < 0 ||
      endX >= tableData.length ||
      startY < 0 ||
      startY >= tableData[0].length ||
      endY < 0 ||
      endY >= tableData[0].length
    ) {
      console.log("Out of Array");
      return legal;
    }

    legal = true; // Setze legal auf true, es wird auf false gesetzt, wenn ein Hindernis gefunden wird

    if (startX === endX) {
      const step = startY < endY ? 1 : -1;
      for (let n = startY + step; n !== endY; n += step) {
        if (tableData[startX][n] !== -1) {
          legal = false;
          break;
        }
      }
    } else if (startY === endY) {
      const step = startX < endX ? 1 : -1;
      for (let n = startX + step; n !== endX; n += step) {
        if (tableData[n][startY] !== -1) {
          legal = false;
          break;
        }
      }
    } else if (Math.abs(startX - endX) === Math.abs(startY - endY)) {
      const stepX = startX < endX ? 1 : -1;
      const stepY = startY < endY ? 1 : -1;
      let y = startY + stepY;
      for (let x = startX + stepX; x !== endX; x += stepX) {
        if (tableData[x][y] !== -1) {
          legal = false;
          break;
        }
        y += stepY;
      }
    } else {
      legal = false;
    }
    return legal;
  }

  Game(rowIndex, cellIndex) {
    let { activePlayer, phase, tableData } = this.state;
    let startX = this.state.startX;
    let startY = this.state.startY;
    let endX = this.state.endX;
    let endY = this.state.endY;
    let shotX = this.state.shotX;
    let shotY = this.state.shotY;
    let legal = this.state.legal;

    // Überprüfen, ob der aktuelle Spieler seine eigenen Figuren bewegt
    const currentPlayerSymbol = activePlayer === "White" ? 0 : 1;
    if (
      tableData[rowIndex] === undefined ||
      tableData[rowIndex] === null ||
      tableData[rowIndex][cellIndex] === undefined ||
      tableData[rowIndex][cellIndex] === null
    ) {
      alert("Indizes ungültig");
      return; // Frühzeitiger Ausstieg, wenn die Indizes ungültig sind
    }

    // Überprüfen, ob der aktuelle Spieler am Zug ist und seine eigene Figur auswählt
    if (
      tableData[rowIndex][cellIndex] === currentPlayerSymbol &&
      activePlayer === this.props.playerName &&
      phase !== "shoot"
    ) {
      startX = rowIndex;
      startY = cellIndex;
      for (let i = startY - 1; i <= startY + 1; i++) {
        for (let j = startX - 1; j <= startX + 1; j++) {
          if (tableData[j] && tableData[j][i] === -1 && i !== 0) {
            phase = "move";
            break;
          }
        }
      }

      // Wenn der aktuelle Spieler am Zug ist und den Zielpunkt der zu bewegenden Figur wählt
    } else if (phase === "move" && activePlayer === this.props.playerName) {
      endX = rowIndex;
      endY = cellIndex;
      legal = this.checkIfFree(startX, startY, endX, endY);
      if (legal) {
        tableData[startX][startY] = -1;
        tableData[endX][endY] = currentPlayerSymbol;
        phase = "shoot";
      }

      // Wenn der Schuss gemacht werden soll (den treffenden Zielpunkt deaktivieren als Spielfeld)
    } else if (phase === "shoot" && activePlayer === this.props.playerName) {
      shotX = rowIndex;
      shotY = cellIndex;
      legal = this.checkIfFree(endX, endY, shotX, shotY);
      if (legal) {
        tableData[rowIndex][cellIndex] = -2;
        const nextPlayer = activePlayer === "White" ? "Black" : "White";
        const move = { startX, startY, endX, endY };
        const shot = { shotX, shotY };
        this.sendMoveToServer(this.props.currentPlayerID, move, shot);
        this.setState({
          activePlayer: nextPlayer,
          phase: "select",
          startX: 0,
          startY: 0,
          endX: 0,
          endY: 0,
          shotX: 0,
          shotY: 0,
          legal: false,
          tableData: [...tableData],
        });

        // Testen, ob ein Spieler gewonnen hat
        if (this.playerWon(activePlayer)) {
          alert("Spieler " + activePlayer + " hat gewonnen!");
        }
        return;
      }
    }

    this.setState({
      activePlayer,
      phase,
      startX,
      startY,
      endX,
      endY,
      shotX,
      shotY,
      legal,
    });
  }

  // Funktion zum Senden des Zugs an den Server
  async sendMoveToServer(playerId, move, shot) {
    try {
      // Versucht, den Zug mit der Funktion makeMove() an den Server zu senden
      const data = await makeMove(playerId, this.props.gameId, move, shot);

      // Überprüfen Sie den Status der Antwort hier
      if (data && data.status && data.status !== 200) {
        // Gibt Fehlerstatus und Fehlertext aus, wenn die Antwort nicht erfolgreich ist
        console.error("Error Status:", data.status);
        console.error("Error Message:", data.message || "Unbekannter Fehler");
      } else {
        // Gibt eine Erfolgsmeldung aus, wenn der Zug erfolgreich gesendet wurde
        console.log("Move sent!");
      }
    } catch (error) {
      // Fängt etwaige Fehler ab und gibt sie in der Konsole aus
      console.error("Ein Fehler ist aufgetreten:", error);
    }
  }

  async fetchOpponentMove() {
    try {
      if (!this.props.gameId) {
        deleteGame(this.props.gameId);
        console.error("Game ID is not available.");
        return;
      }
      
      const game = await getGameById(this.props.gameId);
      const turns = game.turns; // Liste aller Züge
      const lastTurn = turns[turns.length - 1]; // Letzter Zug

      if (lastTurn && game.turnPlayer === this.props.currentPlayerID % 2) {
        console.log("Move angekommen");
        let { tableData, activePlayer } = this.state;

        // Aktualisieren der Position der Amazonen basierend auf dem Zug des Gegners
        const opponentMoveStart = lastTurn.move.start;
        const opponentMoveEnd = lastTurn.move.end;
        tableData[opponentMoveStart.row][opponentMoveStart.column] = -1;
        tableData[opponentMoveEnd.row][opponentMoveEnd.column] =
          activePlayer === "White" ? 1 : 0;
        // Aktualisieren des Schusses basierend auf dem Schuss des Gegners
        const opponentShot = lastTurn.shot;
        tableData[opponentShot.row][opponentShot.column] = -2;

        // Aktualisieren des aktiven Spielers
        activePlayer = this.props.playerName;

        this.setState({
          tableData,
          activePlayer,
          phase: "select",
          startX: 0,
          startY: 0,
          endX: 0,
          endY: 0,
          shotX: 0,
          shotY: 0,
          legal: false,
        });
      }
    } catch (error) {
      console.error("An error occurred:", error);

      // Überprüfen, ob die Fehlermeldung "game doesn't exist" enthält
      if (
        error &&
        error.message &&
        error.message.includes("game doesn't exist")
      ) {
        //alert("Der andere Spieler hat das Spiel verlassen.");
        window.location.reload(); // Seite neu laden
      }
    }
  }

  //test ob sich der nicht aktive Spieler noch bewegen kann, wenn nicht dann hat active Player gewonnen
  playerWon(activePlayer) {
    const nextPlayer = activePlayer === "White" ? 1 : 0;

    for (var n = 0; n < this.props.size; n++) {
      for (var m = 0; m < this.props.size; m++) {
        if (this.state.tableData[n][m] === nextPlayer) {
          for (var i = -1; i < 2; i++) {
            for (var j = -1; j < 2; j++) {
              if (
                j + m < this.props.size &&
                j + m >= 0 &&
                i + n < this.props.size &&
                i + n >= 0
              ) {
                if (this.state.tableData[i + n][j + m] === -1) {
                  return false;
                }
              }
            }
          }
        }
      }
    }
    return true;
  }

  // Neue Funktion, die überprüft, ob die Zeit abgelaufen ist
  WinAfterTime() {
    const { remainingTurnTime, activePlayer, gameOver } = this.state;
    if ((remainingTurnTime === 0 || isNaN(remainingTurnTime)) && !gameOver) {
      const winningPlayer = activePlayer === "White" ? "Black" : "White";
      alert(
        `Spieler ${winningPlayer} hat gewonnen, weil die Zeit des anderen Spielers abgelaufen ist oder er das Spiel verlassen hat.`,
      );
      clearInterval(this.timeInterval); // Intervall stoppen
      clearInterval(this.interval); // Anderes Intervall stoppen
      this.setState({ gameOver: true }); // Zustand auf "Spiel beendet" setzen
    }
  }

  //Nicht Möglich da man den Server nicht bearbeiten darf bzw das Board nicht zurücksetzen kann.
  async handleReset() {
    // Zustand zurücksetzen
    this.setState({
      activePlayer: "White",
      phase: "select",
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      shotX: 0,
      shotY: 0,
      legal: false,
      tableData: JSON.parse(JSON.stringify(this.state.originalTableData)), // Deep Copy
    });

    // Spielbrett auf dem Server zurücksetzen
    try {
      const initialBoard = this.state.originalTableData; // oder wie auch immer Ihr ursprüngliches Brett definiert ist
      await resetGameBoard(this.props.gameId, initialBoard);
      console.log("Spielbrett auf dem Server erfolgreich zurückgesetzt.");
    } catch (error) {
      console.error(
        "Fehler beim Zurücksetzen des Spielbretts auf dem Server:",
        error,
      );
    }
  }

  //aufbau des Spielfeldes in der Website
  render() {
    const { bg } = this.state; // bg aus dem Zustand holen

    const renderCell = (rowIndex, cellIndex, value, cell) => {
      let displayValue = value;
      switch (value) {
        case -1:
          displayValue = " "; // Leer
          break;
        case -2:
          displayValue = "🔥"; // -2 wird zu "🔥"
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

      return (
        <td
          key={cellIndex}
          className={cell === -1 ? "w" : cell === 0 ? "b" : "text"}
          onClick={() => this.Game(rowIndex, cellIndex)}
        >
          {displayValue}
        </td>
      );
    };

    const renderOwnPlayer = () => {
      return <p>Your Color: {this.props.playerName}</p>;
    };

    const renderActivePlayer = () => {
      return <p>Active Player: {this.state.activePlayer}</p>;
    };

    const renderPhase = () => {
      return <p>Phase: {this.state.phase}</p>;
    };

    const renderRemainingTime = () => {
      const timeInSeconds = Math.round(this.state.remainingTurnTime / 1000);
      return (
        <p>
          Remaining time: {isNaN(timeInSeconds) ? 0 : timeInSeconds} seconds
        </p>
      );
    };

    const handleDeleteGame = async () => {
      try {
        let game;

        // Schritt 1: Spielinformationen abrufen
        game = await getGameById(this.props.gameId);

        // Schritt 2: Spiel löschen
        await deleteGame(this.props.gameId);

        // Schritt 3: Spieler-IDs extrahieren und in Ganzzahlen umwandeln
        const players = game.players;

        // Schritt 4: Jeden Spieler löschen
        for (const player of players) {
          await deletePlayer(player.id);
        }

        // Seite neu laden
        window.location.reload();
      } catch (error) {
        // Seite neu laden
        window.location.reload();
      }
    };

    return (
      <div>
        {/* unnötiger Button
        <button onClick={this.handleReset}>Reset</button>
        */}
        {this.props.gameId && (
          <button onClick={handleDeleteGame}>Leave Game</button>
        )}
        <div>{renderOwnPlayer()}</div>
        <div>{renderActivePlayer()}</div>
        <div>{renderPhase()}</div>
        <div>{renderRemainingTime()}</div>
        <div className="playground-container">
          <table>
            <tbody>
              {bg.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) =>
                    renderCell(
                      rowIndex,
                      cellIndex,
                      this.state.tableData[rowIndex][cellIndex],
                      cell,
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="game-id-display">Game ID: {this.props.gameId}</div>
        </div>
      </div>
    );
  }
}
export default Playground;
