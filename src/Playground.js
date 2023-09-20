//Playground.js
import React from 'react';
import { createPlayer, getAllPlayers, deletePlayer, createGame, getAllGames, getGameById, deleteGame, makeMove, resetAll } from './Game';

class Playground extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        activePlayer: 1,
        phase: "select",
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        shotX: 0,
        shotY: 0,
        legal: false,
        tableData: [
          [" ", " ", " ", "♛", " ", " ", "♛", " ", " ", " "],
          [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
          [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
          ["♛", " ", " ", " ", " ", " ", " ", " ", " ", "♛"],
          [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
          [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
          ["♕", " ", " ", " ", " ", " ", " ", " ", " ", "♕"],
          [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
          [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
          [" ", " ", " ", "♕", " ", " ", "♕", " ", " ", " "],
        ]
      };
  }

  async componentDidMount() {
    try {
      const players = await getAllPlayers();
      console.log('Players:', players);
    } catch (error) {
      console.error('An error occurred:', error);
    }
    this.interval = setInterval(this.fetchOpponentMove, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  checkIfFree(startX, startY, endX, endY) {
    
    const { tableData } = this.state;
    let legal = false;

    //wenn start=Ende
    if (startX === endX && (startY === endY)){
      return legal;
    }

    if (startX < 0 && startX >= tableData.length && endX < 0 && endX >= tableData[startX].length && startY < 0 && startY >= tableData.length && endY < 0 && endY >= tableData[startX].length) {
      return legal;
    }

    //wenn auf Einer Senkrechten Ebene
    if (startX === endX) {
      legal = true;

      //wenn nach oben bewegt
      if (startY < endY) {
        for (let n = startY + 1; n <= endY; n++) {
          if (tableData[startX][n] !== " ") {
            legal = false;
            break;
          }
        }

       //wenn nach unten bewegt
      } else {
        for (let n = startY - 1; n >= endY; n--) {
          if (tableData[endX][n] !== " ") {
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
          if (tableData[n][startY] !== " ") {
            legal = false;
            break;
          }
        }
        //wenn nach links bewegt
      } else {
        for (let n = startX - 1; n >= endX; n--) {
          if (tableData[n][startY] !== " ") {
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
          if (tableData[m][n] !== " ") {
            legal = false;
            break;
          }
          n++;
        }
      } else {
        let n = startY - 1;
        for (let m = startX - 1; m >= endX; m--) {
          if (tableData[m][n] !== " ") {
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
          if (tableData[m][n] !== " ") {
            legal = false;
            break;
          }
          n--;
        }
      } else {
        let n = startY + 1;
        for (let m = startX - 1; m >= endX; m--) {
          if (tableData[m][n] !== " ") {
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
    const currentPlayerSymbol = this.props.playerName === "White" ? "♕" : "♛";
  
    if (!tableData[rowIndex] || !tableData[rowIndex][cellIndex]) {
      return; // Frühzeitiger Ausstieg, wenn die Indizes ungültig sind
    }
  
    // Überprüfen, ob der aktuelle Spieler am Zug ist und seine eigene Figur auswählt
    if (tableData[rowIndex][cellIndex] === currentPlayerSymbol && this.props.playerName === activePlayer && phase !== "shoot") {
      startX = rowIndex;
      startY = cellIndex;
      for (let i = startY - 1; i <= startY + 1; i++) {
        for (let j = startX - 1; j <= startX + 1; j++) {
          if (tableData[j] && tableData[j][i] === " " && i !== 0) {
            phase = "move";
            break;
          }
        }
      }
  
    // Wenn der aktuelle Spieler am Zug ist und den Zielpunkt der zu bewegenden Figur wählt
    } else if (phase === "move" && this.props.playerName === activePlayer) {
      endX = rowIndex;
      endY = cellIndex;
      legal = this.checkIfFree(startX, startY, endX, endY);
      if (legal) {
        tableData[startX][startY] = " ";
        tableData[endX][endY] = currentPlayerSymbol;
        phase = "shoot";
      }
  
    // Wenn der Schuss gemacht werden soll (den treffenden Zielpunkt deaktivieren als Spielfeld)
    } else if (phase === "shoot" && this.props.playerName === activePlayer) {
      shotX = rowIndex;
      shotY = cellIndex;
      legal = this.checkIfFree(endX, endY, shotX, shotY);
      if (legal) {
        tableData[rowIndex][cellIndex] = "🔥";
        const nextPlayer = activePlayer === "White" ? "Black" : "White";
        const move = { startX, startY, endX, endY };
        const shot = { shotX, shotY };
        this.sendMoveToServer(this.props.playerName, move, shot);
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
    const response = await makeMove(playerId, this.props.gameId, move, shot);
    if (response.status !== 200) {
      console.error('Error:', response.status);
      console.error('Error Text:', await response.text());
    } else {
      console.log('Move sent:', response);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}


  // Funktion zum Abrufen des Zugs des gegnerischen Spielers vom Server
  async fetchOpponentMove() {
    try {
      const game = await getGameById(this.props.gameId);
      // Logik zum Aktualisieren des Spielfelds mit dem Zug des Gegners
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

  //test ob sich der nicht aktive Spieler noch bewegen kann, wenn nicht dann hat active Player gewonnen
  playerWon(activePlayer){
    var nextPlayer;
    if (activePlayer===1){
      nextPlayer= "♛";
    }else{
      nextPlayer="♕";
    }
      for (var n = 1; n < 11; n++) {
        for (var m = 1; m < 11; m++) {
          if (this.state.tableData[n][m] === nextPlayer) {
            for (var i = -1; i < 2; i++) {
              for (var j = -1; j < 2; j++) {
                if (j + m < 11 && j + m > 0 && i + n < 11 && i + n > 0) {
                  if (this.state.tableData[i + n][j + m] === " ") {
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
    
    //rücksetzen auf default
  handleReset() {
    this.setState({
      activePlayer: 1,
      phase: "select",
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      shotX: 0,
      shotY: 0,
      legal: false,
      tableData: [
        [" ", " ", " ", "♛", " ", " ", "♛", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
        ["♛", " ", " ", " ", " ", " ", " ", " ", " ", "♛"],
        [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
        ["♕", " ", " ", " ", " ", " ", " ", " ", " ", "♕"],
        [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", " ", " ", " ", " ", " ", " ", " "],
        [" ", " ", " ", "♕", " ", " ", "♕", " ", " ", " "],
      ]
    });
  }


  //aufbau des Spielfeldes in der Website
  render() {
    const bg = [
      [-1, 0, -1, 0, -1, 0, -1, 0, -1, 0],
      [0, -1, 0, -1, 0, -1, 0, -1, 0, -1],
      [-1, 0, -1, 0, -1, 0, -1, 0, -1, 0],
      [0, -1, 0, -1, 0, -1, 0, -1, 0, -1],
      [-1, 0, -1, 0, -1, 0, -1, 0, -1, 0],
      [0, -1, 0, -1, 0, -1, 0, -1, 0, -1],
      [-1, 0, -1, 0, -1, 0, -1, 0, -1, 0],
      [0, -1, 0, -1, 0, -1, 0, -1, 0, -1],
      [-1, 0, -1, 0, -1, 0, -1, 0, -1, 0],
      [0, -1, 0, -1, 0, -1, 0, -1, 0, -1],
    ];

    const renderCell = (rowIndex, cellIndex, value, cell) => {
      return <td key={cellIndex} className={cell === -1 ? "w" : cell === 0 ? "b" : "text"} onClick={() => this.Game(rowIndex, cellIndex)}>{value}</td>;
    };

    const renderPlayer = () => {
      if (this.state.activePlayer === 1) {
        return <p>Player: White</p>
      } else {
        return <p>Player: Black</p>
      }
    };

    const renderPhase = () => {
      return <p>Phase: {this.state.phase}</p>
    }

    return (
      <div>
        <button onClick={() => this.handleReset()}>Reset</button>
        <div>{renderPlayer()}</div>  
        <div>{renderPhase()}</div>  
        <div className="playground-container">
          <table>
            <tbody>
              {bg.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => renderCell(rowIndex, cellIndex, this.state.tableData[rowIndex][cellIndex], cell))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="game-id-display">
            Game ID: {this.props.gameId}
          </div>
        </div>  
        <br/><br/><br/><br/><br/><br/><br/>
      </div>
    );
  }
}
export default Playground;