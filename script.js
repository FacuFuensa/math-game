// Math Arena Game - Vanilla JavaScript Version

class MathArena {
    constructor() {
        this.gameMode = null;
        this.difficulty = null;
        this.currentQuestion = null;
        this.userAnswer = '';
        this.score = 0;
        this.questionsAnswered = 0;
        this.timeLeft = 60;
        this.isGameActive = false;
        this.feedback = '';
        this.streak = 0;
        this.bestStreak = 0;
        this.showCharacter = false;
        this.showEmailPrompt = false;
        this.showTutorial = false;
        this.showDifficultySelect = false;
        this.selectedMode = null;
        this.userEmail = null;
        this.saveMessage = '';
        this.timer = null;
        this.secondChanceUsed = false;
        this.streakProtectorUsed = false;
        this.wrongAttempts = 0;
        
        this.character = {
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
        };
        
        this.gameModes = [
            { id: 'speed', name: 'Speed Round', icon: '⚡', desc: '60 seconds, as many as you can!' },
            { id: 'accuracy', name: 'Accuracy Challenge', icon: '🎯', desc: '10 questions, perfect score wins' },
            { id: 'endurance', name: 'Endurance Mode', icon: '🏆', desc: 'Keep going until you miss 3' }
        ];
        
        this.skillDescriptions = {
            speedBonus: { name: 'Time Extension', desc: '+10 seconds per level in Speed Mode', icon: '⏰' },
            scoreMultiplier: { name: 'Score Boost', desc: '+5 points per correct answer per level', icon: '📈' },
            hintsUnlocked: { name: 'Hint Master', desc: 'Show hints on difficult questions', icon: '✨' },
            secondChance: { name: 'Second Chance', desc: 'Get 1 extra attempt before marking wrong', icon: '🎯' },
            streakProtector: { name: 'Streak Shield', desc: 'Protect your streak once per game', icon: '⭐' }
        };
        
        this.init();
    }
    
    init() {
        const savedEmail = localStorage.getItem('mathArenaEmail');
        const hasSeenTutorial = localStorage.getItem('mathArenaTutorial');
        
        if (savedEmail) {
            this.userEmail = savedEmail;
            this.loadProgress(savedEmail);
        }
        
        if (!hasSeenTutorial) {
            this.showTutorial = true;
        }
        
        this.render();
    }
    
    getXpForLevel(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    }
    
    addXp(amount) {
        const newXp = this.character.xp + amount;
        const newTotalXp = this.character.totalXp + amount;
        const xpNeeded = this.getXpForLevel(this.character.level);
        
        if (newXp >= xpNeeded) {
            this.character.level++;
            this.character.xp = newXp - xpNeeded;
            this.character.totalXp = newTotalXp;
            this.character.skillPoints++;
            this.feedback = '🎉 LEVEL UP! You earned a skill point!';
        } else {
            this.character.xp = newXp;
            this.character.totalXp = newTotalXp;
        }
        
        if (this.userEmail) {
            this.saveProgress();
        }
    }
    
    saveProgress() {
        if (!this.userEmail) return;
        const progressData = {
            email: this.userEmail,
            character: this.character,
            lastPlayed: new Date().toISOString()
        };
        localStorage.setItem(`mathArena_${this.userEmail}`, JSON.stringify(progressData));
        localStorage.setItem('mathArenaEmail', this.userEmail);
    }
    
