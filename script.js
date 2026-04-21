document.addEventListener('DOMContentLoaded', () => {

    // 1. Base de datos actualizada con 2 doctores por especialidad y condiciones especiales
    const data = [
        {
            specialty: "Traumatología",
            doctors: [
                { name: "Dr. Roberto Sánchez", current: 5 },
                { name: "Dra. Elena Rivas", current: 0, noAvailability: true } // Ejemplo: Sin turnos
            ]
        },
        {
            specialty: "Pediatría",
            doctors: [
                { name: "Dra. Mariana López", current: 2 },
                { name: "Dr. Carlos Galarza", current: 8, inPersonOnly: true } // Ejemplo: Solo presencial
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

    const specialtiesContainer = document.getElementById('specialties-container');
    const modal = document.getElementById('modal');
    const nowServingDisplay = document.getElementById('doctor-now-serving');
    let activeDoctor = null;

    // 2. Modificación: Crear la lista mostrando los "Badges" a la derecha
    if (specialtiesContainer) {
        data.forEach(item => {
            const div = document.createElement('div');
            div.className = 'specialty-item';
            div.innerHTML = `<div class="specialty-header">${item.specialty}</div>`;
            
            const ul = document.createElement('ul');
            ul.className = 'doctors-list';
            
            item.doctors.forEach(doc => {
                const li = document.createElement('li');
                
                // Creamos un contenedor interno para el nombre y la etiqueta
                let badgeHTML = '';
                if (doc.noAvailability) badgeHTML = '<span class="badge badge-red">Sin disponibilidad</span>';
                else if (doc.inPersonOnly) badgeHTML = '<span class="badge badge-blue">Solo Presencial</span>';

                li.innerHTML = `
                    <div class="doctor-info">
                        <span>${doc.name}</span>
                        ${badgeHTML}
                    </div>
                `;

                // Solo permitimos abrir el modal si hay disponibilidad
                li.onclick = () => {
                    if (!doc.noAvailability) {
                        openDoctorModal(doc);
                    } else {
                        alert("Este profesional no cuenta con turnos disponibles por el momento.");
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

    // 3. Modificación del Modal: Mostrar aviso de turnos presenciales
    function openDoctorModal(doctor) {
        activeDoctor = doctor;
        document.getElementById('modal-doctor-name').textContent = doctor.name;
        document.getElementById('result-message').classList.add('hidden');
        document.getElementById('book-btn').disabled = true;
        
        nowServingDisplay.textContent = `#${doctor.current}`;
        
        // Limpiar y generar horarios
        const container = document.getElementById('time-slots');
        container.innerHTML = '';

        // Si es presencial, agregamos un aviso arriba de los horarios
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

    // El resto de la lógica (bookBtn, closeModalBtn, setInterval) se mantiene igual que en el código anterior
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

    // ... (Aquí iría la lógica del chatbot que ya tenías) ...
});
