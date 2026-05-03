/**
 * DOCUMENTACIÓN DE CONFIGURACIÓN
 * URL_SB: Debe ser tu "Project URL".
 * KEY_SB: Debe ser tu "Anon Public Key".
 */
const URL_SB = 'https://lmblbrzocgyfqbiyrjte.supabase.co'; // Reemplaza esto con tu URL real
const KEY_SB = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtYmxicnpvY2d5ZnFiaXlyanRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MTEzMDgsImV4cCI6MjA5MTA4NzMwOH0.W-3PLKgei4n2MspD1Dv-3eXB0TUcMZtpBt1isSU2ZDs'; // Reemplaza esto con tu Key real
const _supabase = supabase.createClient(URL_SB, KEY_SB);

function getFecha(offset = 0) {
    const f = new Date();
    f.setDate(f.getDate() + offset);
    const d = String(f.getDate()).padStart(2, '0');
    const m = String(f.getMonth() + 1).padStart(2, '0');
    const nombres = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    return `${d}/${m} (${nombres[f.getDay()]})`;
}

/**
 * Función: iniciarReloj
 * Encapsula la lógica de tiempo para evitar el error de 00:00:00
 */
function iniciarReloj(tz = "America/Argentina/Buenos_Aires") {
    const clockEl = document.getElementById('clock');
    if (window.relotTimer) clearInterval(window.relotTimer);

    const tick = () => {
        const ahora = new Date();
        const str = ahora.toLocaleTimeString('es-ES', { 
            timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
        });
        if (clockEl) clockEl.innerText = str;

        // Cambiar ambiente según hora
        const h = parseInt(str.split(':')[0]);
        document.body.className = (h >= 7 && h < 19) ? 'modo-dia' : 'modo-noche';
    };

    tick(); // Ejecución inmediata para evitar delay
    window.relotTimer = setInterval(tick, 1000);
}

async function cargarDatos() {
    // Iniciamos reloj preventivo en hora local mientras carga la DB
    iniciarReloj();

    const fA = getFecha(-1), fH = getFecha(0), fM = getFecha(1);

    try {
        const { data } = await _supabase
            .from('itinerario')
            .select('fecha, ciudad, pais, notas')
            .in('fecha', [fA, fH, fM]);

        if (data) {
            const hoy = data.find(r => r.fecha === fH);
            const ayer = data.find(r => r.fecha === fA);
            const mañana = data.find(r => r.fecha === fM);

            document.getElementById('ayer-destino').innerText = ayer ? ayer.ciudad : "---";
            document.getElementById('mañana-destino').innerText = mañana ? mañana.ciudad : "---";

            if (hoy) {
                document.getElementById('ubicacion').innerText = `${hoy.ciudad}`;
                document.getElementById('notas').innerText = hoy.notas || "";
                const tz = hoy.pais.toUpperCase().includes("BRASIL") ? "America/Sao_Paulo" : "Europe/Madrid";
                iniciarReloj(tz);
            }
        }
    } catch (e) {
        console.error("Error en código de carga:", e);
    }
}

cargarDatos();
