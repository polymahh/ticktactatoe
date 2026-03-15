import { useEffect, useRef, useState } from "react";

const CELL_PX = 4;
const TICK_MS = 120;

/**
 * Converts tic-tac-toe game history into a Conway's Game of Life initial grid.
 * Each game is a 3x3 block; filled cells (tato or okra) = alive.
 * Games are tiled in rows of 3 with 1-cell gaps between them.
 */
function buildSeed(games) {
    if (games.length === 0) return { grid: [], w: 0, h: 0 };

    const perRow = 3;
    const blockSize = 3;
    const gap = 1;
    const cols = Math.min(games.length, perRow);
    const rows = Math.ceil(games.length / perRow);
    const w = cols * blockSize + (cols - 1) * gap;
    const h = rows * blockSize + (rows - 1) * gap;

    // Start with a larger grid with some padding so the pattern has room to grow
    const pad = 20;
    const totalW = w + pad * 2;
    const totalH = h + pad * 2;
    const grid = Array.from({ length: totalH }, () => new Uint8Array(totalW));

    games.forEach((game, idx) => {
        const gCol = idx % perRow;
        const gRow = Math.floor(idx / perRow);
        const ox = pad + gCol * (blockSize + gap);
        const oy = pad + gRow * (blockSize + gap);

        for (let ci = 0; ci < 9; ci++) {
            if (game.squares[ci]) {
                const r = Math.floor(ci / 3);
                const c = ci % 3;
                grid[oy + r][ox + c] = 1;
            }
        }
    });

    return { grid, w: totalW, h: totalH };
}

function nextGeneration(grid, h, w) {
    const next = Array.from({ length: h }, () => new Uint8Array(w));
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            let neighbors = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dy === 0 && dx === 0) continue;
                    const ny = y + dy;
                    const nx = x + dx;
                    if (ny >= 0 && ny < h && nx >= 0 && nx < w) {
                        neighbors += grid[ny][nx];
                    }
                }
            }
            if (grid[y][x]) {
                next[y][x] = neighbors === 2 || neighbors === 3 ? 1 : 0;
            } else {
                next[y][x] = neighbors === 3 ? 1 : 0;
            }
        }
    }
    return next;
}

export default function ConwayCanvas({ games }) {
    const canvasRef = useRef(null);
    const [running, setRunning] = useState(false);
    const [gen, setGen] = useState(0);
    const gridRef = useRef(null);
    const sizeRef = useRef({ w: 0, h: 0 });
    const rafRef = useRef(null);

    function initGrid() {
        const { grid, w, h } = buildSeed(games);
        gridRef.current = grid;
        sizeRef.current = { w, h };
        setGen(0);
        draw(grid, w, h);
    }

    function draw(grid, w, h) {
        const canvas = canvasRef.current;
        if (!canvas || !grid.length) return;
        const ctx = canvas.getContext("2d");
        canvas.width = w * CELL_PX;
        canvas.height = h * CELL_PX;
        ctx.fillStyle = "#e8dfd0";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#2F4C39";
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (grid[y][x]) {
                    ctx.fillRect(x * CELL_PX, y * CELL_PX, CELL_PX - 1, CELL_PX - 1);
                }
            }
        }
    }

    // Animation loop
    useEffect(() => {
        if (!running) return;
        const id = setInterval(() => {
            const { w, h } = sizeRef.current;
            if (!gridRef.current || !gridRef.current.length) return;
            gridRef.current = nextGeneration(gridRef.current, h, w);
            setGen((g) => g + 1);
            draw(gridRef.current, w, h);
        }, TICK_MS);
        return () => clearInterval(id);
    }, [running]);

    // Draw initial seed when games change
    useEffect(() => {
        initGrid();
    }, [games]);

    function handleToggle() {
        if (!gridRef.current || !gridRef.current.length) {
            initGrid();
        }
        setRunning((r) => !r);
    }

    function handleReset() {
        setRunning(false);
        initGrid();
    }

    const hasGames = games.length > 0;

    return (
        <div className="conway-panel">
            <h4 style={{ margin: "0 0 6px", color: "#2F4C39" }}>Conway's Game of Life</h4>
            <p style={{ fontSize: 11, color: "#75655A", margin: "0 0 8px" }}>
                Seeded from your {games.length} saved game{games.length !== 1 ? "s" : ""}
            </p>
            <div style={{ marginBottom: 8 }}>
                <button className="restartbtn" onClick={handleToggle} disabled={!hasGames} style={{ marginRight: 6 }}>
                    {running ? "Pause" : "Start"}
                </button>
                <button className="restartbtn" onClick={handleReset} disabled={!hasGames}>
                    Reset
                </button>
                {gen > 0 && <span style={{ marginLeft: 8, fontSize: 12, color: "#75655A" }}>Gen: {gen}</span>}
            </div>
            {hasGames ? (
                <canvas
                    ref={canvasRef}
                    style={{
                        border: "2px solid #D3C7A2",
                        borderRadius: 6,
                        background: "#e8dfd0",
                        maxWidth: "100%",
                    }}
                />
            ) : (
                <p style={{ fontSize: 12, color: "#999" }}>Play some games first to seed the simulation!</p>
            )}
        </div>
    );
}
