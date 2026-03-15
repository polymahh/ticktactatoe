import { useEffect, useRef, useCallback } from "react";
import * as PIXI from "pixi.js";

const BOARD_SIZE = 180;
const CELL_SIZE = BOARD_SIZE / 3;
const BOARD_PADDING = 40;
const BOARDS_PER_ROW = 3;
const IMG_SIZE = CELL_SIZE * 0.8;

export default function PixiCanvas({ games, currentGame, onCellClick }) {
    const canvasRef = useRef(null);
    const appRef = useRef(null);
    const viewportRef = useRef(null);
    const onCellClickRef = useRef(onCellClick);

    // Keep callback ref fresh without re-running effects
    useEffect(() => {
        onCellClickRef.current = onCellClick;
    }, [onCellClick]);

    // Initialize PixiJS app once
    useEffect(() => {
        const el = canvasRef.current;
        const app = new PIXI.Application({
            width: el.clientWidth || 700,
            height: el.clientHeight || 520,
            backgroundColor: 0xe9c9aa,
            antialias: true,
        });
        el.appendChild(app.view);
        appRef.current = app;

        // Main container for zoom/pan
        const viewport = new PIXI.Container();
        app.stage.addChild(viewport);
        viewportRef.current = viewport;

        // --- Zoom with mouse wheel ---
        const onWheel = (e) => {
            e.preventDefault();
            const factor = e.deltaY < 0 ? 1.1 : 0.9;
            const newScale = Math.max(0.05, Math.min(4, viewport.scale.x * factor));

            // Zoom towards mouse pointer
            const rect = app.view.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            const worldX = (mx - viewport.x) / viewport.scale.x;
            const worldY = (my - viewport.y) / viewport.scale.y;

            viewport.scale.set(newScale);
            viewport.x = mx - worldX * newScale;
            viewport.y = my - worldY * newScale;
        };
        app.view.addEventListener("wheel", onWheel, { passive: false });

        // --- Pan with middle-click or right-click drag ---
        let dragging = false;
        let lastPos = { x: 0, y: 0 };

        const onDown = (e) => {
            // left click drag for pan (shift held) or just left click
            dragging = true;
            lastPos = { x: e.clientX, y: e.clientY };
        };
        const onMove = (e) => {
            if (!dragging) return;
            viewport.x += e.clientX - lastPos.x;
            viewport.y += e.clientY - lastPos.y;
            lastPos = { x: e.clientX, y: e.clientY };
        };
        const onUp = () => {
            dragging = false;
        };

        app.view.addEventListener("pointerdown", onDown);
        app.view.addEventListener("pointermove", onMove);
        app.view.addEventListener("pointerup", onUp);
        app.view.addEventListener("pointerleave", onUp);

        return () => {
            app.view.removeEventListener("wheel", onWheel);
            app.view.removeEventListener("pointerdown", onDown);
            app.view.removeEventListener("pointermove", onMove);
            app.view.removeEventListener("pointerup", onUp);
            app.view.removeEventListener("pointerleave", onUp);
            app.destroy(true, { children: true, texture: false });
        };
    }, []);

    // Redraw all boards when game state changes
    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        viewport.removeChildren();

        // Combine past games + current active game
        const allGames = [
            ...games.map((g) => ({ squares: g.squares, winner: g.winner, active: false })),
            { squares: currentGame.squares, winner: null, active: true },
        ];

        allGames.forEach((game, index) => {
            const col = index % BOARDS_PER_ROW;
            const row = Math.floor(index / BOARDS_PER_ROW);
            const x = col * (BOARD_SIZE + BOARD_PADDING) + BOARD_PADDING;
            const y = row * (BOARD_SIZE + BOARD_PADDING) + BOARD_PADDING;

            const board = createBoard(game, index, x, y, onCellClickRef);
            viewport.addChild(board);
        });
    }, [games, currentGame]);

    return (
        <div
            ref={canvasRef}
            className="pixi-wrapper"
            style={{
                width: "100%",
                height: "520px",
                border: "3px solid #D3C7A2",
                borderRadius: "10px",
                overflow: "hidden",
                cursor: "grab",
            }}
        />
    );
}

