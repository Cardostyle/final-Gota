//Game.js

async function fetchWithCheck(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}, message: ${data}`);
  }
  return data;
}



// Spieler anlegen
export async function createPlayer(name, controllable) {
  return fetchWithCheck("https://gruppe5.toni-barth.com/players/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, controllable }),
  });
}

// Alle Spieler abfragen
export async function getAllPlayers() {
  return fetchWithCheck("https://gruppe5.toni-barth.com/players/");
}

// Spieler löschen
export async function deletePlayer(id) {
  return fetchWithCheck(`https://gruppe5.toni-barth.com/players/${id}`, {
    method: "DELETE",
  });
}

// Einen bestimmten Spieler abfragen
export async function getPlayerById(id) {
  return fetchWithCheck(`https://gruppe5.toni-barth.com/players/${id}`);
}

// Ein neues Spiel starten
export const createGame = async (
  maxTurnTime,
  players,
  gameSizeRows,
  gameSizeColumns,
  squares,
) => {
  return fetchWithCheck("https://gruppe5.toni-barth.com/games/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      maxTurnTime,
      players,
      board: {
        gameSizeRows,
        gameSizeColumns,
        squares,
      },
    }),
  });
};

// Alle Spiele abfragen
export async function getAllGames() {
  return fetchWithCheck("https://gruppe5.toni-barth.com/games/");
}

// Ein bestimmtes Spiel abfragen
export async function getGameById(id) {
  return fetchWithCheck(`https://gruppe5.toni-barth.com/games/${id}`);
}

// Ein Spiel löschen
export async function deleteGame(id) {
  return fetchWithCheck(`https://gruppe5.toni-barth.com/games/${id}`, {
    method: "DELETE",
  });
}

//Einen Spielzug an den Server schicken
export async function makeMove(playerId, gameId, move, shot) {
  try {
    const formattedMove = {
      start: {
        row: move.startX,
        column: move.startY,
      },
      end: {
        row: move.endX,
        column: move.endY,
      },
    };

    const formattedShot = {
      row: shot.shotX,
      column: shot.shotY,
    };

    return fetchWithCheck(
      `https://gruppe5.toni-barth.com/move/${playerId}/${gameId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ move: formattedMove, shot: formattedShot }), // Verwendung der angepassten Objekte
      },
    );
  } catch (error) {
    console.error("An error occurred:", error);
    alert(`Ein Fehler ist aufgetreten: ${error.message}`);
    throw error;
  }
}

// Alles auf Standardwerte zurücksetzen
export async function resetAll() {
  return fetchWithCheck("https://gruppe5.toni-barth.com/reset/", {
    method: "DELETE",
  });
}

//nicht von nöten 
// Funktion zum Zurücksetzen des Spielbretts auf dem Server
export async function resetGameBoard(gameId, initialBoard) {
  return fetchWithCheck(`https://gruppe5.toni-barth.com/games/${gameId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      board: initialBoard,
      turnPlayer: 0,
      turns: [],
      // Weitere Felder, die zurückgesetzt werden sollen
    }),
  });
}

