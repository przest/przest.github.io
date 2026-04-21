document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. BASE DE DATOS Y LISTADO (Con Consultorios y Pisos)
    // ==========================================
    const data = [
        {
            specialty: "Traumatología",
            doctors: [
                { name: "Dr. Roberto Sánchez", current: 5, room: "102", floor: "1er Piso" },
                { name: "Dra. Elena Rivas", current: 0, noAvailability: true, room: "105", floor: "1er Piso" } 
            ]
        },
        {
            specialty: "Pediatría",
            doctors: [
                { name: "Dra. Mariana López", current: 2, room: "201", floor: "2do Piso" },
                { name: "Dr. Carlos Galarza", current: 8, inPersonOnly: true, room: "204", floor: "2do Piso" } 
            ]
        },
        {
            specialty: "Cardiología",
            doctors: [
                { name: "Dr. Hernán Cortéz", current: 4, room: "305", floor: "3er Piso" },
                { name: "Dra. Julieta Román", current: 9, room: "308", floor: "3er Piso" }
            ]
        },
        {
            specialty: "Dermatología",
            doctors: [
                { name: "Dra. Valeria Blanco", current: 1, room: "12", floor: "Planta Baja" },
                { name: "Dr. Tomás Quintana", current: 7, room: "14", floor: "Planta Baja" }
            ]
        },
        {
            specialty: "Oftalmología",
            doctors: [
                { name: "Dr. Esteban Quito", current: 3, room: "401", floor: "4to Piso" },
                { name: "Dra. Laura Campos", current: 11, room: "402", floor: "4to Piso" }
            ]
        }
    ];

    const specialtiesContainer = document.getElementById('specialties-container');
    const modal = document.getElementById('modal');
    const nowServingDisplay = document.getElementById('doctor-now-serving');
    let activeDoctor = null;

    if (specialtiesContainer) {
        data.forEach(item => {
            const div = document.createElement('div');
            div.className = 'specialty-item';
            div.innerHTML = `<div class="specialty-header">${item.specialty}</div>`;
            
            const ul = document.createElement('ul');
            ul.className = 'doctors-list';
            
            item.doctors.forEach(doc => {
                const li = document.createElement('li');
                
                let badgeHTML = '';
                if (doc.noAvailability) badgeHTML = '<span class="badge badge-red">Sin disponibilidad</span>';
                else if (doc.inPersonOnly) badgeHTML = '<span class="badge badge-blue">Solo Presencial</span>';

                li.innerHTML = `
                    <div class="doctor-info">
                        <span>${doc.name}</span>
                        ${badgeHTML}
                    </div>
                `;

// NUEVA LÓGICA: Determinar qué cartel abrir según el doctor
                li.onclick = () => {
                    if (doc.noAvailability) {
                        showCustomAlert(
                            "Sin Disponibilidad", 
                            "Este profesional se encuentra en licencia o no cuenta con turnos disponibles por el momento."
                        );
                    } else if (doc.inPersonOnly) {
                        showCustomAlert(
                            "Atención Exclusivamente Presencial", 
                            "Este profesional no acepta reservas online. Por favor, acércate personalmente para solicitar un turno.",
                            doc // Le pasamos los datos del doctor para mostrar el piso y consultorio
                        );
                    } else {
                        openDoctorModal(doc);
                    }
                };
                ul.appendChild(li);
            });

            div.onclick = (e) => {
                if(e.target.closest('.specialty-header')) {
                    const isVisible = ul.style.display === 'block';
                    ul.style.display = isVisible ? 'none' : 'block';
                }
            };
            
            div.appendChild(ul);
            specialtiesContainer.appendChild(div);
        });
    }

    // ==========================================
    // 2. VENTANA MODAL DE TURNOS
    // ==========================================
    function openDoctorModal(doctor) {
        activeDoctor = doctor;
        document.getElementById('modal-doctor-name').textContent = doctor.name;
        document.getElementById('result-message').classList.add('hidden');
        document.getElementById('book-btn').disabled = true;
        
        nowServingDisplay.textContent = `#${doctor.current}`;
        
        const container = document.getElementById('time-slots');
        container.innerHTML = '';

        if (doctor.inPersonOnly) {
            const notice = document.createElement('div');
            notice.className = 'in-person-notice';
            notice.textContent = "⚠️ Este profesional solo otorga turnos para atención presencial.";
            container.appendChild(notice);
        }
        
        generateSlots(container);
        modal.style.display = 'block';
    }

    function generateSlots(container) {
        const hours = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"];
        
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
            
            // Aquí inyectamos el mensaje con los datos fijos del doctor seleccionado
            msg.innerHTML = `
                ¡Reserva exitosa!<br>
                Tu turno es el <strong>#${ticket}</strong><br><br>
                📍 <strong>Ubicación:</strong> ${activeDoctor.floor}, Consultorio ${activeDoctor.room}
            `;
            
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

    setInterval(() => {
        data.forEach(spec => {
            spec.doctors.forEach(doc => {
                if (!doc.noAvailability && Math.random() < 0.15) { 
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
    // 3. CHATBOT DE TRIAJE
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
});
