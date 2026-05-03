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

function generarFechaOffset(dias = 0) {
    const f = new Date();
    f.setDate(f.getDate() + dias);
    const d = String(f.getDate()).padStart(2, '0');
    const m = String(f.getMonth() + 1).padStart(2, '0');
    const nombres = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    return `${d}/${m} (${nombres[f.getDay()]})`;
}

async function sincronizarTodo() {
    const textoAyer = generarFechaOffset(-1);
    const textoHoy = generarFechaOffset(0);
    const textoMañana = generarFechaOffset(1);

    try {
        // Consultamos los 3 días en una sola petición
        const { data, error } = await _supabase
            .from('itinerario')
            .select('fecha, ciudad, pais, notas')
            .in('fecha', [textoAyer, textoHoy, textoMañana]);

        if (error) throw error;

        // Buscamos cada registro en el array devuelto
        const hoy = data.find(r => r.fecha === textoHoy);
        const ayer = data.find(r => r.fecha === textoAyer);
        const mañana = data.find(r => r.fecha === textoMañana);

        // Actualizamos UI de Ayer y Mañana
        document.getElementById('ayer-destino').innerText = ayer ? ayer.ciudad : "---";
        document.getElementById('mañana-destino').innerText = mañana ? mañana.ciudad : "---";

        if (hoy) {
            document.getElementById('ubicacion').innerText = `${hoy.ciudad}, ${hoy.pais}`;
            document.getElementById('notas').innerText = hoy.notas || "";
            // Determinar zona horaria según país (Ejemplo simplificado)
            const zona = hoy.pais.includes("BRASIL") ? "America/Sao_Paulo" : "Europe/Madrid";
            iniciarReloj(zona);
        } else {
            document.getElementById('ubicacion').innerText = "Sin datos para hoy";
            iniciarReloj("America/Argentina/Buenos_Aires");
        }
    } catch (e) {
        console.error("Fallo de programación:", e);
        iniciarReloj("America/Argentina/Buenos_Aires"); // Aseguramos que el reloj inicie igual
    }
}

function iniciarReloj(zona) {
    const clockEl = document.getElementById('clock');
    if (!clockEl) return; // Validación de seguridad

    if (window.intervaloReloj) clearInterval(window.intervaloReloj);

    window.intervaloReloj = setInterval(() => {
        const ahora = new Date();
        try {
            const horaStr = ahora.toLocaleTimeString('es-ES', { 
                timeZone: zona, 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit', 
                hour12: false 
            });
            
            // Lógica de ambiente
            const h = parseInt(horaStr.split(':')[0]);
            document.body.className = (h >= 7 && h < 19) ? 'modo-dia' : 'modo-noche';
            
            clockEl.innerText = horaStr;
        } catch (err) {
            clockEl.innerText = "Error TZ";
        }
    }, 1000);
}

sincronizarTodo();
