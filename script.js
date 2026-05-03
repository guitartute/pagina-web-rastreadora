/**
 * DOCUMENTACIÓN DE CONFIGURACIÓN
 * URL_SB: Debe ser tu "Project URL".
 * KEY_SB: Debe ser tu "Anon Public Key".
 */
const URL_SB = 'https://lmblbrzocgyfqbiyrjte.supabase.co'; // Reemplaza esto con tu URL real
const KEY_SB = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtYmxicnpvY2d5ZnFiaXlyanRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MTEzMDgsImV4cCI6MjA5MTA4NzMwOH0.W-3PLKgei4n2MspD1Dv-3eXB0TUcMZtpBt1isSU2ZDs'; // Reemplaza esto con tu Key real
const _supabase = supabase.createClient(URL_SB, KEY_SB);

/**
 * Mapeo de Zonas Horarias por País
 * Documentación: Usamos identificadores IANA para asegurar precisión.
 */
const zonasPorPais = {
    "BRASIL": "America/Sao_Paulo",
    "FLORIANOPOLIS": "America/Sao_Paulo",
    "URUBICI": "America/Sao_Paulo",
    "MADRID": "Europe/Madrid",
    "ALICANTE": "Europe/Madrid",
    "TOLEDO y SEGOVIA": "Europe/Madrid",
    "FRANCIA": "Europe/Paris",
    "CHAMONIX": "Europe/Paris",
    "ITALIA": "Europe/Rome",
    "MILAN - NAPOLES": "Europe/Rome",
    "NAPOLES": "Europe/Rome",
    "NAPOLES - ROMA": "Europe/Rome",
    "ROMA": "Europe/Rome",
    "PAISES BAJOS": "Europe/Amsterdam",
    "ARGENTINA": "America/Argentina/Buenos_Aires"
};

function generarFechaFormatoTexto() {
    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const nombresDias = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    return `${dia}/${mes} (${nombresDias[ahora.getDay()]})`;
}

async function sincronizarRastreador() {
    const textoFechaHoy = generarFechaFormatoTexto();

    try {
        const { data, error } = await _supabase
            .from('itinerario')
            .select('ciudad, pais, notas')
            .eq('fecha', textoFechaHoy)
            .maybeSingle();

        if (error) throw error;

        const ubiEl = document.getElementById('ubicacion');
        const notaEl = document.getElementById('notas');
        const tituloEl = document.getElementById('header-title');

        if (data) {
            // LÓGICA DE PROGRAMACIÓN: Determinar zona horaria dinámicamente
            const paisLimpio = data.pais.toUpperCase().trim();
            const zonaElegida = zonasPorPais[paisLimpio] || "Europe/Madrid";

            if (tituloEl) tituloEl.innerText = "¿Dónde estoy hoy?";
            if (ubiEl) ubiEl.innerText = `${data.ciudad}, ${data.pais}`;
            if (notaEl) notaEl.innerText = data.notas || "Sin notas para hoy.";
            
            // Iniciamos el reloj con la zona detectada
            iniciarReloj(zonaElegida);
        } else {
            if (tituloEl) tituloEl.innerText = "Estado: Pre-Viaje";
            iniciarReloj('America/Argentina/Buenos_Aires');
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

function iniciarReloj(zonaHoraria) {
    const reloj = document.getElementById('clock');
    const cuerpo = document.body;

    if (window.timerGlobal) clearInterval(window.timerGlobal);

    window.timerGlobal = setInterval(() => {
        const ahora = new Date();
        try {
            // El método toLocaleTimeString aplica el desfase automáticamente
            const opciones = { timeZone: zonaHoraria, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
            const horaStr = ahora.toLocaleTimeString('es-ES', opciones);
            
            const h = parseInt(horaStr.split(':')[0]);
            cuerpo.className = (h >= 7 && h < 19) ? 'modo-dia' : 'modo-noche';

            if (reloj) reloj.innerText = horaStr;
        } catch (e) {
            if (reloj) reloj.innerText = "--:--:--";
        }
    }, 1000);
}

sincronizarRastreador();
