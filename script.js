// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(15, 19, 41, 0.98)';
    } else {
        navbar.style.background = 'rgba(15, 19, 41, 0.95)';
    }
});

// Animated counters for stats
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current);
                setTimeout(updateCounter, 20);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
            
            // Trigger counter animation when stats section is visible
            if (entry.target.querySelector('.stat-number[data-target]')) {
                animateCounters();
            }
        }
    });
}, observerOptions);

// Observe elements with data-aos attribute
document.querySelectorAll('[data-aos]').forEach(el => {
    observer.observe(el);
});

// Observe stats container
const statsContainer = document.querySelector('.stats-container');
if (statsContainer) {
    observer.observe(statsContainer);
}

// Form handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collect form data
        const formData = new FormData(this);
        const messageData = {};
        
        // Get all form fields
        for (let [key, value] of formData.entries()) {
            if (key !== 'services') {
                messageData[key] = value;
            }
        }
        
        // Handle services checkboxes
        messageData.services = [];
        const checkedServices = document.querySelectorAll('input[name="services"]:checked');
        checkedServices.forEach(checkbox => {
            messageData.services.push(checkbox.value);
        });
        
        console.log('Form data collected:', messageData);
        
        // Save message to JSON file
        saveMessageToFile(messageData);
        
        // Show success message
        showFormSuccess();
        
        // Reset form
        this.reset();
    });
}

async function saveMessageToFile(messageData) {
    // For static websites, we'll use EmailJS to send messages via email
    // and localStorage for admin panel demo purposes
    
    const newMessage = {
        id: Date.now() + Math.random(),
        ...messageData,
        timestamp: new Date().toISOString(),
        status: 'unresponded',
        replies: []
    };
    
    // Save to localStorage for admin panel demo
    let existingMessages = [];
    try {
        const stored = localStorage.getItem('contactMessages');
        if (stored) {
            existingMessages = JSON.parse(stored);
        }
    } catch (error) {
        console.log('Starting fresh message list');
    }
    
    existingMessages.unshift(newMessage);
    localStorage.setItem('contactMessages', JSON.stringify(existingMessages));
    
    // Send email notification (you would need to set up EmailJS)
    console.log('Message saved locally for admin demo:', newMessage);
    
    // Notify admin panel if it exists
    if (window.adminPanel) {
        window.adminPanel.addMessage(newMessage);
    }
}
function showFormSuccess() {
    // Create success message
    const successMessage = document.createElement('div');
    successMessage.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #dfc368 0%, #f4e79d 100%);
            color: #0f1329;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            text-align: center;
            max-width: 400px;
            width: 90%;
        ">
            <h3 style="margin-bottom: 1rem; font-size: 1.5rem;">Message Sent!</h3>
            <p style="margin-bottom: 1.5rem;">Thank you for your interest. We'll get back to you within 24 hours.</p>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: #0f1329;
                color: #dfc368;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
            ">Close</button>
        </div>
    `;
    
    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
    `;
    
    backdrop.appendChild(successMessage);
    document.body.appendChild(backdrop);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (backdrop.parentElement) {
            backdrop.remove();
        }
    }, 5000);
    
    // Close on backdrop click
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
            backdrop.remove();
        }
    });
}

// Add loading animation to buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        // Don't add loading to form submit buttons or external links
        if (this.type === 'submit' || this.href?.startsWith('http')) {
            return;
        }
        
        // Add loading state
        const originalText = this.textContent;
        this.textContent = 'Loading...';
        this.style.pointerEvents = 'none';
        
        // Reset after navigation (this won't work for same-page navigation, but it's fine)
        setTimeout(() => {
            this.textContent = originalText;
            this.style.pointerEvents = 'auto';
        }, 1000);
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-card');
    
    parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });
});

// Add hover effects to service cards
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Add typing effect to hero title (optional enhancement)
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect on page load (uncomment to enable)
// window.addEventListener('load', () => {
//     const heroTitle = document.querySelector('.hero-title');
//     if (heroTitle) {
//         const originalText = heroTitle.textContent;
//         typeWriter(heroTitle, originalText, 50);
//     }
// });

// Add smooth reveal animation for elements
function revealOnScroll() {
    const reveals = document.querySelectorAll('.service-card, .team-member, .value-card, .pricing-card');
    
    reveals.forEach(reveal => {
        const windowHeight = window.innerHeight;
        const elementTop = reveal.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
            reveal.classList.add('aos-animate');
        }
    });
}

window.addEventListener('scroll', revealOnScroll);

// Add click ripple effect to buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add ripple animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize all animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add initial animation delays
    document.querySelectorAll('[data-delay]').forEach(element => {
        const delay = element.getAttribute('data-delay');
        element.style.animationDelay = delay + 'ms';
    });
    
    // Trigger initial reveal check
    revealOnScroll();
});

// Add performance optimization for scroll events
let ticking = false;

function updateOnScroll() {
    revealOnScroll();
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(updateOnScroll);
        ticking = true;
    }
});