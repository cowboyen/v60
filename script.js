// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const ratioInput = document.getElementById('ratio');
    const coffeeInput = document.getElementById('weight-value');
    const incrementBtn = document.getElementById('increment');
    const decrementBtn = document.getElementById('decrement');
    const totalCoffee = document.getElementById('total-coffee');
    const totalWater = document.getElementById('total-water');
    const pourStepsContainer = document.getElementById('pour-steps');
    const timer = document.getElementById('timer');
    const startBtn = document.getElementById('start');
    const stopBtn = document.getElementById('stop');
    const resetBtn = document.getElementById('reset');
    
    // Acidity buttons
    const sweetnessBtn = document.getElementById('sweetness');
    const standardAcidityBtn = document.getElementById('standard-acidity');
    const acidityBtn = document.getElementById('acidity');
    
    // Strength buttons
    const lowerStrengthBtn = document.getElementById('lower-strength');
    const standardStrengthBtn = document.getElementById('standard-strength');
    const higherStrengthBtn = document.getElementById('higher-strength');
    
    // State variables
    let coffeeAmount = 20; // g
    let ratio = 15;
    let waterAmount = 300; // ml
    let acidityLevel = 0; // 0: Standard, 1: More Sweetness, 2: More Acidity
    let strengthLevel = 0; // 0: Standard, 1: Lower Strength, 2: Higher Strength
    let pourSteps = [];
    
    // Stopwatch variables
    let time = 0;
    let isRunning = false;
    let interval = null;
    let lastTime = Date.now();
    
    // Initialize app
    initApp();
    
    function initApp() {
        // Set up event listeners
        ratioInput.addEventListener('input', updateCalculations);
        coffeeInput.addEventListener('input', updateFromInput);
        incrementBtn.addEventListener('click', incrementValue);
        decrementBtn.addEventListener('click', decrementValue);
        startBtn.addEventListener('click', startTimer);
        stopBtn.addEventListener('click', stopTimer);
        resetBtn.addEventListener('click', resetTimer);
        
        // Set up acidity buttons
        sweetnessBtn.addEventListener('click', function() {
            setAcidityLevel(1);
        });
        
        standardAcidityBtn.addEventListener('click', function() {
            setAcidityLevel(0);
        });
        
        acidityBtn.addEventListener('click', function() {
            setAcidityLevel(2);
        });
        
        // Set up strength buttons
        lowerStrengthBtn.addEventListener('click', function() {
            setStrengthLevel(1);
        });
        
        standardStrengthBtn.addEventListener('click', function() {
            setStrengthLevel(0);
        });
        
        higherStrengthBtn.addEventListener('click', function() {
            setStrengthLevel(2);
        });
        
        // Set initial values
        coffeeInput.value = coffeeAmount;
        ratioInput.value = ratio;
        
        // Run initial calculation
        updateCalculations();
    }
    
    function updateFromInput() {
        coffeeAmount = parseFloat(coffeeInput.value) || 0;
        updateCalculations();
    }
    
    function incrementValue() {
        coffeeAmount += 1;
        coffeeInput.value = coffeeAmount;
        updateCalculations();
    }
    
    function decrementValue() {
        coffeeAmount = Math.max(1, coffeeAmount - 1);
        coffeeInput.value = coffeeAmount;
        updateCalculations();
    }
    
    function setAcidityLevel(level) {
        acidityLevel = level;
        
        // Update UI
        [sweetnessBtn, standardAcidityBtn, acidityBtn].forEach(btn => btn.classList.remove('active'));
        
        if (level === 0) standardAcidityBtn.classList.add('active');
        else if (level === 1) sweetnessBtn.classList.add('active');
        else if (level === 2) acidityBtn.classList.add('active');
        
        updateCalculations();
    }
    
    function setStrengthLevel(level) {
        strengthLevel = level;
        
        // Update UI
        [lowerStrengthBtn, standardStrengthBtn, higherStrengthBtn].forEach(btn => btn.classList.remove('active'));
        
        if (level === 0) standardStrengthBtn.classList.add('active');
        else if (level === 1) lowerStrengthBtn.classList.add('active');
        else if (level === 2) higherStrengthBtn.classList.add('active');
        
        updateCalculations();
    }
    
    function updateCalculations() {
        // Update ratio
        ratio = parseFloat(ratioInput.value) || 15;
        
        // Calculate water amount based on coffee amount
        waterAmount = coffeeAmount * ratio;
        
        // Update totals
        totalCoffee.textContent = coffeeAmount.toFixed(1) + " g";
        totalWater.textContent = waterAmount.toFixed(1) + " ml";
        
        // Calculate pour steps
        calculatePourSteps();
        
        // Update display
        renderPourSteps();
        updateProgressBars();
    }
    
    function calculatePourSteps() {
        // Calculate pour amounts based on acidity and strength settings
        const pourAmounts = calculatePourAmounts();
        
        // Calculate cumulative totals
        const totalAmounts = calculateTotalAmounts(pourAmounts);
        
        // Standard colors for steps (extended to 6 steps)
        const colors = ["#8c5642", "#9d6953", "#a87764", "#b38575", "#bf9486", "#c6a395"];
        
        // Standard times for steps (extended to 6 steps)
        const times = [
            { start: "00:00", end: "00:45" },
            { start: "00:45", end: "01:30" },
            { start: "01:30", end: "02:15" },
            { start: "02:15", end: "03:00" },
            { start: "03:00", end: "03:45" },
            { start: "03:45", end: "04:30" }
        ];
        
        // Build pour steps array
        pourSteps = [];
        for (let i = 0; i < pourAmounts.length; i++) {
            pourSteps.push({
                timeStart: times[i].start,
                timeEnd: times[i].end,
                amount: pourAmounts[i],
                total: totalAmounts[i],
                color: colors[i]
            });
        }
    }
    
    function calculatePourAmounts() {
        // This function now calculates pour amounts by working with exact percentages
        // of total water without rounding until the end
        let amounts = [];
        
        if (acidityLevel === 1 && strengthLevel === 2) {
            // More sweetness and higher strength: 6 steps
            // Example at 30g coffee: 72ml, 180ml, 247.5ml, 315ml, 382.5ml, 450ml
            
            // First pour: 16% of total
            amounts.push(waterAmount * 0.16); // 72ml at 30g
            
            // Second pour: additional 24% to reach 40% of total
            amounts.push(waterAmount * 0.24); // 108ml at 30g to reach 180ml
            
            // Remaining 4 pours: each 15% of total
            for (let i = 0; i < 4; i++) {
                amounts.push(waterAmount * 0.15); // 67.5ml each at 30g
            }
        }
        else if (acidityLevel === 1 && strengthLevel === 0) {
            // More sweetness and standard strength: 5 steps
            // Example at 30g coffee: 72ml, 180ml, 270ml, 360ml, 450ml
            
            // First pour: 16% of total
            amounts.push(waterAmount * 0.16); // 72ml at 30g
            
            // Second pour: additional 24% to reach 40% of total
            amounts.push(waterAmount * 0.24); // 108ml at 30g to reach 180ml
            
            // Remaining 3 pours: each 20% of total
            for (let i = 0; i < 3; i++) {
                amounts.push(waterAmount * 0.20); // 90ml each at 30g
            }
        } 
        else if ((acidityLevel === 0 || acidityLevel === 1) && strengthLevel === 1) {
            // Standard/More sweetness with lower strength: 4 steps
            if (acidityLevel === 0) {
                // Standard acidity and lower strength
                // Example at 30g coffee: 90ml, 180ml, 315ml, 450ml
                
                // First pour: 20% of total
                amounts.push(waterAmount * 0.20); // 90ml at 30g
                
                // Second pour: additional 20% to reach 40% of total
                amounts.push(waterAmount * 0.20); // 90ml at 30g to reach 180ml
            } else {
                // More sweetness and lower strength
                // Example at 30g coffee: 72ml, 180ml, 315ml, 450ml
                
                // First pour: 16% of total
                amounts.push(waterAmount * 0.16); // 72ml at 30g
                
                // Second pour: additional 24% to reach 40% of total
                amounts.push(waterAmount * 0.24); // 108ml at 30g to reach 180ml
            }
            
            // Remaining 2 pours: each 30% of total
            amounts.push(waterAmount * 0.30); // 135ml at 30g
            amounts.push(waterAmount * 0.30); // 135ml at 30g
        } 
        else if (acidityLevel === 2 && strengthLevel === 2) {
            // More acidity and higher strength: 6 steps
            // Example at 30g coffee: 108ml, 180ml, 247.5ml, 315ml, 382.5ml, 450ml
            
            // First pour: 24% of total
            amounts.push(waterAmount * 0.24); // 108ml at 30g
            
            // Second pour: additional 16% to reach 40% of total
            amounts.push(waterAmount * 0.16); // 72ml at 30g to reach 180ml
            
            // Remaining 4 pours: each 15% of total
            for (let i = 0; i < 4; i++) {
                amounts.push(waterAmount * 0.15); // 67.5ml each at 30g
            }
        }
        else if (acidityLevel === 0 && strengthLevel === 2) {
            // Standard acidity and higher strength: 6 steps
            // Example at 30g coffee: 90ml, 180ml, 247.5ml, 315ml, 382.5ml, 450ml
            
            // First pour: 20% of total
            amounts.push(waterAmount * 0.20); // 90ml at 30g
            
            // Second pour: additional 20% to reach 40% of total
            amounts.push(waterAmount * 0.20); // 90ml at 30g to reach 180ml
            
            // Remaining 4 pours: each 15% of total
            for (let i = 0; i < 4; i++) {
                amounts.push(waterAmount * 0.15); // 67.5ml each at 30g
            }
        }
        else if (acidityLevel === 2 && strengthLevel === 0) {
            // More acidity and standard strength: 5 steps
            // Example at 30g coffee: 108ml, 180ml, 270ml, 360ml, 450ml
            
            // First pour: 24% of total
            amounts.push(waterAmount * 0.24); // 108ml at 30g
            
            // Second pour: additional 16% to reach 40% of total
            amounts.push(waterAmount * 0.16); // 72ml at 30g to reach 180ml
            
            // Remaining 3 pours: each 20% of total
            for (let i = 0; i < 3; i++) {
                amounts.push(waterAmount * 0.20); // 90ml each at 30g
            }
        } 
        else if (acidityLevel === 2 && strengthLevel === 1) {
            // More acidity and lower strength: 4 steps
            // Example at 30g coffee: 108ml, 180ml, 315ml, 450ml
            
            // First pour: 24% of total
            amounts.push(waterAmount * 0.24); // 108ml at 30g
            
            // Second pour: additional 16% to reach 40% of total
            amounts.push(waterAmount * 0.16); // 72ml at 30g to reach 180ml
            
            // Remaining 2 pours: each 30% of total
            amounts.push(waterAmount * 0.30); // 135ml at 30g
            amounts.push(waterAmount * 0.30); // 135ml at 30g
        }
        else {
            // Standard acidity with standard strength: 5 steps
            // Example at 30g coffee: 90ml, 180ml, 270ml, 360ml, 450ml
            
            // First pour: 20% of total
            amounts.push(waterAmount * 0.20); // 90ml at 30g
            
            // Second pour: additional 20% to reach 40% of total
            amounts.push(waterAmount * 0.20); // 90ml at 30g to reach 180ml
            
            // Remaining 3 pours: each 20% of total
            for (let i = 0; i < 3; i++) {
                amounts.push(waterAmount * 0.20); // 90ml each at 30g
            }
        }
        
        // Round amounts only at the end to preserve decimal precision
        return amounts.map(amount => Math.round(amount * 10) / 10);
    }
    
    function calculateTotalAmounts(pourAmounts) {
        const totalAmounts = [];
        let runningTotal = 0;
        
        for (let amount of pourAmounts) {
            runningTotal += amount;
            // Round to 1 decimal place to handle potential floating point issues
            totalAmounts.push(Math.round(runningTotal * 10) / 10);
        }
        
        return totalAmounts;
    }
    
    function renderPourSteps() {
        pourStepsContainer.innerHTML = '';
        
        pourSteps.forEach((step, index) => {
            const stepElement = document.createElement('div');
            stepElement.className = 'pour-step';
            stepElement.style.backgroundColor = step.color;
            
            // Create progress bar
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressBar.id = `progress-${index}`;
            
            // Create content container
            const content = document.createElement('div');
            content.className = 'step-content';
            
            // Add amount info
            const amount = document.createElement('div');
            amount.className = 'pour-amount';
            amount.innerHTML = `${step.total.toFixed(1)}ml. <span class="pour-detail">(${step.amount.toFixed(1)}ml.)</span>`;
            
            // Add time info
            const time = document.createElement('div');
            time.className = 'pour-time';
            time.textContent = `${step.timeStart} - ${step.timeEnd}`;
            
            // Assemble elements
            content.appendChild(amount);
            content.appendChild(time);
            stepElement.appendChild(progressBar);
            stepElement.appendChild(content);
            
            pourStepsContainer.appendChild(stepElement);
        });
    }
    
    function updateProgressBars() {
        pourSteps.forEach((step, index) => {
            const progressBar = document.getElementById(`progress-${index}`);
            if (!progressBar) return;
            
            const startMs = timeToMs(step.timeStart);
            const endMs = timeToMs(step.timeEnd);
            
            if (time < startMs) {
                // Not started
                progressBar.style.height = '0%';
            } else if (time >= endMs) {
                // Completed
                progressBar.style.height = '100%';
            } else {
                // In progress
                const duration = endMs - startMs;
                const elapsed = time - startMs;
                const percent = Math.min(100, (elapsed / duration) * 100);
                progressBar.style.height = `${percent}%`;
            }
        });
    }
    
    function timeToMs(timeString) {
        const [minutes, seconds] = timeString.split(':').map(Number);
        return (minutes * 60 + seconds) * 1000;
    }
    
    function formatTime(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = Math.floor((ms % 1000) / 10);
        
        return `${padZero(minutes)}:${padZero(seconds)}.${padZero(milliseconds, 3)}`;
    }
    
    function padZero(num, length = 2) {
        return String(num).padStart(length, '0');
    }
    
    function startTimer() {
        if (isRunning) return;
        
        lastTime = Date.now();
        
        interval = setInterval(function() {
            const now = Date.now();
            const delta = now - lastTime;
            lastTime = now;
            
            time += delta;
            timer.textContent = formatTime(time);
            updateProgressBars();
        }, 50);
        
        isRunning = true;
        startBtn.disabled = true;
        stopBtn.disabled = false;
    }
    
    function stopTimer() {
        if (!isRunning) return;
        
        clearInterval(interval);
        isRunning = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
    }
    
    function resetTimer() {
        clearInterval(interval);
        isRunning = false;
        time = 0;
        timer.textContent = formatTime(time);
        startBtn.disabled = false;
        stopBtn.disabled = true;
        updateProgressBars();
    }
});