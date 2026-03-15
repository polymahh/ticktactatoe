import { useEffect, useState, useCallback } from "react";
import PixiCanvas from "./PixiCanvas";
import ConwayCanvas from "./ConwayCanvas";

const STORAGE_KEY = "chimbo-games";

function loadGames() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveGames(games) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

export default function Playground() {
    const [games, setGames] = useState(loadGames);
    const [tatoIsNext, setTatoIsNext] = useState(true);
    const [squares, setSquares] = useState(Array(9).fill(null));
    const [winner, setWinner] = useState(null);
    const [status, setStatus] = useState("Next player: tato");

    const handleCellClick = useCallback(
        (i) => {
            if (squares[i] || winner) return;
            const next = [...squares]; // clone to avoid mutation
            next[i] = tatoIsNext ? "tato" : "okra";
            setSquares(next);
            setTatoIsNext(!tatoIsNext);
        },
        [squares, tatoIsNext, winner],
    );

    // Check win / draw and archive the game when finished
    useEffect(() => {
        const result = calculateWinner(squares);
        const full = isFull(squares);
        setWinner(result);

        if (result === "tato") {
            setStatus("Winner: rubicon crossed...tatoes, the rightful emperor, has assumed the throne!!!");
            archiveGame(result);
        } else if (result === "okra") {
            setStatus("Winner: tatoes, because at the last second, tatoes rose up and slew the evil okra");
            archiveGame(result);
        } else if (result === null && full) {
            setStatus("Winner: tatoes wins anyway, okra was exhausted...TKO");
            archiveGame("draw");
        } else {
            setStatus("Next player: " + (tatoIsNext ? "tato" : "okra"));
        }
    }, [squares, tatoIsNext]);

    function archiveGame(result) {
        // Wait a moment so the player can see the result, then start a new game
        setTimeout(() => {
            setGames((prev) => {
                const updated = [...prev, { squares: [...squares], winner: result }];
                saveGames(updated);
                return updated;
            });
            setSquares(Array(9).fill(null));
            setTatoIsNext(true);
            setWinner(null);
            setStatus("Next player: tato");
        }, 1500);
    }

    function restart() {
        setSquares(Array(9).fill(null));
        setTatoIsNext(true);
        setWinner(null);
        setStatus("Next player: tato");
    }

    function clearHistory() {
        setGames([]);
        saveGames([]);
    }

    return (
        <>
            <h1>Kwonky's Fanciful Chimbo Gardi</h1>
            <h3>who suffers? who is saved?</h3>
            <h5>
                <button className="restartbtn" onClick={restart}>
                    Reset the Chimbo ?
                </button>
                {games.length > 0 && (
                    <button className="restartbtn" onClick={clearHistory} style={{ marginLeft: 10 }}>
                        Clear History ({games.length})
                    </button>
                )}
            </h5>
            <div className="status">{status}</div>
            <p style={{ textAlign: "center", fontSize: 12, color: "#75655A" }}>
                scroll to zoom &bull; drag to pan &bull; click cells on the green board to play
            </p>
            <div className="wrapper">
                <div className="playground-layout">
                    <div className="playground-main">
                        <PixiCanvas games={games} currentGame={{ squares }} onCellClick={handleCellClick} />
                    </div>
                </div>
                <ConwayCanvas games={games} />
            </div>
        </>
    );
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}

function isFull(squares) {
    return squares.every((element) => element !== null);
}
