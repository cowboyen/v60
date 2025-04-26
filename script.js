// Vent til DOM er fullstendig lastet
document.addEventListener('DOMContentLoaded', function() {
    // DOM-elementer
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
    
    // Syrlighetsknapper
    const sweetnessBtn = document.getElementById('sweetness');
    const standardAcidityBtn = document.getElementById('standard-acidity');
    const acidityBtn = document.getElementById('acidity');
    
    // Styrkeknapper
    const lowerStrengthBtn = document.getElementById('lower-strength');
    const standardStrengthBtn = document.getElementById('standard-strength');
    const higherStrengthBtn = document.getElementById('higher-strength');
    
    // Tilstandsvariabler
    let coffeeAmount = 20; // g
    let ratio = 15;
    let waterAmount = 300; // ml
    let acidityLevel = 0; // 0: Standard, 1: More Sweetness, 2: More Acidity
    let strengthLevel = 0; // 0: Standard, 1: Lower Strength, 2: Higher Strength
    let pourSteps = [];
    
    // Stoppeklokke-variabler
    let time = 0;
    let isRunning = false;
    let interval = null;
    let lastTime = Date.now();
    
    // Initialiser app
    initApp();
    
    function initApp() {
        // Sett opp event listeners
        ratioInput.addEventListener('input', updateCalculations);
        coffeeInput.addEventListener('input', updateFromInput);
        incrementBtn.addEventListener('click', incrementValue);
        decrementBtn.addEventListener('click', decrementValue);
        startBtn.addEventListener('click', startTimer);
        stopBtn.addEventListener('click', stopTimer);
        resetBtn.addEventListener('click', resetTimer);
        
        // Sett opp syrlighetsknapper
        sweetnessBtn.addEventListener('click', function() {
            setAcidityLevel(1);
        });
        
        standardAcidityBtn.addEventListener('click', function() {
            setAcidityLevel(0);
        });
        
        acidityBtn.addEventListener('click', function() {
            setAcidityLevel(2);
        });
        
        // Sett opp styrkeknapper
        lowerStrengthBtn.addEventListener('click', function() {
            setStrengthLevel(1);
        });
        
        standardStrengthBtn.addEventListener('click', function() {
            setStrengthLevel(0);
        });
        
        higherStrengthBtn.addEventListener('click', function() {
            setStrengthLevel(2);
        });
        
        // Sett initielle verdier
        coffeeInput.value = coffeeAmount;
        ratioInput.value = ratio;
        
        // Kjør innledende beregning
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
        
        // Oppdaterer UI
        [sweetnessBtn, standardAcidityBtn, acidityBtn].forEach(btn => btn.classList.remove('active'));
        
        if (level === 0) standardAcidityBtn.classList.add('active');
        else if (level === 1) sweetnessBtn.classList.add('active');
        else if (level === 2) acidityBtn.classList.add('active');
        
        updateCalculations();
    }
    
    function setStrengthLevel(level) {
        strengthLevel = level;
        
        // Oppdaterer UI
        [lowerStrengthBtn, standardStrengthBtn, higherStrengthBtn].forEach(btn => btn.classList.remove('active'));
        
        if (level === 0) standardStrengthBtn.classList.add('active');
        else if (level === 1) lowerStrengthBtn.classList.add('active');
        else if (level === 2) higherStrengthBtn.classList.add('active');
        
        updateCalculations();
    }
    
    function updateCalculations() {
        // Oppdaterer ratio
        ratio = parseFloat(ratioInput.value) || 15;
        
        // Beregner vannmengde basert på kaffemengde
        waterAmount = Math.round((coffeeAmount * ratio) * 10) / 10;
        
        // Oppdaterer totaler
        totalCoffee.textContent = coffeeAmount.toFixed(1) + " g";
        totalWater.textContent = waterAmount.toFixed(1) + " ml";
        
        // Kalkulerer pour steps
        calculatePourSteps();
        
        // Oppdaterer visning
        renderPourSteps();
        updateProgressBars();
    }
    
    function calculatePourSteps() {
        // First 40% - for acidity control (2 pours)
        const firstPhaseWater = waterAmount * 0.4;
        
        // Remaining 60% - for strength control (3 pours)
        const secondPhaseWater = waterAmount * 0.6;
        
        // Acidity distribution
        let acidityRatio;
        switch(acidityLevel) {
            case 1: // More sweetness
                acidityRatio = [0.6, 0.4];
                break;
            case 2: // More acidity
                acidityRatio = [0.4, 0.6];
                break;
            default: // Standard
                acidityRatio = [0.5, 0.5];
        }
        
        // Strength distribution
        let strengthRatio;
        switch(strengthLevel) {
            case 1: // Lower strength
                strengthRatio = [0.2, 0.3, 0.5];
                break;
            case 2: // Higher strength
                strengthRatio = [0.5, 0.3, 0.2];
                break;
            default: // Standard
                strengthRatio = [0.33, 0.33, 0.34];
        }
        
        // Calculate individual pours
        const pour1Amount = Math.round(firstPhaseWater * acidityRatio[0]);
        const pour2Amount = Math.round(firstPhaseWater * acidityRatio[1]);
        const pour3Amount = Math.round(secondPhaseWater * strengthRatio[0]);
        const pour4Amount = Math.round(secondPhaseWater * strengthRatio[1]);
        const pour5Amount = Math.round(secondPhaseWater * strengthRatio[2]);
        
        // Calculate cumulative totals (this is where the fix is needed)
        const pour1Total = pour1Amount;
        const pour2Total = pour1Total + pour2Amount;
        const pour3Total = pour2Total + pour3Amount;
        const pour4Total = pour3Total + pour4Amount;
        const pour5Total = pour4Total + pour5Amount;
        
        // Create pour steps array
        pourSteps = [
            {
                timeStart: "00:00",
                timeEnd: "00:45",
                amount: pour1Amount,
                total: pour1Total,
                color: "#8c5642"
            },
            {
                timeStart: "00:45",
                timeEnd: "01:30",
                amount: pour2Amount,
                total: pour2Total,
                color: "#9d6953"
            },
            {
                timeStart: "01:30",
                timeEnd: "02:15",
                amount: pour3Amount,
                total: pour3Total,
                color: "#a87764"
            },
            {
                timeStart: "02:15",
                timeEnd: "03:00",
                amount: pour4Amount,
                total: pour4Total,
                color: "#b38575"
            },
            {
                timeStart: "03:00",
                timeEnd: "03:45",
                amount: pour5Amount,
                total: pour5Total,
                color: "#bf9486"
            }
        ];
        
        // Verifiser at totalene stemmer overens
        console.log("Pour steps calculated:", pourSteps);
        console.log("Total water:", waterAmount);
        console.log("Sum of all pours:", pour1Amount + pour2Amount + pour3Amount + pour4Amount + pour5Amount);
    }
    
    function renderPourSteps() {
        pourStepsContainer.innerHTML = '';
        
        pourSteps.forEach((step, index) => {
            const stepElement = document.createElement('div');
            stepElement.className = 'pour-step';
            stepElement.style.backgroundColor = step.color;
            
            // Opprett fremdriftbjelken
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            progressBar.id = `progress-${index}`;
            
            // Opprett innholdsbeholderen
            const content = document.createElement('div');
            content.className = 'step-content';
            
            // Legg til mengdeinfo
            const amount = document.createElement('div');
            amount.className = 'pour-amount';
            amount.innerHTML = `${step.total.toFixed(1)}ml. <span class="pour-detail">(${step.amount.toFixed(1)}ml.)</span>`;
            
            // Legg til tidsinfo
            const time = document.createElement('div');
            time.className = 'pour-time';
            time.textContent = `${step.timeStart} - ${step.timeEnd}`;
            
            // Monter elementer
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
                // Ikke påbegynt
                progressBar.style.height = '0%';
            } else if (time >= endMs) {
                // Fullført
                progressBar.style.height = '100%';
            } else {
                // Pågår
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