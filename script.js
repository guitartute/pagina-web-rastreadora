// Configuración de API
const URL_SB = 'https://TU_PROYECTO.supabase.co';
const KEY_SB = 'TU_ANON_KEY';
const clienteSupabase = supabase.createClient(URL_SB, KEY_SB);

/**
 * Función: generarFechaFormatoTexto
 * Propósito: Crear un string exacto como "03/05 (Dom)"
 */
function generarFechaFormatoTexto() {
    const ahora = new Date();
    
    // 1. Obtener día y mes con dos dígitos
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    
    // 2. Mapear el nombre del día (JavaScript: 0=Domingo, 1=Lunes...)
    const nombresDias = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    const diaSemana = nombresDias[ahora.getDay()];
    
    // 3. Retornar el formato final: "DD/MM (Día)"
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
            // Caso: Hay coincidencia en la base de datos
            tituloElemento.innerText = "¿Dónde estoy hoy?";
            ubiElemento.innerText = `${data.ciudad}, ${data.pais}`;
            notaElemento.innerText = data.notas || "";
            iniciarReloj('Europe/Madrid');
        } else {
            // Caso: Hoy es 03/05 (Dom) y no hay fila creada
            tituloElemento.innerText = "Estado: Pre-Viaje";
            ubiElemento.innerText = "El itinerario comienza mañana.";
            notaElemento.innerText = `Buscando: "${textoFechaHoy}". Mañana 04/05 (Lun) se activará automáticamente.`;
            iniciarReloj('America/Argentina/Buenos_Aires');
        }
    } catch (err) {
        console.error("Detalle técnico del error:", err);
        document.getElementById('ubicacion').innerText = "Error de conexión con Supabase.";
    }
}

/**
 * Función: iniciarReloj
 * Propósito: Gestionar el reloj digital y el cambio de color del cielo
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

// Ejecución inicial
sincronizarRastreador();
