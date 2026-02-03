import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Target, Zap, User, Star, Sparkles, TrendingUp } from 'lucide-react';

export default function MathGame() {
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isGameActive, setIsGameActive] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showCharacter, setShowCharacter] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [userEmail, setUserEmail] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Character progression system
  const [character, setCharacter] = useState({
    name: 'Math Scholar',
    level: 1,
    xp: 0,
    totalXp: 0,
    skillPoints: 0,
    skills: {
      speedBonus: 0,      // Extra time in speed mode
      scoreMultiplier: 0, // Bonus score per question
      hintsUnlocked: 0,   // Get hints on hard questions
      secondChance: 0,    // Extra attempts before wrong answer
      streakProtector: 0  // Protect streak once per game
    }
  });
  
  const [secondChanceUsed, setSecondChanceUsed] = useState(false);
  const [streakProtectorUsed, setStreakProtectorUsed] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  // Load progress on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('mathArenaEmail');
    const hasSeenTutorial = localStorage.getItem('mathArenaTutorial');
    
    if (savedEmail) {
      setUserEmail(savedEmail);
      loadProgress(savedEmail);
    }
    
    // Show tutorial for first-time players
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  // Save progress whenever character changes
  useEffect(() => {
    if (userEmail) {
      saveProgress();
    }
  }, [character, userEmail]);

  const saveProgress = () => {
    if (!userEmail) return;
    const progressData = {
      email: userEmail,
      character: character,
      lastPlayed: new Date().toISOString()
    };
    localStorage.setItem(`mathArena_${userEmail}`, JSON.stringify(progressData));
    localStorage.setItem('mathArenaEmail', userEmail);
  };

  const loadProgress = (email) => {
    const savedData = localStorage.getItem(`mathArena_${email}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setCharacter(parsed.character);
      setSaveMessage('✓ Progress loaded!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleEmailSubmit = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(emailInput)) {
      setUserEmail(emailInput);
      loadProgress(emailInput);
      setShowEmailPrompt(false);
      setSaveMessage('✓ Progress will be saved!');
      setTimeout(() => setSaveMessage(''), 3000);
    } else {
      setSaveMessage('❌ Please enter a valid email');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mathArenaEmail');
    setUserEmail(null);
    setCharacter({
      name: 'Math Scholar',
      level: 1,
      xp: 0,
      totalXp: 0,
      skillPoints: 0,
      skills: {
        speedBonus: 0,
        scoreMultiplier: 0,
        hintsUnlocked: 0,
        secondChance: 0,
        streakProtector: 0
      }
    });
    setSaveMessage('✓ Logged out');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const closeTutorial = () => {
    localStorage.setItem('mathArenaTutorial', 'seen');
    setShowTutorial(false);
  };

  const selectGameMode = (mode) => {
    setSelectedMode(mode);
    setShowDifficultySelect(true);
  };

  const selectDifficulty = (diff) => {
    startGame(selectedMode, diff);
    setShowDifficultySelect(false);
  };

  const gameModes = [
    { id: 'speed', name: 'Speed Round', icon: Zap, desc: '60 seconds, as many as you can!' },
    { id: 'accuracy', name: 'Accuracy Challenge', icon: Target, desc: '10 questions, perfect score wins' },
    { id: 'endurance', name: 'Endurance Mode', icon: Trophy, desc: 'Keep going until you miss 3' }
  ];

  const getXpForLevel = (level) => {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  };

  const addXp = (amount) => {
    const newXp = character.xp + amount;
    const newTotalXp = character.totalXp + amount;
    const xpNeeded = getXpForLevel(character.level);
    
    if (newXp >= xpNeeded) {
      // Level up!
      setCharacter({
        ...character,
        level: character.level + 1,
        xp: newXp - xpNeeded,
        totalXp: newTotalXp,
        skillPoints: character.skillPoints + 1
      });
      setFeedback('🎉 LEVEL UP! You earned a skill point!');
    } else {
      setCharacter({
        ...character,
        xp: newXp,
        totalXp: newTotalXp
      });
    }
  };

  const upgradeSkill = (skillName) => {
    if (character.skillPoints > 0 && character.skills[skillName] < 5) {
      setCharacter({
        ...character,
        skillPoints: character.skillPoints - 1,
        skills: {
          ...character.skills,
          [skillName]: character.skills[skillName] + 1
        }
      });
    }
  };

  const skillDescriptions = {
    speedBonus: { name: 'Time Extension', desc: '+10 seconds per level in Speed Mode', icon: Clock },
    scoreMultiplier: { name: 'Score Boost', desc: '+5 points per correct answer per level', icon: TrendingUp },
    hintsUnlocked: { name: 'Hint Master', desc: 'Show hints on difficult questions', icon: Sparkles },
    secondChance: { name: 'Second Chance', desc: 'Get 1 extra attempt before marking wrong', icon: Target },
    streakProtector: { name: 'Streak Shield', desc: 'Protect your streak once per game', icon: Star }
  };

  useEffect(() => {
    if (isGameActive && gameMode === 'speed' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isGameActive && gameMode === 'speed' && timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, isGameActive, gameMode]);

  const generateQuestion = () => {
    const types = difficulty === 'easy' ? ['arithmetic', 'algebra'] : 
                  difficulty === 'medium' ? ['arithmetic', 'algebra', 'calculus'] :
                  ['algebra', 'calculus', 'logic'];
    
    const type = types[Math.floor(Math.random() * types.length)];
    
    if (type === 'arithmetic') {
      const a = Math.floor(Math.random() * 50) + 10;
      const b = Math.floor(Math.random() * 50) + 10;
      const ops = ['+', '-', '*'];
      const op = ops[Math.floor(Math.random() * ops.length)];
      const question = `${a} ${op} ${b}`;
      const answer = eval(question);
      return { question, answer: answer.toString(), type };
    }
    
    if (type === 'algebra') {
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 20) + 1;
      const c = Math.floor(Math.random() * 30) + 1;
      const x = Math.floor(Math.random() * 10) + 1;
      const result = a * x + b;
      return { 
        question: `Solve for x: ${a}x + ${b} = ${result}`,
        answer: x.toString(),
        type
      };
    }
    
    if (type === 'calculus') {
      const a = Math.floor(Math.random() * 5) + 1;
      const n = Math.floor(Math.random() * 5) + 2;
      return {
        question: `What is the derivative of ${a}x^${n}?`,
        answer: `${a * n}x^${n - 1}`,
        type,
        hint: 'Power rule: d/dx(ax^n) = anx^(n-1)'
      };
    }
    
    if (type === 'logic') {
      const patterns = [
        { sequence: [2, 4, 8, 16], next: 32, question: '2, 4, 8, 16, ?' },
        { sequence: [1, 1, 2, 3, 5], next: 8, question: '1, 1, 2, 3, 5, ? (Fibonacci)' },
        { sequence: [3, 6, 12, 24], next: 48, question: '3, 6, 12, 24, ?' }
      ];
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];
      return {
        question: `What comes next? ${pattern.question}`,
        answer: pattern.next.toString(),
        type
      };
    }
  };

  const startGame = (mode, diff) => {
    setGameMode(mode);
    setDifficulty(diff);
    setScore(0);
    setQuestionsAnswered(0);
    setStreak(0);
    const baseTime = 60 + (character.skills.speedBonus * 10);
    setTimeLeft(baseTime);
    setIsGameActive(true);
    setCurrentQuestion(generateQuestion());
    setFeedback('');
    setSecondChanceUsed(false);
    setStreakProtectorUsed(false);
    setWrongAttempts(0);
  };

  const checkAnswer = () => {
    if (!userAnswer.trim()) return;
    
    const isCorrect = userAnswer.toLowerCase().replace(/\s/g, '') === 
                      currentQuestion.answer.toLowerCase().replace(/\s/g, '');
    
    if (isCorrect) {
      const baseScore = 10;
      const bonusScore = character.skills.scoreMultiplier * 5;
      const totalPoints = baseScore + bonusScore;
      
      setScore(score + totalPoints);
      setStreak(streak + 1);
      if (streak + 1 > bestStreak) setBestStreak(streak + 1);
      
      // Award XP based on difficulty
      const xpReward = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
      addXp(xpReward);
      
      setFeedback(`✓ Correct! +${totalPoints} points, +${xpReward} XP`);
      setWrongAttempts(0);
      
      setTimeout(() => {
        setQuestionsAnswered(questionsAnswered + 1);
        setCurrentQuestion(generateQuestion());
        setUserAnswer('');
        setFeedback('');
      }, 800);
    } else {
      // Check for second chance
      if (character.skills.secondChance > 0 && !secondChanceUsed && wrongAttempts === 0) {
        setWrongAttempts(1);
        setFeedback('⚠️ Second Chance! Try again.');
        setUserAnswer('');
        setTimeout(() => setFeedback(''), 1500);
        return;
      }
      
      // Check for streak protector
      if (character.skills.streakProtector > 0 && !streakProtectorUsed && streak >= 3) {
        setStreakProtectorUsed(true);
        setFeedback(`✗ Incorrect. Answer: ${currentQuestion.answer} | 🛡️ Streak Protected!`);
      } else {
        setFeedback(`✗ Incorrect. Answer: ${currentQuestion.answer}`);
        setStreak(0);
      }
      
      setSecondChanceUsed(true);
      setWrongAttempts(0);
      
      setTimeout(() => {
        setQuestionsAnswered(questionsAnswered + 1);
        setCurrentQuestion(generateQuestion());
        setUserAnswer('');
        setFeedback('');
      }, 1500);
    }

    if (gameMode === 'accuracy' && questionsAnswered + 1 >= 10) {
      setTimeout(() => endGame(), 1500);
    }
  };

  const endGame = () => {
    setIsGameActive(false);
    setCurrentQuestion(null);
  };

  const resetGame = () => {
    setGameMode(null);
    setDifficulty(null);
    setIsGameActive(false);
    setCurrentQuestion(null);
    setUserAnswer('');
  };

  if (!gameMode) {
    // Difficulty selection screen
    if (showDifficultySelect && selectedMode) {
      const mode = gameModes.find(m => m.id === selectedMode);
      const IconComponent = mode.icon;
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full">
            <button 
              onClick={() => setShowDifficultySelect(false)} 
              className="mb-6 text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              ← Back
            </button>
            
            <div className="text-center mb-8">
              <IconComponent className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{mode.name}</h2>
              <p className="text-gray-600">{mode.desc}</p>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Choose Your Difficulty</h3>
            
            <div className="space-y-3">
              <button 
                onClick={() => selectDifficulty('easy')} 
                className="w-full bg-green-500 text-white py-4 rounded-xl hover:bg-green-600 transition-colors text-lg font-semibold"
              >
                🌱 Easy
                <p className="text-sm font-normal mt-1 opacity-90">Basic arithmetic and simple algebra</p>
              </button>
              <button 
                onClick={() => selectDifficulty('medium')} 
                className="w-full bg-yellow-500 text-white py-4 rounded-xl hover:bg-yellow-600 transition-colors text-lg font-semibold"
              >
                ⚡ Medium
                <p className="text-sm font-normal mt-1 opacity-90">Algebra and calculus fundamentals</p>
              </button>
              <button 
                onClick={() => selectDifficulty('hard')} 
                className="w-full bg-red-500 text-white py-4 rounded-xl hover:bg-red-600 transition-colors text-lg font-semibold"
              >
                🔥 Hard
                <p className="text-sm font-normal mt-1 opacity-90">Advanced calculus and logic puzzles</p>
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // Tutorial popup for first-time players
    if (showTutorial) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">Welcome to Math Arena! 🎮</h2>
            
            <div className="space-y-6">
              <div className="bg-indigo-50 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-indigo-600 mb-3 flex items-center gap-2">
                  <Zap className="w-6 h-6" />
                  How to Play
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">1.</span>
                    <span>Choose a game mode: Speed Round, Accuracy Challenge, or Endurance Mode</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">2.</span>
                    <span>Select your difficulty: Easy, Medium, or Hard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">3.</span>
                    <span>Answer math questions as fast and accurately as possible!</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">4.</span>
                    <span>Type your answer and hit Enter or click Submit</span>
                  </li>
                </ul>
              </div>

              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-purple-600 mb-3 flex items-center gap-2">
                  <Star className="w-6 h-6" />
                  Level Up System
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Earn XP for every correct answer (10/20/30 based on difficulty)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Level up to unlock skill points</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Spend skill points on powerful upgrades like extra time, score boosts, and hints</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Click your character badge to view stats and upgrade skills</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-green-600 mb-3 flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  Game Modes
                </h3>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <p className="font-bold text-green-600">⚡ Speed Round</p>
                    <p className="text-sm">Answer as many questions as you can in 60 seconds!</p>
                  </div>
                  <div>
                    <p className="font-bold text-yellow-600">🎯 Accuracy Challenge</p>
                    <p className="text-sm">10 questions - aim for a perfect score!</p>
                  </div>
                  <div>
                    <p className="font-bold text-red-600">🏆 Endurance Mode</p>
                    <p className="text-sm">Keep going as long as you can!</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-yellow-600 mb-3">💾 Save Your Progress</h3>
                <p className="text-gray-700">
                  Click "Save Progress" and enter your email to keep your character, level, and skills across sessions. 
                  Your data stays in your browser - we never send it anywhere!
                </p>
              </div>
            </div>

            <button
              onClick={closeTutorial}
              className="w-full mt-8 bg-indigo-600 text-white py-4 rounded-xl text-xl font-bold hover:bg-indigo-700 transition-colors"
            >
              Let's Play! 🚀
            </button>
          </div>
        </div>
      );
    }
    
    // Email prompt modal
    if (showEmailPrompt) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Save Your Progress</h2>
            <p className="text-gray-600 mb-6">Enter your email to keep your character level, XP, and skills across sessions!</p>
            
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleEmailSubmit()}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 focus:border-indigo-500 focus:outline-none"
            />
            
            {saveMessage && (
              <p className={`mb-4 text-sm ${saveMessage.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
                {saveMessage}
              </p>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={handleEmailSubmit}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Save Progress
              </button>
              <button
                onClick={() => setShowEmailPrompt(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Skip
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4 text-center">
              Your data is stored locally in your browser. We don't send it anywhere.
            </p>
          </div>
        </div>
      );
    }
    
    if (showCharacter) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8">
          <div className="max-w-4xl mx-auto">
            <button 
              onClick={() => setShowCharacter(false)} 
              className="mb-6 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              ← Back to Games
            </button>
            
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">{character.name}</h1>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-indigo-600">Level {character.level}</span>
                    <span className="text-gray-600">Total XP: {character.totalXp}</span>
                  </div>
                  {userEmail && (
                    <p className="text-sm text-green-600 mt-2">✓ Progress saved to: {userEmail}</p>
                  )}
                </div>
                <User className="w-24 h-24 text-indigo-600" />
              </div>

              {saveMessage && (
                <div className={`mb-4 p-3 rounded-lg text-center ${
                  saveMessage.includes('✓') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {saveMessage}
                </div>
              )}

              {!userEmail && (
                <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 mb-3">
                    ⚠️ Your progress is not saved! Add your email to keep your character across sessions.
                  </p>
                  <button
                    onClick={() => setShowEmailPrompt(true)}
                    className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                  >
                    Save My Progress
                  </button>
                </div>
              )}

              {userEmail && (
                <div className="mb-6 flex justify-end">
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:text-red-700 underline"
                  >
                    Logout & Reset Character
                  </button>
                </div>
              )}

              <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">XP Progress</span>
                  <span className="text-gray-800 font-semibold">{character.xp} / {getXpForLevel(character.level)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full transition-all"
                    style={{ width: `${(character.xp / getXpForLevel(character.level)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Skill Points Available: <span className="text-indigo-600">{character.skillPoints}</span>
                </h2>
                <p className="text-gray-600 mb-6">Earn skill points by leveling up. Max 5 points per skill.</p>
              </div>

              <div className="space-y-4">
                {Object.entries(skillDescriptions).map(([key, skill]) => {
                  const IconComponent = skill.icon;
                  const currentLevel = character.skills[key];
                  const maxLevel = 5;
                  
                  return (
                    <div key={key} className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <IconComponent className="w-8 h-8 text-indigo-600 mt-1" />
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800 mb-1">{skill.name}</h3>
                            <p className="text-gray-600 mb-3">{skill.desc}</p>
                            <div className="flex items-center gap-2">
                              {[...Array(maxLevel)].map((_, i) => (
                                <div 
                                  key={i}
                                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                                    i < currentLevel 
                                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                                      : 'border-gray-300 text-gray-400'
                                  }`}
                                >
                                  {i + 1}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => upgradeSkill(key)}
                          disabled={character.skillPoints === 0 || currentLevel >= maxLevel}
                          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                            character.skillPoints > 0 && currentLevel < maxLevel
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Upgrade
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">Math Arena</h1>
              <p className="text-white/90 text-lg">Challenge your mathematical skills!</p>
              {userEmail && (
                <p className="text-white/80 text-sm mt-1">✓ Logged in as: {userEmail}</p>
              )}
            </div>
            <div className="flex gap-3">
              {!userEmail && (
                <button
                  onClick={() => setShowEmailPrompt(true)}
                  className="bg-yellow-400 text-gray-800 px-5 py-3 rounded-xl font-bold hover:bg-yellow-300 transition-colors shadow-lg"
                >
                  💾 Save Progress
                </button>
              )}
              <button
                onClick={() => setShowCharacter(true)}
                className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-lg"
              >
                <User className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-sm">Level {character.level}</div>
                  <div className="text-xs text-indigo-400">{character.skillPoints} skill points</div>
                </div>
              </button>
            </div>
          </div>

          {saveMessage && (
            <div className={`mb-6 p-4 rounded-xl text-center font-semibold ${
              saveMessage.includes('✓') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {saveMessage}
            </div>
          )}

          <div className="mb-6 flex justify-center">
            <button
              onClick={() => setShowTutorial(true)}
              className="text-white/90 hover:text-white text-sm underline flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              How to Play
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {gameModes.map(mode => (
              <button
                key={mode.id}
                onClick={() => selectGameMode(mode.id)}
                className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 hover:bg-gradient-to-br hover:from-indigo-500 hover:to-purple-500 cursor-pointer text-left group"
              >
                <mode.icon className="w-12 h-12 text-indigo-600 group-hover:text-white mb-4 transition-colors duration-300" />
                <h2 className="text-2xl font-bold text-gray-800 group-hover:text-white mb-2 transition-colors duration-300">{mode.name}</h2>
                <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">{mode.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isGameActive && questionsAnswered > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-12 shadow-2xl max-w-md w-full text-center">
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Game Over!</h2>
          <div className="space-y-3 mb-8">
            <p className="text-2xl text-gray-700">Final Score: <span className="font-bold text-indigo-600">{score}</span></p>
            <p className="text-xl text-gray-600">Questions: {questionsAnswered}</p>
            <p className="text-xl text-gray-600">Best Streak: {bestStreak}</p>
            <p className="text-xl text-gray-600">Accuracy: {questionsAnswered > 0 ? Math.round((score / (questionsAnswered * 10)) * 100) : 0}%</p>
          </div>
          <button onClick={resetGame} className="w-full bg-indigo-600 text-white py-3 rounded-lg text-lg hover:bg-indigo-700 transition-colors">
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-gray-500">Score</p>
                <p className="text-3xl font-bold text-indigo-600">{score}</p>
              </div>
              {gameMode === 'speed' && (
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="text-3xl font-bold text-red-600">{timeLeft}s</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Streak</p>
                <p className="text-3xl font-bold text-green-600">{streak}</p>
              </div>
            </div>
            <button onClick={resetGame} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              Exit
            </button>
          </div>

          {currentQuestion && (
            <div className="mb-8">
              <div className="bg-indigo-50 rounded-xl p-6 mb-6">
                <p className="text-sm text-indigo-600 mb-2 uppercase tracking-wide">{currentQuestion.type}</p>
                <p className="text-2xl text-gray-800 font-medium">{currentQuestion.question}</p>
                {(currentQuestion.hint && (character.skills.hintsUnlocked > 0 || difficulty === 'easy')) && (
                  <p className="text-sm text-gray-500 mt-3 italic">💡 Hint: {currentQuestion.hint}</p>
                )}
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                  placeholder="Type your answer..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-indigo-500 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={checkAnswer}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Submit Answer
                </button>
              </div>

              {feedback && (
                <div className={`mt-4 p-4 rounded-lg text-center font-semibold ${
                  feedback.includes('✓') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {feedback}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}