/**
 * DOCUMENTACIÓN DE CONFIGURACIÓN
 * URL_SB: Debe ser tu "Project URL".
 * KEY_SB: Debe ser tu "Anon Public Key".
 */
const URL_SB = 'https://lmblbrzocgyfqbiyrjte.supabase.co'; // Reemplaza esto con tu URL real
const KEY_SB = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtYmxicnpvY2d5ZnFiaXlyanRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MTEzMDgsImV4cCI6MjA5MTA4NzMwOH0.W-3PLKgei4n2MspD1Dv-3eXB0TUcMZtpBt1isSU2ZDs'; // Reemplaza esto con tu Key real
const clienteSupabase = supabase.createClient(URL_SB, KEY_SB);

function obtenerFechaTexto() {
    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const diasEsp = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    const nombreDia = diasEsp[ahora.getDay()];
    return `${dia}/${mes} (${nombreDia})`;
}

async function sincronizarRastreador() {
    const fechaBusqueda = obtenerFechaTexto();
    console.log("Buscando en la columna 'fecha' el valor:", fechaBusqueda);

    try {
        const { data, error } = await _supabase
            .from('itinerario')
            .select('ciudad, pais, notas')
            .eq('fecha', fechaBusqueda)
            .maybeSingle();

        if (error) throw error;

        // Captura de elementos del DOM
        const ubiEl = document.getElementById('ubicacion');
        const notaEl = document.getElementById('notas');
        const tituloEl = document.getElementById('header-title');
        const relojEl = document.getElementById('clock');

        // Verificación de existencia de elementos antes de asignar texto
        if (data) {
            if (tituloEl) tituloEl.innerText = "¿Dónde estoy hoy?";
            if (ubiEl) ubiEl.innerText = `${data.ciudad}, ${data.pais}`;
            if (notaEl) notaEl.innerText = data.notas || "";
            iniciarReloj('Europe/Madrid');
        } else {
            // Caso hoy 03/05: No hay datos aún
            if (tituloEl) tituloEl.innerText = "Estado: Pre-Viaje";
            if (ubiEl) ubiEl.innerText = "El itinerario comienza mañana.";
            if (notaEl) notaEl.innerText = `Buscando "${fechaBusqueda}". Mañana 04/05 (Lun) se activará automáticamente.`;
            iniciarReloj('America/Argentina/Buenos_Aires');
        }
    } catch (err) {
        console.error("Detalle técnico del error:", err);
        const ubiEl = document.getElementById('ubicacion');
        if (ubiEl) ubiEl.innerText = "Error al obtener datos del itinerario.";
    }
}

function iniciarReloj(zona) {
    const clockEl = document.getElementById('clock');
    const bodyEl = document.body;

    if (window.miTimer) clearInterval(window.miTimer);

    window.miTimer = setInterval(() => {
        const d = new Date();
        const opciones = { timeZone: zona, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        try {
            const horaLocal = d.toLocaleTimeString('es-ES', opciones);
            const h = parseInt(horaLocal.split(':')[0]);
            
            // Cambio de clase CSS para el fondo
            bodyEl.className = (h >= 7 && h < 19) ? 'modo-dia' : 'modo-noche';
            if (clockEl) clockEl.innerText = horaLocal;
        } catch (e) {
            if (clockEl) clockEl.innerText = "--:--:--";
        }
    }, 1000);
}

sincronizarRastreador();
