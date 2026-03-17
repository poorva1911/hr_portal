document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== 'candidate') {
        window.location.href = '/login.html';
        return;
    }

    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const welcomeText = document.getElementById('welcome-text');
    const logoutBtn = document.getElementById('logout-btn');
    
    let selectedFile = null;

    // Fetch initial profile
    try {
        const res = await fetch('/api/candidate/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            welcomeText.textContent = `Welcome, ${data.username}`;
            if (data.hasResume) {
                renderProfileStatus(data.skills, data.experience);
            }
        } else {
            localStorage.clear();
            window.location.href = '/login.html';
        }
    } catch (e) { console.error(e); }

    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/login.html';
    });

    // File Drag & Drop
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFileSelect(fileInput.files[0]);
        }
    });

    function handleFileSelect(file) {
        if (file.type !== 'application/pdf') {
            alert('Please select a valid PDF file.');
            return;
        }
        selectedFile = file;
        dropZone.querySelector('h3').textContent = file.name;
        uploadBtn.disabled = false;
        document.getElementById('success-msg').style.display = 'none';
        document.getElementById('error-msg').style.display = 'none';
    }

    // Upload Action
    uploadBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        uploadBtn.disabled = true;
        document.getElementById('upload-loader').classList.remove('hidden');
        document.getElementById('success-msg').style.display = 'none';
        document.getElementById('error-msg').style.display = 'none';

        const formData = new FormData();
        formData.append('resume', selectedFile);

        try {
            const res = await fetch('/api/candidate/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();
            
            if (!res.ok) throw new Error(data.error || 'Failed to analyze resume');

            document.getElementById('success-msg').style.display = 'block';
            renderProfileStatus(data.parsedData.skills, data.parsedData.experience);

        } catch (err) {
            const errorMsg = document.getElementById('error-msg');
            errorMsg.textContent = err.message;
            errorMsg.style.display = 'block';
        } finally {
            uploadBtn.disabled = false;
            document.getElementById('upload-loader').classList.add('hidden');
        }
    });

    function renderProfileStatus(skills, experience) {
        document.getElementById('profile-status').style.display = 'block';
        document.getElementById('exp-stat').textContent = experience;
        
        const tagsContainer = document.getElementById('skills-list');
        tagsContainer.innerHTML = '';
        skills.forEach(skill => {
            const span = document.createElement('span');
            span.classList.add('skill-tag');
            span.textContent = skill;
            tagsContainer.appendChild(span);
        });
    }
});
