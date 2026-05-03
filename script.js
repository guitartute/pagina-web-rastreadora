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

/**
 * Función: generarTextoFecha
 * @param {number} offset - Desplazamiento en días (-1 para ayer, 0 hoy, 1 mañana)
 */
function generarTextoFecha(offset = 0) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + offset); // Ajustamos el día
    
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const nombresDias = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    const diaSemana = nombresDias[fecha.getDay()];
    
    return `${dia}/${mes} (${diaSemana})`;
}

async function sincronizarRastreador() {
    // Calculamos las tres cadenas de búsqueda
    const fechaAyer = generarTextoFecha(-1);
    const fechaHoy = generarTextoFecha(0);
    const fechaMañana = generarTextoFecha(1);

    try {
        // Consultamos los tres registros simultáneamente para mayor eficiencia
        const { data, error } = await _supabase
            .from('itinerario')
            .select('fecha, ciudad, pais')
            .in('fecha', [fechaAyer, fechaHoy, fechaMañana]);

        if (error) throw error;

        // Referencias del DOM
        const ubiHoy = document.getElementById('ubicacion');
        const ubiAyer = document.getElementById('ayer-destino');
        const ubiMañana = document.getElementById('mañana-destino');

        // Mapeamos los resultados recibidos
        const registroAyer = data.find(r => r.fecha === fechaAyer);
        const registroHoy = data.find(r => r.fecha === fechaHoy);
        const registroMañana = data.find(r => r.fecha === fechaMañana);

        // Renderizado de Hoy
        if (registroHoy) {
            document.getElementById('header-title').innerText = "¿Dónde estoy hoy?";
            ubiHoy.innerText = `${registroHoy.ciudad}, ${registroHoy.pais}`;
            // (Aquí podrías añadir la lógica de zona horaria basada en registroHoy.pais)
        } else {
            ubiHoy.innerText = "Sin datos para hoy";
        }

        // Renderizado de Ayer y Mañana
        if (ubiAyer) {
            ubiAyer.innerText = registroAyer ? `${registroAyer.ciudad}` : "---";
        }
        if (ubiMañana) {
            ubiMañana.innerText = registroMañana ? `${registroMañana.ciudad}` : "---";
        }

    } catch (err) {
        console.error("Error de programación:", err);
    }
}

sincronizarRastreador();
