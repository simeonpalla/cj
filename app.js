let autoSlideInterval;

// 1. Audio and Screen Transition Logic
function openInvitation() {
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainContent = document.getElementById('main-content');
    
    if (welcomeScreen && mainContent) {
        welcomeScreen.style.opacity = '0';
        setTimeout(() => {
            welcomeScreen.style.display = 'none';
            mainContent.style.display = 'block';
        }, 1000); 
    }

    const music = document.getElementById('bg-music');
    if (music) {
        music.volume = 0.5;
        music.play().catch(error => console.log("Audio autoplay blocked:", error));
    }
}

// 2. Handle Form Submission via BFF
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
            fetchWishes(); // Refresh to show the new wish
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

// 3. Fetch and Display Wishes 
async function fetchWishes() {
    const display = document.getElementById('wishes-display');
    
    try {
        const response = await fetch('/.netlify/functions/get-wishes');
        const data = await response.json();

        if (data && data.length > 0) {
            // Ensure we have enough cards to create a seamless loop on wide screens
            let loopData = [...data];
            while (loopData.length < 6) {
                loopData = [...loopData, ...data];
            }

            display.innerHTML = loopData.map(wish => `
                <div class="wish-card">
                    <p class="wish-message">${escapeHTML(wish.message)}</p>
                    <p class="wish-name">♡ ${escapeHTML(wish.name)}</p>
                </div>
            `).join('');

            startCarousel();
        } else {
            display.innerHTML = '<p>Be the first to leave a wish!</p>';
        }
    } catch (error) {
        console.error('Error fetching wishes:', error);
        display.innerHTML = '<p>Error loading wishes.</p>';
    }
}

// 4. TRUE Infinite Step Carousel Logic
function startCarousel() {
    const track = document.getElementById('wishes-display');
    if (!track) return;

    clearInterval(autoSlideInterval);

    autoSlideInterval = setInterval(() => {
        // Grab the very first card in the list
        const firstCard = track.children[0];
        
        // Calculate exact distance to slide (Card width + the 20px gap)
        const slideDistance = firstCard.offsetWidth + 20;

        // Step 1: Smoothly slide the entire track to the left
        track.style.transition = 'transform 0.5s ease-in-out';
        track.style.transform = `translateX(-${slideDistance}px)`;

        // Step 2: Wait exactly 0.5s for the slide animation to finish
        setTimeout(() => {
            // Turn off the animation momentarily
            track.style.transition = 'none';
            // Snap the track back to its starting position
            track.style.transform = 'translateX(0)';
            // Take the first card and move it to the very end of the line
            track.appendChild(firstCard);
        }, 500);

    }, 3000); // Wait 3 seconds, then do it all again
}

// Simple HTML escaper
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
}

// Load wishes immediately
fetchWishes();