// =============================================
//   QUIZ GAME - script.js
//   All game logic goes here
// =============================================


// ─────────────────────────────────────────────
// SECTION 1: QUIZ DATA
// This is your question bank. Edit here to
// change questions, answers, difficulty, etc.
// ─────────────────────────────────────────────

const quizData = [
    {
        id: 1,
        type: 'single',                      // Single choice = pick ONE answer
        question: '🇫🇷 What is the capital of France?',
        options: ['London', 'Berlin', 'Paris', 'Madrid'],
        correctAnswer: 'Paris',
        difficulty: 'easy',
        category: 'Geography'
    },
    {
        id: 2,
        type: 'multiple',                    // Multiple choice = pick MANY answers
        question: '💻 Which are programming languages? (Select ALL that apply)',
        options: ['Python', 'HTML', 'JavaScript', 'CSS'],
        correctAnswers: ['Python', 'JavaScript'],   // Note: array of answers
        difficulty: 'medium',
        category: 'Technology'
    },
    {
        id: 3,
        type: 'fill',                        // Fill in the blank = type answer
        question: '🌿 Plants make food using sunlight in a process called _________.',
        correctAnswer: 'photosynthesis',
        placeholder: 'Type your answer...',
        difficulty: 'medium',
        category: 'Science'
    },
    {
        id: 4,
        type: 'single',
        question: '🪐 What is the largest planet in our solar system?',
        options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
        correctAnswer: 'Jupiter',
        difficulty: 'easy',
        category: 'Science'
    },
    {
        id: 5,
        type: 'multiple',
        question: '🔢 Which of these are prime numbers? (Select ALL that apply)',
        options: ['2', '4', '7', '9', '11'],
        correctAnswers: ['2', '7', '11'],
        difficulty: 'hard',
        category: 'Mathematics'
    },
    {
        id: 6,
        type: 'fill',
        question: '⚗️ The chemical symbol for water is _________.',
        correctAnswer: 'H2O',
        placeholder: 'Enter the formula...',
        difficulty: 'easy',
        category: 'Science'
    },
    {
        id: 7,
        type: 'single',
        question: '🎨 Who painted the Mona Lisa?',
        options: ['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Michelangelo'],
        correctAnswer: 'Leonardo da Vinci',
        difficulty: 'medium',
        category: 'Art'
    },
    {
        id: 8,
        type: 'multiple',
        question: '🌍 Which continents are in the Southern Hemisphere? (Select ALL that apply)',
        options: ['Antarctica', 'Australia', 'Europe', 'South America', 'Africa'],
        correctAnswers: ['Antarctica', 'Australia', 'South America', 'Africa'],
        difficulty: 'hard',
        category: 'Geography'
    }
];


// ─────────────────────────────────────────────
// SECTION 2: GAME STATE VARIABLES
// These variables track everything during quiz
// ─────────────────────────────────────────────

let current       = 0;     // which question we're on (0 = first)
let answers       = {};    // stores user's answers { questionId: answer }
let streak        = 0;     // current correct streak count
let maxStreak     = 0;     // best streak ever in this game
let combo         = 1;     // combo multiplier (max 5x)
let achievements  = [];    // list of achievements unlocked
let correct       = {};    // stores if each answer was correct { questionId: true/false }
let timeLeft      = 30;    // countdown timer seconds
let timerInterval = null;  // reference to setInterval so we can stop it


// ─────────────────────────────────────────────
// SECTION 3: PAGE NAVIGATION
// The app has 3 "pages": landing, quiz, results
// We show/hide them using CSS classes
// ─────────────────────────────────────────────

// Show a specific page, hide all others
function showPage(pageId) {
    // Remove 'active' class from ALL pages
    document.querySelectorAll('.page').forEach(function(page) {
        page.classList.remove('active');
    });
    // Add 'active' class to the page we want
    document.getElementById(pageId).classList.add('active');
}

// Called when user clicks "Start Quiz"
function startQuiz() {
    resetState();           // clear any old data
    showPage('page-quiz');  // go to quiz page
    renderQuestion();       // load first question
}

// Called when user clicks "Play Again"
function restartQuiz() {
    resetState();
    showPage('page-quiz');
    renderQuestion();
}

// Reset all variables to starting values
function resetState() {
    current      = 0;
    answers      = {};
    streak       = 0;
    maxStreak    = 0;
    combo        = 1;
    achievements = [];
    correct      = {};

    // Also reset the display on screen
    document.getElementById('streak-display').textContent = '0';
    document.getElementById('combo-display').textContent  = 'x1';
}


// ─────────────────────────────────────────────
// SECTION 4: TIMER
// Counts down from 30 seconds per question
// Auto-submits when it hits 0
// ─────────────────────────────────────────────

