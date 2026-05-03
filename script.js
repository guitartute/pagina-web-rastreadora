/**
 * DOCUMENTACIÓN:
 * 1. SUPABASE_URL: La URL de tu proyecto en el panel de Supabase.
 * 2. SUPABASE_KEY: La clave 'anon public' de la sección API.
 */
const SUPABASE_URL = 'https://lmblbrzocgyfqbiyrjte.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtYmxicnpvY2d5ZnFiaXlyanRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MTEzMDgsImV4cCI6MjA5MTA4NzMwOH0.W-3PLKgei4n2MspD1Dv-3eXB0TUcMZtpBt1isSU2ZDs';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function obtenerDatosDelDia() {
    // Genera fecha actual YYYY-MM-DD (Hoy es 2026-05-03)
    const hoy = new Date().toISOString().split('T')[0];

    try {
        // Consultamos la tabla 'itinerario'
        const { data, error } = await clienteSupabase
            .from('itinerario')
            .select('ciudad, pais, notas')
            .eq('fecha', hoy)
            .maybeSingle(); // Usamos maybeSingle para que no lance error si no hay datos

        if (error) throw error; // Si hay un error real de red o tabla, va al catch

        if (data) {
            // CASO 1: Hay viaje hoy
            document.getElementById('header-title').innerText = "¿Dónde estoy hoy?";
            document.getElementById('ubicacion').innerText = `${data.ciudad}, ${data.pais}`;
            document.getElementById('notas').innerText = data.notas || "";
            activarReloj('Europe/Madrid');
        } else {
            // CASO 2: No hay datos para hoy (Ej: Antes del inicio del viaje)
            document.getElementById('header-title').innerText = "Próximamente";
            document.getElementById('ubicacion').innerText = "El Eurotrip aún no ha comenzado.";
            document.getElementById('notas').innerText = "Preparando maletas... El viaje inicia el 04/05.";
            document.getElementById('clock').innerText = "--:--:--";
            
            // Opcional: Podrías usar la hora de Argentina mientras esperas
            activarReloj('America/Argentina/Buenos_Aires');
        }
    } catch (err) {
        // CASO 3: Error real de programación o conexión
        console.error("Error técnico:", err);
        document.getElementById('ubicacion').innerText = "Error de conexión con la base de datos.";
    }
}

function activarReloj(zona) {
    const elReloj = document.getElementById('clock');
    const elCuerpo = document.body;

    // Limpiar intervalos anteriores si existieran
    if (window.relojInterval) clearInterval(window.relojInterval);

    window.relojInterval = setInterval(() => {
        const tiempo = new Date();
        
        try {
            const horaTexto = tiempo.toLocaleTimeString('es-ES', { timeZone: zona, hour: '2-digit', hour12: false });
            const horaNum = parseInt(horaTexto);

            // Cambio de ambiente día/noche
            if (horaNum >= 7 && horaNum < 19) {
                elCuerpo.className = 'modo-dia';
            } else {
                elCuerpo.className = 'modo-noche';
            }

            elReloj.innerText = tiempo.toLocaleTimeString('es-ES', { 
                timeZone: zona, 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            });
        } catch (e) {
            elReloj.innerText = "Error de Zona";
        }
    }, 1000);
}

obtenerDatosDelDia();
