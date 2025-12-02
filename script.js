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

    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby0gkeUtJIPrpJ5Pz7uEmfSYOKXFSw1oPdZjzcJMFqj4gge5_k7WRw489wFyM-Wklgb/exec";

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

            // Create FormData object for Google Apps Script
            const formData = new FormData(form);
            formData.append('action', 'create'); // Explicitly set action
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
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = loginForm.username.value.trim();
            const password = loginForm.password.value.trim();

            // Hash the password
            const msgBuffer = new TextEncoder().encode(password);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            const TARGET_HASH = "6c8f38293ab6bc334c703ba27fd3dce4c6632eec49d325ed9e38572372956cc6";

            console.log("Debug Login:");
            console.log("Username:", username);
            console.log("Input Password:", password); // Remove in production
            console.log("Computed Hash:", hashHex);
            console.log("Target Hash:  ", TARGET_HASH);

            if (username === 'admin' && hashHex === TARGET_HASH) {
                console.log("Login Success");
                sessionStorage.setItem('isAuthenticated', 'true');
                window.location.href = 'admin.html';
            } else {
                console.log("Login Failed");
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
            const tableFooter = document.getElementById('table-footer');
            
            if (!data || data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No records found</td></tr>';
                tableFooter.innerHTML = '';
                return;
            }

            let totalAdults = 0;
            let totalKids = 0;
            let totalVeg = 0;
            let totalNonVeg = 0;

            data.forEach(reg => {
                const row = document.createElement('tr');
                
                // Helper to safely get value
                const getVal = (key) => reg[key] || reg[key.toLowerCase()] || '';
                
                // Parse values
                const adults = parseInt(getVal('Adults') || getVal('adults') || 0);
                const kids = parseInt(getVal('Kids') || getVal('kids') || 0);
                const veg = parseInt(getVal('Veg') || getVal('veg') || 0);
                const nonVeg = parseInt(getVal('NonVeg') || getVal('nonVeg') || 0);

                // Add to totals
                totalAdults += adults;
                totalKids += kids;
                totalVeg += veg;
                totalNonVeg += nonVeg;

                row.innerHTML = `
                    <td>${getVal('Name') || getVal('name')}</td>
                    <td>${getVal('Mobile') || getVal('mobile')}</td>
                    <td>${adults}</td>
                    <td>${kids}</td>
                    <td>${veg}</td>
                    <td>${nonVeg}</td>
                    <td>
                        <button class="action-btn btn-view" onclick="openViewModal('${getVal('id') || getVal('ID')}')"><i class="fas fa-eye"></i></button>
                        <button class="action-btn btn-edit" onclick="openEditModal('${getVal('id') || getVal('ID')}')"><i class="fas fa-pencil-alt"></i></button>
                        <button class="action-btn btn-delete" onclick="deleteRegistration('${getVal('id') || getVal('ID')}')"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Render Footer
            tableFooter.innerHTML = `
                <tr>
                    <td colspan="2" style="text-align: right; padding-right: 20px;"><strong>Total:</strong></td>
                    <td>${totalAdults}</td>
                    <td>${totalKids}</td>
                    <td>${totalVeg}</td>
                    <td>${totalNonVeg}</td>
                    <td></td>
                </tr>
            `;
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
            const adults = parseInt(getVal('Adults') || getVal('adults') || 0);
            const kids = parseInt(getVal('Kids') || getVal('kids') || 0);

            const content = `
                <div class="detail-row"><span class="detail-label">Name:</span> <span class="detail-value">${getVal('Name')}</span></div>
                <div class="detail-row"><span class="detail-label">Mobile:</span> <span class="detail-value">${getVal('Mobile')}</span></div>
                <div class="detail-row"><span class="detail-label">Adults:</span> <span class="detail-value">${adults}</span></div>
                <div class="detail-row"><span class="detail-label">Kids:</span> <span class="detail-value">${kids}</span></div>
                <div class="detail-row"><span class="detail-label">Total:</span> <span class="detail-value">${adults + kids}</span></div>
                <div class="detail-row"><span class="detail-label">Veg Meals:</span> <span class="detail-value">${getVal('Veg')}</span></div>
                <div class="detail-row"><span class="detail-label">Non-Veg Meals:</span> <span class="detail-value">${getVal('NonVeg')}</span></div>
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

            editModal.classList.add('active');
        };

        // Delete Logic
        window.deleteRegistration = async (id) => {
            if (!confirm("Are you sure you want to delete this registration?")) return;

            // Optimistic UI update
            const originalData = [...registrations]; // Backup
            registrations = registrations.filter(r => (r.id || r.ID) != id);
            renderTable(registrations);

            try {
                // Use FormData to match the working 'create' implementation
                const formData = new FormData();
                formData.append('action', 'delete');
                formData.append('id', id);

                await fetch(GOOGLE_SCRIPT_URL, {
                    method: "POST",
                    body: formData,
                    mode: "no-cors"
                });
                
                alert("Registration deleted.");
            } catch (error) {
                console.error("Error deleting:", error);
                alert("Error deleting registration. Reverting changes.");
                // Revert on error
                registrations = originalData;
                renderTable(registrations);
            }
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
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-id').value;
            const updatedData = {
                name: document.getElementById('edit-name').value,
                mobile: document.getElementById('edit-mobile').value,
                adults: parseInt(document.getElementById('edit-adults').value),
                kids: parseInt(document.getElementById('edit-kids').value),
                veg: parseInt(document.getElementById('edit-veg').value),
                nonVeg: parseInt(document.getElementById('edit-nonVeg').value)
            };

            // Optimistic Update
            const index = registrations.findIndex(r => (r.id || r.ID) == id);
            if (index !== -1) {
                registrations[index] = { ...registrations[index], ...updatedData };
                renderTable(registrations);
                editModal.classList.remove('active');
            }

            try {
                // Use FormData
                const formData = new FormData();
                formData.append('action', 'update');
                formData.append('id', id);
                formData.append('data', JSON.stringify(updatedData));

                await fetch(GOOGLE_SCRIPT_URL, {
                    method: "POST",
                    body: formData,
                    mode: "no-cors"
                });
                
                alert('Registration updated successfully!');
            } catch (error) {
                console.error("Error updating:", error);
                alert("Error updating registration.");
                fetchRegistrations(); // Re-fetch to sync
            }
        });
    }
});
