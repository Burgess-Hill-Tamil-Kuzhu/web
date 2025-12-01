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

    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx1IIFF1g2QFBltVUlAF4WWXV_HXdsL9xJFucKSFBwQNEAc7VuHHo4qwnnxZ7eX9wxV/exec";

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
});
