// 1. Configuración de conexión (Verifica que no haya espacios en las credenciales)
const URL_SB = 'https://lmblbrzocgyfqbiyrjte.supabase.co'; 
const KEY_SB = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtYmxicnpvY2d5ZnFiaXlyanRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MTEzMDgsImV4cCI6MjA5MTA4NzMwOH0.W-3PLKgei4n2MspD1Dv-3eXB0TUcMZtpBt1isSU2ZDs'; // Asegúrate de colocar tu anon key real
const _supabase = supabase.createClient(URL_SB, KEY_SB);

/**
 * Paso 2: Función para generar el texto exacto que pide tu base de datos.
 * Resultado esperado hoy: "03/05 (Dom)"
 */
function obtenerFechaTexto() {
    const ahora = new Date();
    
    // Obtener día y mes con dos dígitos
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    
    // Mapeo manual para asegurar que coincida con tu columna TEXT
    const diasEspañol = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    const nombreDia = diasEspañol[ahora.getDay()];
    
    return `${dia}/${mes} (${nombreDia})`;
}

async function cargarItinerario() {
    const fechaParaConsultar = obtenerFechaTexto();
    
    // Log de depuración: Verás en consola qué texto exacto estamos enviando
    console.log("Enviando consulta para fecha:", fechaParaConsultar);

    try {
        const { data, error } = await _supabase
            .from('itinerario')
            .select('ciudad, pais, notas')
            .eq('fecha', fechaParaConsultar)
            .maybeSingle();

        if (error) throw error;

        const ubiElemento = document.getElementById('ubicacion');
        const notaElemento = document.getElementById('notas');

        if (data) {
            // Si encuentra el texto "03/05 (Dom)" en la columna fecha
            document.getElementById('header-title').innerText = "¿Dónde estoy hoy?";
            ubiElemento.innerText = `${data.ciudad}, ${data.pais}`;
            notaElemento.innerText = data.notas || "";
            iniciarReloj('Europe/Madrid');
        } else {
            // Si NO encuentra el texto (caso actual hasta mañana 04/05)
            document.getElementById('header-title').innerText = "Próximamente";
            ubiElemento.innerText = "El Eurotrip inicia mañana.";
            notaElemento.innerText = `No hay registros para "${fechaParaConsultar}". El viaje arranca el 04/05 (Lun).`;
            iniciarReloj('America/Argentina/Buenos_Aires');
        }

    } catch (err) {
        console.error("Error detallado:", err);
        document.getElementById('ubicacion').innerText = "Error de comunicación con el servidor.";
    }
}

/**
 * Paso 3: Gestión del reloj y el ambiente visual
 */
function iniciarReloj(zona) {
    const clockEl = document.getElementById('clock');
    const bodyEl = document.body;

    if (window.miIntervalo) clearInterval(window.miIntervalo);

    window.miIntervalo = setInterval(() => {
        const d = new Date();
        const opciones = { timeZone: zona, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        const horaLocal = d.toLocaleTimeString('es-ES', opciones);
        
        // Cambio de color según la hora
        const h = parseInt(horaLocal.split(':')[0]);
        bodyEl.className = (h >= 7 && h < 19) ? 'modo-dia' : 'modo-noche';

        clockEl.innerText = horaLocal;
    }, 1000);
}

// Arrancar la aplicación
cargarItinerario();
