document.addEventListener('DOMContentLoaded', () => {
    
    // --- Mobile Menu ---
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    const navLinksItems = document.querySelectorAll('.nav-link');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when a link is clicked
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }

    // --- Scroll Animations ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-on-scroll');
    fadeElements.forEach(el => {
        el.style.opacity = '0'; // Initial state
        observer.observe(el);
    });

    // --- Registration Form Logic ---
    const registerBtn = document.getElementById('register-btn');
    const formContainer = document.getElementById('registration-form-container');
    const cancelBtn = document.getElementById('cancel-btn');
    const form = document.getElementById('registration-form');
    const submitBtn = document.getElementById('submit-btn');

    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwuTXlffNsfUDggROHm1QoUrahgI4sAfUm9XCNWMFe2T4lihWqslnnyY4dChj8mMq7N/exec";

    if (registerBtn && formContainer && cancelBtn && form) {
        
        // Show Form
        registerBtn.addEventListener('click', () => {
            formContainer.style.display = 'block';
            registerBtn.style.display = 'none'; // Optional: hide button when form is open
        });

        // Hide Form
        cancelBtn.addEventListener('click', () => {
            formContainer.style.display = 'none';
            registerBtn.style.display = 'inline-block';
        });

        // Submit Form
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get values
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Validation
            if (!data.name || !data.mobile || !data.adults) {
                alert("Please fill in all mandatory fields (Name, Mobile, No. of Adults).");
                return;
            }

            const vegCount = parseInt(data.veg || 0);
            const nonVegCount = parseInt(data.nonVeg || 0);

            if (vegCount + nonVegCount === 0) {
                alert("Please select at least one meal (Veg or Non-Veg).");
                return;
            }

            // UI Loading State
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Submitting...';
            submitBtn.disabled = true;
            cancelBtn.disabled = true;

            try {
                // Send to Google Sheets
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: "POST",
                    body: formData,
                    mode: "no-cors"
                });

                // Success
                alert(`Thank you for registering, ${data.name}! We have received your details.`);
                form.reset();
                formContainer.style.display = 'none';
                registerBtn.style.display = 'inline-block';

            } catch (error) {
                console.error("Error submitting form:", error);
                alert("There was an error submitting your registration. Please try again.");
            } finally {
                // Reset UI
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
                cancelBtn.disabled = false;
            }
        });
    }

    // --- Login Logic ---
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = loginForm.username.value;
            const password = loginForm.password.value;

            if (username === 'admin' && password === 'admin') {
                sessionStorage.setItem('isAuthenticated', 'true');
                window.location.href = 'admin.html';
            } else {
                loginError.style.display = 'block';
            }
        });
    }

    // --- Logout Logic ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('isAuthenticated');
            window.location.href = 'index.html';
        });
    }
    // --- Admin Dashboard Logic ---
    if (window.location.pathname.includes('admin.html')) {
        const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwuTXlffNsfUDggROHm1QoUrahgI4sAfUm9XCNWMFe2T4lihWqslnnyY4dChj8mMq7N/exec";
        
        // State
        let registrations = [];

        const tableBody = document.getElementById('table-body');
        const searchInput = document.getElementById('search-input');
        const refreshBtn = document.getElementById('refresh-btn');
        
        // Modals
        const viewModal = document.getElementById('view-modal');
        const editModal = document.getElementById('edit-modal');
        const closeBtns = document.querySelectorAll('.close-modal, .close-modal-btn');
        const editForm = document.getElementById('edit-form');

        // Initial Fetch
        fetchRegistrations();

        // Fetch Function
        async function fetchRegistrations() {
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Loading data from Google Sheet...</td></tr>';
            
            try {
                const response = await fetch(GOOGLE_SCRIPT_URL);
                if (!response.ok) throw new Error('Network response was not ok');
                
                const data = await response.json();
                
                // Transform data if necessary (assuming array of objects from GAS)
                // If GAS returns { data: [...] } adjust accordingly. 
                // Assuming GAS returns plain array of objects as per my previous instructions.
                registrations = Array.isArray(data) ? data : (data.data || []);
                
                renderTable(registrations);
            } catch (error) {
                console.error("Error fetching data:", error);
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 20px; color: #d32f2f;">
                            <i class="fas fa-exclamation-circle"></i> Failed to load data.<br>
                            <small>Error: ${error.message}. Ensure your Google Script has a <code>doGet</code> function deployed.</small>
                        </td>
                    </tr>
                `;
            }
        }

        // Render Function
        function renderTable(data) {
            tableBody.innerHTML = '';
            
            if (!data || data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">No records found</td></tr>';
                return;
            }

            data.forEach(reg => {
                const row = document.createElement('tr');
                // Handle case-insensitive keys if GAS returns different casing
                const status = reg.status || reg.Status || 'Pending';
                const statusClass = `status-${status.toLowerCase()}`;
                
                // Helper to safely get value
                const getVal = (key) => reg[key] || reg[key.toLowerCase()] || '';

                row.innerHTML = `
                    <td>${getVal('Name') || getVal('name')}</td>
                    <td>${getVal('Mobile') || getVal('mobile')}</td>
                    <td>${getVal('Adults') || getVal('adults')}</td>
                    <td>${getVal('Kids') || getVal('kids')}</td>
                    <td>${getVal('Veg') || getVal('veg')}</td>
                    <td>${getVal('NonVeg') || getVal('nonVeg')}</td>
                    <td><span class="status-badge ${statusClass}">${status}</span></td>
                    <td>
                        <button class="action-btn btn-view" onclick="openViewModal('${getVal('id') || getVal('ID')}')"><i class="fas fa-eye"></i></button>
                        <button class="action-btn btn-edit" onclick="openEditModal('${getVal('id') || getVal('ID')}')"><i class="fas fa-pencil-alt"></i></button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }

        // Search Logic
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = registrations.filter(reg => {
                const name = (reg.name || reg.Name || '').toLowerCase();
                const mobile = (reg.mobile || reg.Mobile || '').toString();
                return name.includes(term) || mobile.includes(term);
            });
            renderTable(filtered);
        });

        // Refresh Logic
        refreshBtn.addEventListener('click', () => {
            const icon = refreshBtn.querySelector('i');
            icon.classList.add('fa-spin');
            fetchRegistrations().finally(() => {
                setTimeout(() => icon.classList.remove('fa-spin'), 500);
            });
        });

        // Modal Logic
        window.openViewModal = (id) => {
            // Loose comparison for ID as it might be string/number
            const reg = registrations.find(r => (r.id || r.ID) == id);
            if (!reg) return;

            const getVal = (key) => reg[key] || reg[key.toLowerCase()] || '';

            const content = `
                <div class="detail-row"><span class="detail-label">Name:</span> <span class="detail-value">${getVal('Name')}</span></div>
                <div class="detail-row"><span class="detail-label">Mobile:</span> <span class="detail-value">${getVal('Mobile')}</span></div>
                <div class="detail-row"><span class="detail-label">Adults:</span> <span class="detail-value">${getVal('Adults')}</span></div>
                <div class="detail-row"><span class="detail-label">Kids:</span> <span class="detail-value">${getVal('Kids')}</span></div>
                <div class="detail-row"><span class="detail-label">Veg Meals:</span> <span class="detail-value">${getVal('Veg')}</span></div>
                <div class="detail-row"><span class="detail-label">Non-Veg Meals:</span> <span class="detail-value">${getVal('NonVeg')}</span></div>
                <div class="detail-row"><span class="detail-label">Status:</span> <span class="detail-value">${getVal('Status')}</span></div>
                <div class="detail-row"><span class="detail-label">Registered At:</span> <span class="detail-value">${getVal('Timestamp') || 'N/A'}</span></div>
            `;
            document.getElementById('view-modal-body').innerHTML = content;
            viewModal.classList.add('active');
        };

        window.openEditModal = (id) => {
            const reg = registrations.find(r => (r.id || r.ID) == id);
            if (!reg) return;

            const getVal = (key) => reg[key] || reg[key.toLowerCase()] || '';

            document.getElementById('edit-id').value = getVal('id');
            document.getElementById('edit-name').value = getVal('Name');
            document.getElementById('edit-mobile').value = getVal('Mobile');
            document.getElementById('edit-adults').value = getVal('Adults');
            document.getElementById('edit-kids').value = getVal('Kids');
            document.getElementById('edit-veg').value = getVal('Veg');
            document.getElementById('edit-nonVeg').value = getVal('NonVeg');
            document.getElementById('edit-status').value = getVal('Status');

            editModal.classList.add('active');
        };

        // Close Modals
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                viewModal.classList.remove('active');
                editModal.classList.remove('active');
            });
        });

        window.onclick = (event) => {
            if (event.target == viewModal) viewModal.classList.remove('active');
            if (event.target == editModal) editModal.classList.remove('active');
        };

        // Handle Edit Submit
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = parseInt(document.getElementById('edit-id').value);
            const updatedData = {
                name: document.getElementById('edit-name').value,
                mobile: document.getElementById('edit-mobile').value,
                adults: parseInt(document.getElementById('edit-adults').value),
                kids: parseInt(document.getElementById('edit-kids').value),
                veg: parseInt(document.getElementById('edit-veg').value),
                nonVeg: parseInt(document.getElementById('edit-nonVeg').value),
                status: document.getElementById('edit-status').value
            };

            // Update Mock Data
            const index = registrations.findIndex(r => r.id === id);
            if (index !== -1) {
                registrations[index] = { ...registrations[index], ...updatedData };
                renderTable(registrations);
                editModal.classList.remove('active');
                alert('Registration updated successfully!');
            }
        });
    }
});