    loadProgress(email) {
        const savedData = localStorage.getItem(`mathArena_${email}`);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            this.character = parsed.character;
            this.saveMessage = '✓ Progress loaded!';
            setTimeout(() => {
                this.saveMessage = '';
                this.render();
            }, 3000);
        }
    }
    
    upgradeSkill(skillName) {
        if (this.character.skillPoints > 0 && this.character.skills[skillName] < 5) {
            this.character.skillPoints--;
            this.character.skills[skillName]++;
            if (this.userEmail) {
                this.saveProgress();
            }
            this.render();
        }
    }
    
    generateQuestion() {
        const types = this.difficulty === 'easy' ? ['arithmetic', 'algebra'] : 
                      this.difficulty === 'medium' ? ['arithmetic', 'algebra', 'calculus'] :
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
                { next: 32, question: '2, 4, 8, 16, ?' },
                { next: 8, question: '1, 1, 2, 3, 5, ? (Fibonacci)' },
                { next: 48, question: '3, 6, 12, 24, ?' }
            ];
            const pattern = patterns[Math.floor(Math.random() * patterns.length)];
            return {
                question: `What comes next? ${pattern.question}`,
                answer: pattern.next.toString(),
                type
            };
        }
    }
    
    startGame(mode, diff) {
        this.gameMode = mode;
        this.difficulty = diff;
        this.score = 0;
        this.questionsAnswered = 0;
        this.streak = 0;
        const baseTime = 60 + (this.character.skills.speedBonus * 10);
        this.timeLeft = baseTime;
        this.isGameActive = true;
        this.currentQuestion = this.generateQuestion();
        this.feedback = '';
        this.secondChanceUsed = false;
        this.streakProtectorUsed = false;
        this.wrongAttempts = 0;
        
        if (mode === 'speed') {
            this.timer = setInterval(() => {
                this.timeLeft--;
                if (this.timeLeft <= 0) {
                    this.endGame();
                }
                this.render();
            }, 1000);
        }
        
        this.render();
    }
    
    checkAnswer() {
        const input = document.getElementById('answer-input');
        if (!input || !input.value.trim()) return;
        
        const userAns = input.value.trim();
        const isCorrect = userAns.toLowerCase().replace(/\s/g, '') === 
                          this.currentQuestion.answer.toLowerCase().replace(/\s/g, '');
        
        if (isCorrect) {
            const baseScore = 10;
            const bonusScore = this.character.skills.scoreMultiplier * 5;
            const totalPoints = baseScore + bonusScore;
            
            this.score += totalPoints;
            this.streak++;
            if (this.streak > this.bestStreak) this.bestStreak = this.streak;
            
            const xpReward = this.difficulty === 'easy' ? 10 : this.difficulty === 'medium' ? 20 : 30;
            this.addXp(xpReward);
            
            this.feedback = `✓ Correct! +${totalPoints} points, +${xpReward} XP`;
            this.wrongAttempts = 0;
            
            setTimeout(() => {
                this.questionsAnswered++;
                this.currentQuestion = this.generateQuestion();
                this.feedback = '';
                this.render();
                
                if (this.gameMode === 'accuracy' && this.questionsAnswered >= 10) {
                    setTimeout(() => this.endGame(), 500);
                } else {
                    // Refocus input after render
                    setTimeout(() => {
                        const input = document.getElementById('answer-input');
                        if (input) input.focus();
                    }, 0);
                }
            }, 800);
        } else {
            if (this.character.skills.secondChance > 0 && !this.secondChanceUsed && this.wrongAttempts === 0) {
                this.wrongAttempts = 1;
                this.feedback = '⚠️ Second Chance! Try again.';
                input.value = '';
                setTimeout(() => {
                    this.feedback = '';
                    this.render();
                    // Refocus input after render
                    setTimeout(() => {
                        const newInput = document.getElementById('answer-input');
                        if (newInput) newInput.focus();
                    }, 0);
                }, 1500);
                this.render();
                return;
            }
            
            if (this.character.skills.streakProtector > 0 && !this.streakProtectorUsed && this.streak >= 3) {
                this.streakProtectorUsed = true;
                this.feedback = `✗ Incorrect. Answer: ${this.currentQuestion.answer} | 🛡️ Streak Protected!`;
            } else {
                this.feedback = `✗ Incorrect. Answer: ${this.currentQuestion.answer}`;
                this.streak = 0;
            }
            
            this.secondChanceUsed = true;
            this.wrongAttempts = 0;
            
            setTimeout(() => {
                this.questionsAnswered++;
                this.currentQuestion = this.generateQuestion();
                this.feedback = '';
                this.render();
                
                if (this.gameMode === 'accuracy' && this.questionsAnswered >= 10) {
                    setTimeout(() => this.endGame(), 500);
                } else {
                    // Refocus input after render
                    setTimeout(() => {
                        const input = document.getElementById('answer-input');
                        if (input) input.focus();
                    }, 0);
                }
            }, 1500);
        }
        
        this.render();
    }
    
    endGame() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.isGameActive = false;
        this.currentQuestion = null;
        this.render();
    }
    
    resetGame() {
        this.gameMode = null;
        this.difficulty = null;
        this.isGameActive = false;
        this.currentQuestion = null;
        this.showDifficultySelect = false;
        this.selectedMode = null;
        this.render();
    }
    
    render() {
        const app = document.getElementById('app');
        
        if (!this.gameMode) {
            if (this.showTutorial) {
                app.innerHTML = this.renderTutorial();
                return;
            }
            
            if (this.showEmailPrompt) {
                app.innerHTML = this.renderEmailPrompt();
                this.attachEmailListeners();
                return;
            }
            
            if (this.showDifficultySelect && this.selectedMode) {
                app.innerHTML = this.renderDifficultySelect();
                return;
            }
            
            if (this.showCharacter) {
                app.innerHTML = this.renderCharacterScreen();
                return;
            }
            
            app.innerHTML = this.renderMainMenu();
            return;
        }
        
        if (!this.isGameActive && this.questionsAnswered > 0) {
            app.innerHTML = this.renderGameOver();
            return;
        }
        
        app.innerHTML = this.renderGame();
        this.attachGameListeners();
    }
    
    renderTutorial() {
        return `
            <div class="screen tutorial-screen">
                <div class="modal tutorial-modal">
                    <h2>Welcome to Math Arena! 🎮</h2>
                    
                    <div class="tutorial-section">
                        <h3>⚡ How to Play</h3>
                        <ol>
                            <li>Choose a game mode: Speed Round, Accuracy Challenge, or Endurance Mode</li>
                            <li>Select your difficulty: Easy, Medium, or Hard</li>
                            <li>Answer math questions as fast and accurately as possible!</li>
                            <li>Type your answer and hit Enter or click Submit</li>
                        </ol>
                    </div>

                    <div class="tutorial-section">
                        <h3>⭐ Level Up System</h3>
                        <ul>
                            <li>Earn XP for every correct answer (10/20/30 based on difficulty)</li>
                            <li>Level up to unlock skill points</li>
                            <li>Spend skill points on powerful upgrades</li>
                            <li>Click your character badge to view stats and upgrade skills</li>
                        </ul>
                    </div>

                    <div class="tutorial-section">
                        <h3>🏆 Game Modes</h3>
                        <div class="mode-info">
                            <p><strong>⚡ Speed Round:</strong> Answer as many questions as you can in 60 seconds!</p>
                            <p><strong>🎯 Accuracy Challenge:</strong> 10 questions - aim for a perfect score!</p>
                            <p><strong>🏆 Endurance Mode:</strong> Keep going as long as you can!</p>
                        </div>
                    </div>

                    <div class="tutorial-section">
                        <h3>💾 Save Your Progress</h3>
                        <p>Click "Save Progress" and enter your email to keep your character, level, and skills across sessions. Your data stays in your browser - we never send it anywhere!</p>
                    </div>

                    <button class="btn-primary btn-large" onclick="game.closeTutorial()">Let's Play! 🚀</button>
                </div>
            </div>
        `;
    }
    
    closeTutorial() {
        localStorage.setItem('mathArenaTutorial', 'seen');
        this.showTutorial = false;
        this.render();
    }
    
    renderEmailPrompt() {
        return `
            <div class="screen email-screen">
                <div class="modal email-modal">
                    <h2>Save Your Progress</h2>
                    <p>Enter your email to keep your character level, XP, and skills across sessions!</p>
                    
                    <input type="email" id="email-input" placeholder="your.email@example.com" class="email-input">
                    
                    ${this.saveMessage ? `<p class="save-message ${this.saveMessage.includes('✓') ? 'success' : 'error'}">${this.saveMessage}</p>` : ''}
                    
                    <div class="button-group">
                        <button class="btn-primary" onclick="game.handleEmailSubmit()">Save Progress</button>
                        <button class="btn-secondary" onclick="game.closeEmailPrompt()">Skip</button>
                    </div>
                    
                    <p class="disclaimer">Your data is stored locally in your browser. We don't send it anywhere.</p>
                </div>
            </div>
        `;
    }
    
    attachEmailListeners() {
        const input = document.getElementById('email-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleEmailSubmit();
                }
            });
        }
    }
    
    handleEmailSubmit() {
        const input = document.getElementById('email-input');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(input.value)) {
            this.userEmail = input.value;
            this.loadProgress(input.value);
            this.showEmailPrompt = false;
            this.saveMessage = '✓ Progress will be saved!';
            setTimeout(() => {
                this.saveMessage = '';
                this.render();
            }, 3000);
            this.render();
        } else {
            this.saveMessage = '❌ Please enter a valid email';
            this.render();
            setTimeout(() => {
                this.saveMessage = '';
                this.render();
            }, 3000);
        }
    }
    
    closeEmailPrompt() {
        this.showEmailPrompt = false;
        this.render();
    }
    
    renderDifficultySelect() {
        const mode = this.gameModes.find(m => m.id === this.selectedMode);
        return `
            <div class="screen difficulty-screen">
                <div class="modal difficulty-modal">
                    <button class="back-btn" onclick="game.showDifficultySelect = false; game.render()">← Back</button>
                    
                    <div class="mode-header">
                        <div class="mode-icon">${mode.icon}</div>
                        <h2>${mode.name}</h2>
                        <p>${mode.desc}</p>
                    </div>

                    <h3>Choose Your Difficulty</h3>
                    
                    <div class="difficulty-buttons">
                        <button class="difficulty-btn easy" onclick="game.selectDifficulty('easy')">
                            <span class="diff-emoji">🌱</span>
                            <span class="diff-name">Easy</span>
                            <span class="diff-desc">Basic arithmetic and simple algebra</span>
                        </button>
                        <button class="difficulty-btn medium" onclick="game.selectDifficulty('medium')">
                            <span class="diff-emoji">⚡</span>
                            <span class="diff-name">Medium</span>
                            <span class="diff-desc">Algebra and calculus fundamentals</span>
                        </button>
                        <button class="difficulty-btn hard" onclick="game.selectDifficulty('hard')">
                            <span class="diff-emoji">🔥</span>
                            <span class="diff-name">Hard</span>
                            <span class="diff-desc">Advanced calculus and logic puzzles</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    selectGameMode(modeId) {
        this.selectedMode = modeId;
        this.showDifficultySelect = true;
        this.render();
    }
    
    selectDifficulty(diff) {
        this.startGame(this.selectedMode, diff);
        this.showDifficultySelect = false;
    }
    
    renderCharacterScreen() {
        const xpNeeded = this.getXpForLevel(this.character.level);
        const xpPercent = (this.character.xp / xpNeeded) * 100;
        
        return `
            <div class="screen character-screen">
                <div class="character-container">
                    <button class="back-btn" onclick="game.showCharacter = false; game.render()">← Back to Games</button>
                    
                    <div class="character-header">
                        <div>
                            <h1>${this.character.name}</h1>
                            <div class="character-stats">
                                <span class="level">Level ${this.character.level}</span>
                                <span class="total-xp">Total XP: ${this.character.totalXp}</span>
                            </div>
                            ${this.userEmail ? `<p class="saved-email">✓ Progress saved to: ${this.userEmail}</p>` : ''}
                        </div>
                        <div class="character-icon">👤</div>
                    </div>

                    ${this.saveMessage ? `<div class="save-message ${this.saveMessage.includes('✓') ? 'success' : 'error'}">${this.saveMessage}</div>` : ''}

                    ${!this.userEmail ? `
                        <div class="warning-box">
                            <p>⚠️ Your progress is not saved! Add your email to keep your character across sessions.</p>
                            <button class="btn-warning" onclick="game.showEmailPrompt = true; game.render()">Save My Progress</button>
                        </div>
                    ` : `
                        <div class="logout-container">
                            <button class="logout-btn" onclick="game.handleLogout()">Logout & Reset Character</button>
                        </div>
                    `}

                    <div class="xp-bar-container">
                        <div class="xp-label">
                            <span>XP Progress</span>
                            <span>${this.character.xp} / ${xpNeeded}</span>
                        </div>
                        <div class="xp-bar">
                            <div class="xp-fill" style="width: ${xpPercent}%"></div>
                        </div>
                    </div>

                    <div class="skill-points-header">
                        <h2>Skill Points Available: <span class="points">${this.character.skillPoints}</span></h2>
                        <p>Earn skill points by leveling up. Max 5 points per skill.</p>
                    </div>

                    <div class="skills-list">
                        ${Object.entries(this.skillDescriptions).map(([key, skill]) => {
                            const currentLevel = this.character.skills[key];
                            return `
                                <div class="skill-card">
                                    <div class="skill-info">
                                        <span class="skill-icon">${skill.icon}</span>
                                        <div class="skill-details">
                                            <h3>${skill.name}</h3>
                                            <p>${skill.desc}</p>
                                            <div class="skill-levels">
                                                ${[1,2,3,4,5].map(i => `
                                                    <div class="skill-level ${i <= currentLevel ? 'active' : ''}">${i}</div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        class="upgrade-btn ${this.character.skillPoints === 0 || currentLevel >= 5 ? 'disabled' : ''}"
                                        onclick="game.upgradeSkill('${key}')"
                                        ${this.character.skillPoints === 0 || currentLevel >= 5 ? 'disabled' : ''}
                                    >
                                        Upgrade
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    handleLogout() {
        localStorage.removeItem('mathArenaEmail');
        this.userEmail = null;
        this.character = {
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
        };
        this.saveMessage = '✓ Logged out';
        setTimeout(() => {
            this.saveMessage = '';
            this.render();
        }, 3000);
        this.render();
    }
    
    renderMainMenu() {
        return `
            <div class="screen main-menu">
                <div class="menu-header">
                    <div class="title-section">
                        <h1>Math Arena</h1>
                        <p>Challenge your mathematical skills!</p>
                        ${this.userEmail ? `<p class="logged-in">✓ Logged in as: ${this.userEmail}</p>` : ''}
                    </div>
                    <div class="header-buttons">
                        ${!this.userEmail ? `
                            <button class="save-progress-btn" onclick="game.showEmailPrompt = true; game.render()">
                                💾 Save Progress
                            </button>
                        ` : ''}
                        <button class="character-btn" onclick="game.showCharacter = true; game.render()">
                            <span class="char-icon">👤</span>
                            <div class="char-info">
                                <div class="char-level">Level ${this.character.level}</div>
                                <div class="char-points">${this.character.skillPoints} skill points</div>
                            </div>
                        </button>
                    </div>
                </div>

                ${this.saveMessage ? `<div class="save-message ${this.saveMessage.includes('✓') ? 'success' : 'error'}">${this.saveMessage}</div>` : ''}

                <div class="how-to-play">
                    <button onclick="game.showTutorial = true; game.render()">
                        ✨ How to Play
                    </button>
                </div>

                <div class="game-modes">
                    ${this.gameModes.map(mode => `
                        <button class="mode-card" onclick="game.selectGameMode('${mode.id}')">
                            <div class="mode-icon">${mode.icon}</div>
                            <h2>${mode.name}</h2>
                            <p>${mode.desc}</p>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    renderGameOver() {
        const accuracy = this.questionsAnswered > 0 ? Math.round((this.score / (this.questionsAnswered * 10)) * 100) : 0;
        return `
            <div class="screen game-over-screen">
                <div class="game-over-modal">
                    <div class="trophy-icon">🏆</div>
                    <h2>Game Over!</h2>
                    <div class="final-stats">
                        <div class="stat">
                            <span class="stat-label">Final Score</span>
                            <span class="stat-value">${this.score}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Questions</span>
                            <span class="stat-value">${this.questionsAnswered}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Best Streak</span>
                            <span class="stat-value">${this.bestStreak}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Accuracy</span>
                            <span class="stat-value">${accuracy}%</span>
                        </div>
                    </div>
                    <button class="btn-primary btn-large" onclick="game.resetGame()">Play Again</button>
                </div>
            </div>
        `;
    }
    
    renderGame() {
        return `
            <div class="screen game-screen">
                <div class="game-container">
                    <div class="game-header">
                        <div class="game-stats">
                            <div class="stat-box">
                                <span class="stat-label">Score</span>
                                <span class="stat-value">${this.score}</span>
                            </div>
                            ${this.gameMode === 'speed' ? `
                                <div class="stat-box">
                                    <span class="stat-label">Time</span>
                                    <span class="stat-value time">${this.timeLeft}s</span>
                                </div>
                            ` : ''}
                            <div class="stat-box">
                                <span class="stat-label">Streak</span>
                                <span class="stat-value streak">${this.streak}</span>
                            </div>
                        </div>
                        <button class="exit-btn" onclick="game.resetGame()">Exit</button>
                    </div>

                    ${this.currentQuestion ? `
                        <div class="question-container">
                            <div class="question-box">
                                <span class="question-type">${this.currentQuestion.type}</span>
                                <p class="question-text">${this.currentQuestion.question}</p>
                                ${this.currentQuestion.hint && (this.character.skills.hintsUnlocked > 0 || this.difficulty === 'easy') ? `
                                    <p class="hint">💡 Hint: ${this.currentQuestion.hint}</p>
                                ` : ''}
                            </div>

                            <div class="answer-section">
                                <input 
                                    type="text" 
                                    id="answer-input" 
                                    placeholder="Type your answer..." 
                                    class="answer-input"
                                    autofocus
                                >
                                <button class="submit-btn" onclick="game.checkAnswer()">Submit Answer</button>
                            </div>

                            ${this.feedback ? `
                                <div class="feedback ${this.feedback.includes('✓') ? 'correct' : 'incorrect'}">
                                    ${this.feedback}
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    attachGameListeners() {
        const input = document.getElementById('answer-input');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkAnswer();
                }
            });
            // Focus the input immediately
            setTimeout(() => input.focus(), 0);
        }
    }
}

// Initialize game when page loads
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new MathArena();
});
