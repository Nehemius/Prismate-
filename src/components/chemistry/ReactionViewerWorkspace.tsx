import React, { useState, useMemo, useRef, useEffect } from "react";
import { CHAPTERS, REACTION_CONCEPTS, type ReactionConcept } from "../../data/chemistryData";
import MoleculeViewer from "./MoleculeViewer";
import ReagentAtomViewer from "./ReagentAtomViewer";
import {
  FlaskConical,
  RotateCw,
  Search,
  Sparkles,
  BookOpen,
  HelpCircle,
  X,
  CheckCircle2,
  ArrowLeft,
  Maximize2,
  Minimize2,
} from "lucide-react";

function renderSubscripts(text: string) {
  if (!text) return null;
  const parts = text.split(/([A-Za-z)\]]\d+)/g);
  return parts.map((part, index) => {
    const match = part.match(/^([A-Za-z)\]])(\d+)$/);
    if (match) {
      return (
        <React.Fragment key={index}>
          {match[1]}
          <sub style={{ fontSize: '0.7em', bottom: '-0.2em', position: 'relative' }}>{match[2]}</sub>
        </React.Fragment>
      );
    }
    return part;
  });
}

function shuffleOptions(options: string[], seedStr: string): string[] {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const result = [...options];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.abs((hash + i * 31) % (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const getCPKBackground = (sym: string) => {
  switch (sym) {
    case "CH3":
    case "CH2":
    case "CH":
    case "C":
      return "#222222";
    case "OH":
    case "O":
      return "#FF0D0D";
    case "Br":
      return "#A62929";
    case "Cl":
      return "#1FF01F";
    case "C6H5":
      return "#444444";
    default:
      return "#8A8A8A";
  }
};

const getCPKTextColor = (sym: string) => {
  switch (sym) {
    case "Cl":
      return "#000000";
    default:
      return "#FFFFFF";
  }
};

/**
 * Validates the connectivity graph of nodes built by the user in the Finish the Compound game.
 * Ported from Proto Prismate.
 */
const validateGraph = (reactionId: string, nodes: any[]): boolean => {
  if (nodes.length === 0) return false;

  switch (reactionId) {
    case "hydroboration-oxidation": {
      // Propene -> Propan-1-ol: CH3-CH2-CH2-OH (4 nodes)
      const ch3 = nodes.find((n) => n.symbol === "CH3");
      if (!ch3 || ch3.neighbors.length !== 1) return false;
      let current = ch3;
      const visited = new Set([current.id]);
      const path = [current.symbol];
      while (true) {
        const nextLink = current.neighbors.find((nb: any) => !visited.has(nb.neighborId));
        if (!nextLink) break;
        if (nextLink.bondType !== "single") return false;
        const nextNode = nodes.find((n) => n.id === nextLink.neighborId);
        if (!nextNode) return false;
        visited.add(nextNode.id);
        path.push(nextNode.symbol);
        current = nextNode;
      }
      const pathStr = path.join("-");
      return pathStr === "CH3-CH2-CH2-OH" && visited.size === 4 && nodes.length === 4;
    }

    case "markovnikov-hbr": {
      // Propene + HBr -> 2-Bromopropane: CH(CH3)2Br (4 nodes)
      if (nodes.length !== 4) return false;
      const ch = nodes.find((n) => n.symbol === "CH");
      if (!ch || ch.neighbors.length !== 3) return false;
      const neighborSymbols = ch.neighbors.map((nb: any) => {
        if (nb.bondType !== "single") return null;
        return nodes.find((n) => n.id === nb.neighborId)?.symbol;
      });
      if (neighborSymbols.includes(null)) return false;
      const ch3Count = neighborSymbols.filter((s: any) => s === "CH3").length;
      const brCount = neighborSymbols.filter((s: any) => s === "Br").length;
      return ch3Count === 2 && brCount === 1;
    }

    case "anti-markovnikov-hbr": {
      // Propene + HBr (peroxide) -> 1-Bromopropane: CH3-CH2-CH2-Br (4 nodes)
      const ch3 = nodes.find((n) => n.symbol === "CH3");
      if (!ch3 || ch3.neighbors.length !== 1) return false;
      let current = ch3;
      const visited = new Set([current.id]);
      const path = [current.symbol];
      while (true) {
        const nextLink = current.neighbors.find((nb: any) => !visited.has(nb.neighborId));
        if (!nextLink) break;
        if (nextLink.bondType !== "single") return false;
        const nextNode = nodes.find((n) => n.id === nextLink.neighborId);
        if (!nextNode) return false;
        visited.add(nextNode.id);
        path.push(nextNode.symbol);
        current = nextNode;
      }
      const pathStr = path.join("-");
      return pathStr === "CH3-CH2-CH2-Br" && visited.size === 4 && nodes.length === 4;
    }

    case "ozonolysis": {
      // But-2-ene -> Acetaldehyde: CH3-CH=O (3 nodes)
      if (nodes.length !== 3) return false;
      const ch3 = nodes.find((n) => n.symbol === "CH3");
      if (!ch3 || ch3.neighbors.length !== 1) return false;
      const ch3NbLink = ch3.neighbors[0];
      if (ch3NbLink.bondType !== "single") return false;
      const ch = nodes.find((n) => n.id === ch3NbLink.neighborId);
      if (!ch || ch.symbol !== "CH" || ch.neighbors.length !== 2) return false;
      const oLink = ch.neighbors.find((nb: any) => nb.neighborId !== ch3.id);
      if (!oLink || oLink.bondType !== "double") return false;
      const oNode = nodes.find((n) => n.id === oLink.neighborId);
      return oNode && oNode.symbol === "O";
    }

    case "friedel-crafts": {
      // Benzene + CH3Cl -> Toluene: C6H5-CH3 (2 nodes)
      if (nodes.length !== 2) return false;
      const c6h5 = nodes.find((n) => n.symbol === "C6H5");
      if (!c6h5 || c6h5.neighbors.length !== 1) return false;
      const link = c6h5.neighbors[0];
      if (link.bondType !== "single") return false;
      const ch3 = nodes.find((n) => n.id === link.neighborId);
      return ch3 && ch3.symbol === "CH3";
    }

    case "sn2-substitution": {
      // Chloromethane + OH- -> Methanol: CH3-OH (2 nodes)
      if (nodes.length !== 2) return false;
      const ch3 = nodes.find((n) => n.symbol === "CH3");
      if (!ch3 || ch3.neighbors.length !== 1) return false;
      const link = ch3.neighbors[0];
      if (link.bondType !== "single") return false;
      const oh = nodes.find((n) => n.id === link.neighborId);
      return oh && oh.symbol === "OH";
    }

    case "sn1-substitution": {
      // tert-Butyl chloride -> tert-Butanol: C(CH3)3-OH (5 nodes)
      if (nodes.length !== 5) return false;
      const cNode = nodes.find((n) => n.symbol === "C");
      if (!cNode || cNode.neighbors.length !== 4) return false;
      const neighborSymbols = cNode.neighbors.map((nb: any) => {
        if (nb.bondType !== "single") return null;
        return nodes.find((n) => n.id === nb.neighborId)?.symbol;
      });
      if (neighborSymbols.includes(null)) return false;
      const ch3Count = neighborSymbols.filter((s: any) => s === "CH3").length;
      const ohCount = neighborSymbols.filter((s: any) => s === "OH").length;
      return ch3Count === 3 && ohCount === 1;
    }

    case "esterification": {
      // Acetic acid + Ethanol -> Ethyl acetate: CH3-C(=O)-O-CH2-CH3 (6 nodes)
      if (nodes.length !== 6) return false;
      const cNode = nodes.find((n) => n.symbol === "C");
      if (!cNode || cNode.neighbors.length !== 3) return false;
      const cNbSymbols = cNode.neighbors.map((nb: any) => ({
        symbol: nodes.find((n) => n.id === nb.neighborId)?.symbol,
        bondType: nb.bondType,
        id: nb.neighborId,
      }));
      const acetylCH3 = cNbSymbols.find((n: any) => n.symbol === "CH3" && n.bondType === "single");
      const carbonylO = cNbSymbols.find((n: any) => n.symbol === "O" && n.bondType === "double");
      const esterO = cNbSymbols.find((n: any) => n.symbol === "O" && n.bondType === "single");
      if (!acetylCH3 || !carbonylO || !esterO) return false;
      const esterONode = nodes.find((n) => n.id === esterO.id);
      if (!esterONode || esterONode.neighbors.length !== 2) return false;
      const esterONbLink = esterONode.neighbors.find((nb: any) => nb.neighborId !== cNode.id);
      if (!esterONbLink || esterONbLink.bondType !== "single") return false;
      const ch2Node = nodes.find((n) => n.id === esterONbLink.neighborId);
      if (!ch2Node || ch2Node.symbol !== "CH2" || ch2Node.neighbors.length !== 2) return false;
      const ch2NbLink = ch2Node.neighbors.find((nb: any) => nb.neighborId !== esterONode.id);
      if (!ch2NbLink || ch2NbLink.bondType !== "single") return false;
      const terminalCH3 = nodes.find((n) => n.id === ch2NbLink.neighborId);
      return terminalCH3 && terminalCH3.symbol === "CH3";
    }

    case "aldol-condensation": {
      // 3-hydroxybutanal (6 nodes)
      if (nodes.length !== 6) return false;
      const ch3 = nodes.find((n) => n.symbol === "CH3");
      if (!ch3 || ch3.neighbors.length !== 1) return false;
      const ch3NbLink = ch3.neighbors[0];
      if (ch3NbLink.bondType !== "single") return false;
      const chOH = nodes.find((n) => n.id === ch3NbLink.neighborId);
      if (!chOH || chOH.symbol !== "CH" || chOH.neighbors.length !== 3) return false;
      const ohLink = chOH.neighbors.find((nb: any) => {
        const node = nodes.find((n) => n.id === nb.neighborId);
        return node && node.symbol === "OH" && nb.bondType === "single";
      });
      if (!ohLink) return false;
      const ch2Link = chOH.neighbors.find((nb: any) => {
        const node = nodes.find((n) => n.id === nb.neighborId);
        return node && node.symbol === "CH2" && nb.bondType === "single";
      });
      if (!ch2Link) return false;
      const ch2Node = nodes.find((n) => n.id === ch2Link.neighborId);
      if (!ch2Node || ch2Node.neighbors.length !== 2) return false;
      const chCarbonylLink = ch2Node.neighbors.find((nb: any) => nb.neighborId !== chOH.id);
      if (!chCarbonylLink || chCarbonylLink.bondType !== "single") return false;
      const chCarbonylNode = nodes.find((n) => n.id === chCarbonylLink.neighborId);
      if (!chCarbonylNode || chCarbonylNode.symbol !== "CH" || chCarbonylNode.neighbors.length !== 2) return false;
      const oLink = chCarbonylNode.neighbors.find((nb: any) => nb.neighborId !== ch2Node.id);
      if (!oLink || oLink.bondType !== "double") return false;
      const oNode = nodes.find((n) => n.id === oLink.neighborId);
      return oNode && oNode.symbol === "O";
    }

    case "cannizzaro": {
      // Benzyl alcohol: C6H5-CH2-OH (3 nodes)
      const c6h5 = nodes.find((n) => n.symbol === "C6H5");
      if (!c6h5 || c6h5.neighbors.length !== 1) return false;
      let current = c6h5;
      const visited = new Set([current.id]);
      const path = [current.symbol];
      while (true) {
        const nextLink = current.neighbors.find((nb: any) => !visited.has(nb.neighborId));
        if (!nextLink) break;
        if (nextLink.bondType !== "single") return false;
        const nextNode = nodes.find((n) => n.id === nextLink.neighborId);
        if (!nextNode) return false;
        visited.add(nextNode.id);
        path.push(nextNode.symbol);
        current = nextNode;
      }
      const pathStr = path.join("-");
      return pathStr === "C6H5-CH2-OH" && visited.size === 3 && nodes.length === 3;
    }

    default:
      // Generic connectivity fallback: require at least 2 nodes connected
      return nodes.length >= 2 && nodes.every((n) => n.neighbors.length > 0);
  }
};

interface ReactionViewerWorkspaceProps {
  onBack?: () => void;
}

export const ReactionViewerWorkspace: React.FC<ReactionViewerWorkspaceProps> = ({ onBack }) => {
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const isLight = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light';

  const [selectedChapter, setSelectedChapter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReaction, setSelectedReaction] = useState<ReactionConcept>(REACTION_CONCEPTS[0]);
  const [autoRotate, setAutoRotate] = useState(true);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen event listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      workspaceRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // ── Finish the Compound Game State ──────────────────────────
  const [solvedReactions, setSolvedReactions] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("prismate_solved_reactions");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const [productViewMode, setProductViewMode] = useState<"3d" | "game">("game");
  const [gridSize, setGridSize] = useState<number>(7);
  const [guessGrid, setGuessGrid] = useState<
    Record<string, { type: "element" | "bond"; symbol: string; isHorizontal?: boolean }>
  >({});
  const [builderActiveCoords, setBuilderActiveCoords] = useState<[number, number] | null>([3, 3]);
  const [builderSelectedBond, setBuilderSelectedBond] = useState<"single" | "double" | "triple" | null>(null);
  const [builderMessage, setBuilderMessage] = useState<string>("Click an element from the palette below to place it at the center cell.");
  const [builderHistory, setBuilderHistory] = useState<any[]>([]);
  const [congratsPopup, setCongratsPopup] = useState<string | null>(null);

  // Reset/Initialize Molecule builder when selected reaction changes
  useEffect(() => {
    setGuessGrid({});
    setBuilderActiveCoords([Math.floor(gridSize / 2), Math.floor(gridSize / 2)]);
    setBuilderSelectedBond(null);
    setBuilderHistory([]);
    setBuilderMessage("Click an element from the palette below to place it at the active center cell.");
    // If already solved, show 3D, else show game
    if (solvedReactions[selectedReaction.id]) {
      setProductViewMode("3d");
    } else {
      setProductViewMode("game");
    }
  }, [selectedReaction.id, gridSize]);

  // Quiz Modal State
  const [quizOpen, setQuizOpen] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);

  const filteredReactions = REACTION_CONCEPTS.filter((rx) => {
    const matchesChapter = selectedChapter === "all" || rx.chapterId === selectedChapter;
    const matchesSearch =
      rx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.reagents.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.iupac_product_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChapter && matchesSearch;
  });

  const quizQuestions = useMemo(() => [
    {
      question: `What is the primary mechanism type for "${selectedReaction.name}"?`,
      options: shuffleOptions([
        selectedReaction.mechanism_type,
        "Nucleophilic Acyl Substitution",
        "Free Radical Halogenation",
        "E1cB Elimination",
      ], selectedReaction.id + "-1"),
      correctAnswer: selectedReaction.mechanism_type,
    },
    {
      question: `Which operational reagents drive this chemical transformation?`,
      options: shuffleOptions([
        selectedReaction.reagents,
        "Concentrated H2SO4 at 170°C",
        "Anhydrous AlCl3 + Cl2",
        "LiAlH4 in dry ether",
      ], selectedReaction.id + "-2"),
      correctAnswer: selectedReaction.reagents,
    },
    {
      question: `What is the systematic IUPAC name of the isolated final product?`,
      options: shuffleOptions([
        selectedReaction.iupac_product_name,
        "2-methylbut-2-ene",
        "Ethanol",
        "1,2-dichloroethane",
      ], selectedReaction.id + "-3"),
      correctAnswer: selectedReaction.iupac_product_name,
    },
  ], [selectedReaction]);

  const handleNextQuiz = () => {
    if (selectedAnswer === null) return;
    const isCorrect =
      quizQuestions[currentQIndex].options[selectedAnswer] === quizQuestions[currentQIndex].correctAnswer;
    if (isCorrect) setQuizScore((prev) => prev + 1);

    if (currentQIndex + 1 < quizQuestions.length) {
      setCurrentQIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setQuizFinished(true);
    }
  };

  // ── Molecule Builder Actions ────────────────────────────────
  const placeElement = (el: string) => {
    if (!builderActiveCoords) return;
    const [x, y] = builderActiveCoords;
    const key = `${x},${y}`;

    setBuilderHistory((prev) => [
      ...prev,
      {
        grid: { ...guessGrid },
        activeCoords: builderActiveCoords ? [...builderActiveCoords] : null,
        selectedBond: builderSelectedBond,
        message: builderMessage,
      },
    ]);

    setGuessGrid((prev) => ({
      ...prev,
      [key]: { type: "element", symbol: el },
    }));
    setBuilderSelectedBond(null);
    setBuilderMessage("Element placed! Select a bond (Single, Double, Triple) to extend, or click another cell.");
  };

  const selectBond = (bondType: "single" | "double" | "triple") => {
    if (!builderActiveCoords) {
      setBuilderMessage("Click an element on the grid first before choosing a bond.");
      return;
    }
    const [x, y] = builderActiveCoords;
    const cell = guessGrid[`${x},${y}`];
    if (!cell || cell.type !== "element") {
      setBuilderMessage("Bonds can only start from a placed element node.");
      return;
    }
    setBuilderSelectedBond(bondType);
    setBuilderMessage(`Select a direction (1: Up, 2: Right, 3: Down, 4: Left) around the active element to place ${bondType} bond.`);
  };

  const placeBond = (dir: number) => {
    if (!builderActiveCoords || !builderSelectedBond) return;
    const [x, y] = builderActiveCoords;
    let dx = 0, dy = 0;
    if (dir === 1) dy = -1; // Up
    else if (dir === 2) dx = 1; // Right
    else if (dir === 3) dy = 1; // Down
    else if (dir === 4) dx = -1; // Left

    const bondX = x + dx;
    const bondY = y + dy;
    const nextX = x + 2 * dx;
    const nextY = y + 2 * dy;

    if (
      bondX < 0 || bondX >= gridSize ||
      bondY < 0 || bondY >= gridSize ||
      nextX < 0 || nextX >= gridSize ||
      nextY < 0 || nextY >= gridSize
    ) {
      setBuilderMessage("Cannot place bond outside grid boundaries.");
      return;
    }

    const bondKey = `${bondX},${bondY}`;

    setBuilderHistory((prev) => [
      ...prev,
      {
        grid: { ...guessGrid },
        activeCoords: builderActiveCoords ? [...builderActiveCoords] : null,
        selectedBond: builderSelectedBond,
        message: builderMessage,
      },
    ]);

    const isHoriz = (dir === 2 || dir === 4);
    setGuessGrid((prev) => ({
      ...prev,
      [bondKey]: { type: "bond", symbol: builderSelectedBond!, isHorizontal: isHoriz },
    }));
    setBuilderActiveCoords([nextX, nextY]);
    const prevBond = builderSelectedBond;
    setBuilderSelectedBond(null);
    setBuilderMessage(`Placed ${prevBond} bond! Now click an element from the palette below to connect.`);
  };

  const undoBuilder = () => {
    if (builderHistory.length === 0) {
      setBuilderMessage("Nothing to undo.");
      return;
    }
    const previous = builderHistory[builderHistory.length - 1];
    setBuilderHistory((prev) => prev.slice(0, -1));
    setGuessGrid(previous.grid);
    setBuilderActiveCoords(previous.activeCoords);
    setBuilderSelectedBond(previous.selectedBond);
    setBuilderMessage(previous.message);
  };

  const resetBuilder = () => {
    setGuessGrid({});
    setBuilderActiveCoords([Math.floor(gridSize / 2), Math.floor(gridSize / 2)]);
    setBuilderSelectedBond(null);
    setBuilderHistory([]);
    setBuilderMessage("Choose a starting element from the options below to place at the center.");
  };

  const handlePass = () => {
    setSolvedReactions((prev) => {
      const next = { ...prev, [selectedReaction.id]: true };
      try {
        localStorage.setItem("prismate_solved_reactions", JSON.stringify(next));
      } catch {}
      return next;
    });
    setProductViewMode("3d");
    setBuilderMessage("✨ Reaction bypassed. 3D visualization unlocked.");
  };

  const checkBuilderStructure = () => {
    if (!selectedReaction) return;
    const keys = Object.keys(guessGrid);
    const nodes: any[] = [];
    keys.forEach((k) => {
      const item = guessGrid[k];
      if (item && item.type === "element") {
        const [x, y] = k.split(",").map(Number);
        nodes.push({
          id: k,
          symbol: item.symbol,
          x,
          y,
          neighbors: [],
        });
      }
    });

    nodes.forEach((node) => {
      const { x, y } = node;
      const dirs = [[0, -1], [1, 0], [0, 1], [-1, 0]];
      dirs.forEach(([dx, dy]) => {
        const bondKey = `${x + dx},${y + dy}`;
        const nbKey = `${x + 2 * dx},${y + 2 * dy}`;
        const bondItem = guessGrid[bondKey];
        const nbItem = guessGrid[nbKey];
        if (bondItem && bondItem.type === "bond" && nbItem && nbItem.type === "element") {
          node.neighbors.push({
            neighborId: nbKey,
            bondType: bondItem.symbol,
          });
        }
      });
    });

    const isCorrect = validateGraph(selectedReaction.id, nodes);
    if (isCorrect) {
      setSolvedReactions((prev) => {
        const next = { ...prev, [selectedReaction.id]: true };
        try {
          localStorage.setItem("prismate_solved_reactions", JSON.stringify(next));
        } catch {}
        return next;
      });
      setCongratsPopup(`🎉 Congratulations! You have successfully built ${selectedReaction.iupac_product_name}!`);
      setBuilderMessage("✨ Structure matches perfectly! 3D visualization unlocked.");
      setProductViewMode("3d");
      setTimeout(() => setCongratsPopup(null), 4500);
    } else {
      setBuilderMessage("❌ The chemical connectivity is incorrect. Verify bonds, atoms, and stoichiometry!");
    }
  };

  const renderBondLine = (symbol: string, isHorizontal: boolean) => {
    if (isHorizontal) {
      if (symbol === "double") {
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center', justifyContent: 'center', padding: '0 2px' }}>
            <div style={{ width: '100%', height: '2px', background: isLight ? '#000000' : '#FFFFFF' }} />
            <div style={{ width: '100%', height: '2px', background: isLight ? '#000000' : '#FFFFFF' }} />
          </div>
        );
      }
      if (symbol === "triple") {
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center', justifyContent: 'center', padding: '0 2px' }}>
            <div style={{ width: '100%', height: '1.5px', background: isLight ? '#000000' : '#FFFFFF' }} />
            <div style={{ width: '100%', height: '1.5px', background: isLight ? '#000000' : '#FFFFFF' }} />
            <div style={{ width: '100%', height: '1.5px', background: isLight ? '#000000' : '#FFFFFF' }} />
          </div>
        );
      }
      return <div style={{ width: '100%', height: '2px', background: isLight ? '#000000' : '#FFFFFF', margin: '0 2px' }} />;
    } else {
      if (symbol === "double") {
        return (
          <div style={{ height: '100%', display: 'flex', gap: '2px', alignItems: 'center', justifyContent: 'center', padding: '2px 0' }}>
            <div style={{ height: '100%', width: '2px', background: isLight ? '#000000' : '#FFFFFF' }} />
            <div style={{ height: '100%', width: '2px', background: isLight ? '#000000' : '#FFFFFF' }} />
          </div>
        );
      }
      if (symbol === "triple") {
        return (
          <div style={{ height: '100%', display: 'flex', gap: '2px', alignItems: 'center', justifyContent: 'center', padding: '2px 0' }}>
            <div style={{ height: '100%', width: '1.5px', background: isLight ? '#000000' : '#FFFFFF' }} />
            <div style={{ height: '100%', width: '1.5px', background: isLight ? '#000000' : '#FFFFFF' }} />
            <div style={{ height: '100%', width: '1.5px', background: isLight ? '#000000' : '#FFFFFF' }} />
          </div>
        );
      }
      return <div style={{ height: '100%', width: '2px', background: isLight ? '#000000' : '#FFFFFF', margin: '2px 0' }} />;
    }
  };

  const availableElements = ["CH3", "CH2", "CH", "C", "OH", "Br", "Cl", "O", "C6H5"];

  return (
    <div
      ref={workspaceRef}
      className="chemistry-workspace-root"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: isLight ? '#F4F6FB' : '#070709',
        color: isLight ? '#111114' : '#F2F2F2',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <header
        style={{
          height: '60px',
          borderBottom: isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(242, 242, 242, 0.12)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(10, 10, 12, 0.72)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(242,242,242,0.06)',
                border: isLight ? '1px solid rgba(0, 0, 0, 0.15)' : '1px solid rgba(242,242,242,0.18)',
                borderRadius: '8px',
                padding: '6px 12px',
                color: isLight ? '#111114' : '#F2F2F2',
                fontFamily: 'var(--font-heading)',
                fontSize: '11px',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <ArrowLeft style={{ width: '14px', height: '14px' }} />
              <span>BENTO HUB</span>
            </button>
          )}

          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'rgba(51, 240, 255, 0.12)',
              border: '1px solid rgba(51, 240, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FlaskConical style={{ width: '18px', height: '18px', color: '#33F0FF' }} />
          </div>
          <div>
            <h1
              style={{
                fontSize: '13px',
                fontFamily: 'var(--font-heading)',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                margin: 0,
                color: isLight ? '#111114' : '#FFFFFF',
              }}
            >
              3D Reaction Viewer
            </h1>
            <p
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-subheading)',
                color: isLight ? '#6B7280' : 'rgba(242,242,242,0.45)',
                margin: '2px 0 0',
                letterSpacing: '1px',
              }}
            >
              SPATIAL MOLECULAR DYNAMICS ENGINE
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Fullscreen View Button */}
          <button
            onClick={toggleFullscreen}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '11px',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              border: isLight ? '1px solid rgba(0, 0, 0, 0.16)' : '1px solid rgba(255, 255, 255, 0.2)',
              background: isLight ? '#FFFFFF' : 'rgba(255, 255, 255, 0.08)',
              color: isLight ? '#111114' : '#FFFFFF',
              transition: 'all 0.2s ease',
            }}
            title={isFullscreen ? "Exit Fullscreen (ESC)" : "Toggle Fullscreen View"}
          >
            {isFullscreen ? <Minimize2 style={{ width: '13px', height: '13px' }} /> : <Maximize2 style={{ width: '13px', height: '13px' }} />}
            <span>{isFullscreen ? 'EXIT FULLSCREEN' : 'FULLSCREEN VIEW'}</span>
          </button>

          {/* Auto-rotate Toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '11px',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              border: autoRotate
                ? (isLight ? '1px solid #0055FF' : '1px solid #33F0FF')
                : (isLight ? '1px solid rgba(0, 0, 0, 0.14)' : '1px solid rgba(242,242,242,0.15)'),
              background: autoRotate
                ? (isLight ? 'rgba(0, 85, 255, 0.1)' : 'rgba(51, 240, 255, 0.15)')
                : (isLight ? '#FFFFFF' : 'rgba(242,242,242,0.05)'),
              color: autoRotate
                ? (isLight ? '#0055FF' : '#33F0FF')
                : (isLight ? '#4B5563' : 'rgba(242,242,242,0.7)'),
              transition: 'all 0.2s ease',
            }}
          >
            <RotateCw
              style={{
                width: '13px',
                height: '13px',
                animation: autoRotate ? 'spin 3s linear infinite' : 'none',
              }}
            />
            <span>ORBIT {autoRotate ? 'ON' : 'PAUSED'}</span>
          </button>

          {/* Mechanism Details */}
          <button
            onClick={() => setSidePanelOpen(true)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: isLight ? '#111114' : '#F2F2F2',
              color: isLight ? '#FFFFFF' : '#000000',
              border: 'none',
              fontSize: '11px',
              fontFamily: 'var(--font-heading)',
              letterSpacing: '1px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <BookOpen style={{ width: '13px', height: '13px' }} />
            <span>MECHANISM DETAILS</span>
          </button>
        </div>
      </header>

      {/* ── Main Workspace Body ──────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar: Reaction Selector */}
        <aside
          className="chemistry-sidebar"
          style={{
            width: '320px',
            borderRight: isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(242,242,242,0.12)',
            display: 'flex',
            flexDirection: 'column',
            background: isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(10, 10, 13, 0.65)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Search Input */}
          <div style={{ padding: '16px', borderBottom: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(242,242,242,0.08)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: isLight ? '#FFFFFF' : 'rgba(242,242,242,0.05)',
                border: isLight ? '1px solid rgba(0, 0, 0, 0.14)' : '1px solid rgba(242,242,242,0.15)',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
            >
              <Search style={{ width: '14px', height: '14px', color: isLight ? '#6B7280' : 'rgba(242,242,242,0.4)' }} />
              <input
                type="text"
                placeholder="Search reaction, reagent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'var(--font-content)',
                  fontSize: '12px',
                  color: isLight ? '#111114' : '#F2F2F2',
                  width: '100%',
                }}
              />
            </div>
          </div>

          {/* Chapter Chips Filter */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              padding: '12px 16px',
              overflowX: 'auto',
              borderBottom: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(242,242,242,0.08)',
            }}
          >
            <button
              onClick={() => setSelectedChapter("all")}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '10px',
                fontFamily: 'var(--font-subheading)',
                letterSpacing: '1px',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                border: selectedChapter === "all"
                  ? (isLight ? '1px solid #0055FF' : '1px solid #33F0FF')
                  : (isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(242,242,242,0.1)'),
                background: selectedChapter === "all"
                  ? (isLight ? '#0055FF' : '#33F0FF')
                  : 'transparent',
                color: selectedChapter === "all"
                  ? (isLight ? '#FFFFFF' : '#000000')
                  : (isLight ? '#4B5563' : 'rgba(242,242,242,0.6)'),
                fontWeight: selectedChapter === "all" ? 700 : 400,
              }}
            >
              ALL
            </button>
            {CHAPTERS.map((ch) => {
              const isSelected = selectedChapter === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChapter(ch.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontFamily: 'var(--font-subheading)',
                    letterSpacing: '1px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    border: isSelected
                      ? (isLight ? '1px solid #0055FF' : '1px solid #33F0FF')
                      : (isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(242,242,242,0.1)'),
                    background: isSelected
                      ? (isLight ? '#0055FF' : '#33F0FF')
                      : 'transparent',
                    color: isSelected
                      ? (isLight ? '#FFFFFF' : '#000000')
                      : (isLight ? '#4B5563' : 'rgba(242,242,242,0.6)'),
                    fontWeight: isSelected ? 700 : 400,
                  }}
                >
                  {ch.name}
                </button>
              );
            })}
          </div>

          {/* Reactions List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
            {filteredReactions.map((rx) => {
              const isCurrent = rx.id === selectedReaction.id;
              const isSolved = !!solvedReactions[rx.id];
              return (
                <button
                  key={rx.id}
                  onClick={() => setSelectedReaction(rx)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px',
                    borderRadius: '10px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    border: isCurrent
                      ? (isLight ? '1.5px solid #0055FF' : '1px solid #33F0FF')
                      : (isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(242,242,242,0.08)'),
                    background: isCurrent
                      ? (isLight ? '#FFFFFF' : 'rgba(51, 240, 255, 0.08)')
                      : (isLight ? 'rgba(255, 255, 255, 0.6)' : 'rgba(242,242,242,0.02)'),
                    boxShadow: isCurrent ? (isLight ? '0 4px 12px rgba(0,85,255,0.1)' : '0 0 16px rgba(51, 240, 255, 0.15)') : 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-subheading)',
                        letterSpacing: '1.5px',
                        color: isCurrent
                          ? (isLight ? '#0055FF' : '#33F0FF')
                          : (isLight ? '#6B7280' : 'rgba(242,242,242,0.5)'),
                        fontWeight: 700,
                      }}
                    >
                      Class {rx.class_grade} • p.{rx.page_no}
                    </span>
                    {isSolved && (
                      <span style={{ fontSize: '9px', color: '#10B981', fontWeight: 700, fontFamily: 'monospace' }}>
                        ✓ SOLVED
                      </span>
                    )}
                  </div>
                  <h4
                    style={{
                      fontSize: '13px',
                      fontFamily: 'var(--font-heading)',
                      color: isLight ? '#111114' : '#FFFFFF',
                      margin: 0,
                      fontWeight: 700,
                    }}
                  >
                    {rx.name}
                  </h4>
                  <p
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-content)',
                      color: isLight ? '#6B7280' : 'rgba(242,242,242,0.45)',
                      margin: '4px 0 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {rx.reagents}
                  </p>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Center Canvas */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto' }}>
          {/* Congratulations Toast / Banner */}
          {congratsPopup && (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px 20px',
                borderRadius: '12px',
                background: '#10B981',
                color: '#FFFFFF',
                fontFamily: 'var(--font-heading)',
                fontSize: '13px',
                letterSpacing: '1px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
              }}
            >
              <Sparkles style={{ width: '18px', height: '18px' }} />
              <span>{congratsPopup}</span>
            </div>
          )}

          {/* Reaction Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: isLight ? 'rgba(0, 85, 255, 0.1)' : 'rgba(51, 240, 255, 0.15)',
                    border: isLight ? '1px solid rgba(0, 85, 255, 0.25)' : '1px solid rgba(51, 240, 255, 0.3)',
                    fontSize: '10px',
                    fontFamily: 'var(--font-subheading)',
                    letterSpacing: '1px',
                    color: isLight ? '#0055FF' : '#33F0FF',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  {selectedReaction.reaction_type} Reaction
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-content)',
                    color: isLight ? '#6B7280' : 'rgba(242,242,242,0.5)',
                  }}
                >
                  Mechanism: {selectedReaction.mechanism_type}
                </span>
              </div>
              <h2
                style={{
                  fontSize: '24px',
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '2px',
                  color: isLight ? '#111114' : '#FFFFFF',
                  margin: 0,
                }}
              >
                {selectedReaction.name}
              </h2>
              <p
                style={{
                  fontSize: '12.5px',
                  fontFamily: 'var(--font-content)',
                  color: isLight ? '#4B5563' : 'rgba(242,242,242,0.7)',
                  marginTop: '6px',
                  maxWidth: '780px',
                  lineHeight: 1.5,
                }}
              >
                {renderSubscripts(selectedReaction.description)}
              </p>
            </div>
          </div>

          {/* 3D Equation View: 1. Substrate | 2. Reagents | 3. Product (MoleculeViewer or Finish Compound Game) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              gap: '18px',
              flex: 1,
              minHeight: '400px',
            }}
          >
            {/* 1. Substrate Reactant */}
            <div
              className="chemistry-panel-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(14, 14, 18, 0.65)',
                border: isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(242,242,242,0.12)',
                borderRadius: '16px',
                padding: '16px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-subheading)',
                    letterSpacing: '1.5px',
                    color: isLight ? '#0055FF' : '#33F0FF',
                    fontWeight: 700,
                  }}
                >
                  1. SUBSTRATE REACTANT
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '1px',
                    color: isLight ? '#111114' : '#FFFFFF',
                  }}
                >
                  {selectedReaction.reactant_sdf.toUpperCase()}
                </span>
              </div>
              <div style={{ flex: 1, width: '100%', minHeight: '260px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                <MoleculeViewer
                  sdfName={selectedReaction.reactant_sdf}
                  viewerId={`reactant-${selectedReaction.id}`}
                  autoRotate={autoRotate}
                />
              </div>
            </div>

            {/* 2. Operational Reagent */}
            <div
              className="chemistry-panel-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(14, 14, 18, 0.65)',
                border: isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(242,242,242,0.12)',
                borderRadius: '16px',
                padding: '16px',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-subheading)',
                    letterSpacing: '1.5px',
                    color: isLight ? '#D97706' : '#FFB800',
                    fontWeight: 700,
                  }}
                >
                  2. REAGENTS & CATALYSTS
                </span>
              </div>
              <div style={{ flex: 1, width: '100%', minHeight: '260px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                <ReagentAtomViewer
                  symbol={selectedReaction.reagents}
                  reactionId={selectedReaction.id}
                  transparent={true}
                />
              </div>
            </div>

            {/* 3. Isolated Product (Toggle between 3D Molecule and Finish the Compound Game) */}
            <div
              className="chemistry-panel-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: solvedReactions[selectedReaction.id]
                  ? (isLight ? 'rgba(16, 185, 129, 0.06)' : 'rgba(16, 185, 129, 0.08)')
                  : (isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(14, 14, 18, 0.65)'),
                border: solvedReactions[selectedReaction.id]
                  ? '1px solid rgba(16, 185, 129, 0.5)'
                  : (isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(242,242,242,0.12)'),
                borderRadius: '16px',
                padding: '16px',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease',
                position: 'relative',
              }}
            >
              {/* Product Header & Mode Toggle Pill */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <span
                    style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      fontFamily: 'var(--font-subheading)',
                      letterSpacing: '1.5px',
                      color: solvedReactions[selectedReaction.id] ? '#10B981' : (isLight ? '#6B7280' : 'rgba(242,242,242,0.5)'),
                      fontWeight: 700,
                    }}
                  >
                    3. ISOLATED PRODUCT
                  </span>
                  <div
                    style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-heading)',
                      letterSpacing: '1px',
                      color: solvedReactions[selectedReaction.id] ? '#10B981' : (isLight ? '#111114' : '#FFFFFF'),
                      marginTop: '2px',
                    }}
                  >
                    {selectedReaction.iupac_product_name}
                  </div>
                </div>

                {/* View Mode Toggle Pill */}
                <div style={{ display: 'flex', background: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setProductViewMode("game")}
                    style={{
                      background: productViewMode === "game" ? (isLight ? '#FFFFFF' : '#33F0FF') : 'transparent',
                      color: productViewMode === "game" ? (isLight ? '#111114' : '#000000') : (isLight ? '#4B5563' : 'rgba(242,242,242,0.7)'),
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '9.5px',
                      fontFamily: 'var(--font-subheading)',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    🧩 BUILD GAME
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductViewMode("3d")}
                    style={{
                      background: productViewMode === "3d" ? (isLight ? '#FFFFFF' : '#33F0FF') : 'transparent',
                      color: productViewMode === "3d" ? (isLight ? '#111114' : '#000000') : (isLight ? '#4B5563' : 'rgba(242,242,242,0.7)'),
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '9.5px',
                      fontFamily: 'var(--font-subheading)',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    🔬 3D VIEW
                  </button>
                </div>
              </div>

              {/* Product Body: 3D Molecule OR Finish the Compound Game */}
              {productViewMode === "3d" ? (
                <div style={{ flex: 1, width: '100%', minHeight: '260px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                  <MoleculeViewer
                    sdfName={selectedReaction.product_sdf}
                    viewerId={`product-${selectedReaction.id}`}
                    autoRotate={autoRotate}
                  />
                  {solvedReactions[selectedReaction.id] && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(16, 185, 129, 0.9)',
                        color: '#FFFFFF',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '9px',
                        fontFamily: 'var(--font-subheading)',
                        fontWeight: 700,
                        letterSpacing: '1px',
                      }}
                    >
                      ✓ SOLVED & UNLOCKED
                    </div>
                  )}
                </div>
              ) : (
                /* ── FINISH THE COMPOUND GAME ── */
                <div
                  className="chemistry-builder-container"
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    background: isLight ? '#FFFFFF' : 'rgba(10, 10, 14, 0.95)',
                    border: isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(242, 242, 242, 0.12)',
                    borderRadius: '12px',
                    padding: '12px',
                    boxSizing: 'border-box',
                    gap: '8px',
                  }}
                >
                  {/* Target title and Zoom controls */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '9px', fontFamily: 'var(--font-subheading)', color: isLight ? '#6B7280' : 'rgba(242,242,242,0.5)', textTransform: 'uppercase' }}>
                        Finish the Compound:
                      </span>
                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-heading)', fontWeight: 700, color: isLight ? '#111114' : '#FFFFFF' }}>
                        {selectedReaction.iupac_product_name}
                      </div>
                    </div>
                    {/* Zoom Grid Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setGridSize((prev) => Math.max(7, prev - 2))}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '4px',
                          background: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.1)',
                          border: isLight ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid rgba(255, 255, 255, 0.2)',
                          color: isLight ? '#111114' : '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                        title="Zoom In (Decrease grid)"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => setGridSize((prev) => Math.min(11, prev + 2))}
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '4px',
                          background: isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.1)',
                          border: isLight ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid rgba(255, 255, 255, 0.2)',
                          color: isLight ? '#111114' : '#FFFFFF',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                        title="Zoom Out (Increase grid)"
                      >
                        -
                      </button>
                    </div>
                  </div>

                  {/* 2D Chemistry Grid */}
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '220px',
                      aspectRatio: '1 / 1',
                      margin: '0 auto',
                      display: 'grid',
                      gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                      gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
                      gap: '2px',
                      background: isLight ? '#F9FAFB' : '#141418',
                      padding: '4px',
                      borderRadius: '8px',
                      border: isLight ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.1)',
                      boxSizing: 'border-box',
                    }}
                  >
                    {Array.from({ length: gridSize }).map((_, r) =>
                      Array.from({ length: gridSize }).map((_, c) => {
                        const key = `${c},${r}`;
                        const item = guessGrid[key];
                        const isActive = builderActiveCoords && builderActiveCoords[0] === c && builderActiveCoords[1] === r;

                        let placementDir: number | null = null;
                        if (builderActiveCoords && builderSelectedBond && !item) {
                          const [ax, ay] = builderActiveCoords;
                          if (c === ax && r === ay - 1) placementDir = 1;
                          if (c === ax + 1 && r === ay) placementDir = 2;
                          if (c === ax && r === ay + 1) placementDir = 3;
                          if (c === ax - 1 && r === ay) placementDir = 4;
                        }

                        return (
                          <div
                            key={key}
                            onClick={() => {
                              setBuilderActiveCoords([c, r]);
                              if (item && item.type === "element") {
                                setBuilderSelectedBond(null);
                                setBuilderMessage(`Selected ${item.symbol}. Choose a bond to extend, or click another cell.`);
                              } else if (!item) {
                                setBuilderSelectedBond(null);
                                setBuilderMessage(`Selected cell [${c}, ${r}]. Click an element from palette below.`);
                              }
                            }}
                            style={{
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: isActive && !item
                                ? '1.5px dashed #33F0FF'
                                : (isLight ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid rgba(255, 255, 255, 0.05)'),
                              background: isActive
                                ? (isLight ? 'rgba(0, 85, 255, 0.08)' : 'rgba(51, 240, 255, 0.12)')
                                : 'transparent',
                              cursor: 'pointer',
                              borderRadius: '3px',
                            }}
                          >
                            {item ? (
                              item.type === "element" ? (
                                <div
                                  style={{
                                    width: '88%',
                                    height: '88%',
                                    borderRadius: '50%',
                                    background: getCPKBackground(item.symbol),
                                    color: getCPKTextColor(item.symbol),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '8px',
                                    fontFamily: 'monospace',
                                    fontWeight: 700,
                                    boxShadow: isActive ? '0 0 0 2px #33F0FF' : '0 2px 4px rgba(0,0,0,0.3)',
                                  }}
                                >
                                  {renderSubscripts(item.symbol)}
                                </div>
                              ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {renderBondLine(item.symbol, item.isHorizontal ?? false)}
                                </div>
                              )
                            ) : placementDir !== null ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  placeBond(placementDir!);
                                }}
                                style={{
                                  width: '86%',
                                  height: '86%',
                                  borderRadius: '50%',
                                  background: isLight ? '#111114' : '#33F0FF',
                                  color: isLight ? '#FFFFFF' : '#000000',
                                  border: 'none',
                                  fontSize: '9px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  fontFamily: 'monospace',
                                }}
                              >
                                {placementDir}
                              </button>
                            ) : (
                              <div style={{ width: '2px', height: '2px', borderRadius: '50%', background: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }} />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Message status banner */}
                  <div
                    style={{
                      padding: '5px 8px',
                      borderRadius: '6px',
                      background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
                      fontSize: '9px',
                      fontFamily: 'var(--font-content)',
                      color: isLight ? '#4B5563' : 'rgba(242, 242, 242, 0.7)',
                      textAlign: 'center',
                      lineHeight: 1.3,
                    }}
                  >
                    {builderMessage}
                  </div>

                  {/* 1. Element palette */}
                  <div>
                    <span style={{ fontSize: '8px', textTransform: 'uppercase', fontFamily: 'var(--font-subheading)', letterSpacing: '1px', color: isLight ? '#6B7280' : 'rgba(242,242,242,0.45)', display: 'block', marginBottom: '3px' }}>
                      1. Click group to place:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', justifyContent: 'center' }}>
                      {availableElements.map((el) => (
                        <button
                          key={el}
                          type="button"
                          onClick={() => placeElement(el)}
                          style={{
                            padding: '3px 6px',
                            borderRadius: '4px',
                            background: isLight ? '#FFFFFF' : '#1a1a20',
                            border: isLight ? '1px solid rgba(0, 0, 0, 0.16)' : '1px solid rgba(255, 255, 255, 0.15)',
                            color: isLight ? '#111114' : '#FFFFFF',
                            fontSize: '9px',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {renderSubscripts(el)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Bond selector */}
                  <div>
                    <span style={{ fontSize: '8px', textTransform: 'uppercase', fontFamily: 'var(--font-subheading)', letterSpacing: '1px', color: isLight ? '#6B7280' : 'rgba(242,242,242,0.45)', display: 'block', marginBottom: '3px' }}>
                      2. Select bond, then pick direction (1-4):
                    </span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {(['single', 'double', 'triple'] as const).map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => selectBond(b)}
                          style={{
                            flex: 1,
                            padding: '4px',
                            borderRadius: '4px',
                            background: builderSelectedBond === b
                              ? (isLight ? '#111114' : '#33F0FF')
                              : (isLight ? '#FFFFFF' : '#1a1a20'),
                            color: builderSelectedBond === b
                              ? (isLight ? '#FFFFFF' : '#000000')
                              : (isLight ? '#111114' : '#FFFFFF'),
                            border: isLight ? '1px solid rgba(0, 0, 0, 0.16)' : '1px solid rgba(255, 255, 255, 0.15)',
                            fontSize: '9px',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                          }}
                        >
                          {b === 'single' ? 'Single —' : b === 'double' ? 'Double ═' : 'Triple ≡'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div style={{ display: 'flex', gap: '4px', marginTop: '2px', borderTop: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '6px' }}>
                    <button
                      type="button"
                      onClick={resetBuilder}
                      style={{
                        flex: 1,
                        padding: '4px',
                        borderRadius: '4px',
                        background: 'transparent',
                        border: isLight ? '1px solid rgba(0, 0, 0, 0.14)' : '1px solid rgba(255, 255, 255, 0.15)',
                        color: isLight ? '#111114' : '#FFFFFF',
                        fontSize: '9px',
                        fontFamily: 'var(--font-heading)',
                        cursor: 'pointer',
                      }}
                    >
                      RESET
                    </button>
                    <button
                      type="button"
                      onClick={undoBuilder}
                      disabled={builderHistory.length === 0}
                      style={{
                        flex: 1,
                        padding: '4px',
                        borderRadius: '4px',
                        background: 'transparent',
                        border: isLight ? '1px solid rgba(0, 0, 0, 0.14)' : '1px solid rgba(255, 255, 255, 0.15)',
                        color: isLight ? '#111114' : '#FFFFFF',
                        fontSize: '9px',
                        fontFamily: 'var(--font-heading)',
                        cursor: 'pointer',
                        opacity: builderHistory.length === 0 ? 0.35 : 1,
                      }}
                    >
                      UNDO
                    </button>
                    <button
                      type="button"
                      onClick={handlePass}
                      style={{
                        flex: 1,
                        padding: '4px',
                        borderRadius: '4px',
                        background: 'transparent',
                        border: isLight ? '1px solid rgba(0, 0, 0, 0.14)' : '1px solid rgba(255, 255, 255, 0.15)',
                        color: isLight ? '#111114' : '#FFFFFF',
                        fontSize: '9px',
                        fontFamily: 'var(--font-heading)',
                        cursor: 'pointer',
                      }}
                      title="Reveal 3D product model directly"
                    >
                      PASS
                    </button>
                    <button
                      type="button"
                      onClick={checkBuilderStructure}
                      style={{
                        flex: 1.2,
                        padding: '4px',
                        borderRadius: '4px',
                        background: isLight ? '#10B981' : '#10B981',
                        border: 'none',
                        color: '#FFFFFF',
                        fontSize: '9px',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      VERIFY ✓
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Equation Box + Test Knowledge Button */}
          <div
            className="chemistry-equation-box"
            style={{
              marginTop: '20px',
              padding: '16px 20px',
              borderRadius: '14px',
              background: isLight ? 'rgba(255, 255, 255, 0.85)' : 'rgba(14, 14, 18, 0.8)',
              border: isLight ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid rgba(242,242,242,0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '9px',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  fontFamily: 'var(--font-subheading)',
                  color: isLight ? '#6B7280' : 'rgba(242,242,242,0.45)',
                  display: 'block',
                  marginBottom: '4px',
                  fontWeight: 700,
                }}
              >
                Balanced Chemical Equation
              </span>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '14px',
                  letterSpacing: '1px',
                  color: isLight ? '#111114' : '#FFFFFF',
                }}
              >
                {renderSubscripts(selectedReaction.balanced_equation)}
              </div>
            </div>

            <button
              onClick={() => {
                setQuizOpen(true);
                setQuizFinished(false);
                setCurrentQIndex(0);
                setQuizScore(0);
                setSelectedAnswer(null);
              }}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                background: isLight ? '#111114' : '#F2F2F2',
                color: isLight ? '#FFFFFF' : '#000000',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontSize: '11px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              <HelpCircle style={{ width: '14px', height: '14px' }} />
              <span>TEST KNOWLEDGE</span>
            </button>
          </div>
        </main>
      </div>

      {/* ── Mechanism Sheet Drawer ─────────────────────────── */}
      {sidePanelOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-end',
            background: isLight ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              background: isLight ? '#FFFFFF' : '#0a0a0c',
              borderLeft: isLight ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid rgba(242,242,242,0.18)',
              height: '100%',
              overflowY: 'auto',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
              color: isLight ? '#111114' : '#F2F2F2',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(242,242,242,0.12)', paddingBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '9px', textTransform: 'uppercase', fontFamily: 'var(--font-subheading)', letterSpacing: '2px', color: isLight ? '#0055FF' : '#33F0FF', fontWeight: 700 }}>
                    MOLECULAR DYNAMICS SHEET
                  </span>
                  <h3 style={{ fontSize: '18px', fontFamily: 'var(--font-heading)', letterSpacing: '2px', color: isLight ? '#111114' : '#FFFFFF', margin: '4px 0 0' }}>
                    {selectedReaction.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSidePanelOpen(false)}
                  style={{
                    background: isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(242,242,242,0.08)',
                    border: isLight ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid rgba(242,242,242,0.15)',
                    borderRadius: '8px',
                    padding: '6px',
                    color: isLight ? '#111114' : '#F2F2F2',
                    cursor: 'pointer',
                  }}
                >
                  <X style={{ width: '16px', height: '16px' }} />
                </button>
              </div>

              <div>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', fontFamily: 'var(--font-subheading)', letterSpacing: '1.5px', color: isLight ? '#6B7280' : 'rgba(242,242,242,0.45)', display: 'block', marginBottom: '6px' }}>
                  BALANCED EQUATION
                </span>
                <div style={{ padding: '12px 14px', borderRadius: '10px', background: isLight ? 'rgba(0, 0, 0, 0.03)' : 'rgba(242,242,242,0.04)', border: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(242,242,242,0.1)', fontFamily: 'var(--font-heading)', fontSize: '12px', color: isLight ? '#111114' : '#FFFFFF' }}>
                  {renderSubscripts(selectedReaction.balanced_equation)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', fontFamily: 'var(--font-subheading)', letterSpacing: '1.5px', color: isLight ? '#6B7280' : 'rgba(242,242,242,0.45)', display: 'block', marginBottom: '6px' }}>
                  STEP-BY-STEP MECHANISM
                </span>
                <div style={{ fontSize: '12.5px', color: isLight ? '#374151' : 'rgba(242,242,242,0.85)', lineHeight: 1.6, fontFamily: 'var(--font-content)', background: isLight ? 'rgba(0, 0, 0, 0.02)' : 'rgba(242,242,242,0.03)', padding: '16px', borderRadius: '12px', border: isLight ? '1px solid rgba(0, 0, 0, 0.06)' : '1px solid rgba(242,242,242,0.08)', whiteSpace: 'pre-line' }}>
                  {renderSubscripts(selectedReaction.reaction_mechanisms)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', fontFamily: 'var(--font-subheading)', letterSpacing: '1.5px', color: isLight ? '#6B7280' : 'rgba(242,242,242,0.45)', display: 'block', marginBottom: '6px' }}>
                  STERIC & INDUCTIVE EFFECTS
                </span>
                <p style={{ fontSize: '12px', color: isLight ? '#4B5563' : 'rgba(242,242,242,0.7)', lineHeight: 1.5, fontFamily: 'var(--font-content)', margin: 0 }}>
                  {renderSubscripts(selectedReaction.structural_effects)}
                </p>
              </div>

              <div>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', fontFamily: 'var(--font-subheading)', letterSpacing: '1.5px', color: isLight ? '#6B7280' : 'rgba(242,242,242,0.45)', display: 'block', marginBottom: '6px' }}>
                  IUPAC DERIVATION
                </span>
                <div style={{ fontSize: '12px', color: isLight ? '#4B5563' : 'rgba(242,242,242,0.7)', lineHeight: 1.5, fontFamily: 'var(--font-content)', background: isLight ? 'rgba(0, 0, 0, 0.02)' : 'rgba(242,242,242,0.03)', padding: '14px', borderRadius: '10px', border: isLight ? '1px solid rgba(0, 0, 0, 0.06)' : '1px solid rgba(242,242,242,0.08)', whiteSpace: 'pre-line' }}>
                  {renderSubscripts(selectedReaction.iupac_derivation)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', fontFamily: 'var(--font-subheading)', letterSpacing: '1.5px', color: isLight ? '#6B7280' : 'rgba(242,242,242,0.45)', display: 'block', marginBottom: '6px' }}>
                  INDUSTRIAL & LAB USES
                </span>
                <p style={{ fontSize: '12px', color: isLight ? '#4B5563' : 'rgba(242,242,242,0.7)', lineHeight: 1.5, fontFamily: 'var(--font-content)', margin: 0 }}>
                  {renderSubscripts(selectedReaction.uses_applications)}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setSidePanelOpen(false);
                setQuizOpen(true);
              }}
              style={{
                marginTop: '24px',
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: isLight ? '#0055FF' : '#33F0FF',
                color: isLight ? '#FFFFFF' : '#000000',
                border: 'none',
                fontFamily: 'var(--font-heading)',
                fontSize: '12px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              TAKE REACTION ASSESSMENT QUIZ
            </button>
          </div>
        </div>
      )}

      {/* ── Quiz Modal ─────────────────────────────────────── */}
      {quizOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isLight ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(12px)',
            padding: '16px',
          }}
        >
          <div
            className="prismate-modal-card"
            style={{
              width: '100%',
              maxWidth: '520px',
              background: isLight ? '#FFFFFF' : '#0d0d10',
              border: isLight ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid rgba(242,242,242,0.2)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: isLight ? '0 20px 48px rgba(0,0,0,0.15)' : '0 20px 40px rgba(0,0,0,0.6)',
              boxSizing: 'border-box',
              color: isLight ? '#111114' : '#F2F2F2',
            }}
          >
            {!quizFinished ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(242,242,242,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '9px', textTransform: 'uppercase', fontFamily: 'var(--font-subheading)', letterSpacing: '2px', color: isLight ? '#6B7280' : 'rgba(242,242,242,0.45)', fontWeight: 700 }}>
                      QUIZ EVALUATION
                    </span>
                    <h4 style={{ fontSize: '15px', fontFamily: 'var(--font-heading)', letterSpacing: '1px', color: isLight ? '#111114' : '#FFFFFF', margin: '2px 0 0' }}>
                      {selectedReaction.name}
                    </h4>
                  </div>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-subheading)', color: isLight ? '#0055FF' : '#33F0FF', background: isLight ? 'rgba(0, 85, 255, 0.08)' : 'rgba(51, 240, 255, 0.1)', border: isLight ? '1px solid rgba(0, 85, 255, 0.2)' : '1px solid rgba(51, 240, 255, 0.25)', padding: '4px 8px', borderRadius: '6px' }}>
                    Q {currentQIndex + 1} / {quizQuestions.length}
                  </span>
                </div>

                <p style={{ fontSize: '13.5px', color: isLight ? '#111114' : '#F2F2F2', marginBottom: '16px', fontFamily: 'var(--font-content)', lineHeight: 1.5 }}>
                  {quizQuestions[currentQIndex].question}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  {quizQuestions[currentQIndex].options.map((opt, i) => {
                    const isSelected = selectedAnswer === i;
                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedAnswer(i)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          fontSize: '12px',
                          fontFamily: 'var(--font-heading)',
                          letterSpacing: '0.5px',
                          cursor: 'pointer',
                          border: isSelected
                            ? (isLight ? '1.5px solid #0055FF' : '1px solid #33F0FF')
                            : (isLight ? '1px solid rgba(0, 0, 0, 0.12)' : '1px solid rgba(242,242,242,0.1)'),
                          background: isSelected
                            ? (isLight ? '#0055FF' : '#33F0FF')
                            : (isLight ? '#F9FAFB' : 'rgba(242,242,242,0.04)'),
                          color: isSelected
                            ? (isLight ? '#FFFFFF' : '#000000')
                            : (isLight ? '#111114' : '#F2F2F2'),
                          fontWeight: isSelected ? 700 : 400,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    onClick={() => setQuizOpen(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: isLight ? '#6B7280' : 'rgba(242,242,242,0.5)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-subheading)',
                      cursor: 'pointer',
                      letterSpacing: '1px',
                    }}
                  >
                    CANCEL
                  </button>
                  <button
                    disabled={selectedAnswer === null}
                    onClick={handleNextQuiz}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '10px',
                      background: isLight ? '#111114' : '#F2F2F2',
                      color: isLight ? '#FFFFFF' : '#000000',
                      border: 'none',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '11px',
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      cursor: selectedAnswer === null ? 'not-allowed' : 'pointer',
                      opacity: selectedAnswer === null ? 0.35 : 1,
                    }}
                  >
                    {currentQIndex + 1 === quizQuestions.length ? 'FINISH QUIZ' : 'NEXT QUESTION'}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircle2 style={{ width: '48px', height: '48px', color: '#10B981', margin: '0 auto 14px' }} />
                <h4 style={{ fontSize: '18px', fontFamily: 'var(--font-heading)', letterSpacing: '2px', color: isLight ? '#111114' : '#FFFFFF', margin: '0 0 6px' }}>
                  ASSESSMENT COMPLETED!
                </h4>
                <p style={{ fontSize: '13px', color: isLight ? '#4B5563' : 'rgba(242,242,242,0.6)', fontFamily: 'var(--font-content)', marginBottom: '20px' }}>
                  You scored <strong style={{ color: isLight ? '#0055FF' : '#33F0FF' }}>{quizScore}</strong> out of {quizQuestions.length} on {selectedReaction.name}.
                </p>
                <button
                  onClick={() => setQuizOpen(false)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '10px',
                    background: isLight ? '#111114' : '#F2F2F2',
                    color: isLight ? '#FFFFFF' : '#000000',
                    border: 'none',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '11px',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  RETURN TO CANVAS
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReactionViewerWorkspace;
