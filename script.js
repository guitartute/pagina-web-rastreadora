/**
 * DOCUMENTACIÓN DE CONFIGURACIÓN
 * URL_SB: Debe ser tu "Project URL".
 * KEY_SB: Debe ser tu "Anon Public Key".
 */
const URL_SB = 'https://lmblbrzocgyfqbiyrjte.supabase.co'; // Reemplaza esto con tu URL real
const KEY_SB = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtYmxicnpvY2d5ZnFiaXlyanRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MTEzMDgsImV4cCI6MjA5MTA4NzMwOH0.W-3PLKgei4n2MspD1Dv-3eXB0TUcMZtpBt1isSU2ZDs'; // Reemplaza esto con tu Key real
const clienteSupabase = supabase.createClient(URL_SB, KEY_SB);

/**
 * Función: generarFechaFormatoTexto
 * Transforma la fecha actual al formato exacto de tu DB: "03/05 (Dom)"
 */
function generarFechaFormatoTexto() {
    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const nombresDias = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    const diaSemana = nombresDias[ahora.getDay()];
    
    return `${dia}/${mes} (${diaSemana})`;
}

async function sincronizarRastreador() {
    const textoFechaHoy = generarFechaFormatoTexto();
    console.log("Buscando en la columna 'fecha' el valor:", textoFechaHoy);

    try {
        const { data, error } = await clienteSupabase
            .from('itinerario')
            .select('ciudad, pais, notas')
            .eq('fecha', textoFechaHoy)
            .maybeSingle();

        if (error) throw error;

        const ubiElemento = document.getElementById('ubicacion');
        const notaElemento = document.getElementById('notas');
        const tituloElemento = document.getElementById('header-title');

        if (data) {
            tituloElemento.innerText = "¿Dónde estoy hoy?";
            ubiElemento.innerText = `${data.ciudad}, ${data.pais}`;
            notaElemento.innerText = data.notas || "";
            iniciarReloj('Europe/Madrid');
        } else {
            // Caso hoy: 03/05 (Dom) no existe en tu tabla
            tituloElemento.innerText = "Estado: Pre-Viaje";
            ubiElemento.innerText = "El itinerario comienza mañana.";
            notaElemento.innerText = `Buscando "${textoFechaHoy}". Mañana 04/05 (Lun) se activará automáticamente.`;
            iniciarReloj('America/Argentina/Buenos_Aires');
        }
    } catch (err) {
        console.error("Detalle técnico del error:", err);
        // Si la URL es incorrecta, el código caerá aquí
        document.getElementById('ubicacion').innerText = "Error: URL de base de datos no válida.";
    }
}

/**
 * Función: iniciarReloj
 * Controla la hora local y los colores del CSS
 */
function iniciarReloj(zonaHoraria) {
    const reloj = document.getElementById('clock');
    const cuerpo = document.body;

    if (window.timerViaje) clearInterval(window.timerViaje);

    window.timerViaje = setInterval(() => {
        const ahora = new Date();
        try {
            const opciones = { timeZone: zonaHoraria, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
            const horaLocalStr = ahora.toLocaleTimeString('es-ES', opciones);
            
            // Lógica de ambiente (Día: 07:00 a 19:00)
            const horaActual = parseInt(horaLocalStr.split(':')[0]);
            cuerpo.className = (horaActual >= 7 && horaActual < 19) ? 'modo-dia' : 'modo-noche';

            reloj.innerText = horaLocalStr;
        } catch (e) {
            reloj.innerText = "Error TZ";
        }
    }, 1000);
}

// Iniciar proceso
sincronizarRastreador();
