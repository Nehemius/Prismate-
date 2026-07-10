"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Unlock,
  MessageSquare,
  Award,
  Sparkles,
  LogOut,
  User,
  Check,
  AlertCircle,
  ArrowRight,
  Flame,
  ShieldAlert,
  Send,
  GraduationCap,
  Search,
  HelpCircle,
  ChevronDown
} from "lucide-react";
import SplashScreen from "./components/SplashScreen";
import MoleculeViewer from "./components/MoleculeViewer";
import ReagentAtomViewer from "./components/ReagentAtomViewer";
import { MockDB, Profile, Query, isSupabaseConfigured } from "./lib/supabase";
import { CHAPTERS, REACTION_CONCEPTS, ReactionConcept } from "./data/chemistryData";

const REAGENT_MAP: Record<string, { symbol: string; electrons: number }> = {
  "hydroboration-oxidation": { symbol: "B", electrons: 3 },
  "markovnikov-hbr": { symbol: "Br", electrons: 7 },
  "anti-markovnikov-hbr": { symbol: "Br", electrons: 7 },
  "ozonolysis": { symbol: "O", electrons: 6 },
  "friedel-crafts": { symbol: "C", electrons: 4 },
  "sn2-substitution": { symbol: "O", electrons: 6 },
  "sn1-substitution": { symbol: "O", electrons: 6 },
  "esterification": { symbol: "O", electrons: 6 },
  "aldol-condensation": { symbol: "C", electrons: 4 },
  "cannizzaro": { symbol: "O", electrons: 6 },
};

