/**
 * DOCUMENTACIÓN DE CONFIGURACIÓN
 * URL_SB: Debe ser tu "Project URL".
 * KEY_SB: Debe ser tu "Anon Public Key".
 */
const URL_SB = 'https://lmblbrzocgyfqbiyrjte.supabase.co'; // Reemplaza esto con tu URL real
const KEY_SB = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtYmxicnpvY2d5ZnFiaXlyanRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MTEzMDgsImV4cCI6MjA5MTA4NzMwOH0.W-3PLKgei4n2MspD1Dv-3eXB0TUcMZtpBt1isSU2ZDs'; // Reemplaza esto con tu Key real
const _supabase = supabase.createClient(URL_SB, KEY_SB);

function generarFecha(offset = 0) {
    const f = new Date();
    f.setDate(f.getDate() + offset);
    const d = String(f.getDate()).padStart(2, '0');
    const m = String(f.getMonth() + 1).padStart(2, '0');
    const diasSemana = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    return `${d}/${m} (${diasSemana[f.getDay()]})`;
}

async function sincronizarApp() {
    const fAyer = generarFecha(-1);
    const fHoy = generarFecha(0);
    const fMañana = generarFecha(1);

    try {
        const { data, error } = await _supabase
            .from('itinerario')
            .select('fecha, ciudad, pais, notas')
            .in('fecha', [fAyer, fHoy, fMañana]);

        if (error) throw error;

        const hoy = data.find(r => r.fecha === fHoy);
        const ayer = data.find(r => r.fecha === fAyer);
        const mañana = data.find(r => r.fecha === fMañana);

        // Actualizar Ayer/Mañana
        document.getElementById('ayer-destino').innerText = ayer ? ayer.ciudad : "---";
        document.getElementById('mañana-destino').innerText = mañana ? mañana.ciudad : "---";

        if (hoy) {
            document.getElementById('ubicacion').innerText = `${hoy.ciudad}, ${hoy.pais}`;
            document.getElementById('notas').innerText = hoy.notas || "";
            // Zona horaria dinámica
            const tz = hoy.pais.includes("BRASIL") ? "America/Sao_Paulo" : "Europe/Madrid";
            iniciarReloj(tz);
        } else {
            document.getElementById('ubicacion').innerText = "Sin datos para hoy";
            iniciarReloj("America/Argentina/Buenos_Aires");
        }
    } catch (e) {
        console.error("Error de conexión:", e);
        iniciarReloj("America/Argentina/Buenos_Aires");
    }
}

/**
 * Función: iniciarReloj
 * Maneja el tiempo real y el cambio de ambiente visual.
 */
function iniciarReloj(zona) {
    const clockEl = document.getElementById('clock');
    if (!clockEl) return;

    if (window.cronometro) clearInterval(window.cronometro);

    window.cronometro = setInterval(() => {
        const d = new Date();
        try {
            const horaStr = d.toLocaleTimeString('es-ES', { 
                timeZone: zona, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
            });
            
            // Actualización de UI
            clockEl.innerText = horaStr;
            
            // Cambio de fondo (Día: 7hs a 19hs)
            const h = parseInt(horaStr.split(':')[0]);
            document.body.className = (h >= 7 && h < 19) ? 'modo-dia' : 'modo-noche';
        } catch (err) {
            clockEl.innerText = "Error TZ";
        }
    }, 1000);
}

// Ejecutar al cargar
sincronizarApp();
