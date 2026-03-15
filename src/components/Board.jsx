import { useEffect, useState } from "react";
import Square from "./square";

export default function Board({ handleClick, squares }) {
    return (
        <>
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
