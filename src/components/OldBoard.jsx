import { useState } from "react";

function Square({ tato, onTatoClick }) {
    return (
        <button className="square" onClick={onTatoClick}>
            {tato == "okra" ? (
                <img src="poisontato.png" height="180px" width="180px"></img>
            ) : tato == "tato" ? (
                <img src="tato.jpg" height="180px" width="180px"></img>
            ) : null}
        </button>
    );
}

export default function Board() {
    const [tatoIsNext, setTatoIsNext] = useState(true);
    const [squares, setTato] = useState(Array(9).fill(null));
    const winner = calculateWinner(squares);
    let status;

    if (winner === "tato") {
        status = "Winner: rubicon crossed...tatoes, the rightful emperor, has assumed the throne!!!";
    } else if (winner === "okra") {
        status = "Winner: tatoes, because at the last second, tatoes rose up and slew the evil okra";
    } else if (winner === null && isFull(squares)) {
        status = "Winner: tatoes wins anyway, okra was exhausted...TKO";
    } else {
        status = "Next player: " + (tatoIsNext ? "tato" : "okra");
    }

    function handleClick(i) {
        if (squares[i] || calculateWinner(squares)) {
            return;
        }
        const nextTato = squares.slice();
        if (tatoIsNext) {
            nextTato[i] = "tato";
        } else {
            nextTato[i] = "okra";
        }

        setTato(nextTato);
        setTatoIsNext(!tatoIsNext);
    }

    function restart() {
        setTato(Array(9).fill(null));
        setTatoIsNext(true);
    }

    return (
        <>
            <h1>Kwonky's Fanciful Chimbo Gardi</h1>
            <h3>who suffers? who is saved? </h3>
            <h5>
                <button className="restartbtn" onClick={restart}>
                    Reset the Chimbo ?
                </button>
            </h5>
            <div className="status">{status}</div>
            <div className="board-row">
                <Square tato={squares[0]} onTatoClick={() => handleClick(0)} />
                <Square tato={squares[1]} onTatoClick={() => handleClick(1)} />
                <Square tato={squares[2]} onTatoClick={() => handleClick(2)} />
            </div>
            <div className="board-row">
                <Square tato={squares[3]} onTatoClick={() => handleClick(3)} />
                <Square tato={squares[4]} onTatoClick={() => handleClick(4)} />
                <Square tato={squares[5]} onTatoClick={() => handleClick(5)} />
            </div>
            <div className="board-row">
                <Square tato={squares[6]} onTatoClick={() => handleClick(6)} />
                <Square tato={squares[7]} onTatoClick={() => handleClick(7)} />
                <Square tato={squares[8]} onTatoClick={() => handleClick(8)} />
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
