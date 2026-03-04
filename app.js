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
            fetchWishes(); // Refresh the list
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
            display.innerHTML = data.map(wish => `
                <div class="wish-card">
                    <h4>${escapeHTML(wish.name)}</h4>
                    <p>${escapeHTML(wish.message)}</p>
                </div>
            `).join('');
        } else {
            display.innerHTML = '<p>Be the first to leave a wish!</p>';
        }
    } catch (error) {
        console.error('Error fetching wishes:', error);
        display.innerHTML = '<p>Error loading wishes.</p>';
    }
}

// Simple HTML escaper
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
}

// Load wishes on start
fetchWishes();