document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initTabs();
    initSMSDemo();
    initWeatherAPI();
    initTimeUpdates();
    initAnimations();
    initServicePlanButtons();
});

function initMobileNav() {
    const nav = document.querySelector('.nav-menu');
    const burger = document.createElement('button');
    burger.className = 'nav-burger';
    burger.innerHTML = '☰';
    burger.style.display = 'none';
    
    if (window.innerWidth <= 768) {
        burger.style.display = 'block';
        document.querySelector('.nav-container').insertBefore(burger, nav);
    }
    
    burger.addEventListener('click', () => {
        nav.classList.toggle('active');
    });
    
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            nav.classList.remove('active');
            burger.style.display = 'none';
        } else {
            burger.style.display = 'block';
        }
    });
}

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');
        });
    });
}

function initSMSDemo() {
    const messageInput = document.getElementById('sms-message');
    const previewText = document.getElementById('preview-text');
    const charCount = document.getElementById('char-count');
    const sendButton = document.getElementById('send-sms');
    const resultDiv = document.getElementById('sms-result');
    const dateInput = document.getElementById('sms-date');
    
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
    
    if (messageInput && previewText && charCount) {
        messageInput.addEventListener('input', (e) => {
            const text = e.target.value;
            previewText.textContent = text || 'Your message will appear here...';
            charCount.textContent = text.length;
            
            if (text.length > 160) {
                charCount.style.color = 'var(--danger)';
            } else {
                charCount.style.color = 'var(--text-light)';
            }
        });
    }
    
    if (sendButton && resultDiv) {
        sendButton.addEventListener('click', () => {
            const recipients = document.getElementById('sms-recipients').value;
            const message = messageInput.value;
            
            if (!message.trim()) {
                showResult(resultDiv, 'Please enter a message', 'error');
                return;
            }
            
            sendButton.textContent = 'Sending...';
            sendButton.disabled = true;
            
            setTimeout(() => {
                showResult(resultDiv, `✓ Message sent successfully to ${recipients}`, 'success');
                sendButton.textContent = 'Send Message';
                sendButton.disabled = false;
            }, 1500);
        });
    }
}

function showResult(element, message, type) {
    element.textContent = message;
    element.style.padding = '1rem';
    element.style.marginTop = '1rem';
    element.style.borderRadius = '8px';
    element.style.background = type === 'success' ? 'var(--success)' : 'var(--danger)';
    element.style.color = 'white';
    
    setTimeout(() => {
        element.style.opacity = '0';
        setTimeout(() => {
            element.textContent = '';
            element.style.padding = '0';
            element.style.marginTop = '0';
            element.style.opacity = '1';
        }, 300);
    }, 3000);
}

function initWeatherAPI() {
    const weatherGrid = document.querySelector('.weather-grid');
    if (!weatherGrid) return;
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => fetchWeatherData(position.coords.latitude, position.coords.longitude),
            error => loadDefaultWeather()
        );
    } else {
        loadDefaultWeather();
    }
}

async function fetchWeatherData(lat, lon) {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max,weathercode&timezone=auto&forecast_days=7`
        );
        
        if (!response.ok) throw new Error('Weather fetch failed');
        
        const data = await response.json();
        updateWeatherDisplay(data);
    } catch (error) {
        console.log('Weather API error, using default data');
        loadDefaultWeather();
    }
}

function updateWeatherDisplay(data) {
    const weatherCards = document.querySelectorAll('.weather-card');
    const days = ['Today', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
    
    weatherCards.forEach((card, index) => {
        if (index >= data.daily.temperature_2m_max.length) return;
        
        const temp = Math.round(data.daily.temperature_2m_max[index]);
        const precipitation = data.daily.precipitation_probability_max[index];
        const windspeed = Math.round(data.daily.windspeed_10m_max[index]);
        const weatherCode = data.daily.weathercode[index];
        
        const icon = getWeatherIcon(weatherCode);
        const desc = getWeatherDescription(weatherCode);
        
        card.querySelector('.weather-temp').textContent = `${temp}°C`;
        card.querySelector('.weather-icon').textContent = icon;
        card.querySelector('.weather-desc').textContent = desc;
        card.querySelector('.weather-details').innerHTML = `
            <div class="weather-detail">💧 ${precipitation}%</div>
            <div class="weather-detail">💨 ${windspeed} km/h</div>
        `;
    });
}

function loadDefaultWeather() {
    console.log('Using default weather data');
}

function getWeatherIcon(code) {
    const iconMap = {
        0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
        45: '🌫️', 48: '🌫️',
        51: '🌦️', 53: '🌦️', 55: '🌦️',
        61: '🌧️', 63: '🌧️', 65: '🌧️',
        71: '🌨️', 73: '🌨️', 75: '🌨️',
        80: '🌦️', 81: '🌧️', 82: '🌧️',
        95: '⛈️', 96: '⛈️', 99: '⛈️'
    };
    return iconMap[code] || '🌤️';
}

function getWeatherDescription(code) {
    const descMap = {
        0: 'Clear', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
        45: 'Foggy', 48: 'Foggy',
        51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
        61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain',
        71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow',
        80: 'Light Showers', 81: 'Showers', 82: 'Heavy Showers',
        95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Severe Storm'
    };
    return descMap[code] || 'Partly Cloudy';
}

function initTimeUpdates() {
    updateAllTimes();
    setInterval(updateAllTimes, 60000);
}

function updateAllTimes() {
    const now = new Date();
    const timeElements = document.querySelectorAll('.sms-time');
    
    timeElements.forEach(el => {
        el.textContent = now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    });
    
    updateGreeting(now);
}

function updateGreeting(date) {
    const hour = date.getHours();
    const heroTitle = document.querySelector('.hero-title');
    
    if (!heroTitle || !heroTitle.textContent.includes('Connections')) return;
    
    let greeting = 'Good day';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    
    const greetingSpan = document.createElement('span');
    greetingSpan.style.fontSize = '0.5em';
    greetingSpan.style.opacity = '0.7';
    greetingSpan.style.display = 'block';
    greetingSpan.textContent = greeting;
}

function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    const animatedElements = document.querySelectorAll(
        '.feature-card, .stat-card, .team-card, .value-card, .pricing-card, .weather-card, .priority-card'
    );
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s, transform 0.6s';
        observer.observe(el);
    });
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
    if (!button.id && !button.getAttribute('data-no-ripple')) {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.5)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s ease-out';
            ripple.style.pointerEvents = 'none';
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    }
});

const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .nav-burger {
        display: none;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--primary);
    }
    
    @media (max-width: 768px) {
        .nav-menu {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--white);
            flex-direction: column;
            padding: 1rem 2rem;
            box-shadow: 0 4px 12px var(--shadow);
        }
        
        .nav-menu.active {
            display: flex;
        }
    }
`;
document.head.appendChild(style);

function initServicePlanButtons() {
    const planButtons = document.querySelectorAll('.select-service-plan');
    planButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const plan = e.target.dataset.plan;
            const planName = e.target.dataset.planName;
            const price = e.target.closest('.pricing-card').querySelector('.pricing-amount').textContent;

            const tempProfile = {
                name: '',
                role: 'seller',
                phone: '',
                address: '',
                county: '',
                farmName: '',
                primaryCrops: '',
                subscription: {
                    plan: plan,
                    planName: planName,
                    price: price,
                    selectedAt: new Date().toISOString()
                },
                timestamp: new Date().toISOString(),
                fromServicePage: true
            };

            sessionStorage.setItem('pendingFarmerProfile', JSON.stringify(tempProfile));
            window.location.href = 'buynsell.html';
        });
    });
}