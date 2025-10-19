// ==================== SUPABASE INITIALIZATION ====================
const SUPABASE_URL = window.ENV?.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.ENV?.SUPABASE_ANON_KEY || '';

let supabase = null;

// Initialize Supabase only if credentials are available
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ==================== SCROLL ANIMATIONS ====================
// Add js-loaded class to enable animations
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('js-loaded');
});

// Intersection Observer for scroll-triggered animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -80px 0px'
};

const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            // Stop observing after animation
            animateOnScroll.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all elements with animate-on-scroll class
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => {
        // Add a small delay to ensure smooth loading
        setTimeout(() => {
            animateOnScroll.observe(el);
        }, 100);
    });
});

// ==================== SMOOTH SCROLL ====================
// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            // Update URL without jumping
            if (history.pushState) {
                history.pushState(null, null, href);
            }
        }
    });
});

// ==================== FORM HANDLING ====================
const form = document.getElementById('beta-signup-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.querySelector('.btn-text');
const btnLoader = document.querySelector('.btn-loader');
const messageDiv = document.getElementById('message');

// Show message to user
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    // Scroll message into view
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Auto-hide success messages after 6 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 6000);
    }
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Set loading state
function setLoading(isLoading) {
    submitBtn.disabled = isLoading;
    btnText.style.display = isLoading ? 'none' : 'inline';
    btnLoader.style.display = isLoading ? 'inline' : 'none';
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    // Hide any previous messages
    messageDiv.style.display = 'none';

    // Validate email (required)
    if (!email) {
        showMessage('Please enter your email address', 'error');
        emailInput.focus();
        return;
    }

    if (!isValidEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        emailInput.focus();
        return;
    }

    // Check if Supabase is initialized
    if (!supabase) {
        showMessage('Service is not configured. Please contact support.', 'error');
        console.error('Supabase is not initialized. Check your environment variables.');
        return;
    }

    setLoading(true);

    try {
        // Prepare data object
        const signupData = {
            email: email,
            signed_up_at: new Date().toISOString()
        };

        // Add name if provided
        if (name) {
            signupData.name = name;
        }

        // Insert into Supabase
        const { data, error } = await supabase
            .from('beta_signups')
            .insert([signupData]);

        if (error) {
            // Handle duplicate email error
            if (error.code === '23505') {
                showMessage("You're already on the list! We'll be in touch soon.", 'success');
                // Clear form on duplicate (they're already signed up)
                nameInput.value = '';
                emailInput.value = '';
            } else {
                console.error('Supabase error details:', error);
                console.error('Error code:', error.code);
                console.error('Error message:', error.message);
                showMessage(`Error: ${error.message || 'Database error. Please contact support.'}`, 'error');
                return;
            }
        } else {
            showMessage('Welcome to Echoes! Check your email for next steps.', 'success');

            // Clear form on success
            nameInput.value = '';
            emailInput.value = '';

            // Optional: Track signup event (add your analytics here)
            console.log('New signup:', data);
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        showMessage('Something went wrong. Please try again.', 'error');
    } finally {
        setLoading(false);
    }
}

// Add form submit event listener
if (form) {
    form.addEventListener('submit', handleSubmit);
}

// ==================== DEVELOPMENT WARNINGS ====================
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.warn('⚠️ Supabase credentials not found. Please set up your environment variables.');
        console.log('Add your Supabase URL and anon key to env.js');
    } else {
        console.log('✅ Supabase initialized successfully');
    }
}

// ==================== ACCESSIBILITY ====================
// Add keyboard navigation improvements
document.addEventListener('keydown', (e) => {
    // Escape key closes messages
    if (e.key === 'Escape' && messageDiv.style.display === 'block') {
        messageDiv.style.display = 'none';
    }
});

// ==================== PERFORMANCE ====================
// Preload critical resources on hover (optional enhancement)
const ctaButtons = document.querySelectorAll('.cta-button');
ctaButtons.forEach(button => {
    button.addEventListener('mouseenter', () => {
        // Prefetch or prepare any resources needed for the signup form
        // This is a placeholder for future optimizations
    }, { once: true });
});
