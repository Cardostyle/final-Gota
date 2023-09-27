//Playground.js
import React from "react";
import { deletePlayer, getGameById, deleteGame, makeMove } from "./Game";

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
      tableData: this.props.customBoard,
      originalTableData: JSON.parse(JSON.stringify(this.props.customBoard)), // Deep Copy
      bg: Array.from({ length: size }, (_, i) =>
        Array.from({ length: size }, (_, j) => ((i + j) % 2 === 0 ? 0 : -1)),
      ),
    };
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
    }, 1000);

    //Initialisierung des Hintergrunds
    this.initializeBg(this.props.size);
  }

  //Testet ob ein Punkt beschossen oder dahin bewegt werden kann (Diagonale/Vertikale/Senkrechte)
  checkIfFree(startX, startY, endX, endY) {
    const { tableData } = this.state;
    let legal = false;

    //wenn start=Ende
    if (startX === endX && startY === endY) {
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

    //wenn auf Einer Senkrechten Ebene
    if (startX === endX) {
      legal = true;

      //wenn nach oben bewegt
      if (startY < endY) {
        for (let n = startY + 1; n <= endY; n++) {
          if (tableData[startX][n] !== -1) {
            legal = false;
            break;
          }
        }

        //wenn nach unten bewegt
      } else {
        for (let n = startY - 1; n >= endY; n--) {
          if (tableData[startX][n] !== -1) {
            legal = false;
            break;
          }
        }
      }
      //wenn auf einer Horizontalen
    } else if (startY === endY) {
      legal = true;
      //wenn nach rechts bewegt
      if (startX < endX) {
        for (let n = startX + 1; n <= endX; n++) {
          if (tableData[startX][n] !== -1) {
            legal = false;
            break;
          }
        }
        //wenn nach links bewegt
      } else {
        for (let n = startX - 1; n >= endX; n--) {
          if (tableData[startX][n] !== -1) {
            legal = false;
            break;
          }
        }
      }
      //neben-diagonalen
    } else if (startX - startY === endX - endY) {
      legal = true;
      if (startX < endX) {
        let n = startY + 1;
        for (let m = startX + 1; m <= endX; m++) {
          if (tableData[startX][n] !== -1) {
            legal = false;
            break;
          }
          n++;
        }
      } else {
        let n = startY - 1;
        for (let m = startX - 1; m >= endX; m--) {
          if (tableData[startX][n] !== -1) {
            legal = false;
            break;
          }
          n--;
        }
      }
      //Haupt-diagonalen
    } else if (startX + startY === endX + endY) {
      legal = true;
      if (startX < endX) {
        let n = startY - 1;
        for (let m = startX + 1; m <= endX; m++) {
          if (tableData[startX][n] !== -1) {
            legal = false;
            break;
          }
          n--;
        }
      } else {
        let n = startY + 1;
        for (let m = startX - 1; m >= endX; m--) {
          if (tableData[startX][n] !== -1) {
            legal = false;
            break;
          }
          n++;
        }
      }
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
      const response = await makeMove(playerId, this.props.gameId, move, shot);

      // Überprüft den Status der Antwort
      if (response.status !== 200) {
        // Gibt Fehlerstatus und Fehlertext aus, wenn die Antwort nicht erfolgreich ist
        console.error("Error:", response.status);
        console.error("Error Text:", await response);
      } else {
        // Gibt eine Erfolgsmeldung aus, wenn der Zug erfolgreich gesendet wurde
        console.log("Move sent:", response);
      }
    } catch (error) {
      // Fängt etwaige Fehler ab und gibt sie in der Konsole aus
      console.error("Ein Fehler ist aufgetreten:", error);
    }
  }

  async fetchOpponentMove() {
    if (!this.props.gameId) {
      console.error("Game ID is not available.");
      return;
    }
    try {
      const game = await getGameById(this.props.gameId);
      const turns = game.turns; // Liste aller Züge
      const lastTurn = turns[turns.length - 1]; // Letzter Zug

      if (lastTurn && game.turnPlayer === this.props.currentPlayerID) {
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

  handleReset() {
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

    const renderPlayer = () => {
      return <p>Player: {this.state.activePlayer}</p>;
    };

    const renderPhase = () => {
      return <p>Phase: {this.state.phase}</p>;
    };

    const handleDeleteGame = async () => {
      try {
        let game;
        try {
          // Schritt 1: Spielinformationen abrufen
          game = await getGameById(this.props.gameId);
        } catch (error) {
          // Seite neu laden
          window.location.reload();
        }

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
        console.error("Ein Fehler ist aufgetreten:", error);
      }
    };

    return (
      <div>
        <button onClick={() => this.handleReset()}>Reset</button>
        {this.props.gameId && (
          <button onClick={handleDeleteGame}>Spiel verlassen</button>
        )}
        <div>{renderPlayer()}</div>
        <div>{renderPhase()}</div>
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
