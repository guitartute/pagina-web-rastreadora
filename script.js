/**
 * DOCUMENTACIÓN DE CONFIGURACIÓN
 * URL_SB: Debe ser tu "Project URL".
 * KEY_SB: Debe ser tu "Anon Public Key".
 */
const URL_SB = 'https://lmblbrzocgyfqbiyrjte.supabase.co'; // Reemplaza esto con tu URL real
const KEY_SB = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtYmxicnpvY2d5ZnFiaXlyanRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MTEzMDgsImV4cCI6MjA5MTA4NzMwOH0.W-3PLKgei4n2MspD1Dv-3eXB0TUcMZtpBt1isSU2ZDs'; // Reemplaza esto con tu Key real
const _supabase = supabase.createClient(URL_SB, KEY_SB);

/**
 * Función: generarFechaFormatoTexto
 * Crea el string "03/05 (Dom)" para comparar con la base de datos.
 */
function generarFechaFormatoTexto() {
    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const nombresDias = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    const diaSemana = nombresDias[ahora.getDay()];
    return `${dia}/${mes} (${diaSemana})`;
}

/**
 * Función: sincronizarRastreador
 * Se encarga de pedir los datos a Supabase y mostrarlos en el HTML.
 */
async function sincronizarRastreador() {
    const textoFechaHoy = generarFechaFormatoTexto();
    console.log("Buscando en la columna 'fecha' el valor:", textoFechaHoy);

    try {
        // Aquí usamos _supabase, que ya fue definido arriba
        const { data, error } = await _supabase
            .from('itinerario')
            .select('ciudad, pais, notas')
            .eq('fecha', textoFechaHoy)
            .maybeSingle();

        if (error) throw error;

        // Referencias a los elementos del HTML (DOM)
        const ubiEl = document.getElementById('ubicacion');
        const notaEl = document.getElementById('notas');
        const tituloEl = document.getElementById('header-title');

        if (data) {
            // CASO: VIAJE ACTIVO (Lo que verás ahora que modificaste los datos)
            if (tituloEl) tituloEl.innerText = "¿Dónde estoy hoy?";
            if (ubiEl) ubiEl.innerText = `${data.ciudad}, ${data.pais}`;
            if (notaEl) notaEl.innerText = data.notas || "Sin notas para hoy.";
            iniciarReloj('Europe/Madrid');
        } else {
            // CASO: NO HAY DATOS
            if (tituloEl) tituloEl.innerText = "Estado: En Espera";
            if (ubiEl) ubiEl.innerText = "No hay registros para hoy.";
            if (notaEl) notaEl.innerText = `Buscando "${textoFechaHoy}"...`;
            iniciarReloj('America/Argentina/Buenos_Aires');
        }
    } catch (err) {
        console.error("Detalle técnico del error:", err);
        const ubiEl = document.getElementById('ubicacion');
        if (ubiEl) ubiEl.innerText = "Fallo al conectar con la base de datos.";
    }
}

/**
 * Función: iniciarReloj
 * Maneja el tiempo y cambia el color del fondo (Día/Noche).
 */
function iniciarReloj(zonaHoraria) {
    const reloj = document.getElementById('clock');
    const cuerpo = document.body;

    if (window.timerGlobal) clearInterval(window.timerGlobal);

    window.timerGlobal = setInterval(() => {
        const ahora = new Date();
        try {
            const opciones = { timeZone: zonaHoraria, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
            const horaStr = ahora.toLocaleTimeString('es-ES', opciones);
            
            // Lógica de ambiente: 07:00 a 19:00 es día
            const h = parseInt(horaStr.split(':')[0]);
            cuerpo.className = (h >= 7 && h < 19) ? 'modo-dia' : 'modo-noche';

            if (reloj) reloj.innerText = horaStr;
        } catch (e) {
            if (reloj) reloj.innerText = "--:--:--";
        }
    }, 1000);
}

// Ejecución inicial de la lógica de programación
sincronizarRastreador();
