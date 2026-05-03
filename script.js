/**
 * DOCUMENTACIÓN DE CONFIGURACIÓN
 * URL_SB: Debe ser tu "Project URL".
 * KEY_SB: Debe ser tu "Anon Public Key".
 */
const URL_SB = 'https://lmblbrzocgyfqbiyrjte.supabase.co'; // Reemplaza esto con tu URL real
const KEY_SB = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtYmxicnpvY2d5ZnFiaXlyanRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MTEzMDgsImV4cCI6MjA5MTA4NzMwOH0.W-3PLKgei4n2MspD1Dv-3eXB0TUcMZtpBt1isSU2ZDs'; // Reemplaza esto con tu Key real
const _supabase = supabase.createClient(URL_SB, KEY_SB);

function fmtFecha(offset = 0) {
    const f = new Date();
    f.setDate(f.getDate() + offset);
    const d = String(f.getDate()).padStart(2, '0');
    const m = String(f.getMonth() + 1).padStart(2, '0');
    const n = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    return `${d}/${m} (${n[f.getDay()]})`;
}

/**
 * Función: updateUI
 * Actualiza los elementos del DOM basándose en el tiempo y zona horaria
 */
function runEngine(tz = "America/Argentina/Buenos_Aires") {
    const clock = document.getElementById('clock');
    const fill = document.getElementById('progress-fill');

    if (window.mainLoop) clearInterval(window.mainLoop);

    const update = () => {
        const ahora = new Date();
        const timeStr = ahora.toLocaleTimeString('es-ES', { 
            timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
        });

        // Lógica de Programación: Cálculo de porcentaje del día (0-100%)
        const partes = timeStr.split(':');
        const totalSegundos = (parseInt(partes[0]) * 3600) + (parseInt(partes[1]) * 60) + parseInt(partes[2]);
        const porcentaje = (totalSegundos / 86400) * 100;

        if (clock) clock.innerText = timeStr;
        if (fill) fill.style.width = `${porcentaje}%`;

        // Cambio de ambiente
        const h = parseInt(partes[0]);
        document.body.style.background = (h >= 7 && h < 19) ? '#0a0a0a' : '#020205';
    };

    update();
    window.mainLoop = setInterval(update, 1000);
}

async function init() {
    runEngine(); // Reloj inicial
    const fA = fmtFecha(-1), fH = fmtFecha(0), fM = fmtFecha(1);

    try {
        const { data } = await _supabase.from('itinerario').select('*').in('fecha', [fA, fH, fM]);
        
        if (data) {
            const h = data.find(r => r.fecha === fH);
            const a = data.find(r => r.fecha === fA);
            const m = data.find(r => r.fecha === fM);

            document.getElementById('ayer-destino').innerText = a ? a.ciudad : "---";
            document.getElementById('mañana-destino').innerText = m ? m.ciudad : "---";

            if (h) {
                document.getElementById('ubicacion').innerText = h.ciudad;
                document.getElementById('notas').innerText = h.notas || "";
                const tz = h.pais.toUpperCase().includes("BRASIL") ? "America/Sao_Paulo" : "Europe/Madrid";
                runEngine(tz);
            }
        }
    } catch (e) { console.error("Error en script:", e); }
}

init();
