// Wishes functionality for wedding invitation
document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwzmh4Lb-GDMJr-kJyQyCNPqtJVu3A86OT6Ff_KEuCG4xLXCCy-sCsEMnbaf25sBg9wQQ/exec'; // You'll need to replace this with your actual script URL
    const WISHES_PER_PAGE = 5;
    let currentPage = 1;
    
    // DOM Elements
    const wishesForm = document.getElementById('wishes-form');
    const wishesContainer = document.getElementById('wishes-container');
    const loadMoreButton = document.getElementById('load-more');
    const loadingWishes = document.getElementById('loading-wishes');
    const formMessages = document.getElementById('form-messages');
    
    // Load initial wishes
    loadWishes(1);
    
    // Event Listeners
    wishesForm.addEventListener('submit', handleFormSubmit);
    loadMoreButton.addEventListener('click', function() {
        currentPage++;
        loadWishes(currentPage);
    });
    
    // Functions
    function loadWishes(page) {
        // Show loading indicator
        if (page === 1) {
            loadingWishes.style.display = 'block';
            loadingWishes.innerHTML = '<div class="loading-animation"><i class="icon-spinner icon-spin"></i> Memuat ucapan...</div>';
            wishesContainer.innerHTML = '';
        } else {
            // Show loading indicator at bottom when loading more
            loadMoreButton.innerHTML = '<i class="icon-spinner icon-spin"></i> Memuat...';
            loadMoreButton.disabled = true;
        }
        
        // Fetch wishes from Google Spreadsheet
        fetch(`${SCRIPT_URL}?action=getWishes&page=${page}&limit=${WISHES_PER_PAGE}`)
            .then(response => response.json())
            .then(data => {
                // Hide loading indicators
                loadingWishes.style.display = 'none';
                loadMoreButton.innerHTML = 'Tampilkan Lebih Banyak';
                loadMoreButton.disabled = false;
                
                // Display wishes
                if (data.wishes && data.wishes.length > 0) {
                    renderWishes(data.wishes, page === 1);
                    
                    // Show/hide load more button
                    loadMoreButton.style.display = data.hasMore ? 'inline-block' : 'none';
                } else if (page === 1) {
                    wishesContainer.innerHTML = '<div class="text-center">Belum ada ucapan. Jadilah yang pertama memberikan ucapan!</div>';
                    loadMoreButton.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error loading wishes:', error);
                loadingWishes.style.display = 'none';
                loadMoreButton.innerHTML = 'Tampilkan Lebih Banyak';
                loadMoreButton.disabled = false;
                
                if (page === 1) {
                    wishesContainer.innerHTML = '<div class="text-center">Gagal memuat ucapan. Silakan coba lagi nanti.</div>';
                } else {
                    // Show error message when loading more fails
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'alert alert-danger';
                    errorMsg.textContent = 'Gagal memuat ucapan tambahan. Silakan coba lagi.';
                    wishesContainer.appendChild(errorMsg);
                }
            });
    }
    
    function renderWishes(wishes, clearContainer) {
        // Clear container if needed
        if (clearContainer) {
            wishesContainer.innerHTML = '';
        }
        
        // Create wish elements
        wishes.forEach(wish => {
            const wishElement = document.createElement('div');
            wishElement.className = 'list-group-item';
            
            // Create attendance badge
            const attendanceBadge = document.createElement('span');
            attendanceBadge.className = `badge ${getBadgeClass(wish.kehadiran)}`;
            attendanceBadge.textContent = wish.kehadiran;
            
            // Create wish content
            const wishContent = document.createElement('div');
            wishContent.className = 'wish-content';
            
            // Create wish header
            const wishHeader = document.createElement('div');
            wishHeader.className = 'wish-header';
            
            const wishName = document.createElement('strong');
            wishName.textContent = wish.nama;
            
            const wishDate = document.createElement('small');
            wishDate.className = 'text-muted';
            wishDate.textContent = formatDate(wish.timestamp);
            
            wishHeader.appendChild(wishName);
            wishHeader.appendChild(document.createTextNode(' '));
            wishHeader.appendChild(wishDate);
            
            // Create wish message
            const wishMessage = document.createElement('p');
            wishMessage.className = 'wish-message';
            wishMessage.textContent = wish.ucapan;
            
            // Assemble wish content
            wishContent.appendChild(wishHeader);
            wishContent.appendChild(wishMessage);
            
            // Assemble wish element
            wishElement.appendChild(attendanceBadge);
            wishElement.appendChild(wishContent);
            
            // Add to container
            wishesContainer.appendChild(wishElement);
        });
    }
    
    function handleFormSubmit(event) {
        event.preventDefault();
        
        // Get form data
        const formData = new FormData(wishesForm);
        
        // Show loading state
        const submitButton = wishesForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="icon-spinner icon-spin"></i> Mengirim...';
        
        // Clear previous messages
        formMessages.innerHTML = '';
        
        // Send data to Google Spreadsheet
        fetch(SCRIPT_URL, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // Reset form
            wishesForm.reset();
            
            // Show success message
            formMessages.innerHTML = '<div class="alert alert-success">Terima kasih! Ucapan Anda telah berhasil dikirim.</div>';
            
            // Reload wishes to show the new one
            currentPage = 1;
            loadWishes(1);
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            formMessages.innerHTML = '<div class="alert alert-danger">Terjadi kesalahan. Silakan coba lagi nanti.</div>';
        })
        .finally(() => {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        });
    }
    
    // Helper Functions
    function getBadgeClass(attendance) {
        switch(attendance) {
            case 'Hadir':
                return 'badge-success';
            case 'Tidak Hadir':
                return 'badge-danger';
            case 'Belum Pasti':
                return 'badge-warning';
            default:
                return 'badge-default';
        }
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
});
