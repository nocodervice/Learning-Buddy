
let selectedSubject = "";

window.onload = () => {
    fetch('/subjects')
        .then(res => res.json())
        .then(subjects => {
            const select = document.getElementById('subjectSelect');
            subjects.forEach(subject => {
                const opt = document.createElement('option');
                opt.value = subject;
                opt.innerText = subject;
                select.appendChild(opt);
            });
        });

    document.getElementById('subjectSelect').addEventListener('change', (e) => {
        if (e.target.value === 'new') {
            const name = prompt('Enter new subject name:');
            if (name) {
                fetch('/subjects', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name })
                }).then(() => location.reload());
            }
        } else {
            selectedSubject = e.target.value;
            document.getElementById('chatContainer').innerHTML = "";
        }
    });

    document.getElementById('fileInput').addEventListener('change', (e) => {
        const files = e.target.files;
        if (!selectedSubject) {
            alert("Please select a subject first.");
            return;
        }
        const formData = new FormData();
        for (let file of files) {
            formData.append('files', file);
        }
        formData.append('subject', selectedSubject);
        fetch('/upload', {
            method: 'POST',
            body: formData
        }).then(() => alert("Files uploaded!"));
    });
};

function sendMessage() {
    const input = document.getElementById('inputField');
    const message = input.value.trim();
    if (!message || !selectedSubject) return;

    const chatContainer = document.getElementById('chatContainer');
    const userEntry = document.createElement('div');
    userEntry.className = 'chat-entry';
    userEntry.textContent = `👦 You: ${message}`;
    chatContainer.appendChild(userEntry);

    fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, subject: selectedSubject })
    })
    .then(res => res.json())
    .then(data => {
        const botEntry = document.createElement('div');
        botEntry.className = 'chat-entry';
        botEntry.textContent = `🤖 Buddy: ${data.response}`;
        chatContainer.appendChild(botEntry);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    });

    input.value = '';
}
