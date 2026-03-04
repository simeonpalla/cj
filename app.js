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
            fetchWishes(); // Refresh the list with the new wish
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
            let loopData = [...data];
            // Ensure we have enough cards to fill the cinematic wide screen properly
            while (loopData.length < 8) {
                loopData = [...loopData, ...data];
            }

            display.innerHTML = loopData.map(wish => `
                <div class="wish-card" onclick="openModal(this)" data-message="${escapeHTML(wish.message)}" data-name="${escapeHTML(wish.name)}">
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
        const firstCard = track.children[0];
        
        // Exact distance: 320px (Cinemascope card width) + 20px (gap)
        const slideDistance = 340;

        track.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
        track.style.transform = `translateX(-${slideDistance}px)`;

        setTimeout(() => {
            track.style.transition = 'none';
            track.style.transform = 'translateX(0)';
            track.appendChild(firstCard);
        }, 600); 

    }, 3000); 
}

// 5. Modal Pop-up Logic
function openModal(cardElement) {
    clearInterval(autoSlideInterval); // Pause carousel
    const modal = document.getElementById('wish-modal');
    document.getElementById('modal-message').innerHTML = cardElement.getAttribute('data-message');
    document.getElementById('modal-name').innerHTML = '♡ ' + cardElement.getAttribute('data-name');
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('wish-modal').style.display = 'none';
    startCarousel(); // Resume carousel
}

// Close the pop-up if the user clicks the dark background
window.onclick = function(event) {
    const modal = document.getElementById('wish-modal');
    if (event.target == modal) {
        closeModal();
    }
}

// 6. Security Utility
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
}

// Initialize
fetchWishes();