function startTimer() {
    clearInterval(timerInterval);  // stop any existing timer first
    timeLeft = 30;
    updateTimerDisplay();

    // setInterval runs a function every 1000ms (1 second)
    timerInterval = setInterval(function() {
        timeLeft--;                // decrease by 1
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);  // stop timer
            processAnswer();               // auto-submit
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerEl = document.getElementById('timer-display');
    timerEl.textContent = timeLeft + 's';

    // Turn red and pulse when under 10 seconds
    if (timeLeft <= 10) {
        timerEl.className = 'topbar-value timer-warn';
    } else {
        timerEl.className = 'topbar-value timer-ok';
    }
}


// ─────────────────────────────────────────────
// SECTION 5: RENDER QUESTION
// Builds the HTML for the current question
// and puts it on the screen
// ─────────────────────────────────────────────

function renderQuestion() {
    const q = quizData[current];  // get current question object

    // --- Update progress bar ---
    const progressPercent = ((current + 1) / quizData.length) * 100;
    document.getElementById('progress-label').textContent = 'Question ' + (current + 1) + ' of ' + quizData.length;
    document.getElementById('progress-pct').textContent   = Math.round(progressPercent) + '%';
    document.getElementById('progress-fill').style.width  = progressPercent + '%';

    // --- Update badges (difficulty, category, type) ---
    document.getElementById('q-badges').innerHTML =
        '<span class="badge badge-' + q.difficulty + '">' + q.difficulty + '</span>' +
        '<span class="badge badge-cat">' + q.category + '</span>' +
        '<span class="badge badge-type">' + getTypeLabel(q.type) + '</span>';

    // --- Update question text ---
    document.getElementById('q-text').textContent = q.question;

    // --- Render answers based on question type ---
    const container = document.getElementById('q-options');

    if (q.type === 'fill') {
        // FILL IN THE BLANK: show text input box
        container.innerHTML =
            '<input class="fill-input" id="fill-input" placeholder="' + q.placeholder + '" oninput="onFillInput(this.value)">';
        // Restore previously typed answer if user went back
        document.getElementById('fill-input').value = answers[q.id] || '';

    } else {
        // SINGLE or MULTIPLE CHOICE: show clickable options
        const savedAnswer = answers[q.id] || (q.type === 'multiple' ? [] : null);
        let optionsHTML = '<div class="options">';

        q.options.forEach(function(opt) {
            // Check if this option is already selected
            const isSelected = q.type === 'single'
                ? savedAnswer === opt
                : savedAnswer.includes(opt);

            optionsHTML +=
                '<div class="option' + (isSelected ? ' selected' : '') + '" onclick="selectOption(\'' + escapeQuote(opt) + '\')">' +
                    '<div class="opt-dot">' + (isSelected ? '✓' : '') + '</div>' +
                    '<span>' + opt + '</span>' +
                '</div>';
        });

        optionsHTML += '</div>';
        container.innerHTML = optionsHTML;
    }

    // --- Update navigation buttons ---
    document.getElementById('btn-prev').disabled    = (current === 0);   // disable Prev on first question
    document.getElementById('btn-next').textContent = (current === quizData.length - 1) ? '🏁 Finish' : 'Next →';

    updateNextButton();
    startTimer();   // start the countdown for this question
}

// Helper: get readable label for question type
function getTypeLabel(type) {
    if (type === 'single')   return 'Single Choice';
    if (type === 'multiple') return 'Multiple Choice';
    if (type === 'fill')     return 'Fill in the Blank';
    return type;
}

// Helper: escape single quotes in option text (for HTML onclick)
function escapeQuote(str) {
    return str.replace(/'/g, "\\'");
}


// ─────────────────────────────────────────────
// SECTION 6: USER INTERACTIONS
// Handles when user clicks options or types
// ─────────────────────────────────────────────

// Called when user clicks an answer option
function selectOption(option) {
    const q = quizData[current];

    if (q.type === 'single') {
        // Single choice: just save the one option
        answers[q.id] = option;

    } else if (q.type === 'multiple') {
        // Multiple choice: toggle option in/out of array
        if (!answers[q.id]) {
            answers[q.id] = [];   // create empty array if first selection
        }

        const index = answers[q.id].indexOf(option);
        if (index > -1) {
            // Option already selected → remove it (deselect)
            answers[q.id].splice(index, 1);
        } else {
            // Option not selected → add it (select)
            answers[q.id].push(option);
        }
    }

    renderQuestion();  // re-render to show selection visually
}

// Called every time user types in the fill-in-the-blank box
function onFillInput(value) {
    answers[quizData[current].id] = value;  // save what they typed
    updateNextButton();                     // enable/disable Next button
}

// Update the Next button and hint text based on whether question is answered
function updateNextButton() {
    const answered = isAnswered();
    document.getElementById('btn-next').disabled = !answered;

    // Show hint if not yet answered
    const q = quizData[current];
    document.getElementById('hint-text').textContent = answered ? '' :
        (q.type === 'multiple' ? '💡 Select all that apply to continue' : '💡 Answer to continue');
}

// Check if current question has been answered
function isAnswered() {
    const q = quizData[current];
    const a = answers[q.id];

    if (q.type === 'fill')     return a && a.trim() !== '';  // has text
    if (q.type === 'single')   return !!a;                   // has selection
    if (q.type === 'multiple') return a && a.length > 0;     // has at least one
    return false;
}


// ─────────────────────────────────────────────
// SECTION 7: NAVIGATION (Prev / Next)
// ─────────────────────────────────────────────

function goPrev() {
    if (current > 0) {
        current--;
        renderQuestion();
    }
}

function goNext() {
    if (!isAnswered()) return;      // safety check
    clearInterval(timerInterval);   // stop timer
    processAnswer();                // check the answer
}


// ─────────────────────────────────────────────
// SECTION 8: ANSWER PROCESSING
// Checks answer, updates streak, shows feedback
// ─────────────────────────────────────────────

function processAnswer() {
    const isCorrect = checkAnswer();              // is the answer right?
    correct[quizData[current].id] = isCorrect;   // save result

    showFeedback(isCorrect);   // show big ✓ or ✗

    if (isCorrect) {
        // Correct: increase streak and combo
        streak++;
        maxStreak = Math.max(maxStreak, streak);
        combo     = Math.min(streak, 5);          // max combo is 5x
        checkAchievements();                      // maybe unlock achievement
        spawnConfetti();                          // celebration effect!
    } else {
        // Wrong: reset streak and combo
        streak = 0;
        combo  = 1;
    }

    // Update the display
    document.getElementById('streak-display').textContent = streak;
    document.getElementById('combo-display').textContent  = 'x' + combo;

    // Wait 1.4 seconds then move to next question (or results)
    setTimeout(function() {
        hideFeedback();

        if (current < quizData.length - 1) {
            current++;          // go to next question
            renderQuestion();
        } else {
            showResults();      // all questions done!
        }
    }, 1400);
}

// Compare the user's answer with the correct answer
function checkAnswer() {
    const q = quizData[current];
    const a = answers[q.id];

    if (q.type === 'single') {
        return a === q.correctAnswer;

    } else if (q.type === 'fill') {
        // Case-insensitive, ignore extra spaces
        return a && a.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();

    } else if (q.type === 'multiple') {
        if (!a) return false;
        // Both sets must have same items
        const correctSet = new Set(q.correctAnswers);
        const userSet    = new Set(a);
        if (correctSet.size !== userSet.size) return false;
        for (const item of correctSet) {
            if (!userSet.has(item)) return false;
        }
        return true;
    }
    return false;
}


// ─────────────────────────────────────────────
// SECTION 9: VISUAL FEEDBACK
// Shows ✓ or ✗ overlay after answering
// ─────────────────────────────────────────────

function showFeedback(isCorrect) {
    const overlay = document.getElementById('feedback-overlay');
    const bubble  = document.getElementById('feedback-bubble');

    bubble.textContent = isCorrect ? '✓' : '✗';
    bubble.className   = 'feedback-bubble ' + (isCorrect ? 'fb-correct' : 'fb-wrong');
    overlay.classList.add('show');    // make visible
}

function hideFeedback() {
    document.getElementById('feedback-overlay').classList.remove('show');
}


// ─────────────────────────────────────────────
// SECTION 10: ACHIEVEMENTS
// Unlock special badges for doing well
// ─────────────────────────────────────────────

function checkAchievements() {
    const toUnlock = [];

    // Check each achievement condition
    if (streak === 3) {
        toUnlock.push({ icon: '🔥', title: 'On Fire!',      desc: '3 correct answers in a row!' });
    }
    if (streak === 5) {
        toUnlock.push({ icon: '⚡', title: 'Unstoppable!',  desc: '5 correct streak!' });
    }
    if (timeLeft >= 25) {
        toUnlock.push({ icon: '💨', title: 'Speed Demon!',  desc: 'Answered in under 5 seconds!' });
    }

    // Add new achievements (avoid duplicates)
    toUnlock.forEach(function(newAch) {
        const alreadyHave = achievements.find(function(a) { return a.title === newAch.title; });
        if (!alreadyHave) {
            achievements.push(newAch);
            showToast(newAch);   // show popup notification
        }
    });
}

// Show the toast notification in top-right corner
function showToast(achievement) {
    document.getElementById('toast-icon').textContent  = achievement.icon;
    document.getElementById('toast-title').textContent = achievement.title;
    document.getElementById('toast-desc').textContent  = achievement.desc;

    const toast = document.getElementById('achievement-toast');
    toast.classList.add('show');

    // Auto-hide after 3 seconds
    setTimeout(function() {
        toast.classList.remove('show');
    }, 3000);
}


// ─────────────────────────────────────────────
// SECTION 11: CONFETTI EFFECT
// Spawns colorful falling pieces on correct answer
// ─────────────────────────────────────────────

function spawnConfetti() {
    const colors = ['#7c6dfa', '#fa6d8f', '#6dfad3', '#fbbf24', '#ffffff'];

    for (let i = 0; i < 40; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';

        // Random position, color, shape, timing
        piece.style.cssText =
            'left:'               + (Math.random() * 100) + '%;' +
            'top: -10px;' +
            'background:'        + colors[Math.floor(Math.random() * colors.length)] + ';' +
            'animation-delay:'   + (Math.random() * 0.5) + 's;' +
            'animation-duration:'+ (1.5 + Math.random()) + 's;' +
            'transform: rotate(' + (Math.random() * 360) + 'deg);' +
            'border-radius:'     + (Math.random() > 0.5 ? '50%' : '2px') + ';';

        document.body.appendChild(piece);

        // Remove from DOM after animation ends
        setTimeout(function() { piece.remove(); }, 3000);
    }
}


// ─────────────────────────────────────────────
// SECTION 12: RESULTS PAGE
// Calculate and display the final score
// ─────────────────────────────────────────────

function showResults() {
    clearInterval(timerInterval);   // make sure timer is stopped

    // Count correct answers
    const score      = Object.values(correct).filter(Boolean).length;
    const percentage = Math.round((score / quizData.length) * 100);

    // Choose grade message based on percentage
    const grades = [
        { min: 90, grade: 'LEGENDARY! 🏆',  msg: "You're in a league of your own!" },
        { min: 75, grade: 'EXCELLENT! 🌟',  msg: 'Outstanding performance!'        },
        { min: 60, grade: 'GREAT JOB! 👍',  msg: 'You really know your stuff!'     },
        { min: 40, grade: 'KEEP GOING! 💪', msg: 'Practice makes perfect!'         },
        { min: 0,  grade: 'TRY AGAIN! 📚',  msg: 'Every expert was once a beginner.' }
    ];
    const g = grades.find(function(item) { return percentage >= item.min; });

    // Update the results page content
    document.getElementById('results-grade').textContent = g.grade;
    document.getElementById('results-msg').textContent   = g.msg;
    document.getElementById('r-score').textContent       = score + '/' + quizData.length;
    document.getElementById('r-pct').textContent         = percentage + '%';
    document.getElementById('r-streak').textContent      = maxStreak;
    document.getElementById('r-ach').textContent         = achievements.length;

    // Show achievements section if any were unlocked
    if (achievements.length > 0) {
        document.getElementById('ach-section').style.display = 'block';
        document.getElementById('ach-grid').innerHTML = achievements.map(function(a) {
            return '<div class="ach-item">' +
                '<span class="ach-item-icon">' + a.icon + '</span>' +
                '<div class="ach-item-title">' + a.title + '</div>' +
                '<div class="ach-item-desc">'  + a.desc  + '</div>' +
            '</div>';
        }).join('');
    } else {
        document.getElementById('ach-section').style.display = 'none';
    }

    // Build the question review list
    document.getElementById('review-list').innerHTML = quizData.map(function(q, index) {
        const userAnswer = answers[q.id];
        const wasCorrect = correct[q.id];

        // Format answers as readable text
        const userText    = q.type === 'multiple'
            ? (userAnswer ? userAnswer.join(', ') : 'No answer')
            : (userAnswer || 'No answer');
        const correctText = q.type === 'multiple'
            ? q.correctAnswers.join(', ')
            : q.correctAnswer;

        return '<div class="review-item ' + (wasCorrect ? 'correct' : 'wrong') + '">' +
            '<div class="review-q">' + (wasCorrect ? '✅' : '❌') + ' Q' + (index + 1) + ': ' + q.question + '</div>' +
            '<div class="review-your">Your answer: <strong style="color:' + (wasCorrect ? 'var(--success)' : 'var(--danger)') + '">' + userText + '</strong></div>' +
            (!wasCorrect ? '<div class="review-correct-ans">✓ Correct: ' + correctText + '</div>' : '') +
        '</div>';
    }).join('');

    showPage('page-results');   // navigate to results page
}
