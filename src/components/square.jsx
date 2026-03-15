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

export default Square;
