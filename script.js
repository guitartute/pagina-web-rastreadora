/**
 * DOCUMENTACIÓN:
 * 1. SUPABASE_URL: La URL de tu proyecto en el panel de Supabase.
 * 2. SUPABASE_KEY: La clave 'anon public' de la sección API.
 */
const SUPABASE_URL = 'https://lmblbrzocgyfqbiyrjte.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtYmxicnpvY2d5ZnFiaXlyanRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MTEzMDgsImV4cCI6MjA5MTA4NzMwOH0.W-3PLKgei4n2MspD1Dv-3eXB0TUcMZtpBt1isSU2ZDs';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function inicializarRastreador() {
    // Obtenemos la fecha actual del sistema en formato YYYY-MM-DD
    const hoy = new Date().toISOString().split('T')[0];

    try {
        // Consulta a la tabla 'itinerario' filtrando por la columna 'fecha'
        const { data, error } = await _supabase
            .from('itinerario')
            .select('ciudad, pais, notas')
            .eq('fecha', hoy)
            .single();

        if (error) throw error;

        if (data) {
            document.getElementById('ubicacion').innerText = `${data.ciudad}, ${data.pais}`;
            document.getElementById('notas').innerText = data.notas || "";
            // Iniciamos el ciclo de tiempo para Europa
            gestionarTiempo('Europe/Madrid');
        } else {
            document.getElementById('ubicacion').innerText = "Sin destino programado para hoy";
        }
    } catch (err) {
        console.error("Error de conexión:", err);
        document.getElementById('ubicacion').innerText = "Error al conectar con el itinerario";
    }
}

/**
 * Función para manejar el reloj y el cambio de fondo día/noche
 */
function gestionarTiempo(timezone) {
    const relojElemento = document.getElementById('clock');
    const cuerpo = document.body;

    setInterval(() => {
        const ahora = new Date();
        
        // Obtenemos solo la hora numérica del destino
        const horaLocalStr = ahora.toLocaleTimeString('es-ES', { 
            timeZone: timezone, 
            hour: '2-digit', 
            hour12: false 
        });
        const horaNumerica = parseInt(horaLocalStr);

        // Lógica de ambiente: 07:00 a 18:59 es DÍA
        if (horaNumerica >= 7 && horaNumerica < 19) {
            cuerpo.className = 'dia';
        } else {
            cuerpo.className = 'noche';
        }

        // Actualizamos el texto del reloj en pantalla
        relojElemento.innerText = ahora.toLocaleTimeString('es-ES', {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }, 1000);
}

// Arrancar la aplicación
inicializarRastreador();