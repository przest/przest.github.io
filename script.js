// Envolvemos TODO el código para asegurarnos de que el HTML cargue primero
document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. BASE DE DATOS Y LISTADO DE DOCTORES
    // ==========================================
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

    // Elementos de la página principal
    const specialtiesContainer = document.getElementById('specialties-container');
    const modal = document.getElementById('modal');
    const nowServingDisplay = document.getElementById('doctor-now-serving');
    let activeDoctor = null;

    // Crear la lista desplegable de especialidades
    if (specialtiesContainer) {
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
    }

    // ==========================================
    // 2. LÓGICA DE LA VENTANA MODAL (TURNOS)
    // ==========================================
    function openDoctorModal(doctor) {
        activeDoctor = doctor;
        document.getElementById('modal-doctor-name').textContent = doctor.name;
        document.getElementById('result-message').classList.add('hidden');
        document.getElementById('book-btn').disabled = true;
        
        nowServingDisplay.textContent = `#${doctor.current}`;
        
        generateSlots();
        modal.style.display = 'block';
    }

    function generateSlots() {
        const container = document.getElementById('time-slots');
        container.innerHTML = '';
        
        const hours = [
            "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
            "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"
        ];
        
        hours.forEach(h => {
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.textContent = h;
            
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

    const bookBtn = document.getElementById('book-btn');
    if (bookBtn) {
        bookBtn.onclick = () => {
            const ticket = Math.floor(Math.random() * 15) + 1;
            const msg = document.getElementById('result-message');
            msg.innerHTML = `Reserva exitosa. Tu turno es el <strong>#${ticket}</strong>`;
            msg.classList.remove('hidden');
            bookBtn.disabled = true;
        };
    }

    const closeModalBtn = document.getElementById('close-modal');
    if (closeModalBtn) {
        closeModalBtn.onclick = () => {
            modal.style.display = 'none';
            activeDoctor = null;
        };
    }

    // SIMULACIÓN: Los doctores avanzan sus turnos automáticamente (24/7)
    setInterval(() => {
        data.forEach(spec => {
            spec.doctors.forEach(doc => {
                if (Math.random() < 0.15) { 
                    doc.current++;
                    if (doc.current > 50) doc.current = 1; 
                    
                    if (activeDoctor && activeDoctor.name === doc.name) {
                        nowServingDisplay.textContent = `#${doc.current}`;
                    }
                }
            });
        });
    }, 5000);

    // ==========================================
    // 3. LÓGICA DEL CHATBOT DE TRIAJE
    // ==========================================
    const chatToggle = document.getElementById('chatbot-toggle');
    const chatWindow = document.getElementById('chatbot-window');
    const closeChat = document.getElementById('close-chat');
    const chatInput = document.getElementById('chat-input');
    const sendChatBtn = document.getElementById('send-chat');
    const chatMessages = document.getElementById('chat-messages');

    if (chatToggle && chatWindow && closeChat && chatInput && sendChatBtn) {
        
        const triageRules = {
            "Traumatología": ["hueso", "golpe", "fractura", "esguince", "rodilla", "espalda", "caida", "pierna", "brazo", "doble"],
            "Pediatría": ["niño", "bebe", "hijo", "nene", "nena", "chico"],
            "Cardiología": ["corazon", "pecho", "taquicardia", "presion", "palpitacion", "infarto", "arritmia"],
            "Dermatología": ["piel", "grano", "mancha", "picazon", "sarpullido", "alergia", "quemadura", "lunar"],
            "Oftalmología": ["ojo", "vision", "ver", "lentes", "borroso", "irritacion", "conjuntivitis"]
        };

        chatToggle.onclick = () => chatWindow.classList.toggle('hidden');
        closeChat.onclick = () => chatWindow.classList.add('hidden');

        function addMessage(text, sender) {
            const msgDiv = document.createElement('div');
            msgDiv.className = `message ${sender}-message`;
            msgDiv.textContent = text;
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function processSymptom(input) {
            const text = input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            let recommendedSpecialty = null;

            for (const [specialty, keywords] of Object.entries(triageRules)) {
                if (keywords.some(keyword => text.includes(keyword))) {
                    recommendedSpecialty = specialty;
                    break;
                }
            }

            setTimeout(() => {
                if (recommendedSpecialty) {
                    addMessage(`Basado en tus síntomas, te sugiero buscar turno con la especialidad de ${recommendedSpecialty}. Revisa nuestra lista de profesionales.`, 'bot');
                } else {
                    addMessage("Mis disculpas, no logro identificar la especialidad exacta para ese síntoma. Te recomiendo agendar con un Médico Clínico para una evaluación general o acudir a la guardia.", 'bot');
                }
            }, 600); 
        }

        sendChatBtn.onclick = () => {
            const text = chatInput.value.trim();
            if (text) {
                addMessage(text, 'user');
                chatInput.value = '';
                processSymptom(text);
            }
        };

        chatInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendChatBtn.click();
            }
        });
    }
    /* Estilos para las etiquetas en la lista de doctores */
.doctor-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
}

.badge {
    font-size: 0.75rem;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: bold;
}

.badge-red {
    background-color: #fee2e2;
    color: #b91c1c;
}

.badge-blue {
    background-color: #e0f2fe;
    color: #0369a1;
}

/* Aviso dentro del modal */
.in-person-notice {
    background-color: #fff7ed;
    color: #9a3412;
    padding: 10px;
    border-radius: 6px;
    font-size: 0.9rem;
    margin-bottom: 10px;
    border: 1px solid #fdba74;
    text-align: center;
}
}); // <-- Aquí se cierra la envoltura protectora principal