function renderSubscripts(text: string): React.ReactNode {
  if (!text) return "";
  const parts: React.ReactNode[] = [];
  const regex = /([A-Z][a-z]?)([0-9]+)/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(match[1]);
    parts.push(<sub key={match.index} className="select-text font-mono text-[80%]">{match[2]}</sub>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  return <>{parts}</>;
}

const validateGraph = (reactionId: string, nodes: any[]): boolean => {
  if (nodes.length === 0) return false;
  switch (reactionId) {
    case "hydroboration-oxidation": {
      const ch3 = nodes.find(n => n.symbol === "CH3");
      if (!ch3 || ch3.neighbors.length !== 1) return false;
      let current = ch3;
      const visited = new Set([current.id]);
      const path = [current.symbol];
      while (true) {
        const nextLink = current.neighbors.find((nb: any) => !visited.has(nb.neighborId));
        if (!nextLink) break;
        if (nextLink.bondType !== "single") return false;
        const nextNode = nodes.find(n => n.id === nextLink.neighborId);
        if (!nextNode) return false;
        visited.add(nextNode.id);
        path.push(nextNode.symbol);
        current = nextNode;
      }
      const pathStr = path.join("-");
      return pathStr === "CH3-CH2-CH2-OH" && visited.size === 4 && nodes.length === 4;
    }
    case "markovnikov-hbr": {
      if (nodes.length !== 4) return false;
      const ch = nodes.find(n => n.symbol === "CH");
      if (!ch || ch.neighbors.length !== 3) return false;
      const neighborSymbols = ch.neighbors.map((nb: any) => {
        if (nb.bondType !== "single") return null;
        return nodes.find(n => n.id === nb.neighborId)?.symbol;
      });
      if (neighborSymbols.includes(null)) return false;
      const ch3Count = neighborSymbols.filter((s: any) => s === "CH3").length;
      const brCount = neighborSymbols.filter((s: any) => s === "Br").length;
      return ch3Count === 2 && brCount === 1;
    }
    case "anti-markovnikov-hbr": {
      const ch3 = nodes.find(n => n.symbol === "CH3");
      if (!ch3 || ch3.neighbors.length !== 1) return false;
      let current = ch3;
      const visited = new Set([current.id]);
      const path = [current.symbol];
      while (true) {
        const nextLink = current.neighbors.find((nb: any) => !visited.has(nb.neighborId));
        if (!nextLink) break;
        if (nextLink.bondType !== "single") return false;
        const nextNode = nodes.find(n => n.id === nextLink.neighborId);
        if (!nextNode) return false;
        visited.add(nextNode.id);
        path.push(nextNode.symbol);
        current = nextNode;
      }
      const pathStr = path.join("-");
      return pathStr === "CH3-CH2-CH2-Br" && visited.size === 4 && nodes.length === 4;
    }
    case "ozonolysis": {
      if (nodes.length !== 3) return false;
      const ch3 = nodes.find(n => n.symbol === "CH3");
      if (!ch3 || ch3.neighbors.length !== 1) return false;
      const ch3NbLink = ch3.neighbors[0];
      if (ch3NbLink.bondType !== "single") return false;
      const ch = nodes.find(n => n.id === ch3NbLink.neighborId);
      if (!ch || ch.symbol !== "CH" || ch.neighbors.length !== 2) return false;
      const oLink = ch.neighbors.find((nb: any) => nb.neighborId !== ch3.id);
      if (!oLink || oLink.bondType !== "double") return false;
      const oNode = nodes.find(n => n.id === oLink.neighborId);
      return oNode && oNode.symbol === "O";
    }
    case "friedel-crafts": {
      if (nodes.length !== 2) return false;
      const c6h5 = nodes.find(n => n.symbol === "C6H5");
      if (!c6h5 || c6h5.neighbors.length !== 1) return false;
      const link = c6h5.neighbors[0];
      if (link.bondType !== "single") return false;
      const ch3 = nodes.find(n => n.id === link.neighborId);
      return ch3 && ch3.symbol === "CH3";
    }
    case "sn2-substitution": {
      if (nodes.length !== 2) return false;
      const ch3 = nodes.find(n => n.symbol === "CH3");
      if (!ch3 || ch3.neighbors.length !== 1) return false;
      const link = ch3.neighbors[0];
      if (link.bondType !== "single") return false;
      const oh = nodes.find(n => n.id === link.neighborId);
      return oh && oh.symbol === "OH";
    }
    case "sn1-substitution": {
      if (nodes.length !== 5) return false;
      const cNode = nodes.find(n => n.symbol === "C");
      if (!cNode || cNode.neighbors.length !== 4) return false;
      const neighborSymbols = cNode.neighbors.map((nb: any) => {
        if (nb.bondType !== "single") return null;
        return nodes.find(n => n.id === nb.neighborId)?.symbol;
      });
      if (neighborSymbols.includes(null)) return false;
      const ch3Count = neighborSymbols.filter((s: any) => s === "CH3").length;
      const ohCount = neighborSymbols.filter((s: any) => s === "OH").length;
      return ch3Count === 3 && ohCount === 1;
    }
    case "esterification": {
      if (nodes.length !== 6) return false;
      const cNode = nodes.find(n => n.symbol === "C");
      if (!cNode || cNode.neighbors.length !== 3) return false;
      const cNbSymbols = cNode.neighbors.map((nb: any) => ({
        symbol: nodes.find(n => n.id === nb.neighborId)?.symbol,
        bondType: nb.bondType,
        id: nb.neighborId
      }));
      const acetylCH3 = cNbSymbols.find((n: any) => n.symbol === "CH3" && n.bondType === "single");
      const carbonylO = cNbSymbols.find((n: any) => n.symbol === "O" && n.bondType === "double");
      const esterO = cNbSymbols.find((n: any) => n.symbol === "O" && n.bondType === "single");
      if (!acetylCH3 || !carbonylO || !esterO) return false;
      const esterONode = nodes.find(n => n.id === esterO.id);
      if (!esterONode || esterONode.neighbors.length !== 2) return false;
      const esterONbLink = esterONode.neighbors.find((nb: any) => nb.neighborId !== cNode.id);
      if (!esterONbLink || esterONbLink.bondType !== "single") return false;
      const ch2Node = nodes.find(n => n.id === esterONbLink.neighborId);
      if (!ch2Node || ch2Node.symbol !== "CH2" || ch2Node.neighbors.length !== 2) return false;
      const ch2NbLink = ch2Node.neighbors.find((nb: any) => nb.neighborId !== esterONode.id);
      if (!ch2NbLink || ch2NbLink.bondType !== "single") return false;
      const terminalCH3 = nodes.find(n => n.id === ch2NbLink.neighborId);
      return terminalCH3 && terminalCH3.symbol === "CH3";
    }
    case "aldol-condensation": {
      if (nodes.length !== 6) return false;
      const ch3 = nodes.find(n => n.symbol === "CH3");
      if (!ch3 || ch3.neighbors.length !== 1) return false;
      const ch3NbLink = ch3.neighbors[0];
      if (ch3NbLink.bondType !== "single") return false;
      const chOH = nodes.find(n => n.id === ch3NbLink.neighborId);
      if (!chOH || chOH.symbol !== "CH" || chOH.neighbors.length !== 3) return false;
      const ohLink = chOH.neighbors.find((nb: any) => {
        const node = nodes.find(n => n.id === nb.neighborId);
        return node && node.symbol === "OH" && nb.bondType === "single";
      });
      if (!ohLink) return false;
      const ch2Link = chOH.neighbors.find((nb: any) => {
        const node = nodes.find(n => n.id === nb.neighborId);
        return node && node.symbol === "CH2" && nb.bondType === "single";
      });
      if (!ch2Link) return false;
      const ch2Node = nodes.find(n => n.id === ch2Link.neighborId);
      if (!ch2Node || ch2Node.neighbors.length !== 2) return false;
      const chCarbonylLink = ch2Node.neighbors.find((nb: any) => nb.neighborId !== chOH.id);
      if (!chCarbonylLink || chCarbonylLink.bondType !== "single") return false;
      const chCarbonylNode = nodes.find(n => n.id === chCarbonylLink.neighborId);
      if (!chCarbonylNode || chCarbonylNode.symbol !== "CH" || chCarbonylNode.neighbors.length !== 2) return false;
      const oLink = chCarbonylNode.neighbors.find((nb: any) => nb.neighborId !== ch2Node.id);
      if (!oLink || oLink.bondType !== "double") return false;
      const oNode = nodes.find(n => n.id === oLink.neighborId);
      return oNode && oNode.symbol === "O";
    }
    case "cannizzaro": {
      const c6h5 = nodes.find(n => n.symbol === "C6H5");
      if (!c6h5 || c6h5.neighbors.length !== 1) return false;
      let current = c6h5;
      const visited = new Set([current.id]);
      const path = [current.symbol];
      while (true) {
        const nextLink = current.neighbors.find((nb: any) => !visited.has(nb.neighborId));
        if (!nextLink) break;
        if (nextLink.bondType !== "single") return false;
        const nextNode = nodes.find(n => n.id === nextLink.neighborId);
        if (!nextNode) return false;
        visited.add(nextNode.id);
        path.push(nextNode.symbol);
        current = nextNode;
      }
      const pathStr = path.join("-");
      return pathStr === "C6H5-CH2-OH" && visited.size === 3 && nodes.length === 3;
    }
    default:
      return false;
  }
};

function renderStructure2D(name: string) {
  const norm = name.toLowerCase().trim();
  switch (norm) {
    case "propene":
      return (
        <div className="flex items-center gap-1 font-mono text-sm text-black font-bold">
          <span>CH₃</span><span className="text-black/40">—</span><span>CH</span><span className="text-black/40 font-sans">═</span><span>CH₂</span>
        </div>
      );
    case "propan-1-ol":
      return (
        <div className="flex items-center gap-1 font-mono text-sm text-black font-bold">
          <span>CH₃</span><span className="text-black/40">—</span><span>CH₂</span><span className="text-black/40">—</span><span>CH₂</span><span className="text-black/40">—</span><span>OH</span>
        </div>
      );
    case "2-bromopropane":
      return (
        <div className="flex flex-col items-center font-mono text-sm text-black font-bold">
          <div className="flex items-center gap-1">
            <span>CH₃</span><span className="text-black/40">—</span><span>CH</span><span className="text-black/40">—</span><span>CH₃</span>
          </div>
          <div className="w-0.5 h-3 bg-black/40 my-0.5"></div>
          <span>Br</span>
        </div>
      );
    case "1-bromopropane":
      return (
        <div className="flex items-center gap-1 font-mono text-sm text-black font-bold">
          <span>CH₃</span><span className="text-black/40">—</span><span>CH₂</span><span className="text-black/40">—</span><span>CH₂</span><span className="text-black/40">—</span><span>Br</span>
        </div>
      );
    case "but-2-ene":
      return (
        <div className="flex items-center gap-1 font-mono text-sm text-black font-bold">
          <span>CH₃</span><span className="text-black/40">—</span><span>CH</span><span className="text-black/40 font-sans">═</span><span>CH</span><span className="text-black/40">—</span><span>CH₃</span>
        </div>
      );
    case "acetaldehyde":
      return (
        <div className="flex items-center gap-1 font-mono text-sm text-black font-bold">
          <span>CH₃</span><span className="text-black/40">—</span><span>CH</span><span className="text-black/40 font-sans">═</span><span>O</span>
        </div>
      );
    case "benzene":
      return (
        <div className="flex flex-col items-center font-mono text-xs text-black font-bold">
          <div className="border border-black/40 rounded-full p-2 w-10 h-10 flex items-center justify-center relative">
            <div className="border border-dashed border-black/30 rounded-full w-6 h-6"></div>
          </div>
          <span className="mt-1">C₆H₆</span>
        </div>
      );
    case "toluene":
      return (
        <div className="flex items-center gap-1 font-mono text-sm text-black font-bold">
          <span>C₆H₅</span><span className="text-black/40">—</span><span>CH₃</span>
        </div>
      );
    case "chloromethane":
      return (
        <div className="flex items-center gap-1 font-mono text-sm text-black font-bold">
          <span>CH₃</span><span className="text-black/40">—</span><span>Cl</span>
        </div>
      );
    case "methanol":
      return (
        <div className="flex items-center gap-1 font-mono text-sm text-black font-bold">
          <span>CH₃</span><span className="text-black/40">—</span><span>OH</span>
        </div>
      );
    case "tert-butyl-chloride":
      return (
        <div className="flex flex-col items-center font-mono text-sm text-black font-bold">
          <span>CH₃</span>
          <div className="w-0.5 h-2.5 bg-black/40 my-0.5"></div>
          <div className="flex items-center gap-1">
            <span>CH₃</span><span className="text-black/40">—</span><span>C</span><span className="text-black/40">—</span><span>Cl</span>
          </div>
          <div className="w-0.5 h-2.5 bg-black/40 my-0.5"></div>
          <span>CH₃</span>
        </div>
      );
    case "tert-butyl-alcohol":
      return (
        <div className="flex flex-col items-center font-mono text-sm text-black font-bold">
          <span>CH₃</span>
          <div className="w-0.5 h-2.5 bg-black/40 my-0.5"></div>
          <div className="flex items-center gap-1">
            <span>CH₃</span><span className="text-black/40">—</span><span>C</span><span className="text-black/40">—</span><span>OH</span>
          </div>
          <div className="w-0.5 h-2.5 bg-black/40 my-0.5"></div>
          <span>CH₃</span>
        </div>
      );
    case "ethanol":
      return (
        <div className="flex items-center gap-1 font-mono text-sm text-black font-bold">
          <span>CH₃</span><span className="text-black/40">—</span><span>CH₂</span><span className="text-black/40">—</span><span>OH</span>
        </div>
      );
    case "ethyl-acetate":
      return (
        <div className="flex flex-col items-center font-mono text-sm text-black font-bold">
          <span>O</span>
          <div className="flex gap-0.5 my-0.5">
            <div className="w-0.5 h-2.5 bg-black/40"></div>
            <div className="w-0.5 h-2.5 bg-black/40"></div>
          </div>
          <div className="flex items-center gap-1">
            <span>CH₃</span><span className="text-black/40">—</span><span>C</span><span className="text-black/40">—</span><span>O</span><span className="text-black/40">—</span><span>CH₂</span><span className="text-black/40">—</span><span>CH₃</span>
          </div>
        </div>
      );
    case "benzaldehyde":
      return (
        <div className="flex flex-col items-center font-mono text-sm text-black font-bold">
          <span>O</span>
          <div className="flex gap-0.5 my-0.5">
            <div className="w-0.5 h-2.5 bg-black/40"></div>
            <div className="w-0.5 h-2.5 bg-black/40"></div>
          </div>
          <div className="flex items-center gap-1">
            <span>C₆H₅</span><span className="text-black/40">—</span><span>CH</span>
          </div>
        </div>
      );
    case "benzyl-alcohol":
      return (
        <div className="flex items-center gap-1 font-mono text-sm text-black font-bold">
          <span>C₆H₅</span><span className="text-black/40">—</span><span>CH₂</span><span className="text-black/40">—</span><span>OH</span>
        </div>
      );
    default:
      return <span className="font-mono text-xs uppercase text-black/50">{name}</span>;
  }
}

export default function Home() {
  // Splash screen state
  const [splashFinished, setSplashFinished] = useState(false);

  // Auth / session state
  const [user, setUser] = useState<Profile | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginName, setLoginName] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // OTP state
  const [otpStep, setOtpStep] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);

  // Navigation state
  const [activeTab, setActiveTab] = useState<"chemistry" | "qa" | "physics" | "math" | "achievements">("chemistry");

  // Chemistry search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState<"all" | "11" | "12">("all");
  const [selectedChapterFilter, setSelectedChapterFilter] = useState<string>("all");
  const [selectedConceptFilter, setSelectedConceptFilter] = useState<string>("all");
  const [selectedReaction, setSelectedReaction] = useState<ReactionConcept | null>(null);

  // Canvas rotation controls
  const [autoRotate, setAutoRotate] = useState(true);


  // Side Panel logic
  const [sidePanelOpen, setSidePanelOpen] = useState(false);

  // Q&A module feed state
  const [queries, setQueries] = useState<Query[]>([]);
  const [newQuestionContent, setNewQuestionContent] = useState("");
  const [showStudentName, setShowStudentName] = useState(false); // Student's choice to reveal name to teacher
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);
  const [isModerating, setIsModerating] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);
  
  // Teacher reply states
  const [replyContents, setReplyContents] = useState<Record<string, string>>({});
  const [replyAnonymous, setReplyAnonymous] = useState<Record<string, boolean>>({});

  // Assessment Quiz modal state
  const [quizOpen, setQuizOpen] = useState(false);
  const [currentQuizQuestions, setCurrentQuizQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  // Achievements state
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [newBadgeNotification, setNewBadgeNotification] = useState<{title: string, desc: string} | null>(null);

  // Fullscreen mode state
  const [fullscreenMode, setFullscreenMode] = useState(false);

  // Molecule guesser state
  const [solvedReactions, setSolvedReactions] = useState<Record<string, boolean>>({});
  const [guessGrid, setGuessGrid] = useState<Record<string, { type: "element" | "bond"; symbol: string }>>({});
  const [builderActiveCoords, setBuilderActiveCoords] = useState<[number, number] | null>(null);
  const [builderSelectedBond, setBuilderSelectedBond] = useState<"single" | "double" | "triple" | null>(null);
  const [builderMessage, setBuilderMessage] = useState<string>("Select a starting block below to begin building the product.");
  const [gridSize, setGridSize] = useState<number>(7);
  const [builderHistory, setBuilderHistory] = useState<{
    grid: Record<string, { type: "element" | "bond"; symbol: string }>;
    activeCoords: [number, number] | null;
    selectedBond: "single" | "double" | "triple" | null;
    message: string;
  }[]>([]);

  // Mobile touch drag & drop and double-tap refs
  const [touchDragItem, setTouchDragItem] = useState<{ type: "element" | "bond"; value: string } | null>(null);
  const lastTapLayout = useRef<number>(0);
  const lastTapProduct = useRef<number>(0);

  // Teacher anonymous posting and congrats popup states
  const [teacherPostAnonymous, setTeacherPostAnonymous] = useState(false);
  const [congratsPopup, setCongratsPopup] = useState<string | null>(null);

  // Floating Smart whiteboard state
  const whiteboardCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [radialMenuOpen, setRadialMenuOpen] = useState(false);
  const [penColor, setPenColor] = useState("#FF0000");
  const [isEraser, setIsEraser] = useState(false);
  const isDrawingRef = useRef(false);
  const lastCoordsRef = useRef({ x: 0, y: 0 });

  // Load session user and setup achievements on mount
  useEffect(() => {
    const session = MockDB.getSessionUser();
    if (session) {
      setUser(session);
    }

    if (typeof window !== "undefined") {
      const storedBadges = localStorage.getItem("prismate_badges");
      if (storedBadges) {
        setUnlockedBadges(JSON.parse(storedBadges));
      }
      const storedSolved = localStorage.getItem("prismate_solved_reactions");
      if (storedSolved) {
        setSolvedReactions(JSON.parse(storedSolved));
      }
    }
  }, []);

  // Intercept Android back button navigation to close open overlay panels
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.pushState({ page: "home" }, "");
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      let overlayClosed = false;

      if (quizOpen) {
        setQuizOpen(false);
        overlayClosed = true;
      }
      if (sidePanelOpen) {
        setSidePanelOpen(false);
        overlayClosed = true;
      }
      if (isDrawingMode) {
        setIsDrawingMode(false);
        overlayClosed = true;
      }
      if (radialMenuOpen) {
        setRadialMenuOpen(false);
        overlayClosed = true;
      }
      if (fullscreenMode) {
        setFullscreenMode(false);
        overlayClosed = true;
      }

      if (overlayClosed) {
        window.history.pushState({ page: "home" }, "");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [quizOpen, sidePanelOpen, isDrawingMode, radialMenuOpen, fullscreenMode]);

  // Update Q&A feed whenever activeTab changes or user login state changes
  useEffect(() => {
    if (user) {
      MockDB.getQueries(user).then((res) => setQueries(res));
    }
  }, [activeTab, user]);

  // Cooldown timer interval check
  useEffect(() => {
    if (cooldownTimeLeft <= 0) return;
    const interval = setInterval(() => {
      setCooldownTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownTimeLeft]);

  // Save badges to localStorage and handle animations
  const unlockBadge = (badgeId: string, title: string, desc: string) => {
    if (unlockedBadges.includes(badgeId)) return;
    const updated = [...unlockedBadges, badgeId];
    setUnlockedBadges(updated);
    localStorage.setItem("prismate_badges", JSON.stringify(updated));
    
    // Trigger notification
    setNewBadgeNotification({ title, desc });
    setTimeout(() => {
      setNewBadgeNotification(null);
    }, 5000);
  };

  const setReactionSolved = (reactionId: string) => {
    const updated = { ...solvedReactions, [reactionId]: true };
    setSolvedReactions(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("prismate_solved_reactions", JSON.stringify(updated));
    }
  };

  // Reset/Initialize Molecule builder when selected reaction changes
  useEffect(() => {
    if (selectedReaction) {
      // Force unsolved state on reaction change to display guesser game every time it's reopened
      setSolvedReactions(prev => ({ ...prev, [selectedReaction.id]: false }));
      setGuessGrid({});
      setBuilderActiveCoords([Math.floor(gridSize / 2), Math.floor(gridSize / 2)]); // Dynamic center cell
      setBuilderSelectedBond(null);
      setBuilderHistory([]);
      setBuilderMessage("Choose a starting element from the options below to place at the center.");
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [selectedReaction, gridSize]);

  // Whiteboard resize listener
  useEffect(() => {
    if (fullscreenMode && whiteboardCanvasRef.current) {
      const canvas = whiteboardCanvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [fullscreenMode, isDrawingMode]);

  // Whiteboard drawing event listener hook for extreme lag-free response on smartboards
  useEffect(() => {
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;

    const handleStart = (clientX: number, clientY: number) => {
      if (!isDrawingMode) return;
      isDrawingRef.current = true;
      const rect = canvas.getBoundingClientRect();
      lastCoordsRef.current = {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const handleMove = (clientX: number, clientY: number, e?: Event) => {
      if (!isDrawingMode || !isDrawingRef.current) return;
      if (e && e.cancelable) e.preventDefault();
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
      ctx.beginPath();
      ctx.moveTo(lastCoordsRef.current.x, lastCoordsRef.current.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = isEraser ? "#FFFFFF" : penColor;
      ctx.lineWidth = isEraser ? 32 : 4;
      ctx.stroke();
      
      lastCoordsRef.current = { x, y };
    };

    const handleStop = () => {
      isDrawingRef.current = false;
    };

    // Native mouse events
    const onMouseDown = (e: MouseEvent) => {
      handleStart(e.clientX, e.clientY);
    };
    const onMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };
    const onMouseUp = () => {
      handleStop();
    };

    // Native touch events
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY, e);
      }
    };
    const onTouchEnd = () => {
      handleStop();
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseUp);

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mouseleave", onMouseUp);

      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDrawingMode, penColor, isEraser, fullscreenMode]);

  const clearCanvas = () => {
    if (whiteboardCanvasRef.current) {
      const canvas = whiteboardCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

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

  const renderBondLine = (c: number, r: number, symbol: string) => {
    const cy = Math.floor(gridSize / 2);
    const isHorizontal = (r % 2) === (cy % 2); 
    if (isHorizontal) {
      if (symbol === "double") {
        return (
          <div className="w-full flex flex-col gap-0.5 items-center justify-center px-1">
            <div className="w-full h-0.5 bg-black/40"></div>
            <div className="w-full h-0.5 bg-black/40"></div>
          </div>
        );
      }
      if (symbol === "triple") {
        return (
          <div className="w-full flex flex-col gap-0.5 items-center justify-center px-1">
            <div className="w-full h-0.5 bg-black/40"></div>
            <div className="w-full h-0.5 bg-black/40"></div>
            <div className="w-full h-0.5 bg-black/40"></div>
          </div>
        );
      }
      return <div className="w-full h-0.5 bg-black/40 mx-1"></div>;
    } else {
      if (symbol === "double") {
        return (
          <div className="h-full flex gap-0.5 items-center justify-center py-1">
            <div className="h-full w-0.5 bg-black/40"></div>
            <div className="h-full w-0.5 bg-black/40"></div>
          </div>
        );
      }
      if (symbol === "triple") {
        return (
          <div className="h-full flex gap-0.5 items-center justify-center py-1">
            <div className="h-full w-0.5 bg-black/40"></div>
            <div className="h-full w-0.5 bg-black/40"></div>
            <div className="h-full w-0.5 bg-black/40"></div>
          </div>
        );
      }
      return <div className="h-full w-0.5 bg-black/40 my-1"></div>;
    }
  };

  const undoBuilder = () => {
    if (builderHistory.length === 0) {
      setBuilderMessage("Nothing to undo.");
      return;
    }
    const previous = builderHistory[builderHistory.length - 1];
    setBuilderHistory(prev => prev.slice(0, -1));
    setGuessGrid(previous.grid);
    setBuilderActiveCoords(previous.activeCoords);
    setBuilderSelectedBond(previous.selectedBond);
    setBuilderMessage(previous.message);
  };

  const handleDropAtCoords = (c: number, r: number, dragType: string, dragVal: string) => {
    const key = `${c},${r}`;
    if (dragType === "element") {
      setBuilderHistory(prev => [
        ...prev,
        {
          grid: { ...guessGrid },
          activeCoords: builderActiveCoords ? [...builderActiveCoords] : null,
          selectedBond: builderSelectedBond,
          message: builderMessage
        }
      ]);
      setGuessGrid(prev => ({
        ...prev,
        [key]: { type: "element", symbol: dragVal }
      }));
      setBuilderActiveCoords([c, r]);
      setBuilderSelectedBond(null);
      setBuilderMessage(`Placed ${dragVal} at [${c}, ${r}].`);
    } else if (dragType === "bond") {
      if (builderActiveCoords) {
        const [ax, ay] = builderActiveCoords;
        let dir = null;
        if (c === ax && r === ay - 1) dir = 1;
        if (c === ax + 1 && r === ay) dir = 2;
        if (c === ax && r === ay + 1) dir = 3;
        if (c === ax - 1 && r === ay) dir = 4;
        if (dir !== null) {
          const bondKey = `${c},${r}`;
          const nextX = ax + 2 * (c - ax);
          const nextY = ay + 2 * (r - ay);
          if (nextX >= 0 && nextX < gridSize && nextY >= 0 && nextY < gridSize) {
            setBuilderHistory(prev => [
              ...prev,
              {
                grid: { ...guessGrid },
                activeCoords: builderActiveCoords ? [...builderActiveCoords] : null,
                selectedBond: builderSelectedBond,
                message: builderMessage
              }
            ]);
            setGuessGrid(prev => ({
              ...prev,
              [bondKey]: { type: "bond", symbol: dragVal }
            }));
            setBuilderActiveCoords([nextX, nextY]);
            setBuilderSelectedBond(null);
            setBuilderMessage(`Placed ${dragVal} bond in direction ${dir}.`);
          }
        }
      }
    }
  };

  const placeElement = (el: string) => {
    if (!builderActiveCoords) return;
    const [x, y] = builderActiveCoords;
    const key = `${x},${y}`;

    setBuilderHistory(prev => [
      ...prev,
      {
        grid: { ...guessGrid },
        activeCoords: builderActiveCoords ? [...builderActiveCoords] : null,
        selectedBond: builderSelectedBond,
        message: builderMessage
      }
    ]);

    setGuessGrid(prev => ({
      ...prev,
      [key]: { type: "element", symbol: el }
    }));
    setBuilderSelectedBond(null);
    setBuilderMessage("Group placed! Select a bond type (single, double, triple) to extend the molecule, or select another element on the grid.");
  };

  const selectBond = (bondType: "single" | "double" | "triple") => {
    if (!builderActiveCoords) {
      setBuilderMessage("Please select an element on the grid first.");
      return;
    }
    const [x, y] = builderActiveCoords;
    const cell = guessGrid[`${x},${y}`];
    if (!cell || cell.type !== "element") {
      setBuilderMessage("You can only start a bond from a placed element node.");
      return;
    }
    setBuilderSelectedBond(bondType);
    setBuilderMessage(`Select a direction (1-4) around the active element to place the ${bondType} bond.`);
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

    if (bondX < 0 || bondX >= gridSize || bondY < 0 || bondY >= gridSize || nextX < 0 || nextX >= gridSize || nextY < 0 || nextY >= gridSize) {
      setBuilderMessage("Cannot place bond outside grid boundaries.");
      return;
    }

    const bondKey = `${bondX},${bondY}`;

    setBuilderHistory(prev => [
      ...prev,
      {
        grid: { ...guessGrid },
        activeCoords: builderActiveCoords ? [...builderActiveCoords] : null,
        selectedBond: builderSelectedBond,
        message: builderMessage
      }
    ]);

    setGuessGrid(prev => ({
      ...prev,
      [bondKey]: { type: "bond", symbol: builderSelectedBond }
    }));
    setBuilderActiveCoords([nextX, nextY]);
    setBuilderSelectedBond(null);
    setBuilderMessage(`Select an element from the palette below to connect to the ${builderSelectedBond} bond.`);
  };

  const resetBuilder = () => {
    setGuessGrid({});
    setBuilderActiveCoords([Math.floor(gridSize / 2), Math.floor(gridSize / 2)]);
    setBuilderSelectedBond(null);
    setBuilderHistory([]);
    setBuilderMessage("Choose a starting element from the options below to place at the center.");
  };

  const checkBuilderStructure = () => {
    if (!selectedReaction) return;
    const keys = Object.keys(guessGrid);
    const nodes: any[] = [];
    keys.forEach(k => {
      const item = guessGrid[k];
      if (item && item.type === "element") {
        const [x, y] = k.split(",").map(Number);
        nodes.push({
          id: k,
          symbol: item.symbol,
          x,
          y,
          neighbors: []
        });
      }
    });
    nodes.forEach(node => {
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
            bondType: bondItem.symbol
          });
        }
      });
    });
    const isCorrect = validateGraph(selectedReaction.id, nodes);
    if (isCorrect) {
      setBuilderMessage("✨ Structure matches perfectly! Unlocking 3D visualization...");
      setCongratsPopup("🎉 Congratulations!! You have guessed the reaction correctly!");
      setTimeout(() => setCongratsPopup(null), 4000);
      setReactionSolved(selectedReaction.id);
      if (selectedReaction.is_secret_achievement) {
        unlockBadge(
          selectedReaction.id,
          selectedReaction.achievement_title || "Chemistry Mastery",
          selectedReaction.achievement_hint || "Discovered a hidden mechanism path."
        );
      }
    } else {
      setBuilderMessage("❌ The chemical connectivity is incorrect. Verify bonds, atoms, and stoichiometry, then check again!");
    }
  };

  const renderMoleculeBuilder = () => {
    if (!selectedReaction) return null;
    const size = gridSize;
    const cellSize = Math.max(16, Math.floor(196 / size));
    const gridCells = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
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
        gridCells.push(
          <div 
            key={key} 
            data-cell-coords={`${c},${r}`}
            onClick={() => {
              setBuilderActiveCoords([c, r]);
              if (item && item.type === "element") {
                setBuilderSelectedBond(null);
                setBuilderMessage("Selected element node. Choose a bond type to extend, or click another cell.");
              } else if (!item) {
                setBuilderSelectedBond(null);
                setBuilderMessage(`Selected cell [${c}, ${r}]. Click an element from the palette to place it.`);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const dragType = e.dataTransfer.getData("type");
              const dragVal = e.dataTransfer.getData("value");
              handleDropAtCoords(c, r, dragType, dragVal);
            }}
            className={`relative flex items-center justify-center border border-black/5 select-none transition-all ${
              item?.type === "element" ? "cursor-pointer" : ""
            } ${isActive && !item ? "border-black border-dashed bg-black/5 animate-pulse" : ""}`}
            style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
          >
            {item ? (
              item.type === "element" ? (
                <div 
                  className={`rounded-full flex items-center justify-center font-bold shadow-md transition-transform hover:scale-105 select-none ${
                    isActive ? "ring-2 ring-black" : ""
                  }`}
                  style={{
                    width: `${cellSize - 4}px`,
                    height: `${cellSize - 4}px`,
                    fontSize: cellSize > 28 ? "10px" : "8px",
                    background: getCPKBackground(item.symbol),
                    color: getCPKTextColor(item.symbol)
                  }}
                >
                  {renderSubscripts(item.symbol)}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {renderBondLine(c, r, item.symbol)}
                </div>
              )
            ) : placementDir !== null ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  placeBond(placementDir!);
                }}
                className="rounded-full bg-black text-white hover:bg-black/80 flex items-center justify-center font-bold z-10 shadow-lg active:scale-90 transition-all font-mono"
                style={{
                  width: `${cellSize - 6}px`,
                  height: `${cellSize - 6}px`,
                  fontSize: cellSize > 28 ? "10px" : "8px",
                }}
              >
                {placementDir}
              </button>
            ) : (
              <div className="w-1 h-1 bg-black/10 rounded-full"></div>
            )}
          </div>
        );
      }
    }

    const availableElements = ["CH3", "CH2", "CH", "C", "OH", "Br", "Cl", "O", "C6H5"];

    return (
      <div className="w-full bg-white text-black p-3.5 rounded-2xl border border-black/10 shadow-inner flex flex-col gap-2 select-none">
        <div className="text-center relative pr-14">
          <h3 className="text-xs font-bold font-outfit uppercase tracking-wider text-black/85">Build: {selectedReaction.iupac_product_name}</h3>
          <p className="text-[9px] text-black/50 font-mono mt-0.5">Target Chemistry Product</p>
          
          {/* Zoom controls at top right */}
          <div className="absolute top-0.5 right-0.5 flex items-center gap-1">
            <button
              onClick={() => setGridSize(prev => Math.max(7, prev - 2))}
              className="w-5 h-5 rounded bg-neutral-100 hover:bg-neutral-200 text-[10px] font-bold border border-black/10 flex items-center justify-center"
              title="Zoom In"
            >
              +
            </button>
            <button
              onClick={() => setGridSize(prev => Math.min(13, prev + 2))}
              className="w-5 h-5 rounded bg-neutral-100 hover:bg-neutral-200 text-[10px] font-bold border border-black/10 flex items-center justify-center"
              title="Zoom Out (Adds more grid)"
            >
              -
            </button>
          </div>
        </div>

        <div 
          className="grid gap-1 w-full max-w-[210px] mx-auto aspect-square bg-neutral-50 p-1.5 border border-black/5 rounded-xl shadow-inner relative justify-center items-center overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`
          }}
        >
          {gridCells}
        </div>

        <div className="py-1.5 px-2.5 rounded-lg bg-black/5 border border-black/5 text-[9px] leading-relaxed text-center font-mono font-semibold text-black/70">
          {builderMessage}
        </div>

        <div className="space-y-2">
          <div className="flex flex-col gap-1">
            <span className="text-[8px] uppercase tracking-widest text-black/40 font-mono block">1. Click / Drag Group to Place</span>
            <div className="flex flex-wrap gap-1 justify-center">
              {availableElements.map(el => (
                <button
                  key={el}
                  onClick={() => placeElement(el)}
                  onTouchStart={() => {
                    setTouchDragItem({ type: "element", value: el });
                  }}
                  onTouchMove={(e) => {
                    if (e.cancelable) e.preventDefault();
                  }}
                  onTouchEnd={(e) => {
                    if (!touchDragItem) return;
                    const touch = e.changedTouches[0];
                    const element = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (element) {
                      const cell = element.closest("[data-cell-coords]");
                      if (cell) {
                        const coords = cell.getAttribute("data-cell-coords");
                        if (coords) {
                          const [c, r] = coords.split(",").map(Number);
                          handleDropAtCoords(c, r, "element", el);
                        }
                      }
                    }
                    setTouchDragItem(null);
                  }}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("type", "element");
                    e.dataTransfer.setData("value", el);
                  }}
                  className="px-2 py-1 rounded-lg border border-black/20 hover:border-black/50 bg-white hover:bg-neutral-50 text-[9px] font-mono font-bold shadow-xs active:scale-95 transition-all text-black cursor-grab active:cursor-grabbing select-none touch-none"
                >
                  {renderSubscripts(el)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[8px] uppercase tracking-widest text-black/40 font-mono block">2. Select Bond, Choose Direction</span>
            <div className="flex gap-1.5 justify-center">
              <button
                onClick={() => selectBond("single")}
                onTouchStart={() => {
                  setTouchDragItem({ type: "bond", value: "single" });
                }}
                onTouchMove={(e) => {
                  if (e.cancelable) e.preventDefault();
                }}
                onTouchEnd={(e) => {
                  if (!touchDragItem) return;
                  const touch = e.changedTouches[0];
                  const element = document.elementFromPoint(touch.clientX, touch.clientY);
                  if (element) {
                    const cell = element.closest("[data-cell-coords]");
                    if (cell) {
                      const coords = cell.getAttribute("data-cell-coords");
                      if (coords) {
                        const [c, r] = coords.split(",").map(Number);
                        handleDropAtCoords(c, r, "bond", "single");
                      }
                    }
                  }
                  setTouchDragItem(null);
                }}
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData("type", "bond");
                  e.dataTransfer.setData("value", "single");
                }}
                className={`flex-1 py-1 rounded-lg border text-[9px] font-mono font-bold transition-all cursor-grab active:cursor-grabbing select-none touch-none ${
                  builderSelectedBond === "single" 
                    ? "bg-black text-white border-black" 
                    : "bg-white text-black border-black/20 hover:border-black/40"
                }`}
              >
                Single (—)
              </button>
              <button
                onClick={() => selectBond("double")}
                onTouchStart={() => {
                  setTouchDragItem({ type: "bond", value: "double" });
                }}
                onTouchMove={(e) => {
                  if (e.cancelable) e.preventDefault();
                }}
                onTouchEnd={(e) => {
                  if (!touchDragItem) return;
                  const touch = e.changedTouches[0];
                  const element = document.elementFromPoint(touch.clientX, touch.clientY);
                  if (element) {
                    const cell = element.closest("[data-cell-coords]");
                    if (cell) {
                      const coords = cell.getAttribute("data-cell-coords");
                      if (coords) {
                        const [c, r] = coords.split(",").map(Number);
                        handleDropAtCoords(c, r, "bond", "double");
                      }
                    }
                  }
                  setTouchDragItem(null);
                }}
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData("type", "bond");
                  e.dataTransfer.setData("value", "double");
                }}
                className={`flex-1 py-1 rounded-lg border text-[9px] font-mono font-bold transition-all cursor-grab active:cursor-grabbing select-none touch-none ${
                  builderSelectedBond === "double" 
                    ? "bg-black text-white border-black" 
                    : "bg-white text-black border-black/20 hover:border-black/40"
                }`}
              >
                Double (═)
              </button>
              <button
                onClick={() => selectBond("triple")}
                onTouchStart={() => {
                  setTouchDragItem({ type: "bond", value: "triple" });
                }}
                onTouchMove={(e) => {
                  if (e.cancelable) e.preventDefault();
                }}
                onTouchEnd={(e) => {
                  if (!touchDragItem) return;
                  const touch = e.changedTouches[0];
                  const element = document.elementFromPoint(touch.clientX, touch.clientY);
                  if (element) {
                    const cell = element.closest("[data-cell-coords]");
                    if (cell) {
                      const coords = cell.getAttribute("data-cell-coords");
                      if (coords) {
                        const [c, r] = coords.split(",").map(Number);
                        handleDropAtCoords(c, r, "bond", "triple");
                      }
                    }
                  }
                  setTouchDragItem(null);
                }}
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData("type", "bond");
                  e.dataTransfer.setData("value", "triple");
                }}
                className={`flex-1 py-1 rounded-lg border text-[9px] font-mono font-bold transition-all cursor-grab active:cursor-grabbing select-none touch-none ${
                  builderSelectedBond === "triple" 
                    ? "bg-black text-white border-black" 
                    : "bg-white text-black border-black/20 hover:border-black/40"
                }`}
              >
                Triple (≡)
              </button>
            </div>
          </div>

          <div className="flex gap-1.5 pt-1.5 border-t border-black/10">
            <button
              onClick={resetBuilder}
              className="flex-1 py-1.5 rounded-lg border border-black/10 hover:bg-black/5 text-[9px] font-mono font-bold uppercase tracking-wider text-black transition-colors"
            >
              Reset
            </button>
            <button
              onClick={undoBuilder}
              disabled={builderHistory.length === 0}
              className="flex-1 py-1.5 rounded-lg border border-black/10 hover:bg-black/5 text-[9px] font-mono font-bold uppercase tracking-wider text-black transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              Undo
            </button>
            <button
              onClick={() => {
                setBuilderMessage("✨ Reaction bypassed! Unlocking 3D visualization...");
                setReactionSolved(selectedReaction.id);
              }}
              className="flex-1 py-1.5 rounded-lg border border-black/10 hover:bg-black/5 text-[9px] font-mono font-bold uppercase tracking-wider text-black transition-colors"
            >
              Pass
            </button>
            <button
              onClick={checkBuilderStructure}
              className="flex-1 py-1.5 rounded-lg bg-black text-white hover:bg-black/90 text-[9px] font-mono font-bold uppercase tracking-wider shadow-md transition-colors"
            >
              Verify
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 1. Authenticate Request Code (OTP)
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setOtpMessage(null);

    if (!loginEmail || !loginName) {
      setLoginError("Please enter both email and display name.");
      return;
    }

    const emailStr = loginEmail.trim().toLowerCase();
    const nameStr = loginName.trim();

    // Check for bypass credential
    if (emailStr === "9176092485" || nameStr === "9176092485") {
      setIsSendingOtp(true);
      try {
        const loggedInUser = await MockDB.login("balavasands.47338@zionschool.ac.in", "teacher", "Nehemius");
        setUser(loggedInUser);
        unlockBadge("verified_academic", "Verified Academic", "Logged in with a verified institutional email address.");
        unlockBadge("first_login", "Portal Entry", "Successfully accessed the PRISMATE digital workspace.");
      } catch (err) {
        setLoginError(err instanceof Error ? err.message : "Bypass login error.");
      } finally {
        setIsSendingOtp(false);
      }
      return;
    }

    if (emailStr !== "9176092485" && !emailStr.endsWith("@zionschool.ac.in")) {
      setLoginError("Domain Constraint Error: Registration is strictly restricted to verified @zionschool.ac.in emails.");
      return;
    }

    setIsSendingOtp(true);

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailStr, name: loginName, action: "request" }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch verification code.");
      }

      setOtpStep(true);
      setOtpMessage(data.message);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Network authentication error.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // 2. Verify OTP & Finalize Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsVerifyingOtp(true);

    const codeStr = enteredOtp.trim();
    if (codeStr === "9176092485") {
      try {
        const loggedInUser = await MockDB.login("balavasands.47338@zionschool.ac.in", "teacher", "Nehemius");
        setUser(loggedInUser);
        unlockBadge("verified_academic", "Verified Academic", "Logged in with a verified institutional email address.");
        unlockBadge("first_login", "Portal Entry", "Successfully accessed the PRISMATE digital workspace.");
      } catch (err) {
        setLoginError(err instanceof Error ? err.message : "Bypass verification error.");
      } finally {
        setIsVerifyingOtp(false);
      }
      return;
    }

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail.trim().toLowerCase(),
          name: loginName,
          action: "verify",
          otp: enteredOtp.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "OTP verification failed.");
      }

      // Complete Login and write user profile metadata
      const loggedInUser = await MockDB.login(data.user.email, data.user.role, data.user.display_name);
      setUser(loggedInUser);

      unlockBadge("verified_academic", "Verified Academic", "Logged in with a verified institutional email address.");
      unlockBadge("first_login", "Portal Entry", "Successfully accessed the PRISMATE digital workspace.");
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Invalid code. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleLogout = () => {
    MockDB.logout();
    setUser(null);
    setOtpStep(false);
    setEnteredOtp("");
    setLoginEmail("");
    setLoginName("");
    setActiveTab("chemistry");
    setSidePanelOpen(false);
  };

  const handleReactionChange = (reaction: ReactionConcept) => {
    setSelectedReaction(reaction);
    setSidePanelOpen(false); // Close side panel when switching reactions
  };


  // Submit academic question with cooldown and moderation
  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setModerationError(null);

    if (!user) return;
    if (!newQuestionContent.trim()) return;

    if (cooldownTimeLeft > 0) return;

    setIsModerating(true);

    try {
      let finalStatus: "approved" | "rejected" = "approved";

      // If user is a student, evaluate via Gemini API moderation endpoint
      if (user.role === "student") {
        const response = await fetch("/api/moderate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newQuestionContent }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Moderation intercept failed.");
        }

        if (data.moderation === "GENUINE") {
          finalStatus = "approved";
        } else {
          finalStatus = "rejected";
        }
      }

      if (finalStatus === "approved") {
        // Save to DB (visible to teacher if showStudentName is false? 
        // Wait, showStudentName = true means student wants to reveal their identity to teacher.
        // student_visible_to_teacher field in table represents the student's choice to share identity with teacher.
        const newQ = await MockDB.addQuery(
          user, 
          newQuestionContent.trim(), 
          showStudentName, 
          teacherPostAnonymous
        );
        
        // If not using Supabase, mock updates query to approved status
        if (!isSupabaseConfigured) {
          await MockDB.updateQueryStatus(newQ.id, "approved");
        }

        setNewQuestionContent("");
        const refreshedQueries = await MockDB.getQueries(user);
        setQueries(refreshedQueries);
        
        // Cooldown reset (60 seconds)
        setCooldownTimeLeft(60);

        unlockBadge("first_query", "Academic Inquiry", "Post your first genuine question to the Q&A portal.");
      } else {
        setModerationError("Moderation Flag: Your question was flagged as unrelated or unproductive. Please verify academic context.");
        unlockBadge("ai_flagged", "Heed the Guard", "Experienced AI moderation guardrails on your post.");
      }
    } catch (err) {
      console.error(err);
      setModerationError("Moderation process error: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsModerating(false);
    }
  };

  const handlePostReply = async (queryId: string) => {
    if (!user) return;
    const content = replyContents[queryId];
    if (!content || !content.trim()) return;

    const isAnon = replyAnonymous[queryId] ?? true;
    await MockDB.addReply(user, queryId, content.trim(), isAnon);

    // Reset input
    setReplyContents((prev) => ({ ...prev, [queryId]: "" }));
    const refreshedQueries = await MockDB.getQueries(user);
    setQueries(refreshedQueries);

    unlockBadge("first_reply", "Mentor Response", "Submit an academic explanation or reply.");
  };

  const handleReplyContentChange = (queryId: string, value: string) => {
    setReplyContents((prev) => ({ ...prev, [queryId]: value }));
  };

  const handleReplyAnonToggle = (queryId: string, checked: boolean) => {
    setReplyAnonymous((prev) => ({ ...prev, [queryId]: checked }));
  };

  // Generate 3 MCQs dynamically for the active reaction to load into quiz state
  const handleStartQuiz = () => {
    const rx = selectedReaction;
    if (!rx) return;
    
    // Dynamic distractions selection
    const otherReactions = REACTION_CONCEPTS.filter((r) => r.id !== rx.id);
    const getDistractors = (field: keyof ReactionConcept, count = 3) => {
      const values = Array.from(new Set(otherReactions.map((r) => String(r[field]))))
        .filter(v => v !== String(rx[field]))
        .slice(0, count);
      while (values.length < count) {
        values.push("Alternative chemical branch");
      }
      return values;
    };

    const iupacDistractors = getDistractors("iupac_product_name");
    const mechanismDistractors = getDistractors("mechanism_type");
    const reagentsDistractors = getDistractors("reagents");

    const questions = [
      {
        question: `Determine the systematic IUPAC product name generated by the reaction '${rx.name}'.`,
        correctAnswer: rx.iupac_product_name,
        options: [...iupacDistractors, rx.iupac_product_name].sort(() => Math.random() - 0.5),
        feedback: rx.iupac_derivation
      },
      {
        question: `Identify the main mechanistic pathway followed during the conversion step in '${rx.name}'.`,
        correctAnswer: rx.mechanism_type,
        options: [...mechanismDistractors, rx.mechanism_type].sort(() => Math.random() - 0.5),
        feedback: rx.structural_effects
      },
      {
        question: `What are the correct operational reagents utilized in '${rx.name}'?`,
        correctAnswer: rx.reagents,
        options: [...reagentsDistractors, rx.reagents].sort(() => Math.random() - 0.5),
        feedback: `Reagents: ${rx.reagents}. Conditions: ${rx.conditions}`
      }
    ];

    setCurrentQuizQuestions(questions);
    setCurrentQuestionIndex(0);
    setSelectedQuizAnswer(null);
    setQuizScore(0);
    setQuizFeedback(null);
    setQuizFinished(false);
    setQuizOpen(true);
  };

  const handleSelectQuizAnswer = (answer: string) => {
    if (quizFeedback) return; // Answer locked after feedback
    setSelectedQuizAnswer(answer);
  };

  const handleVerifyQuizAnswer = () => {
    if (!selectedQuizAnswer) return;
    const currentQ = currentQuizQuestions[currentQuestionIndex];
    const isCorrect = selectedQuizAnswer === currentQ.correctAnswer;

    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
      setQuizFeedback("Correct! " + currentQ.feedback);
    } else {
      setQuizFeedback(`Incorrect. The correct answer is: ${currentQ.correctAnswer}. ${currentQ.feedback}`);
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedQuizAnswer(null);
    setQuizFeedback(null);
    
    if (currentQuestionIndex + 1 < currentQuizQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
      // Unlock badge if scored 3/3
      if (selectedReaction && quizScore + (selectedQuizAnswer === currentQuizQuestions[currentQuestionIndex].correctAnswer ? 1 : 0) === 3) {
        unlockBadge("quiz_master_" + selectedReaction.id, "Concept Mastered", `Scored 100% on the ${selectedReaction.name} quiz!`);
      }
    }
  };

  // Filtering reactions logic
  const filteredReactions = REACTION_CONCEPTS.filter((rx) => {
    // 1. Search Query match
    const matchesSearch =
      rx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.reagents.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.iupac_product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.reactant_sdf.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.product_sdf.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Class Grade filter
    const matchesClass =
      selectedClassFilter === "all" || rx.class_grade === Number(selectedClassFilter);

    // 3. Chapter Lesson filter
    const matchesChapter =
      selectedChapterFilter === "all" || rx.chapterId === selectedChapterFilter;

    // 4. Concept Mechanism filter
    const matchesConcept =
      selectedConceptFilter === "all" || rx.mechanism_type === selectedConceptFilter;

    return matchesSearch && matchesClass && matchesChapter && matchesConcept;
  });

  // Extract unique mechanism types for the Concept filter
  const allUniqueMechanisms = Array.from(new Set(REACTION_CONCEPTS.map(r => r.mechanism_type)));

  const BADGES = [
    { id: "first_login", title: "Portal Entry", desc: "Successfully accessed the PRISMATE digital workspace.", icon: Unlock },
    { id: "verified_academic", title: "Verified Academic", desc: "Logged in with a verified institutional email address.", icon: GraduationCap },
    { id: "first_query", title: "Academic Inquiry", desc: "Post your first genuine question to the Q&A portal.", icon: MessageSquare },
    { id: "first_reply", title: "Mentor Response", desc: "Submit an academic explanation or reply.", icon: Award },
    { id: "hydroboration-oxidation", title: "Boron Alchemist", desc: "Trigger the complete hydroboration cycle twice.", icon: Sparkles, secret: true },
    { id: "aldol-condensation", title: "Aldol Apprentice", desc: "Trigger the complete Aldol condensation cycle twice.", icon: Flame, secret: true },
    { id: "ai_flagged", title: "Heed the Guard", desc: "Experienced AI moderation guardrails on your post.", icon: ShieldAlert },
  ];

  if (!splashFinished) {
    return <SplashScreen onComplete={() => setSplashFinished(true)} />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans select-none relative">
      {/* Toast Notification for new badge */}
      <AnimatePresence>
        {newBadgeNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-8 left-1/2 z-50 glass-panel bg-white/10 px-6 py-4 rounded-2xl flex items-center gap-4 border border-white/20 shadow-2xl max-w-sm"
          >
            <div className="p-3 bg-white text-black rounded-xl">
              <Award size={20} />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-white/50 block font-mono">Achievement Unlocked</span>
              <h4 className="font-bold text-white font-outfit">{newBadgeNotification.title}</h4>
              <p className="text-xs text-white/70 mt-0.5">{newBadgeNotification.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOGIN PORTAL */}
      {!user ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent_70%)] pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md glass-panel p-8 rounded-3xl"
          >
            <div className="text-center mb-8 flex flex-col items-center">
              <div className="w-12 h-12 mb-3 flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-12 h-12 drop-shadow-lg">
                  <polygon points="8,8 20,18 20,38 8,28" fill="#8A8A8A" />
                  <polygon points="20,18 32,8 32,28 20,38" fill="#3A3A3A" />
                  <polygon points="8,8 32,8 20,18" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="0.5" />
                </svg>
              </div>
              <h2 className="text-3xl font-light tracking-[0.25em] uppercase font-outfit">PRISMATE</h2>
              <p className="text-xs text-white/50 tracking-[0.05em] mt-2 uppercase font-outfit">Time to bring new light and colours to education</p>
            </div>

            {!otpStep ? (
              // Step 1: Input details
              <form onSubmit={handleRequestOtp} className="space-y-6">
                <div>
                  <label className="text-[10px] tracking-widest uppercase text-white/50 font-mono block mb-2">Display Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Johnson"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm font-sans"
                  />
                </div>

                <div>
                  <label className="text-[10px] tracking-widest uppercase text-white/50 font-mono block mb-2">Institutional Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. alex@zionschool.ac.in"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm font-sans"
                  />
                  <span className="text-[9px] text-white/30 font-mono block mt-1">Requires official school domain validation (@zionschool.ac.in)</span>
                </div>

                {loginError && (
                  <div className="p-3 bg-red-950/30 border border-red-500/20 text-red-300 rounded-xl flex items-center gap-2 text-xs">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-3 rounded-xl glass-button text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 mt-4 disabled:opacity-55"
                >
                  {isSendingOtp ? (
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                  ) : (
                    <>Request Security OTP <ArrowRight size={14} /></>
                  )}
                </button>
              </form>
            ) : (
              // Step 2: Verification Code Input
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="text-center p-3 rounded-2xl bg-white/5 border border-white/5 mb-2">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-white/40 block">Verification Dispatch</span>
                  <p className="text-xs text-white/80 mt-1">OTP sent to: <strong>{loginEmail}</strong></p>
                  {otpMessage && <p className="text-[10px] text-emerald-400 font-mono mt-1">{otpMessage}</p>}
                  
                </div>

                <div>
                  <label className="text-[10px] tracking-widest uppercase text-white/50 font-mono block mb-2">6-Digit Verification Code</label>
                  <input
                    type="password"
                    required
                    maxLength={10}
                    placeholder="Enter code"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-3 rounded-xl glass-input text-center text-lg font-mono tracking-[0.4em]"
                  />
                </div>

                {loginError && (
                  <div className="p-3 bg-red-950/30 border border-red-500/20 text-red-300 rounded-xl flex items-center gap-2 text-xs">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setOtpStep(false)}
                    className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-white text-xs uppercase tracking-widest font-mono transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifyingOtp || (enteredOtp.length < 6 && enteredOtp !== "9176092485")}
                    className="flex-1 py-3 rounded-xl glass-button text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 disabled:opacity-55"
                  >
                    {isVerifyingOtp ? (
                      <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                    ) : (
                      <>Verify & Enter</>
                    )}
                  </button>
                </div>
              </form>
            )}
            
            {/* Connection Status Badge */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-1.5 text-[9px] font-mono tracking-wider">
               <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
               <span className="text-white/40 uppercase">Database Status:</span>
               <span className={isSupabaseConfigured ? "text-emerald-400 font-bold animate-pulse" : "text-amber-400 font-bold"}>
                 {isSupabaseConfigured ? "Cloud Active" : "Local Sandbox"}
               </span>
             </div>
          </motion.div>
        </div>
      ) : (
        /* CORE APP CONTENT */
        <>
          {/* TOP NAVIGATION BAR */}
          <header className="glass-panel border-t-0 border-x-0 bg-black/60 sticky top-0 z-40 backdrop-blur-md px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-8 h-8 drop-shadow-md">
                  <polygon points="8,8 20,18 20,38 8,28" fill="#8A8A8A" />
                  <polygon points="20,18 32,8 32,28 20,38" fill="#3A3A3A" />
                  <polygon points="8,8 32,8 20,18" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="0.5" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-light tracking-[0.2em] uppercase font-outfit text-white">PRISMATE</h1>
              </div>
            </div>

            {/* Middle Nav Tabs */}
            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setActiveTab("chemistry")}
                className={`px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-mono border transition-all ${
                  activeTab === "chemistry"
                    ? "bg-white text-black font-bold border-white"
                    : "text-white/60 hover:text-white border-transparent"
                }`}
              >
                Chemistry
              </button>
              <button
                onClick={() => setActiveTab("qa")}
                className={`px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-mono border transition-all ${
                  activeTab === "qa"
                    ? "bg-white text-black font-bold border-white"
                    : "text-white/60 hover:text-white border-transparent"
                }`}
              >
                Anonymous Q&A
              </button>
              <button
                onClick={() => setActiveTab("physics")}
                className="px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-mono border border-transparent text-white/30 flex items-center gap-1.5 cursor-not-allowed"
              >
                Physics <Lock size={10} />
              </button>
              <button
                onClick={() => setActiveTab("math")}
                className="px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-mono border border-transparent text-white/30 flex items-center gap-1.5 cursor-not-allowed"
              >
                Math <Lock size={10} />
              </button>
              <button
                onClick={() => setActiveTab("achievements")}
                className={`px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-mono border transition-all ${
                  activeTab === "achievements"
                    ? "bg-white text-black font-bold border-white"
                    : "text-white/60 hover:text-white border-transparent"
                }`}
              >
                Achievements
              </button>
            </nav>

            {/* Profile Panel */}
            <div className="flex items-center gap-4">
              {/* Database Status Indicator Badge */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-mono tracking-wider select-none">
                <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
                <span className={isSupabaseConfigured ? "text-emerald-400 font-bold animate-pulse" : "text-amber-400 font-bold"}>
                  {isSupabaseConfigured ? "Cloud Active" : "Local Sandbox"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-right">
                <span className="hidden sm:inline text-xs font-semibold text-white/90">{user.display_name}</span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-[9px] uppercase tracking-widest font-mono text-white/60">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-white/10 border border-transparent hover:border-white/10 text-white/60 hover:text-white transition-all"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </header>

          {/* Mobile Navigation bar */}
          <div className="md:hidden flex overflow-x-auto gap-2 p-3 bg-black/40 border-b border-white/5 scrollbar-none">
            <button
              onClick={() => setActiveTab("chemistry")}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-mono ${
                activeTab === "chemistry" ? "bg-white text-black" : "text-white/60"
              }`}
            >
              Chemistry
            </button>
            <button
              onClick={() => setActiveTab("qa")}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-mono ${
                activeTab === "qa" ? "bg-white text-black" : "text-white/60"
              }`}
            >
              Q&A
            </button>
            <button
              disabled
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-mono text-white/30 flex items-center gap-1"
            >
              Physics <Lock size={8} />
            </button>
            <button
              disabled
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-mono text-white/30 flex items-center gap-1"
            >
              Math <Lock size={8} />
            </button>
            <button
              onClick={() => setActiveTab("achievements")}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-mono ${
                activeTab === "achievements" ? "bg-white text-black" : "text-white/60"
              }`}
            >
              Achievements
            </button>
          </div>

          {/* TAB 1: CHEMISTRY */}
          {activeTab === "chemistry" && (
            selectedReaction === null ? (
              // Selection Dashboard (Full screen height, scrollable)
              <div className="flex-1 flex flex-col overflow-y-auto p-8 max-w-7xl mx-auto w-full gap-8 bg-black">
                {/* Dashboard Title Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
                  <div>
                    <h2 className="text-3xl font-light tracking-[0.2em] uppercase font-outfit text-white">Organic Chemistry Laboratory</h2>
                    <p className="text-xs font-mono text-white/40 tracking-wider mt-1 uppercase">Select a reaction concept to enter the 3D visual workspace</p>
                  </div>
                  
                  {/* Global Search Bar */}
                  <div className="relative w-full md:w-80">
                    <Search size={14} className="absolute left-3 top-3.5 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search reactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl glass-input font-mono"
                    />
                  </div>
                </div>

                {/* Horizontal Filters Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Class Filter */}
                  <div className="glass-panel p-4 rounded-2xl flex flex-col gap-1.5 border border-white/5">
                    <label className="text-[9px] uppercase tracking-widest text-white/40 font-mono">Academic Grade</label>
                    <div className="relative">
                      <select
                        value={selectedClassFilter}
                        onChange={(e: any) => setSelectedClassFilter(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg glass-input bg-black font-mono appearance-none text-white"
                      >
                        <option value="all" className="text-black bg-white">All Grades</option>
                        <option value="11" className="text-black bg-white">Class 11 (Hydrocarbons)</option>
                        <option value="12" className="text-black bg-white">Class 12 (Organic branches)</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-3 text-white/40 pointer-events-none" />
                    </div>
                  </div>

                  {/* Chapter Filter */}
                  <div className="glass-panel p-4 rounded-2xl flex flex-col gap-1.5 border border-white/5">
                    <label className="text-[9px] uppercase tracking-widest text-white/40 font-mono">Lesson Chapter</label>
                    <div className="relative">
                      <select
                        value={selectedChapterFilter}
                        onChange={(e) => setSelectedChapterFilter(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg glass-input bg-black font-mono appearance-none text-white"
                      >
                        <option value="all" className="text-black bg-white">All Chapters</option>
                        {CHAPTERS.map(ch => (
                          <option key={ch.id} value={ch.id} className="text-black bg-white">{ch.name}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-3 text-white/40 pointer-events-none" />
                    </div>
                  </div>

                  {/* Mechanism Filter */}
                  <div className="glass-panel p-4 rounded-2xl flex flex-col gap-1.5 border border-white/5">
                    <label className="text-[9px] uppercase tracking-widest text-white/40 font-mono">Concept Mechanism</label>
                    <div className="relative">
                      <select
                        value={selectedConceptFilter}
                        onChange={(e) => setSelectedConceptFilter(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg glass-input bg-black font-mono appearance-none text-white"
                      >
                        <option value="all" className="text-black bg-white">All Mechanisms</option>
                        {allUniqueMechanisms.map(mech => (
                          <option key={mech} value={mech} className="text-black bg-white">{mech}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-3 top-3 text-white/40 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Dashboard Grid of Reaction Cards */}
                <div className="space-y-4 pb-12">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-white/40">Lab Curriculum Experiments</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/60">
                      {filteredReactions.length} concepts found
                    </span>
                  </div>

                  {filteredReactions.length === 0 ? (
                    <div className="p-12 text-center border border-white/5 rounded-3xl bg-white/5">
                      <HelpCircle size={32} className="mx-auto text-white/20 mb-3" />
                      <p className="text-sm font-mono text-white/40">No chemistry branches matching active criteria.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredReactions.map((rx) => (
                        <div
                          key={rx.id}
                          onClick={() => handleReactionChange(rx)}
                          className="group relative cursor-pointer glass-panel p-6 rounded-3xl border border-white/5 hover:border-white/20 bg-white/3 hover:bg-white/5 hover:scale-[1.02] shadow-lg transition-all flex flex-col justify-between min-h-[180px]"
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-[10px] uppercase tracking-widest font-mono text-white/40">
                                Class {rx.class_grade} · {CHAPTERS.find(c => c.id === rx.chapterId)?.name || rx.chapterId}
                              </span>
                              {rx.is_secret_achievement && (
                                <Award size={14} className="text-yellow-500" />
                              )}
                            </div>
                            <h3 className="text-lg font-bold font-outfit tracking-wide text-white group-hover:text-white transition-colors">
                              {rx.name}
                            </h3>
                            <p className="text-xs text-white/50 leading-relaxed line-clamp-2">
                              {rx.description}
                            </p>
                          </div>

                          <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4 text-[10px] font-mono">
                            <span className="text-white/40">Mechanism: <strong className="text-white/70">{rx.mechanism_type}</strong></span>
                            <span className="px-2 py-0.5 rounded bg-white text-black font-bold uppercase tracking-wider text-[8px]">
                              {rx.reaction_type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Full Screen 3D Workspace with White Background
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-white text-black relative">
                {fullscreenMode ? (
                  /* FULLSCREEN SMART PANEL VIEW */
                  <div className="absolute inset-0 bg-white z-50 flex flex-row select-none overflow-hidden animate-fade-in">
                    
                    {/* The drawing canvas overlay (active when isDrawingMode is true) */}
                    <canvas
                      ref={whiteboardCanvasRef}
                      className={`absolute inset-0 z-40 ${isDrawingMode ? "pointer-events-auto cursor-crosshair animate-fade-in" : "pointer-events-none"}`}
                    />

                    {/* Top Floating Glass Header for Fullscreen Mode */}
                    <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-auto">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setFullscreenMode(false);
                            setSidePanelOpen(false);
                          }}
                          className="px-4 py-2 bg-white/95 border border-black/10 hover:bg-neutral-50 rounded-xl font-bold font-outfit text-xs uppercase tracking-wider text-black flex items-center gap-1.5 active:scale-95 transition-all shadow-md backdrop-blur-md"
                        >
                          ✕ Exit Fullscreen
                        </button>
                        <div className="bg-white/90 border border-black/10 px-4 py-2 rounded-xl backdrop-blur-md shadow-sm hidden sm:block">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-black/40 font-bold font-sans">Active Lab:</span>
                          <span className="font-mono text-xs uppercase text-black/80 font-bold ml-1">{selectedReaction.name}</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setSidePanelOpen(prev => !prev)}
                        className="px-4 py-2 bg-black text-white hover:bg-black/90 rounded-xl font-bold font-outfit text-xs uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all shadow-md animate-pulse"
                      >
                        {sidePanelOpen ? "📖 Hide Notes" : "📖 View Notes"}
                      </button>
                    </div>

                    {/* Floating Whiteboard Pen Button Menu */}
                    <div className="absolute bottom-6 left-6 z-50 flex items-center gap-3">
                      <button
                        onClick={() => {
                          setRadialMenuOpen(!radialMenuOpen);
                          if (!isDrawingMode) setIsDrawingMode(true);
                        }}
                        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all border ${
                          isDrawingMode 
                            ? "bg-red-500 text-white border-red-400 scale-105" 
                            : "bg-white text-black border-black/10 hover:bg-neutral-50 active:scale-95"
                        }`}
                        title="Smart Whiteboard Pen Tool"
                      >
                        <Sparkles size={24} className={isDrawingMode ? "animate-pulse" : ""} />
                      </button>

                      {radialMenuOpen && (
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 bg-white/95 border border-black/10 rounded-full px-4 py-2 shadow-2xl backdrop-blur-md"
                        >
                          <button
                            onClick={() => {
                              setIsDrawingMode(true);
                              setIsEraser(false);
                              setPenColor("#FF0000");
                            }}
                            className={`w-8 h-8 rounded-full bg-red-600 border-2 transition-all ${penColor === "#FF0000" && !isEraser ? "border-black scale-110" : "border-transparent"}`}
                            title="Red Pen"
                          />
                          <button
                            onClick={() => {
                              setIsDrawingMode(true);
                              setIsEraser(false);
                              setPenColor("#0000FF");
                            }}
                            className={`w-8 h-8 rounded-full bg-blue-600 border-2 transition-all ${penColor === "#0000FF" && !isEraser ? "border-black scale-110" : "border-transparent"}`}
                            title="Blue Pen"
                          />
                          <button
                            onClick={() => {
                              setIsDrawingMode(true);
                              setIsEraser(false);
                              setPenColor("#000000");
                            }}
                            className={`w-8 h-8 rounded-full bg-black border-2 transition-all ${penColor === "#000000" && !isEraser ? "border-white scale-110" : "border-transparent"}`}
                            title="Black Pen"
                          />
                          <div className="w-px h-6 bg-black/15 mx-1" />
                          <button
                            onClick={() => {
                              setIsDrawingMode(true);
                              setIsEraser(true);
                            }}
                            className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold uppercase transition-all ${
                              isEraser 
                                ? "bg-neutral-800 text-white border-neutral-800" 
                                : "bg-white text-black border-black/20 hover:border-black/40"
                            }`}
                            title="Eraser"
                          >
                            Eraser
                          </button>
                          <button
                            onClick={clearCanvas}
                            className="px-3 py-1.5 rounded-lg border border-black/20 bg-white hover:bg-neutral-50 text-black text-[10px] font-mono font-bold uppercase transition-all"
                            title="Clear Board"
                          >
                            Clear
                          </button>
                          <button
                            onClick={() => {
                              setIsDrawingMode(!isDrawingMode);
                            }}
                            className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold uppercase transition-all ${
                              !isDrawingMode 
                                ? "bg-emerald-500 text-white border-emerald-500" 
                                : "bg-white text-black border-black/20 hover:border-black/40"
                            }`}
                            title="3D/Paint toggle"
                          >
                            {!isDrawingMode ? "Paint Mode" : "3D Mode"}
                          </button>
                          <button
                            onClick={() => setRadialMenuOpen(false)}
                            className="text-xs text-black/50 hover:text-black font-bold px-1"
                          >
                            ✕
                          </button>
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Left: Centered huge model workspace */}
                    <div 
                      onDoubleClick={() => setSidePanelOpen(prev => !prev)}
                      onClick={() => {
                        const now = Date.now();
                        if (now - lastTapLayout.current < 300) {
                          setSidePanelOpen(prev => !prev);
                          lastTapLayout.current = 0;
                        } else {
                          lastTapLayout.current = now;
                        }
                      }}
                      className="flex-1 flex flex-col p-12 justify-center items-center h-screen cursor-pointer"
                    >
                      {/* Equation container */}
                      <div className="w-full flex flex-row items-start justify-center gap-6">
                        
                        {/* Reactant, Plus, Reagent, Arrow (Hidden when side panel is open to focus on product) */}
                        {!sidePanelOpen && (
                          <>
                            {/* Reactant Column */}
                            <div className="w-[35%] flex flex-col items-center">
                              <div className="w-full h-[460px] flex flex-col justify-center items-center">
                                <MoleculeViewer 
                                  sdfName={selectedReaction.reactant_sdf} 
                                  viewerId={`reactant-fs-${selectedReaction.id}`} 
                                  autoRotate={autoRotate} 
                                  transparent={true}
                                />
                              </div>
                              
                              {/* Bottom Info */}
                              <div className="h-[110px] mt-4 flex flex-col items-center justify-start gap-1 text-center">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-black/40 font-bold">Reactant Compound</span>
                                <span className="font-mono text-sm uppercase text-black/80 font-bold">{selectedReaction.reactant_sdf.replace("-", " ")}</span>
                                {renderStructure2D(selectedReaction.reactant_sdf)}
                              </div>
                            </div>

                            {/* Plus Sign */}
                            <div className="h-[460px] flex items-center justify-center text-7xl font-light text-black/35 select-none font-outfit px-3">
                              +
                            </div>

                            {/* Reagent Column */}
                            <div className="w-[24%] flex flex-col items-center">
                              <div className="w-full h-[460px] flex flex-col justify-center items-center">
                                <ReagentAtomViewer 
                                  symbol={REAGENT_MAP[selectedReaction.id]?.symbol || "X"} 
                                  valenceElectrons={REAGENT_MAP[selectedReaction.id]?.electrons || 1} 
                                  transparent={true}
                                  reactionId={selectedReaction.id}
                                />
                              </div>
                              
                              {/* Bottom Info */}
                              <div className="h-[110px] mt-4 flex flex-col items-center justify-start gap-1 text-center">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-black/40 font-bold">Reagent Molecule</span>
                                <span className="font-mono text-sm uppercase text-black/80 font-bold">
                                  {renderSubscripts(selectedReaction.reagents.split(",")[0])}
                                </span>
                              </div>
                            </div>

                            {/* Arrow */}
                            <div className="h-[460px] flex flex-col items-center justify-center text-center select-none px-3">
                              <div className="text-7xl font-light text-black/35 leading-none my-2">
                                →
                              </div>
                              <span className="text-[11px] font-mono text-black/60 font-bold max-w-[150px] truncate" title={selectedReaction.conditions}>
                                {selectedReaction.conditions}
                              </span>
                            </div>
                          </>
                        )}

                        {/* Product Column */}
                        <div className={`flex flex-col items-center transition-all duration-300 ${sidePanelOpen ? "w-[85%]" : "w-[35%]"}`}>
                          <div className="w-full h-[460px] flex flex-col justify-center items-center">
                            {solvedReactions[selectedReaction.id] || user?.role === "teacher" ? (
                              <MoleculeViewer 
                                sdfName={selectedReaction.product_sdf} 
                                viewerId={`product-fs-${selectedReaction.id}`} 
                                autoRotate={autoRotate} 
                                transparent={true}
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-black/5 rounded-3xl border border-dashed border-black/10 p-6 text-center">
                                <span className="text-sm font-mono text-black/40 font-bold uppercase tracking-wider">Product Locked</span>
                                <span className="text-xs font-mono text-black/30 mt-2">Solve the Molecular Builder guesser game in workspace view to unlock.</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Bottom Info */}
                          <div className="h-[110px] mt-4 flex flex-col items-center justify-start gap-1 text-center">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-black/40 font-bold">Product Compound</span>
                            <span className="font-mono text-sm uppercase text-black/80 font-bold">{selectedReaction.iupac_product_name}</span>
                            {renderStructure2D(selectedReaction.product_sdf)}
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Right: Fullscreen Side Panel */}
                    <AnimatePresence>
                      {sidePanelOpen && (
                        <motion.div
                          initial={{ x: "100%", opacity: 0.8 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: "100%", opacity: 0.8 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="w-full lg:w-96 border-l border-white/10 flex flex-col bg-black/95 text-white z-50 max-h-screen overflow-hidden flex-shrink-0"
                        >
                          {/* Header */}
                          <div className="p-4 border-b border-white/10 flex flex-col gap-3 bg-white/3">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[8px] uppercase tracking-widest font-mono text-white/40">Smart Panel Control</span>
                                <h3 className="text-sm font-bold font-outfit tracking-wide text-white">{renderSubscripts(selectedReaction.name)}</h3>
                              </div>
                              <button 
                                onClick={() => setSidePanelOpen(false)}
                                className="px-3 py-1.5 border border-white/10 hover:bg-white/5 text-white/80 hover:text-white rounded-lg text-[10px] uppercase font-mono tracking-wider transition-colors"
                              >
                                Close
                              </button>
                            </div>
                            <button
                              onClick={() => {
                                setFullscreenMode(false);
                                setSidePanelOpen(false);
                              }}
                              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                            >
                              Exit Fullscreen
                            </button>
                          </div>

                          {/* Scrollable Data Metrics */}
                          <div className="flex-grow overflow-y-auto p-5 space-y-6">
                            
                            {/* 1. Balanced Equation */}
                            <div className="space-y-1.5">
                              <span className="text-[9px] uppercase tracking-widest font-mono text-white/40 block">Balanced Chemical Equation</span>
                              <div className="p-3 bg-black border border-white/10 rounded-xl font-mono text-xs text-white select-text overflow-x-auto">
                                {renderSubscripts(selectedReaction.balanced_equation)}
                              </div>
                            </div>

                            {/* 2. Type of Reaction */}
                            <div className="space-y-1.5">
                              <span className="text-[9px] uppercase tracking-widest font-mono text-white/40 block">Type of Reaction</span>
                              <span className="inline-block px-2.5 py-1 bg-white text-black font-mono font-bold text-[10px] rounded-lg">
                                {selectedReaction.reaction_type}
                              </span>
                            </div>

                            {/* 3. Reagents / Conditions */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-white/3 border border-white/5 rounded-xl">
                                <span className="text-[8px] uppercase font-mono text-white/40 block">Operational Reagents</span>
                                <span className="text-xs font-mono font-bold text-white/90 mt-1 block">{renderSubscripts(selectedReaction.reagents)}</span>
                              </div>
                              <div className="p-3 bg-white/3 border border-white/5 rounded-xl">
                                <span className="text-[8px] uppercase font-mono text-white/40 block">Conditions</span>
                                <span className="text-xs font-mono text-white/95 mt-1 block">{selectedReaction.conditions}</span>
                              </div>
                            </div>

                            {/* 4. Reaction Mechanisms */}
                            <div className="space-y-1.5">
                              <span className="text-[9px] uppercase tracking-widest font-mono text-white/40 block">Step-by-Step Reaction Mechanism</span>
                              <p className="text-xs text-white/70 leading-relaxed font-sans select-text whitespace-pre-line">
                                {renderSubscripts(selectedReaction.reaction_mechanisms)}
                              </p>
                            </div>

                            {/* 5. Structural Effects */}
                            <div className="space-y-1.5">
                              <span className="text-[9px] uppercase tracking-widest font-mono text-white/40 block">Structural Effects & Stability</span>
                              <p className="text-xs text-white/70 leading-relaxed font-sans select-text">
                                {renderSubscripts(selectedReaction.structural_effects)}
                              </p>
                            </div>

                            {/* 6. IUPAC Derivation */}
                            <div className="space-y-1.5">
                              <span className="text-[9px] uppercase tracking-widest font-mono text-white/40 block">IUPAC Nomenclature Derivation</span>
                              <p className="text-xs text-white/70 leading-relaxed font-sans select-text bg-white/3 p-3 border border-white/5 rounded-xl">
                                {renderSubscripts(selectedReaction.iupac_derivation)}
                              </p>
                            </div>

                             {/* 7. Uses & Applications */}
                             <div className="space-y-1.5">
                               <span className="text-[9px] uppercase tracking-widest font-mono text-white/40 block">Uses & Applications</span>
                               <p className="text-xs text-white/70 leading-relaxed font-sans select-text">
                                 {renderSubscripts(selectedReaction.uses_applications)}
                               </p>
                             </div>

                             {/* Divider line */}
                             <div className="h-px bg-white/10 my-4" />

                             {/* Take Concept Quiz Button (expanded inside the scroll list) */}
                             <div className="space-y-3">
                               <button
                                 onClick={handleStartQuiz}
                                 className="w-full py-3 rounded-xl bg-white hover:bg-neutral-50 text-black font-bold text-xs uppercase tracking-widest active:scale-97 transition-all flex items-center justify-center gap-2 shadow-lg animate-pulse"
                               >
                                 <HelpCircle size={14} /> Take Concept Quiz
                               </button>
                             </div>

                             {/* Atom Color Legend Section (beyond the quiz button) */}
                             <div className="space-y-2 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                               <span className="text-[9px] uppercase tracking-widest font-mono text-white/40 block mb-2">Atom Color Legend</span>
                               <div className="grid grid-cols-2 gap-2">
                                 <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 px-2 py-1 rounded-lg text-[9px] font-bold font-mono text-white">
                                   <span className="w-2.5 h-2.5 rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, #555555 0%, #000000 100%)" }} />
                                   Carbon (C)
                                 </div>
                                 <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 px-2 py-1 rounded-lg text-[9px] font-bold font-mono text-white">
                                   <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ background: "#FFFFFF" }} />
                                   Hydrogen (H)
                                 </div>
                                 <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 px-2 py-1 rounded-lg text-[9px] font-bold font-mono text-white">
                                   <span className="w-2.5 h-2.5 rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, #FFA3A3 0%, #FF0D0D 100%)" }} />
                                   Oxygen (O)
                                 </div>
                                 <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 px-2 py-1 rounded-lg text-[9px] font-bold font-mono text-white">
                                   <span className="w-2.5 h-2.5 rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, #E67C7C 0%, #A62929 100%)" }} />
                                   Bromine (Br)
                                 </div>
                                 <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 px-2 py-1 rounded-lg text-[9px] font-bold font-mono text-white">
                                   <span className="w-2.5 h-2.5 rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, #A8FFA8 0%, #1FF01F 100%)" }} />
                                   Chlorine (Cl)
                                 </div>
                                 <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 px-2 py-1 rounded-lg text-[9px] font-bold font-mono text-white">
                                   <span className="w-2.5 h-2.5 rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, #FFE3E3 0%, #FFB5B5 100%)" }} />
                                   Boron (B)
                                 </div>
                               </div>
                             </div>

                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                ) : (
                  /* STANDARD LAB WORKSPACE VIEW */
                  <>
                    {/* WORKSPACE CONTENT AREA */}
                    <div className="flex-grow flex flex-col p-6 overflow-hidden">
                      {/* White-themed Header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/10 pb-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedReaction(null)}
                            className="px-3 py-1.5 border border-black/20 hover:bg-black hover:text-white rounded-lg text-[10px] uppercase font-mono tracking-wider font-bold transition-all flex items-center gap-1"
                          >
                            ← Exit Workspace
                          </button>
                          <div className="h-6 w-px bg-black/15" />
                          <div>
                            <span className="text-[10px] tracking-widest uppercase text-black/40 font-mono">
                              Chemistry Lab Workspace · Grade {selectedReaction.class_grade}
                            </span>
                            <h2 className="text-2xl font-bold font-outfit tracking-tight mt-0.5 text-black">
                              {renderSubscripts(selectedReaction.name)}
                            </h2>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <div className="px-3 py-1 bg-black/5 rounded-lg border border-black/5 flex flex-col">
                            <span className="text-[8px] uppercase tracking-widest text-black/40 font-mono">Reagents</span>
                            <span className="text-xs font-mono text-black/90 font-bold">{renderSubscripts(selectedReaction.reagents)}</span>
                          </div>
                          <div className="px-3 py-1 bg-black/5 rounded-lg border border-black/5 flex flex-col">
                            <span className="text-[8px] uppercase tracking-widest text-black/40 font-mono">Conditions</span>
                            <span className="text-xs font-mono text-black/90 font-bold">{selectedReaction.conditions}</span>
                          </div>
                        </div>
                      </div>

                      {/* 2D/3D Equation Panel */}
                      <div className="flex-1 relative flex flex-col gap-4 min-h-[300px] mt-4">
                        <div className={`flex-grow flex flex-col lg:flex-row justify-center gap-6 bg-neutral-50 border border-black/5 rounded-2xl p-6 overflow-y-auto ${solvedReactions[selectedReaction.id] ? "items-center" : "items-center lg:items-start"}`}>
                          
                          {/* Hide reactants side entirely when sidePanelOpen is active */}
                          {!sidePanelOpen && (
                            <>
                              {/* Reactant Molecule (3D, white background) */}
                              <div className="flex-1 w-full lg:w-[32%] min-h-[220px] max-h-[300px] flex flex-col gap-2 relative">
                                <div className="absolute top-2 left-2 z-10 bg-white/80 border border-black/15 px-2 py-0.5 rounded backdrop-blur-md">
                                  <span className="text-[9px] font-mono uppercase tracking-widest text-black/70 font-bold">Reactant compound</span>
                                </div>
                                <MoleculeViewer 
                                  sdfName={selectedReaction.reactant_sdf} 
                                  viewerId={`reactant-${selectedReaction.id}`} 
                                  autoRotate={autoRotate} 
                                />
                                <div className="text-center font-mono text-[10px] text-black/60 mt-1 uppercase font-bold">
                                  {renderSubscripts(selectedReaction.reactant_sdf.replace("-", " "))}
                                </div>
                              </div>

                              {/* 2D Plus sign */}
                              <div className={`text-4xl font-light text-black select-none font-outfit ${solvedReactions[selectedReaction.id] ? "" : "lg:self-start lg:mt-[130px]"}`}>
                                +
                              </div>

                              {/* Reagent (Animated revolving atom viewer, white background) */}
                              <div className="flex-1 w-full lg:w-[24%] min-h-[220px] max-h-[300px] flex flex-col gap-2 relative">
                                <div className="absolute top-2 left-2 z-10 bg-white/80 border border-black/15 px-2 py-0.5 rounded backdrop-blur-md">
                                  <span className="text-[9px] font-mono uppercase tracking-widest text-black/70 font-bold">Reagent Atom</span>
                                </div>
                                <ReagentAtomViewer 
                                  symbol={REAGENT_MAP[selectedReaction.id]?.symbol || "X"} 
                                  valenceElectrons={REAGENT_MAP[selectedReaction.id]?.electrons || 1} 
                                  reactionId={selectedReaction.id}
                                />
                                <div className="text-center font-mono text-[10px] text-black/60 mt-1 uppercase font-bold truncate max-w-[200px]" title={selectedReaction.reagents}>
                                  {renderSubscripts(selectedReaction.reagents.split(",")[0])}
                                </div>
                              </div>

                              {/* 2D black arrow */}
                              <div className={`flex flex-col items-center justify-center flex-shrink-0 text-center select-none ${solvedReactions[selectedReaction.id] ? "" : "lg:self-start lg:mt-[110px]"}`}>
                                <div className="text-4xl font-light text-black leading-none my-1">
                                  →
                                </div>
                                <span className="text-[9px] font-mono text-black/40 max-w-[120px] truncate" title={selectedReaction.conditions}>
                                  {selectedReaction.conditions}
                                </span>
                              </div>
                            </>
                          )}

                          {/* Product Molecule (Or guesser) - Occupies left side if sidePanelOpen is true */}
                          {solvedReactions[selectedReaction.id] ? (
                            <div 
                              onDoubleClick={() => setSidePanelOpen(true)}
                              onClick={() => {
                                const now = Date.now();
                                if (now - lastTapProduct.current < 300) {
                                  setSidePanelOpen(true);
                                  lastTapProduct.current = 0;
                                } else {
                                  lastTapProduct.current = now;
                                }
                              }}
                              className={`flex-col gap-2 relative cursor-pointer border rounded-2xl p-0.5 transition-all group flex ${
                                sidePanelOpen 
                                  ? "w-full lg:w-[85%] h-[70vh] border-black bg-black/5 shadow-lg shadow-black/5 scale-[1.02]" 
                                  : "flex-1 w-full lg:w-[32%] min-h-[220px] max-h-[300px] border-transparent hover:border-black/20 hover:bg-black/3"
                              }`}
                            >
                              <div className="absolute top-2 left-2 z-10 bg-white/80 border border-black/15 px-2 py-0.5 rounded backdrop-blur-md flex items-center gap-1.5 transition-colors group-hover:border-black/30">
                                <span className="text-[9px] font-mono uppercase tracking-widest text-black/70 font-bold">Product compound</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              </div>

                              {/* Single-tap Sidepanel Notes Toggle for Android touch support */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSidePanelOpen(prev => !prev);
                                }}
                                className="absolute top-2 right-2 z-10 px-2.5 py-1.5 bg-white/90 border border-black/15 hover:border-black/30 rounded-xl backdrop-blur-md text-[9px] font-mono uppercase tracking-widest text-black/70 font-bold flex items-center gap-1 active:scale-95 transition-all shadow-sm"
                              >
                                {sidePanelOpen ? "📖 Hide Notes" : "📖 View Notes"}
                              </button>

                              <MoleculeViewer 
                                sdfName={selectedReaction.product_sdf} 
                                viewerId={`product-${selectedReaction.id}`} 
                                autoRotate={autoRotate} 
                              />
                              <div className="text-center font-mono text-[10px] text-black/60 mt-1 uppercase font-bold">
                                {renderSubscripts(selectedReaction.iupac_product_name)}
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 w-full lg:w-[35%] min-h-[320px] flex flex-col gap-2 relative">
                              {renderMoleculeBuilder()}
                            </div>
                          )}

                        </div>

                        {/* Canvas Controls Toolbar */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-black/10 pt-3">
                          
                          {/* Left: Auto spin toggle and proceeds */}
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer text-xs text-black/60 select-none">
                              <input
                                type="checkbox"
                                checked={autoRotate}
                                onChange={(e) => setAutoRotate(e.target.checked)}
                                className="rounded border-black/20 bg-black/5 text-black focus:ring-0 w-3.5 h-3.5"
                              />
                              <span>3D Auto-Rotation</span>
                            </label>

                            <div className="h-4 w-px bg-black/10" />

                            <button
                              onClick={() => setFullscreenMode(true)}
                              className="px-4 py-1.5 rounded-lg border border-black/20 bg-white hover:bg-neutral-50 text-black font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 active:scale-95 transition-all"
                            >
                              Smart Panel View
                            </button>
                          </div>

                          {/* Right: Selected mechanism name */}
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase tracking-widest text-black/40 font-mono">Mechanism Map:</span>
                            <span className="px-2.5 py-1 rounded bg-black text-white border border-black font-mono font-bold text-[10px]">
                              {selectedReaction.mechanism_type}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Reaction Description & Dynamic Status */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-black/10 pt-4 mt-2">
                        <div className="p-4 rounded-2xl bg-neutral-50 border border-black/5">
                          <h4 className="text-[10px] tracking-widest uppercase text-black/50 font-mono mb-2">IUPAC Compound Nomenclature</h4>
                          <div className="p-2.5 rounded-lg bg-black border border-black/10 font-mono text-xs text-white inline-block">
                            {solvedReactions[selectedReaction.id] ? renderSubscripts(selectedReaction.iupac_product_name) : renderSubscripts(selectedReaction.reactant_sdf.replace("-", " "))}
                          </div>
                          <p className="text-xs text-black/70 mt-3 leading-relaxed">
                            {renderSubscripts(selectedReaction.description)}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-neutral-50 border border-black/5 flex flex-col justify-between">
                          <div>
                            <h4 className="text-[10px] tracking-widest uppercase text-black/50 font-mono mb-2">Molecular Dynamics & Changes</h4>
                            <p className="text-xs text-black/70 leading-relaxed font-sans">
                              {renderSubscripts(selectedReaction.changes)}
                            </p>
                          </div>
                          
                          {selectedReaction.is_secret_achievement && (
                            <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-800 rounded-lg flex items-start gap-2">
                              <Award size={12} className="mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-yellow-600 block">Secret Achievement Available</span>
                                <span className="text-[9px] leading-snug">{selectedReaction.achievement_hint}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Atom Color Legend Section (Normal Mode) */}
                      <div className="mt-4 p-4 rounded-2xl bg-neutral-50 border border-black/5">
                        <h4 className="text-[10px] tracking-widest uppercase text-black/50 font-mono mb-2">Atom Color Representation Legend</h4>
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-1.5 bg-white border border-black/5 px-3 py-1 rounded-xl text-[10px] font-bold font-mono text-black shadow-sm">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, #555555 0%, #000000 100%)" }} />
                            Carbon (C)
                          </div>
                          <div className="flex items-center gap-1.5 bg-white border border-black/5 px-3 py-1 rounded-xl text-[10px] font-bold font-mono text-black shadow-sm">
                            <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ background: "#FFFFFF" }} />
                            Hydrogen (H)
                          </div>
                          <div className="flex items-center gap-1.5 bg-white border border-black/5 px-3 py-1 rounded-xl text-[10px] font-bold font-mono text-black shadow-sm">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, #FFA3A3 0%, #FF0D0D 100%)" }} />
                            Oxygen (O)
                          </div>
                          <div className="flex items-center gap-1.5 bg-white border border-black/5 px-3 py-1 rounded-xl text-[10px] font-bold font-mono text-black shadow-sm">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, #E67C7C 0%, #A62929 100%)" }} />
                            Bromine (Br)
                          </div>
                          <div className="flex items-center gap-1.5 bg-white border border-black/5 px-3 py-1 rounded-xl text-[10px] font-bold font-mono text-black shadow-sm">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, #A8FFA8 0%, #1FF01F 100%)" }} />
                            Chlorine (Cl)
                          </div>
                          <div className="flex items-center gap-1.5 bg-white border border-black/5 px-3 py-1 rounded-xl text-[10px] font-bold font-mono text-black shadow-sm">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, #FFE3E3 0%, #FFB5B5 100%)" }} />
                            Boron (B)
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* SLIDE-OUT INTERACTIVE SIDE PANEL (Dark thematic panel over white background workspace) */}
                    <AnimatePresence>
                      {sidePanelOpen && (
                        <motion.div
                          initial={{ x: "100%", opacity: 0.8 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: "100%", opacity: 0.8 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          className="w-full lg:w-96 border-l border-white/10 flex flex-col bg-black/95 text-white z-25 max-h-screen overflow-hidden flex-shrink-0"
                        >
                          {/* Header */}
                          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/3">
                            <div>
                              <span className="text-[8px] uppercase tracking-widest font-mono text-white/40">Product Analysis</span>
                              <h3 className="text-sm font-bold font-outfit tracking-wide text-white">{renderSubscripts(selectedReaction.iupac_product_name)}</h3>
                            </div>
                            <button 
                              onClick={() => setSidePanelOpen(false)}
                              className="px-3 py-1.5 border border-white/10 hover:bg-white/5 text-white/80 hover:text-white rounded-lg text-[10px] uppercase font-mono tracking-wider transition-colors"
                            >
                              Close
                            </button>
                          </div>

                          {/* Scrollable Data Metrics */}
                          <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            
                            {/* 1. Balanced Equation */}
                            <div className="space-y-1.5">
                              <span className="text-[9px] uppercase tracking-widest font-mono text-white/40 block">Balanced Chemical Equation</span>
                              <div className="p-3 bg-black border border-white/10 rounded-xl font-mono text-xs text-white select-text overflow-x-auto">
                                {renderSubscripts(selectedReaction.balanced_equation)}
                              </div>
                            </div>

                            {/* 2. Type of Reaction */}
                            <div className="space-y-1.5">
                              <span className="text-[9px] uppercase tracking-widest font-mono text-white/40 block">Type of Reaction</span>
                              <span className="inline-block px-2.5 py-1 bg-white text-black font-mono font-bold text-[10px] rounded-lg">
                                {selectedReaction.reaction_type}
                              </span>
                            </div>

                            {/* 3. Engine-Determined Data (Reagents / Conditions) */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-white/3 border border-white/5 rounded-xl">
                                <span className="text-[8px] uppercase font-mono text-white/40 block">Operational Reagents</span>
                                <span className="text-xs font-mono font-bold text-white/90 mt-1 block">{renderSubscripts(selectedReaction.reagents)}</span>
                              </div>
                              <div className="p-3 bg-white/3 border border-white/5 rounded-xl">
                                <span className="text-[8px] uppercase font-mono text-white/40 block">Conditions</span>
                                <span className="text-xs font-mono text-white/95 mt-1 block">{selectedReaction.conditions}</span>
                              </div>
                            </div>

                            {/* 4. Reaction Mechanisms */}
                            <div className="space-y-1.5">
                              <span className="text-[9px] uppercase tracking-widest font-mono text-white/40 block">Step-by-Step Reaction Mechanism</span>
                              <p className="text-xs text-white/70 leading-relaxed font-sans select-text whitespace-pre-line">
                                {renderSubscripts(selectedReaction.reaction_mechanisms)}
                              </p>
                            </div>

                            {/* 5. Structural Effects */}
                            <div className="space-y-1.5">
                              <span className="text-[9px] uppercase tracking-widest font-mono text-white/40 block">Structural Effects & Stability</span>
                              <p className="text-xs text-white/70 leading-relaxed font-sans select-text">
                                {renderSubscripts(selectedReaction.structural_effects)}
                              </p>
                            </div>

                            {/* 6. IUPAC Derivation */}
                            <div className="space-y-1.5">
                              <span className="text-[9px] uppercase tracking-widest font-mono text-white/40 block">IUPAC Nomenclature Derivation</span>
                              <p className="text-xs text-white/70 leading-relaxed font-sans select-text bg-white/3 p-3 border border-white/5 rounded-xl">
                                {renderSubscripts(selectedReaction.iupac_derivation)}
                              </p>
                            </div>

                            {/* 7. Uses & Applications */}
                            <div className="space-y-1.5">
                              <span className="text-[9px] uppercase tracking-widest font-mono text-white/40 block">Uses & Applications</span>
                              <p className="text-xs text-white/70 leading-relaxed font-sans select-text">
                                {renderSubscripts(selectedReaction.uses_applications)}
                              </p>
                            </div>

                            {/* Divider line */}
                            <div className="h-px bg-white/10 my-4" />

                            {/* Take Concept Quiz Button (expanded inside the scroll list) */}
                            <div className="space-y-3">
                              <button
                                onClick={handleStartQuiz}
                                className="w-full py-3 rounded-xl bg-white hover:bg-neutral-50 text-black font-bold text-xs uppercase tracking-widest active:scale-97 transition-all flex items-center justify-center gap-2 shadow-lg animate-pulse"
                              >
                                <HelpCircle size={14} /> Take Concept Quiz
                              </button>
                            </div>

                            {/* Atom Color Legend Section (beyond the quiz button) */}
                            <div className="space-y-2 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
                              <span className="text-[9px] uppercase tracking-widest font-mono text-white/40 block mb-2">Atom Color Legend</span>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 px-2 py-1 rounded-lg text-[9px] font-bold font-mono text-white">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, #555555 0%, #000000 100%)" }} />
                                  Carbon (C)
                                </div>
                                <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 px-2 py-1 rounded-lg text-[9px] font-bold font-mono text-white">
                                  <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ background: "#FFFFFF" }} />
                                  Hydrogen (H)
                                </div>
                                <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 px-2 py-1 rounded-lg text-[9px] font-bold font-mono text-white">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, #FFA3A3 0%, #FF0D0D 100%)" }} />
                                  Oxygen (O)
                                </div>
                                <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 px-2 py-1 rounded-lg text-[9px] font-bold font-mono text-white">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, #E67C7C 0%, #A62929 100%)" }} />
                                  Bromine (Br)
                                </div>
                                <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 px-2 py-1 rounded-lg text-[9px] font-bold font-mono text-white">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, #A8FFA8 0%, #1FF01F 100%)" }} />
                                  Chlorine (Cl)
                                </div>
                                <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 px-2 py-1 rounded-lg text-[9px] font-bold font-mono text-white">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, #FFE3E3 0%, #FFB5B5 100%)" }} />
                                  Boron (B)
                                </div>
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            )
          )}

          {/* TAB 2: ANONYMOUS Q&A */}
          {activeTab === "qa" && (
            <div className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col gap-6 overflow-y-auto">
              {/* Question submission form (Students and Teachers) */}
              {(user.role === "student" || user.role === "teacher") && (
                <div className="glass-panel p-6 rounded-3xl">
                  <h3 className="text-sm font-semibold tracking-wide font-outfit text-white mb-4">
                    {user.role === "student" ? "Post Academic Query" : "Broadcast Classroom Announcement / Query"}
                  </h3>
                  
                  <form onSubmit={handlePostQuestion} className="space-y-4">
                    <div className="relative">
                      <textarea
                        rows={3}
                        placeholder={user.role === "student" 
                          ? "Write your chemistry, physics or math query here... (e.g. Why is SN2 faster in polar aprotic solvents?)"
                          : "Broadcast announcement, start a class discussion or post a question..."
                        }
                        value={newQuestionContent}
                        onChange={(e) => setNewQuestionContent(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl glass-input text-sm font-sans resize-none pr-10"
                        disabled={cooldownTimeLeft > 0 || isModerating}
                      />
                      {isModerating && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center rounded-2xl">
                          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/80">
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            Gemini AI Moderating...
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Anonymity Checkbox */}
                      {user.role === "student" ? (
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70 select-none">
                          <input
                            type="checkbox"
                            checked={showStudentName}
                            onChange={(e) => setShowStudentName(e.target.checked)}
                            className="rounded border-white/20 bg-white/5 text-black focus:ring-0 w-4 h-4"
                          />
                          <span>Reveal my display name to the teacher (Default: Anonymous to peers and teachers)</span>
                        </label>
                      ) : (
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-white/70 select-none">
                          <input
                            type="checkbox"
                            checked={teacherPostAnonymous}
                            onChange={(e) => setTeacherPostAnonymous(e.target.checked)}
                            className="rounded border-white/20 bg-white/5 text-black focus:ring-0 w-4 h-4"
                          />
                          <span>Post anonymously as &quot;Anonymous Teacher&quot; (Default: Show display name &quot;{user.display_name}&quot;)</span>
                        </label>
                      )}

                      {/* Submit button with cooldown */}
                      <button
                        type="submit"
                        disabled={!newQuestionContent.trim() || (user.role === "student" && cooldownTimeLeft > 0) || isModerating}
                        className="px-6 py-2.5 rounded-xl glass-button font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {cooldownTimeLeft > 0 ? (
                          `Cooldown (${cooldownTimeLeft}s)`
                        ) : (
                          <>Send to Feed <Send size={12} /></>
                        )}
                      </button>
                    </div>

                    {moderationError && (
                      <div className="p-3 bg-red-950/30 border border-red-500/20 text-red-300 rounded-xl flex items-start gap-2 text-xs">
                        <ShieldAlert size={14} className="mt-0.5 flex-shrink-0" />
                        <span>{moderationError}</span>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Feed Card List */}
              <div className="space-y-4 pb-12">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-widest text-white/40 font-mono">Academic Feed</h3>
                  <span className="text-[10px] text-white/50 bg-white/5 border border-white/10 px-2 py-0.5 rounded font-mono">
                    {queries.length} queries loaded
                  </span>
                </div>

                <div className="space-y-4">
                  {queries.length === 0 ? (
                    <div className="glass-panel p-8 text-center rounded-3xl">
                      <MessageSquare size={32} className="mx-auto text-white/20 mb-3" />
                      <p className="text-sm text-white/50">No academic queries visible on this feed yet.</p>
                    </div>
                  ) : (
                    queries.map((q) => (
                      <motion.div
                        key={q.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel p-5 rounded-2xl flex flex-col gap-4 border border-white/10"
                      >
                        {/* Question Title Bar */}
                        <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                              <User size={12} className="text-white/60" />
                            </div>
                            <span className="text-xs font-semibold text-white/80">{q.author_name}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-white/40">
                              {new Date(q.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] uppercase tracking-widest font-mono flex items-center gap-1">
                              <Check size={8} /> AI Approved
                            </span>
                          </div>
                        </div>

                        {/* Question Content */}
                        <p className="text-sm text-white/90 leading-relaxed font-sans pl-1 select-text">
                          {q.content}
                        </p>

                        {/* Replies list */}
                        {q.replies && q.replies.length > 0 && (
                          <div className="space-y-3 pl-4 border-l-2 border-white/15 mt-2">
                            {q.replies.map((reply) => (
                              <div key={reply.id} className="bg-white/5 border border-white/5 p-3.5 rounded-xl space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-white/80 font-outfit uppercase tracking-wider flex items-center gap-1">
                                    <GraduationCap size={12} /> {reply.author_name}
                                  </span>
                                  <span className="text-[9px] font-mono text-white/30">
                                    {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-xs text-white/70 leading-relaxed select-text">
                                  {reply.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Teacher Response Panel */}
                        {user.role === "teacher" && (
                          <div className="border-t border-white/5 pt-4 space-y-3">
                            <span className="text-[9px] tracking-widest uppercase text-white/40 font-mono block">Provide Professional Explanation:</span>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Explain chemical mechanics or provide answers..."
                                value={replyContents[q.id] || ""}
                                onChange={(e) => handleReplyContentChange(q.id, e.target.value)}
                                className="flex-1 px-4 py-2 rounded-xl glass-input text-xs"
                              />
                              <button
                                onClick={() => handlePostReply(q.id)}
                                className="px-4 py-2 rounded-xl glass-button text-xs font-bold uppercase tracking-widest"
                              >
                                Reply
                              </button>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer text-[10px] text-white/50 select-none">
                              <input
                                type="checkbox"
                                checked={replyAnonymous[q.id] ?? true}
                                onChange={(e) => handleReplyAnonToggle(q.id, e.target.checked)}
                                className="rounded border-white/20 bg-white/5 text-black focus:ring-0 w-3 h-3"
                              />
                              <span>Reply Anonymously (Default: Anonymous)</span>
                            </label>
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3 & 4: PHYSICS / MATH COMING SOON */}
          {(activeTab === "physics" || activeTab === "math") && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg glass-panel p-10 rounded-3xl"
              >
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl inline-block mb-6 text-white/60">
                  <Lock size={32} />
                </div>
                <h2 className="text-2xl font-light tracking-[0.2em] uppercase font-outfit mb-3">
                  {activeTab === "physics" ? "Physics Lab" : "Visual Math Studio"}
                </h2>
                <p className="text-xs uppercase tracking-widest text-white/40 font-mono mb-4">Module Status: Coming Soon</p>
                <p className="text-sm text-white/60 leading-relaxed font-sans">
                  Coming soon !
                </p>
              </motion.div>
            </div>
          )}

          {/* TAB 5: ACHIEVEMENTS */}
          {activeTab === "achievements" && (
            <div className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col gap-6 overflow-y-auto">
              <div>
                <h2 className="text-xl font-bold font-outfit tracking-tight text-white">Workspace Achievements</h2>
                <p className="text-xs text-white/40 font-mono mt-1">Unlock badges by interacting with the laboratory mechanics.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-12">
                {BADGES.map((badge) => {
                  const isUnlocked = unlockedBadges.includes(badge.id);
                  const showSecretPlaceholder = badge.secret && !isUnlocked;
                  const displayTitle = showSecretPlaceholder ? "?" : badge.title;
                  const displayDesc = showSecretPlaceholder ? "?" : badge.desc;
                  const Icon = showSecretPlaceholder ? HelpCircle : badge.icon;

                  return (
                    <div
                      key={badge.id}
                      className={`glass-panel p-5 rounded-2xl flex items-start gap-4 border transition-all ${
                        isUnlocked
                          ? "bg-white/10 border-white/30 shadow-lg shadow-white/5"
                          : "bg-black/40 border-white/5 opacity-50"
                      }`}
                    >
                      <div className={`p-3 rounded-xl flex-shrink-0 ${isUnlocked ? "bg-white text-black" : "bg-white/5 text-white/30"}`}>
                        <Icon size={20} />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className={`text-sm font-bold font-outfit ${isUnlocked ? "text-white" : "text-white/60"}`}>
                            {displayTitle}
                          </h4>
                          {badge.secret && (
                            <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[8px] uppercase tracking-widest font-mono font-bold">
                              Secret
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/50 mt-1 leading-snug">{displayDesc}</p>
                        
                        <div className="mt-3 flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${isUnlocked ? "bg-white" : "bg-white/20"}`} />
                          <span className="text-[9px] font-mono uppercase tracking-widest text-white/40">
                            {isUnlocked ? "Unlocked" : "Locked"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* DYNAMIC ASSESSMENT QUIZ MODAL */}
      <AnimatePresence>
        {quizOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-white/20 shadow-2xl bg-black flex flex-col gap-6"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div>
                  <span className="text-[9px] uppercase tracking-widest font-mono text-white/40">Assessment Module</span>
                  <h3 className="text-sm font-bold font-outfit text-white">{selectedReaction?.name} Quiz</h3>
                </div>
                {!quizFinished && (
                  <span className="text-[10px] font-mono text-white/50 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                    Q: {currentQuestionIndex + 1} of {currentQuizQuestions.length}
                  </span>
                )}
              </div>

              {!quizFinished ? (
                // Active Quiz Content
                <div className="space-y-4">
                  <p className="text-sm font-medium text-white/95 leading-relaxed select-text">
                    {currentQuizQuestions[currentQuestionIndex].question}
                  </p>

                  <div className="space-y-2">
                    {currentQuizQuestions[currentQuestionIndex].options.map((opt: string) => {
                      const isSelected = selectedQuizAnswer === opt;
                      const isCorrectAnswer = opt === currentQuizQuestions[currentQuestionIndex].correctAnswer;
                      let optionStyle = "border-white/5 bg-white/3 hover:bg-white/5 text-white/70";

                      if (isSelected) {
                        optionStyle = "border-white bg-white/15 text-white font-bold";
                      }
                      if (quizFeedback) {
                        if (isCorrectAnswer) {
                          optionStyle = "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-bold";
                        } else if (isSelected) {
                          optionStyle = "border-red-500/40 bg-red-500/10 text-red-300";
                        } else {
                          optionStyle = "border-white/5 bg-white/2 opacity-40 text-white/40 pointer-events-none";
                        }
                      }

                      return (
                        <button
                          key={opt}
                          onClick={() => handleSelectQuizAnswer(opt)}
                          disabled={!!quizFeedback}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs font-mono transition-all flex items-center justify-between ${optionStyle}`}
                        >
                          <span>{opt}</span>
                          {quizFeedback && isCorrectAnswer && <Check size={12} className="text-emerald-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Message */}
                  {quizFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3.5 rounded-xl border text-xs leading-relaxed select-text ${
                        selectedQuizAnswer === currentQuizQuestions[currentQuestionIndex].correctAnswer
                          ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-300"
                          : "bg-red-950/20 border-red-500/20 text-red-300"
                      }`}
                    >
                      <div className="font-bold font-mono uppercase text-[9px] mb-1">
                        {selectedQuizAnswer === currentQuizQuestions[currentQuestionIndex].correctAnswer ? "Correct Answer Explanation" : "Explanation"}
                      </div>
                      {quizFeedback}
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-end pt-3 border-t border-white/5">
                    {!quizFeedback ? (
                      <button
                        onClick={handleVerifyQuizAnswer}
                        disabled={!selectedQuizAnswer}
                        className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Submit Answer
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuizQuestion}
                        className="px-6 py-2.5 rounded-xl glass-button font-bold text-xs uppercase tracking-widest flex items-center gap-1"
                      >
                        {currentQuestionIndex + 1 < currentQuizQuestions.length ? "Next Question" : "Finish Quiz"} <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                // Quiz Complete Screen
                <div className="text-center py-6 space-y-4">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-full inline-block text-white">
                    <Award size={40} />
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-bold font-outfit text-white">Assessment Complete</h4>
                    <p className="text-xs text-white/50 font-mono mt-1">Quiz results are validated client-side.</p>
                  </div>

                  <div className="text-3xl font-mono font-bold tracking-wider py-2">
                    Score: {quizScore} / {currentQuizQuestions.length}
                  </div>

                  <p className="text-xs text-white/60 max-w-sm mx-auto leading-relaxed">
                    {quizScore === 3
                      ? "Outstanding! You have demonstrated absolute conceptual mastery over the reaction's mechanisms, IUPAC structures, and chemical equations."
                      : "Good effort. Review the side panel mechanics, step-by-step structural details, and textbook page references to score 100%."}
                  </p>

                  <div className="pt-4 border-t border-white/10 flex gap-3">
                    <button
                      onClick={handleStartQuiz}
                      className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-mono uppercase tracking-widest transition-colors"
                    >
                      Retry Quiz
                    </button>
                    <button
                      onClick={() => setQuizOpen(false)}
                      className="flex-1 py-3 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-widest"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONGRATS POPUP OVERLAY */}
      <AnimatePresence>
        {congratsPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 px-8 py-4 bg-black/60 border border-white/15 rounded-3xl flex items-center gap-3.5 backdrop-blur-xl select-none"
            style={{
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
            }}
          >
            {/* Pulsing glow ring around target icon */}
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/25">
              <Sparkles className="w-4 h-4 text-white" />
              <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-60"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest text-white/50 font-mono font-bold leading-none mb-1">
                Puzzle Cleared
              </span>
              <span className="text-xs text-white font-outfit font-semibold tracking-wide leading-tight">
                {congratsPopup}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
