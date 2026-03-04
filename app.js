// Global variable to keep track of the carousel timer
let autoSlideInterval;

// 1. Audio and Screen Transition Logic
function openInvitation() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainContent = document.getElementById('main-content');
    
    if (welcomeScreen && mainContent) {
        // Fade out the envelope
        welcomeScreen.style.opacity = '0';
        setTimeout(() => {
            welcomeScreen.style.display = 'none';
            mainContent.style.display = 'block';
        }, 1000); 
    }

    // Play Music
    const music = document.getElementById('bg-music');
    if (music) {
        music.volume = 0.5;
        music.play().catch(error => console.log("Audio autoplay blocked:", error));
    }
}

// 2. Handle Form Submission via BFF (Netlify Functions)
document.getElementById('wishes-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nameInput = document.getElementById('guest-name');
    const messageInput = document.getElementById('guest-message');
    const submitBtn = document.getElementById('submit-btn');

    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
        const response = await fetch('/.netlify/functions/add-wish', {
            method: 'POST',
            body: JSON.stringify({ name: nameInput.value, message: messageInput.value })
        });

        if (response.ok) {
            nameInput.value = '';
            messageInput.value = '';
            fetchWishes(); // Refresh the list so the new wish appears immediately
        } else {
            throw new Error('Server error');
        }
    } catch (error) {
        console.error('Error saving wish:', error);
        alert('Could not send wish. Please try again.');
    }

    submitBtn.textContent = 'Send Wish';
    submitBtn.disabled = false;
});

// 3. Fetch and Display Wishes via BFF
async function fetchWishes() {
    const display = document.getElementById('wishes-display');
    
    try {
        const response = await fetch('/.netlify/functions/get-wishes');
        const data = await response.json();

        if (data && data.length > 0) {
            // Generate the cards matching the centered aesthetic
            display.innerHTML = data.map(wish => `
                <div class="wish-card">
                    <p class="wish-message">${escapeHTML(wish.message)}</p>
                    <p class="wish-name">♡ ${escapeHTML(wish.name)}</p>
                </div>
            `).join('');

            // Start the 3-second auto-slide carousel
            startCarousel();
        } else {
            display.innerHTML = '<p>Be the first to leave a wish!</p>';
        }
    } catch (error) {
        console.error('Error fetching wishes:', error);
        display.innerHTML = '<p>Error loading wishes.</p>';
    }
}

// 4. 3-Second Pause-and-Slide Carousel Logic
function startCarousel() {
    const list = document.getElementById('wishes-display');
    if (!list) return;

    // Clear any existing timer so they don't overlap when a new wish is added
    clearInterval(autoSlideInterval);

    // Set the timer to slide every 3000 milliseconds (3 seconds)
    autoSlideInterval = setInterval(slideNext, 4000); // Increased to 4 seconds for better readability

    function slideNext() {
        const card = list.querySelector('.wish-card');
        if (!card) return;
        
        // Calculate the width of one card plus the 20px CSS gap
        const scrollAmount = card.offsetWidth + 20; 

        // If we hit the end of the scroll, smoothly jump back to the beginning
        if (list.scrollLeft + list.clientWidth >= list.scrollWidth - 10) {
            list.scrollLeft = 0;
        } else {
            // Otherwise, slide exactly one card over
            list.scrollLeft += scrollAmount;
        }
    }

    // Stop the auto-scroll completely if the guest touches or hovers over the cards to read manually
    list.addEventListener('touchstart', () => clearInterval(autoSlideInterval), { once: true });
    list.addEventListener('mouseenter', () => clearInterval(autoSlideInterval), { once: true });
}

// 5. Simple HTML escaper to prevent malicious inputs (XSS protection)
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
}

// Load wishes immediately when the script starts
fetchWishes();