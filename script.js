// 1. Base de datos con los turnos iniciales de cada doctor
const data = [
    {
        specialty: "Traumatología",
        doctors: [
            { name: "Dr. Roberto Sánchez", current: 5 },
            { name: "Dra. Lucía Fernández", current: 12 }
        ]
    },
    {
        specialty: "Pediatría",
        doctors: [
            { name: "Dra. Mariana López", current: 2 },
            { name: "Dr. Carlos Galarza", current: 8 },
            { name: "Dra. Sofía Mendoza", current: 15 }
        ]
    },
    {
        specialty: "Cardiología",
        doctors: [
            { name: "Dr. Hernán Cortéz", current: 4 },
            { name: "Dra. Julieta Román", current: 9 }
        ]
    },
    {
        specialty: "Dermatología",
        doctors: [
            { name: "Dra. Valeria Blanco", current: 1 },
            { name: "Dr. Tomás Quintana", current: 7 }
        ]
    },
    {
        specialty: "Oftalmología",
        doctors: [
            { name: "Dr. Esteban Quito", current: 3 },
            { name: "Dra. Laura Campos", current: 11 }
        ]
    }
];

// Elementos de la página
const specialtiesContainer = document.getElementById('specialties-container');
const modal = document.getElementById('modal');
const nowServingDisplay = document.getElementById('doctor-now-serving');
let activeDoctor = null;

// 2. Crear la lista desplegable de especialidades
data.forEach(item => {
    const div = document.createElement('div');
    div.className = 'specialty-item';
    div.innerHTML = `<div class="specialty-header">${item.specialty}</div>`;
    
    const ul = document.createElement('ul');
    ul.className = 'doctors-list';
    
    item.doctors.forEach(doc => {
        const li = document.createElement('li');
        li.textContent = doc.name;
        li.onclick = () => openDoctorModal(doc);
        ul.appendChild(li);
    });

    // Abrir/Cerrar la lista al hacer clic en la especialidad
    div.onclick = (e) => {
        if(e.target.className === 'specialty-header') {
            const isVisible = ul.style.display === 'block';
            ul.style.display = isVisible ? 'none' : 'block';
        }
    };
    
    div.appendChild(ul);
    specialtiesContainer.appendChild(div);
});

// 3. Abrir la ventana Modal y quitar el "--"
function openDoctorModal(doctor) {
    activeDoctor = doctor;
    document.getElementById('modal-doctor-name').textContent = doctor.name;
    document.getElementById('result-message').classList.add('hidden');
    document.getElementById('book-btn').disabled = true;
    
    // Aquí es donde el código borra el "--" e inyecta el número del doctor
    nowServingDisplay.textContent = `#${doctor.current}`;
    
    generateSlots();
    modal.style.display = 'block';
}

// 4. Generar los botones de horarios
function generateSlots() {
    const container = document.getElementById('time-slots');
    container.innerHTML = '';
    
    // Todos los horarios requeridos
    const hours = [
        "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
        "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"
    ];
    
    hours.forEach(h => {
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.textContent = h;
        
        // Simular turnos ocupados (30% de probabilidad)
        if (Math.random() < 0.3) {
            slot.classList.add('occupied');
        } else {
            slot.onclick = () => {
                document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
                document.getElementById('book-btn').disabled = false;
            };
        }
        container.appendChild(slot);
    });
}

// 5. Botones de pedir turno y cerrar
document.getElementById('book-btn').onclick = () => {
    const ticket = Math.floor(Math.random() * 15) + 1;
    const msg = document.getElementById('result-message');
    msg.innerHTML = `Reserva exitosa. Tu turno es el <strong>#${ticket}</strong>`;
    msg.classList.remove('hidden');
    document.getElementById('book-btn').disabled = true;
};

document.getElementById('close-modal').onclick = () => {
    modal.style.display = 'none';
    activeDoctor = null;
};

// 6. SIMULACIÓN: Los doctores avanzan sus turnos automáticamente (24/7)
setInterval(() => {
    data.forEach(spec => {
        spec.doctors.forEach(doc => {
            // Cada 5 segundos, hay un 15% de probabilidad de que el doctor llame al siguiente paciente
            if (Math.random() < 0.15) { 
                doc.current++;
                if (doc.current > 50) doc.current = 1; // Se reinicia si pasa del 50
                
                // Si tienes abierta la ficha de ese doctor en este momento, actualiza el número en tu pantalla
                if (activeDoctor && activeDoctor.name === doc.name) {
                    nowServingDisplay.textContent = `#${doc.current}`;
                }
            }
        });
    });
}, 5000);

// --- Lógica del Chatbot de Triaje ---
const chatToggle = document.getElementById('chatbot-toggle');
const chatWindow = document.getElementById('chatbot-window');
const closeChat = document.getElementById('close-chat');
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat');
const chatMessages = document.getElementById('chat-messages');

// Diccionario: Palabras clave y su derivación
const triageRules = {
    "Traumatología": ["hueso", "golpe", "fractura", "esguince", "rodilla", "espalda", "caida", "pierna", "brazo", "doble"],
    "Pediatría": ["niño", "bebe", "hijo", "nene", "nena", "chico"],
    "Cardiología": ["corazon", "pecho", "taquicardia", "presion", "palpitacion", "infarto", "arritmia"],
    "Dermatología": ["piel", "grano", "mancha", "picazon", "sarpullido", "alergia", "quemadura", "lunar"],
    "Oftalmología": ["ojo", "vision", "ver", "lentes", "borroso", "irritacion", "conjuntivitis"]
};

// Abrir y cerrar el chat
chatToggle.onclick = () => chatWindow.classList.toggle('hidden');
closeChat.onclick = () => chatWindow.classList.add('hidden');

// Función para imprimir mensajes en la pantalla
function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;
    msgDiv.textContent = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll hacia abajo
}

// Lógica para analizar los síntomas
function processSymptom(input) {
    // Quitar tildes y pasar a minúsculas para que sea más fácil buscar
    const text = input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let recommendedSpecialty = null;

    for (const [specialty, keywords] of Object.entries(triageRules)) {
        if (keywords.some(keyword => text.includes(keyword))) {
            recommendedSpecialty = specialty;
            break; // Si encuentra coincidencia, deja de buscar
        }
    }

    // Simulamos un tiempo de "pensamiento" de medio segundo
    setTimeout(() => {
        if (recommendedSpecialty) {
            addMessage(`Basado en tus síntomas, te sugiero buscar turno con la especialidad de ${recommendedSpecialty}. Revisa nuestra lista de profesionales.`, 'bot');
        } else {
            addMessage("Mis disculpas, no logro identificar la especialidad exacta para ese síntoma. Te recomiendo agendar con un Médico Clínico para una evaluación general o acudir a la guardia.", 'bot');
        }
    }, 600); 
}

// Evento al hacer clic en "Enviar"
sendChatBtn.onclick = () => {
    const text = chatInput.value.trim();
    if (text) {
        addMessage(text, 'user');
        chatInput.value = '';
        processSymptom(text);
    }
};

// Permitir enviar el mensaje apretando la tecla "Enter"
chatInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendChatBtn.click();
    }
});
