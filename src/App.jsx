import { Link, Navigate, Route, Routes } from "react-router-dom";
import Playground from "./components/playground";
import Board from "./components/OldBoard";

export default function App() {
    return (
        <>
            <nav>
                <Link to="/">Game</Link> | <Link to="/playground">Playground</Link>
            </nav>

            <Routes>
                <Route path="/" element={<Board />} />
                <Route path="/playground" element={<Playground />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}