function createBoard(game, gameIndex, x, y, onCellClickRef) {
    const container = new PIXI.Container();
    container.x = x;
    container.y = y;

    // Board background
    const bg = new PIXI.Graphics();
    bg.beginFill(game.active ? 0xd1feb8 : 0xe8dfd0);
    bg.drawRoundedRect(0, 0, BOARD_SIZE, BOARD_SIZE, 8);
    bg.endFill();
    container.addChild(bg);

    // Grid lines
    const grid = new PIXI.Graphics();
    grid.lineStyle(2, 0xd3c7a2);
    for (let i = 1; i < 3; i++) {
        grid.moveTo(i * CELL_SIZE, 4);
        grid.lineTo(i * CELL_SIZE, BOARD_SIZE - 4);
        grid.moveTo(4, i * CELL_SIZE);
        grid.lineTo(BOARD_SIZE - 4, i * CELL_SIZE);
    }
    container.addChild(grid);

    // Draw each cell
    for (let i = 0; i < 9; i++) {
        const cellRow = Math.floor(i / 3);
        const cellCol = i % 3;
        const cx = cellCol * CELL_SIZE;
        const cy = cellRow * CELL_SIZE;

        if (game.squares[i]) {
            // Load image sprite
            const imgPath = game.squares[i] === "tato" ? "/tato.jpg" : "/poisontato.png";
            const sprite = PIXI.Sprite.from(imgPath);
            sprite.width = IMG_SIZE;
            sprite.height = IMG_SIZE;
            sprite.x = cx + (CELL_SIZE - IMG_SIZE) / 2;
            sprite.y = cy + (CELL_SIZE - IMG_SIZE) / 2;
            container.addChild(sprite);
        }

        // Clickable hit area for active board empty cells
        if (game.active && !game.squares[i]) {
            const hit = new PIXI.Graphics();
            hit.beginFill(0xffffff, 0.001);
            hit.drawRect(cx + 1, cy + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            hit.endFill();
            hit.eventMode = "static";
            hit.cursor = "pointer";
            const cellIndex = i;
            hit.on("pointerdown", (e) => {
                e.stopPropagation();
                onCellClickRef.current(cellIndex);
            });
            container.addChild(hit);
        }
    }

    // Border highlight
    const border = new PIXI.Graphics();
    border.lineStyle(game.active ? 3 : 1, game.active ? 0x2f4c39 : 0xc0b8a0);
    border.drawRoundedRect(0, 0, BOARD_SIZE, BOARD_SIZE, 8);
    container.addChild(border);

    // Game number label
    const label = new PIXI.Text(`#${gameIndex + 1}`, {
        fontSize: 12,
        fill: game.active ? 0x2f4c39 : 0x999999,
        fontWeight: game.active ? "bold" : "normal",
    });
    label.x = 4;
    label.y = BOARD_SIZE + 4;
    container.addChild(label);

    // Winner overlay for completed games
    if (!game.active && game.winner) {
        const overlay = new PIXI.Graphics();
        overlay.beginFill(0x000000, 0.15);
        overlay.drawRoundedRect(0, 0, BOARD_SIZE, BOARD_SIZE, 8);
        overlay.endFill();
        container.addChild(overlay);

        const winText = new PIXI.Text(game.winner === "tato" ? "🥔 Wins!" : "🫛 Wins!", {
            fontSize: 20,
            fill: 0x2f4c39,
            fontWeight: "bold",
            dropShadow: true,
            dropShadowColor: 0xffffff,
            dropShadowDistance: 1,
        });
        winText.anchor.set(0.5);
        winText.x = BOARD_SIZE / 2;
        winText.y = BOARD_SIZE / 2;
        container.addChild(winText);
    }

    return container;
}
