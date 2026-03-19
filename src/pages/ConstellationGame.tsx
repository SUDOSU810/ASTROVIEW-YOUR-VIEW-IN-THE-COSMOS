import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles, Trophy, RotateCcw, ChevronRight, Star, Zap,
    Clock, Award, ArrowRight, Keyboard, Heart, Info, X
} from "lucide-react";
import { CardStack, type CardItem } from "../components/ui/card-stack";
import { Starfield } from "../components/Starfield";
import { cn } from "../lib/utils";
import introVideo from "../assets/game intro.webm";
import cardBackImg from "../assets/image.png";
import {
    ALL_CONSTELLATIONS, CORRECT_TO_PASS, TOTAL_LEVELS,
    getLevelConfig, getPoolForLevel, getNewForLevel, shuffle,
} from "../data/constellationData";
import './ConstellationGame.css';

/* ────────────────────────────── component ────────────── */
export default function ConstellationGame() {
    const [showIntro, setShowIntro] = useState(true);
    const [showGuide, setShowGuide] = useState(false); // User Guide state
    const videoRef = useRef<HTMLVideoElement>(null);

    /* ── Hide body scrollbar ── */
    useEffect(() => {
        document.documentElement.classList.add('polaris-active');
        return () => document.documentElement.classList.remove('polaris-active');
    }, []);

    /* ── Explore state ── */
    const [exploreCards] = useState<CardItem[]>(() => shuffle(ALL_CONSTELLATIONS).slice(0, 10));
    const [activeIndex, setActiveIndex] = useState(0);

    /* ── Quiz / Level state ── */
    const [quizMode, setQuizMode] = useState(false);
    const [level, setLevel] = useState(1);
    const [streakInLevel, setStreakInLevel] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [answered, setAnswered] = useState<null | "correct" | "wrong">(null);
    const [options, setOptions] = useState<string[]>([]);
    const [showScorePop, setShowScorePop] = useState(false);
    const [hearts, setHearts] = useState(3);
    const [gameOver, setGameOver] = useState(false);

    /* ── Timer state ── */
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    /* ── Hard mode typing ── */
    const [typedAnswer, setTypedAnswer] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    /* ── Overlays ── */
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [showBadge, setShowBadge] = useState(false);

    /* ── Derived state ── */

    const levelConfig = useMemo(() => getLevelConfig(level), [level]);
    const pool = useMemo(() => getPoolForLevel(level), [level]);
    const quizCards = useRef<CardItem[]>(shuffle(getNewForLevel(level)));
    const [quizIndex, setQuizIndex] = useState(0);
    const activeCard = quizMode ? quizCards.current[quizIndex % quizCards.current.length] : exploreCards[activeIndex];
    const lastCardId = useRef<number | null>(null);

    /* ── Reshuffle quiz cards when level changes ── */
    useEffect(() => {
        quizCards.current = shuffle(getNewForLevel(level));
        setQuizIndex(0);
        lastCardId.current = null;
    }, [level]);

    /* ── Generate quiz options (wrong answers from full pool) ── */
    const generateOptions = useCallback(
        (correctTitle: string) => {
            const poolTitles = pool.map(c => c.title).filter(t => t !== correctTitle);
            const wrong = shuffle(poolTitles).slice(0, 3);
            return shuffle([correctTitle, ...wrong]);
        },
        [pool]
    );

    /* ── Prepare quiz round ── */
    useEffect(() => {
        if (quizMode && activeCard && !showLevelUp && !showBadge) {
            // Only regenerate options if the card has changed
            if (lastCardId.current !== activeCard.id) {
                if (levelConfig.difficulty !== "hard") {
                    setOptions(generateOptions(activeCard.title));
                }
                setAnswered(null);
                setTypedAnswer("");
                setTimeLeft(levelConfig.timerSeconds);
                lastCardId.current = activeCard.id;
            }
        }
    }, [quizMode, quizIndex, activeCard, generateOptions, levelConfig, showLevelUp, showBadge]);

    /* ── Timer countdown ── */
    useEffect(() => {
        if (!quizMode || answered || showLevelUp || showBadge) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    // Time's up — counts as wrong
                    clearInterval(timerRef.current!);
                    handleTimeout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizMode, quizIndex, answered, showLevelUp, showBadge]);

    /* ── Focus input in hard mode ── */
    useEffect(() => {
        if (quizMode && levelConfig.difficulty === "hard" && inputRef.current && !answered) {
            inputRef.current.focus();
        }
    }, [quizMode, quizIndex, levelConfig.difficulty, answered]);

    /* ── Handle timeout ── */
    const handleTimeout = () => {
        setStreakInLevel(0);
        setTotalScore(s => Math.max(0, s - 2)); // Timeout penalty
        setAnswered("wrong"); // Reveal correct answer
        setHearts(prev => {
            const newHearts = prev - 1;
            if (newHearts <= 0) {
                setTimeout(() => setGameOver(true), 1000);
            }
            // Only advance if not game over
            setTimeout(() => {
                if (newHearts > 0) {
                    advanceQuiz();
                }
            }, 1200);
            return newHearts;
        });
    };

    /* ── Handle guess (multiple choice) ── */
    const handleGuess = (option: string) => {
        if (answered) return;
        if (timerRef.current) clearInterval(timerRef.current);

        const correct = option.toLowerCase().trim() === activeCard.title.toLowerCase().trim();
        if (correct) {
            setTotalScore(s => s + 1);
            setShowScorePop(true);
            setTimeout(() => setShowScorePop(false), 400);
            const newStreak = streakInLevel + 1;
            setStreakInLevel(newStreak);
            setAnswered("correct");

            if (newStreak >= CORRECT_TO_PASS) {
                // Level complete!
                setTimeout(() => {
                    if (level >= TOTAL_LEVELS) {
                        setShowBadge(true);
                    } else {
                        setShowLevelUp(true);
                    }
                }, 800);
                return;
            }
        } else {
            setStreakInLevel(0);
            setTotalScore(s => Math.max(0, s - 2)); // Decrease score by 2
            setAnswered("wrong");
            setHearts(prev => {
                const newHearts = prev - 1;
                if (newHearts <= 0) {
                    setTimeout(() => setGameOver(true), 1000);
                }
                return newHearts;
            });
        }

        setTimeout(() => {
            if (hearts > 1 || correct) { // Only advance if not game over (or if correct)
                 advanceQuiz();
            }
        }, 1200);
    };

    /* ── Handle hard mode submit ── */
    const handleHardSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!typedAnswer.trim()) return;
        handleGuess(typedAnswer);
    };

    /* ── Advance to next quiz card ── */
    const advanceQuiz = () => {
        setQuizIndex(i => (i + 1) % quizCards.current.length);
    };

    /* ── Level up ── */
    /* ── Level up ── */
    const handleLevelUp = () => {
        setShowLevelUp(false);
        setLevel(l => l + 1);
        setStreakInLevel(0);
        setHearts(3); // Refill hearts
    };

    /* ── Restart ── */
    const handleRestart = () => {
        setQuizMode(false);
        setLevel(1);
        setStreakInLevel(0);
        setTotalScore(0);
        setHearts(3);
        setAnswered(null);
        setShowBadge(false);
        setShowLevelUp(false);
        setGameOver(false);
        setTypedAnswer("");
    };

    /* ── Start quiz ── */
    const startQuiz = () => {
        quizCards.current = shuffle(getNewForLevel(level));
        setQuizIndex(0);
        setStreakInLevel(0);
        setTotalScore(0);
        setQuizMode(true);
    };

    const handleVideoEnd = () => setShowIntro(false);
    const skipIntro = () => {
        if (videoRef.current) videoRef.current.pause();
        setShowIntro(false);
    };

    /* ── Intro Video Screen ── */
    if (showIntro) {
        return (
            <div className="polaris-intro-screen">
                <video
                    ref={videoRef}
                    className="polaris-intro-video"
                    src={introVideo}
                    autoPlay
                    muted
                    playsInline
                    onEnded={handleVideoEnd}
                />
                <button className="polaris-skip-btn" onClick={skipIntro}>
                    Skip Intro →
                </button>
            </div>
        );
    }

    /* ── Timer bar fraction ── */
    const timerFraction = quizMode ? timeLeft / levelConfig.timerSeconds : 1;
    const timerColor = timerFraction > 0.5 ? "#4ade80" : timerFraction > 0.25 ? "#fbbf24" : "#f87171";

    /* ── Game Screen ── */
    return (
        <div className="constellation-game-page">
            <Starfield count={140} />

            <section className="polaris-game-section">
                {/* ── Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="polaris-header"
                >
                    <div className="polaris-badge">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span>Star Game</span>
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                    </div>
                    <h1 className="polaris-title">Polaris</h1>
                    {!quizMode && (
                        <p className="polaris-subtitle">
                            Explore the ancient constellations. Swipe through the cosmos.
                        </p>
                    )}
                </motion.div>

                {/* ── Level & Score panel (quiz mode) ── */}
                <AnimatePresence>
                    {quizMode && !showLevelUp && !showBadge && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="polaris-score-panel"
                        >
                            <div className="polaris-score-item">
                                <Star className="w-4 h-4" style={{ color: levelConfig.color }} />
                                <span className="polaris-score-label">Lv.{level}</span>
                                <span
                                    className="polaris-difficulty-badge"
                                    style={{ background: levelConfig.color + "22", color: levelConfig.color, borderColor: levelConfig.color + "44" }}
                                >
                                    {levelConfig.label}
                                    {levelConfig.difficulty === "hard" && <Keyboard className="w-3 h-3" />}
                                </span>
                            </div>
                            <div className="polaris-score-divider" />
                            <div className="polaris-score-item">
                                <Trophy className="w-4 h-4" style={{ color: '#fbbf24' }} />
                                <span className="polaris-score-label">Score</span>
                                <span className={cn("polaris-score-value", showScorePop && "score-pop")}>
                                    {totalScore}
                                </span>
                            </div>
                            <div className="polaris-score-divider" />
                        <div className="polaris-score-item">
                            <Zap className="w-4 h-4 text-star-gold" />
                            <span className="polaris-score-label">Streak</span>
                            <span className="polaris-score-value">{streakInLevel}/{CORRECT_TO_PASS}</span>
                        </div>
                        <div className="polaris-score-divider" />
                        <div className="polaris-score-item">
                            <Heart className={cn("w-4 h-4", hearts > 0 ? "text-red-500 fill-red-500" : "text-gray-600")} />
                            <span className="polaris-score-value text-white">{hearts}</span>
                        </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── User Guide Modal (Enhanced) ── */}
                <AnimatePresence>
                    {showGuide && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                            onClick={() => setShowGuide(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="bg-[#0B1221]/95 border border-cyan-500/40 p-10 pb-12 rounded-2xl max-w-4xl w-full text-white shadow-[0_0_60px_rgba(6,182,212,0.2)] relative overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Background glow effect */}
                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px]" />
                                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />

                                <button
                                    onClick={() => setShowGuide(false)}
                                    className="absolute top-5 right-5 p-2 text-cyan-400/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                <div className="relative z-10">
                                    <h2 className="text-4xl font-bold text-center mb-8 uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                                        Mission Briefing
                                    </h2>

                                    <div className="space-y-8 text-slate-300">
                                        <div className="flex gap-6 items-start p-6 bg-gradient-to-br from-cyan-900/20 to-transparent rounded-xl border border-cyan-500/20">
                                            <div className="p-4 bg-cyan-500/10 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                                                <Trophy className="w-8 h-8 text-cyan-300" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-2 tracking-wide">OBJECTIVE</h3>
                                                <p className="text-lg leading-relaxed text-cyan-100/80">
                                                    Identify 88 constellations across 9 levels of increasing difficulty.
                                                    Keep your streak alive and manage your 3 Hearts to survive the cosmos.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Game Modes */}
                                            <div className="p-6 bg-slate-900/40 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors group">
                                                <h4 className="text-cyan-300 font-bold mb-4 flex items-center gap-3 uppercase tracking-wider text-sm">
                                                    <Star className="w-4 h-4" /> Classification Levels
                                                </h4>
                                                <ul className="space-y-3">
                                                    <li className="flex items-center gap-3">
                                                        <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
                                                        <span className="text-slate-200">Level 1-3 <span className="text-slate-500 text-sm ml-1">(15s Timer)</span></span>
                                                    </li>
                                                    <li className="flex items-center gap-3">
                                                        <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                                                        <span className="text-slate-200">Level 4-6 <span className="text-slate-500 text-sm ml-1">(8s Timer)</span></span>
                                                    </li>
                                                    <li className="flex items-center gap-3">
                                                        <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                                                        <span className="text-slate-200">Level 7-9 <span className="text-slate-500 text-sm ml-1">(Type Name)</span></span>
                                                    </li>
                                                </ul>
                                            </div>

                                            {/* Survival */}
                                            <div className="p-6 bg-slate-900/40 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-colors group">
                                                <h4 className="text-cyan-300 font-bold mb-4 flex items-center gap-3 uppercase tracking-wider text-sm">
                                                    <Heart className="w-4 h-4" /> Life Support
                                                </h4>
                                                <ul className="space-y-3 text-slate-300">
                                                    <li className="flex items-start gap-3">
                                                        <Heart className="w-4 h-4 text-red-500 fill-red-500/50 mt-1" />
                                                        <span>You start with <strong>3 Hearts</strong>.</span>
                                                    </li>
                                                    <li className="flex items-start gap-3">
                                                        <Heart className="w-4 h-4 text-slate-600 mt-1" />
                                                        <span>Wrong answer or timeout costs <strong>1 Heart</strong>.</span>
                                                    </li>
                                                    <li className="flex items-start gap-3">
                                                        <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400/50 mt-1" />
                                                        <span>Complete a level to <strong>Refill Hearts</strong>!</span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-white/10 text-center flex justify-center">
                                            <button
                                                onClick={() => setShowGuide(false)}
                                                className="group relative px-10 py-3 bg-cyan-600/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-full font-bold text-cyan-300 hover:text-white transition-all overflow-hidden"
                                            >
                                                <span className="relative z-10 flex items-center gap-2">
                                                    INITIATE
                                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </span>
                                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Top Left Guide Button ── */}
                <motion.div
                    className="absolute top-6 left-6 z-30 flex items-center gap-3 group cursor-pointer"
                    onClick={() => setShowGuide(true)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="p-3 bg-slate-900/40 backdrop-blur-md border border-cyan-500/20 rounded-full text-cyan-400 group-hover:bg-cyan-500/20 group-hover:border-cyan-400/60 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300">
                        <Info className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-xs font-bold tracking-[0.2em] text-cyan-400/70 group-hover:text-cyan-300 group-hover:drop-shadow-[0_0_5px_rgba(6,182,212,0.8)] transition-all uppercase select-none whitespace-nowrap">
                        How to Play
                    </span>
                </motion.div>
                {/* ── Timer bar ── */}
                <AnimatePresence>
                    {quizMode && !showLevelUp && !showBadge && !answered && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="polaris-timer-bar-container"
                        >
                            <Clock className="w-3.5 h-3.5" style={{ color: timerColor }} />
                            <div className="polaris-timer-track">
                                <motion.div
                                    className="polaris-timer-fill"
                                    style={{ background: timerColor }}
                                    animate={{ width: `${timerFraction * 100}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <span className="polaris-timer-text" style={{ color: timerColor }}>
                                {timeLeft}s
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Card Stack ── */}
                <div className="polaris-cards-area">
                    <CardStack
                        items={quizMode ? quizCards.current : exploreCards}
                        activeIndex={quizMode ? quizIndex % quizCards.current.length : activeIndex}
                        onActiveChange={(i) => {
                            if (!quizMode) setActiveIndex(i);
                        }}
                        autoAdvanceMs={quizMode ? 999999 : 2500}
                        cardBackImage={cardBackImg}
                        revealActiveInfo={!quizMode || answered !== null}
                    />
                </div>

                {/* ── Quiz options (Easy/Medium) ── */}
                <AnimatePresence>
                    {quizMode && levelConfig.difficulty !== "hard" && !showLevelUp && !showBadge && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="polaris-quiz-options"
                        >
                            <p className="polaris-quiz-question">
                                Which constellation is shown?
                            </p>
                            <div className="polaris-quiz-grid">
                                {options.map((opt) => {
                                    const isCorrect = opt === activeCard.title;
                                    const isAnswered = answered !== null;
                                    return (
                                        <motion.button
                                            key={opt}
                                            whileHover={!isAnswered ? { scale: 1.03 } : {}}
                                            whileTap={!isAnswered ? { scale: 0.97 } : {}}
                                            onClick={() => handleGuess(opt)}
                                            className={cn(
                                                "polaris-quiz-btn",
                                                isAnswered && isCorrect && "polaris-quiz-correct",
                                                isAnswered && !isCorrect && "polaris-quiz-wrong",
                                                !isAnswered && "polaris-quiz-default"
                                            )}
                                        >
                                            <Star
                                                className="w-4 h-4"
                                                style={{ color: isAnswered && isCorrect ? '#4ade80' : '#4a5eae' }}
                                            />
                                            {opt}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Hard mode: type-in ── */}
                <AnimatePresence>
                    {quizMode && levelConfig.difficulty === "hard" && !showLevelUp && !showBadge && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="polaris-quiz-options"
                        >
                            <p className="polaris-quiz-question">
                                Type the constellation name:
                            </p>
                            {answered ? (
                                <div className={cn(
                                    "polaris-hard-result",
                                    answered === "correct" ? "polaris-hard-correct" : "polaris-hard-wrong"
                                )}>
                                    {answered === "correct"
                                        ? "✓ Correct!"
                                        : `✗ It was "${activeCard.title}"`}
                                </div>
                            ) : (
                                <form onSubmit={handleHardSubmit} className="polaris-hard-form">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={typedAnswer}
                                        onChange={(e) => setTypedAnswer(e.target.value)}
                                        placeholder="Enter constellation name..."
                                        className="polaris-hard-input"
                                        autoComplete="off"
                                        spellCheck={false}
                                    />
                                    <button type="submit" className="polaris-action-btn polaris-submit-btn">
                                        <ArrowRight className="w-4 h-4" />
                                        Submit
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Controls ── */}
                {!showLevelUp && !showBadge && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="polaris-controls"
                    >
                        {!quizMode ? (
                            <button onClick={startQuiz} className="polaris-action-btn">
                                <Sparkles className="w-4 h-4" />
                                Start Challenge
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button onClick={handleRestart} className="polaris-action-btn polaris-exit-btn">
                                <RotateCcw className="w-4 h-4" />
                                Exit Quiz
                            </button>
                        )}
                    </motion.div>
                )}

                {/* ── Footer stats ── */}
                <div className="polaris-footer-stats">
                    <div className="polaris-footer-dot" />
                    {quizMode ? (
                        <>
                            <span>Level {level} / {TOTAL_LEVELS}</span>
                            <span className="polaris-footer-sep">•</span>
                            <span>Pool: {pool.length} constellations</span>
                        </>
                    ) : (
                        <>
                            <span>{activeIndex + 1} / {exploreCards.length}</span>
                            <span className="polaris-footer-sep">•</span>
                            <span>Swipe or click to explore</span>
                        </>
                    )}
                </div>


            {/* ── Level Up Overlay ── */}
            <AnimatePresence>
                {showLevelUp && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="polaris-overlay"
                    >
                        <motion.div
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.7, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="polaris-level-up-card"
                        >
                            <div className="polaris-level-up-stars">✦ ✦ ✦</div>
                            <h2 className="polaris-level-up-title">Level {level} Complete!</h2>
                            <p className="polaris-level-up-sub">
                                {level < TOTAL_LEVELS
                                    ? `Get ready for Level ${level + 1} — ${getLevelConfig(level + 1).label} difficulty`
                                    : "Final level awaits!"}
                            </p>
                            <div className="polaris-level-up-info">
                                <span>Pool expands to {Math.min((level + 1) * 10, 88)} constellations</span>
                            </div>
                            <button onClick={handleLevelUp} className="polaris-action-btn polaris-level-btn">
                                <ArrowRight className="w-4 h-4" />
                                Next Level
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Badge / Completion Overlay ── */}
            <AnimatePresence>
                {showBadge && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="polaris-overlay"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
                            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 150, damping: 18 }}
                            className="polaris-badge-card"
                        >
                            <div className="polaris-badge-trophy">
                                <Award className="w-16 h-16" style={{ color: '#fbbf24' }} />
                            </div>
                            <h2 className="polaris-badge-title">🌟 Constellation Master 🌟</h2>
                            <p className="polaris-badge-sub">
                                You identified all 88 constellations across {TOTAL_LEVELS} levels!
                            </p>
                            <div className="polaris-badge-stats">
                                <div className="polaris-badge-stat">
                                    <Trophy className="w-5 h-5" style={{ color: '#fbbf24' }} />
                                    <span>Total Score: {totalScore}</span>
                                </div>
                            </div>
                            <button onClick={handleRestart} className="polaris-action-btn polaris-level-btn">
                                <RotateCcw className="w-4 h-4" />
                                Play Again
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* ── Game Over Overlay ── */}
            <AnimatePresence>
                {gameOver && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="polaris-overlay"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="polaris-badge-card"
                            style={{ borderColor: 'rgba(248, 113, 113, 0.3)' }}
                        >
                            <Heart className="w-16 h-16 text-red-500 fill-red-500 animate-pulse" />
                            <h2 className="polaris-badge-title" style={{ background: 'linear-gradient(to right, #f87171, #fca5a5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Out of Stardust
                            </h2>
                            <p className="polaris-badge-sub">
                                You ran out of energy! The cosmos is a dangerous place.
                            </p>
                            <div className="polaris-badge-stats">
                                <div className="polaris-badge-stat" style={{ borderColor: 'rgba(248, 113, 113, 0.3)', color: '#f87171', background: 'rgba(248, 113, 113, 0.05)' }}>
                                    <Trophy className="w-4 h-4" />
                                    Level {level}
                                </div>
                                <div className="polaris-badge-stat" style={{ borderColor: 'rgba(248, 113, 113, 0.3)', color: '#f87171', background: 'rgba(248, 113, 113, 0.05)' }}>
                                    <Star className="w-4 h-4" />
                                    {totalScore} pts
                                </div>
                            </div>
                            <button onClick={handleRestart} className="polaris-action-btn" style={{ marginTop: '1rem', borderColor: 'rgba(248, 113, 113, 0.5)', color: '#fca5a5' }}>
                                <RotateCcw className="w-4 h-4" />
                                Try Again
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </section>
        </div>
    );
}
