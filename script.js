document.addEventListener('DOMContentLoaded', function() {
    const prevBtns = document.querySelectorAll(".btn-prev");
    const nextBtns = document.querySelectorAll(".btn-next");
    const progress = document.getElementById("progress");
    const formSteps = document.querySelectorAll(".form-step");
    const progressSteps = document.querySelectorAll(".progress-step");
    const form = document.getElementById('applicationForm');

    let formStepsNum = 0;

    // --- Step Navigation ---
    nextBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            if (validateStep()) {
                formStepsNum++;
                updateFormSteps();
                updateProgressbar();
            }
        });
    });

    prevBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            formStepsNum--;
            updateFormSteps();
            updateProgressbar();
        });
    });

    function updateFormSteps() {
        formSteps.forEach((formStep) => {
            formStep.classList.contains("form-step-active") &&
                formStep.classList.remove("form-step-active");
        });
        formSteps[formStepsNum].classList.add("form-step-active");
    }

    function updateProgressbar() {
        progressSteps.forEach((progressStep, idx) => {
            if (idx < formStepsNum + 1) {
                progressStep.classList.add("progress-step-active");
            } else {
                progressStep.classList.remove("progress-step-active");
            }
        });
        const progressActive = document.querySelectorAll(".progress-step-active");
        progress.style.width =
            ((progressActive.length - 1) / (progressSteps.length - 1)) * 100 + "%";
    }

    // --- Input Validation ---
    function validateStep() {
        let isValid = true;
        const currentStep = formSteps[formStepsNum];
        const inputs = currentStep.querySelectorAll('input[required], textarea[required]');

        inputs.forEach(input => {
            const formGroup = input.closest('.form-group');
            const errorElement = formGroup.querySelector('.error-message');
            input.classList.remove('invalid');
            errorElement.textContent = '';

            if (!input.value.trim()) {
                showError(input, 'এই ঘরটি পূরণ করুন।');
                isValid = false;
            } else {
                 // Specific validations
                if (input.id === 'phone' || input.id === 'guardian_phone') {
                    if (!/^\d{11}$/.test(input.value)) {
                        showError(input, '১১ সংখ্যার সঠিক ফোন নাম্বার দিন।');
                        isValid = false;
                    }
                }
                if (input.id === 'nid') {
                    if (!/^\d{10}$|^\d{13}$|^\d{17}$/.test(input.value)) {
                         showError(input, '১০, ১৩ বা ১৭ সংখ্যার সঠিক NID নাম্বার দিন।');
                         isValid = false;
                    }
                }
                 if (input.type === 'email') {
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
                        showError(input, 'সঠিক ইমেইল ঠিকানা দিন।');
                        isValid = false;
                    }
                }
                if(input.type === 'file' && input.files.length === 0){
                    showError(input, 'একটি ফাইল নির্বাচন করুন।');
                    isValid = false;
                }
            }
        });
        return isValid;
    }

    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message');
        input.classList.add('invalid');
        errorElement.textContent = message;
    }

    // --- Image Preview ---
    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', function() {
            const preview = this.parentElement.querySelector('.image-preview');
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                preview.style.display = 'block';
                reader.onload = function(e) {
                    preview.src = e.target.result;
                }
                reader.readAsDataURL(file);
            } else {
                preview.style.display = 'none';
                preview.src = "#";
            }
        });
    });

    // --- Save and Load from LocalStorage ---
    form.addEventListener('input', () => {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        // Don't save file data
        delete data.photo;
        delete data.payment_screenshot;
        localStorage.setItem('applicationFormData', JSON.stringify(data));
    });

    window.addEventListener('load', () => {
        const savedData = localStorage.getItem('applicationFormData');
        if (savedData) {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(key => {
                if (form.elements[key]) {
                    form.elements[key].value = data[key];
                }
            });
        }
    });

    // --- Form Submission ---
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        if (!validateStep()) return;
        
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        const botToken = '7118737556:AAFppOToV3Mn0xMuyscxPVhITbPlQYOy5vk'; // আপনার টেলিগ্রাম বট টোকেন দিন
        const chatId = '8174575316';     // আপনার টেলিগ্রাম চ্যাট আইডি দিন
        
        // Telegram submission logic from previous steps...
        const formData = new FormData(form);
        let messageText = `
*নতুন চাকরির আবেদন*
*ব্যক্তিগত বিবরণ:*
-------------------------
*নাম:* ${formData.get('name')}
*ফোন:* \`${formData.get('phone')}\` | *ইমেইল:* ${formData.get('email')}
*পেমেন্ট একাউন্ট:* \`${formData.get('payment_account')}\`
*NID:* \`${formData.get('nid')}\` | *জন্ম তারিখ:* ${formData.get('dob')}
*অভিভাবকের বিবরণ:*
-------------------------
*বাবার নাম:* ${formData.get('father_name')} | *অভিভাবকের ফোন:* \`${formData.get('guardian_phone')}\`
*ঠিকানা:*
-------------------------
*বর্তমান:* ${formData.get('present_address')}
*স্থায়ী:* ${formData.get('permanent_address')}
-------------------------
*ছবি এবং স্ক্রিনশট নিচে পাঠানো হচ্ছে...*
        `;

        const sendFile = (file, caption) => {
                const fileFormData = new FormData();
                fileFormData.append('chat_id', chatId);
                fileFormData.append('photo', file);
                fileFormData.append('caption', caption);
                return fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
                    method: 'POST',
                    body: fileFormData
                });
            };

        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: messageText, parse_mode: 'Markdown' }),
        })
        .then(res => res.json().then(data => ({ ok: res.ok, data })))
        .then(({ok, data}) => {
            if (!ok) throw new Error('Text message sending failed: ' + data.description);
            return sendFile(formData.get('photo'), 'আবেদনকারীর ছবি');
        })
        .then(res => res.json().then(data => ({ ok: res.ok, data })))
        .then(({ok, data}) => {
            if (!ok) throw new Error('Photo sending failed: ' + data.description);
            return sendFile(formData.get('payment_screenshot'), 'পেমেন্ট স্ক্রিনশট');
        })
        .then(res => res.json().then(data => ({ ok: res.ok, data })))
        .then(({ok, data}) => {
            if (!ok) throw new Error('Screenshot sending failed: ' + data.description);
            localStorage.removeItem('applicationFormData'); // Clear saved data on success
            window.location.href = 'success.html';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('দুঃখিত, আবেদন জমা হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।');
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        });
    });
}); 