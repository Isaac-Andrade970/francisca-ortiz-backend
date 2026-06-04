// Carga inicial de productos a Firestore. Correr UNA sola vez: node seed-productos.js
const productosService = require('./src/services/productos');

// 👇 PEGA AQUÍ tu array PRODUCTOS completo, copiado de tu frontend productos.js
const PRODUCTOS = [
    // ===== CLOE PROFESSIONAL - PURE SENSATION CLEAR =====
    {
        id: 'cloe-shampoo-clear',
        nombre: 'Shampoo Pure Sensation Clear 400ml',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$16.300',
        descripcion: 'Shampoo para cuero cabelludo graso y puntas secas. Hidratación y cuidado equilibrado, limpieza profunda y prolongada.',
        imagen: 'images/productos/cloe-shampoo-clear.jpg',
        destacado: true
    },
    {
        id: 'cloe-acond-clear',
        nombre: 'Acondicionador Pure Sensation Clear 400ml',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$17.000',
        descripcion: 'Potenciado con aminoácidos de origen vegetal, aumenta la fuerza y elasticidad del cabello, disminuyendo el frizz considerablemente.',
        imagen: 'images/productos/cloe-acond-clear.jpg',
        destacado: false
    },
    {
        id: 'cloe-mascara-clear',
        nombre: 'Máscara Pure Sensation Clear 270gr',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$17.900',
        descripcion: 'Para cueros cabelludos mixtos, cabellos secos y deshidratados. Hidratación profunda de medios a puntas, aporta suavidad, brillo y elasticidad.',
        imagen: 'images/productos/cloe-mascara-clear.jpg',
        destacado: false
    },

    // ===== CLOE PROFESSIONAL - PURE SENSATION REPAIR =====
    {
        id: 'cloe-shampoo-repair',
        nombre: 'Shampoo Pure Sensation Repair 400ml',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$16.300',
        descripcion: 'Para cabellos dañados y quebradizos. Brillo resplandeciente y suave, prevención de futuros daños, reduce la estática y el frizz.',
        imagen: 'images/productos/cloe-shampoo-repair.jpg',
        destacado: false
    },
    {
        id: 'cloe-acond-repair',
        nombre: 'Acondicionador Pure Sensation Repair 400ml',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$17.000',
        descripcion: 'Potenciado con aminoácidos Restore y Oilfix, sin parabenos. Con activos emolientes naturales. Mejora la peinabilidad y elasticidad.',
        imagen: 'images/productos/cloe-acond-repair.jpg',
        destacado: false
    },
    {
        id: 'cloe-mascara-repair',
        nombre: 'Máscara Pure Sensation Repair 270gr',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$17.900',
        descripcion: 'Máxima reconstrucción, mejora la resistencia de la hebra capilar. Cabello suave, sin frizz, previene daños futuros.',
        imagen: 'images/productos/cloe-mascara-repair.jpg',
        destacado: false
    },

    // ===== CLOE PROFESSIONAL - PURE SENSATION COLOR =====
    {
        id: 'cloe-shampoo-color',
        nombre: 'Shampoo Pure Sensation Color 400ml',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$16.300',
        descripcion: 'Para cabellos con coloración permanente, demi permanente o máscaras con pigmentos. Para cabellos con daños por coloración.',
        imagen: 'images/productos/cloe-shampoo-color.jpg',
        destacado: true
    },
    {
        id: 'cloe-acond-color',
        nombre: 'Acondicionador Pure Sensation Color 400ml',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$17.000',
        descripcion: 'Con activos Bio-AOXcare, Aceite de Palta y Coco. Sin parabenos. Fórmula compatible para cabellos con daño por decoloración.',
        imagen: 'images/productos/cloe-acond-color.jpg',
        destacado: false
    },
    {
        id: 'cloe-mascara-color',
        nombre: 'Máscara Pure Sensation Color 270gr',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$17.900',
        descripcion: 'Ayuda a mantener un color más intenso y duradero, previene la oxidación del color, protección solar natural. Cabello más brillante.',
        imagen: 'images/productos/cloe-mascara-color.jpg',
        destacado: false
    },

    // ===== CLOE PROFESSIONAL - OOH MY COLOR VIOLET =====
    {
        id: 'cloe-shampoo-violet',
        nombre: 'Shampoo Ooh My Color Violet 400ml',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$16.300',
        descripcion: 'Para cabellos decolorados, rubios platinados y canas naturales. Con activo Mango, HRA Complex, Aminoácidos. Libre de sulfatos y parabenos.',
        imagen: 'images/productos/cloe-shampoo-violet.jpg',
        destacado: false
    },
    {
        id: 'cloe-mascara-violet',
        nombre: 'Máscara Ooh My Color Violet 270gr',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$17.900',
        descripcion: 'Acondicionantes de alta tecnología, pigmentos violetas microparticulados para mejor fijación del color. Ideal para mantener tu rubio perfecto en casa.',
        imagen: 'images/productos/cloe-mascara-violet.jpg',
        destacado: false
    },
    {
        id: 'cloe-fascination-violet',
        nombre: 'Fascination Oil Violet 50ml',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$14.500',
        descripcion: 'Aceite de puntas con acción antifrizz, sella las puntas, no graso. Suavidad y mejor manejabilidad. Cabellos rubios protegidos y reparados.',
        imagen: 'images/productos/cloe-fascination-violet.jpg',
        destacado: true
    },

    // ===== CLOE PROFESSIONAL - FOREVER LONG =====
    {
        id: 'cloe-shampoo-long',
        nombre: 'Shampoo Forever Long 400ml',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$19.500',
        descripcion: 'Efecto anticaída y antiquiebre, promueve la salud del cuero cabelludo y la hebra capilar, permitiendo que el cabello prolongue su longitud.',
        imagen: 'images/productos/cloe-shampoo-long.jpg',
        destacado: false
    },
    {
        id: 'cloe-acond-long',
        nombre: 'Acondicionador Forever Long 400ml',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$19.500',
        descripcion: 'Fortalece y evita el quiebre de la hebra capilar, con activos naturales, sin parabenos. Desarrollado con Amino-Biotin. Aumenta grosor y densidad.',
        imagen: 'images/productos/cloe-acond-long.jpg',
        destacado: false
    },
    {
        id: 'cloe-tonico-long',
        nombre: 'Tónico Forever Long 100ml',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$22.900',
        descripcion: 'Fórmula Prunizen que bloquea el efecto del cortisol y protege los folículos. Incluye Bio Capigen Veg para reducir la pérdida del cabello.',
        imagen: 'images/productos/cloe-tonico-long.jpg',
        destacado: false
    },

    // ===== CLOE PROFESSIONAL - STRANGE LOVE (RIZOS) =====
    {
        id: 'cloe-shampoo-curls',
        nombre: 'Shampoo Strange Love 400ml',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$16.300',
        descripcion: 'Hidratante y nutritivo para el cuidado del cabello rizado, brinda una limpieza gentil y efectiva en el cuero cabelludo.',
        imagen: 'images/productos/cloe-shampoo-curls.jpg',
        destacado: false
    },
    {
        id: 'cloe-acond-curls',
        nombre: 'Acondicionador Strange Love 400ml',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$17.000',
        descripcion: 'Con Xylicurl, restaura las reservas naturales de hidratación y repara la fibra capilar dañada. Potencia brillo, suavidad y definición del rizo.',
        imagen: 'images/productos/cloe-acond-curls.jpg',
        destacado: false
    },
    {
        id: 'cloe-mascara-curls',
        nombre: 'Máscara Strange Love My Curls 270gr',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$17.900',
        descripcion: 'Tratamiento intensivo hidratante y nutritivo para cabellos rizados. Nutre desde el córtex hasta las cutículas. Potencia brillo y definición del rizo.',
        imagen: 'images/productos/cloe-mascara-curls.jpg',
        destacado: false
    },
    {
        id: 'cloe-curlcream',
        nombre: 'Curl Cream Strange Love 250ml',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$17.000',
        descripcion: 'Tratamiento sin enjuague y definidor de rizos. Efecto reparador e hidratante, brillo instantáneo, flexibilidad y suavidad. Cabellos crespos y secos.',
        imagen: 'images/productos/cloe-curlcream.jpg',
        destacado: false
    },
    {
        id: 'cloe-curlcream-light',
        nombre: 'Curl Cream Strange Love Light 250ml',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$17.000',
        descripcion: 'Versión de textura ligera en crema, ultra deslizamiento en húmedo y protección térmica. Para cabellos crespos y rizados, normales o finos.',
        imagen: 'images/productos/cloe-curlcream-light.jpg',
        destacado: false
    },
    {
        id: 'cloe-softjelly',
        nombre: 'Soft Jelly Strange Love 250ml',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$14.500',
        descripcion: 'Jalea suave de alta definición para rizos, acabado suave y ligero. Definición prolongada sin residuos. Apto para método curly.',
        imagen: 'images/productos/cloe-softjelly.jpg',
        destacado: false
    },
    {
        id: 'cloe-refreshing-spray',
        nombre: 'Refreshing Spray Strange Love',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$12.900',
        descripcion: 'Spray refrescante para reactivar rizos en cualquier momento y entre lavados. Mayor definición y control del frizz. Apto para todo tipo de rizos.',
        imagen: 'images/productos/cloe-refreshing-spray.jpg',
        destacado: false
    },

    // ===== CLOE PROFESSIONAL - OOH MY COLOR (MÁSCARAS DE COLOR) =====
    {
        id: 'cloe-color-pinklove',
        nombre: 'Ooh My Color Pink Love (Rosa Pastel) 270gr',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$17.900',
        descripcion: 'Máscara intensificadora progresiva de color rosa pastel. Pigmenta, nutre e hidrata en profundidad. Con HRA Complex.',
        imagen: 'images/productos/cloe-color-pinklove.jpg',
        destacado: false
    },
    {
        id: 'cloe-color-lavender',
        nombre: 'Ooh My Color Lavender Dreams (Lila Pastel) 270gr',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$17.900',
        descripcion: 'Máscara intensificadora progresiva de color lila pastel. Pigmenta, nutre e hidrata en profundidad. Con HRA Complex.',
        imagen: 'images/productos/cloe-color-lavender.jpg',
        destacado: false
    },
    {
        id: 'cloe-color-redcrush',
        nombre: 'Ooh My Color Red Crush (Rojo) 270gr',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$17.900',
        descripcion: 'Máscara intensificadora progresiva de color rojo. Pigmenta, nutre e hidrata en profundidad. Con HRA Complex.',
        imagen: 'images/productos/cloe-color-redcrush.jpg',
        destacado: false
    },
    {
        id: 'cloe-color-honey',
        nombre: 'Ooh My Color Lovely Honey (Miel) 270gr',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$17.900',
        descripcion: 'Máscara intensificadora progresiva color miel. Pigmenta, nutre e hidrata en profundidad. Con HRA Complex.',
        imagen: 'images/productos/cloe-color-honey.jpg',
        destacado: false
    },
    {
        id: 'cloe-color-yellow',
        nombre: 'Ooh My Color Bright Yellow (Amarillo) 270gr',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$17.900',
        descripcion: 'Máscara intensificadora progresiva color amarillo. Pigmenta, nutre e hidrata en profundidad. Con HRA Complex.',
        imagen: 'images/productos/cloe-color-yellow.jpg',
        destacado: false
    },
    {
        id: 'cloe-color-orange',
        nombre: 'Ooh My Color Orange Sunrise (Naranja) 270gr',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$17.900',
        descripcion: 'Máscara intensificadora progresiva color naranja. Pigmenta, nutre e hidrata en profundidad. Con HRA Complex.',
        imagen: 'images/productos/cloe-color-orange.jpg',
        destacado: false
    },
    {
        id: 'cloe-color-magenta',
        nombre: 'Ooh My Color Crazy Magenta (Fucsia) 270gr',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$17.900',
        descripcion: 'Máscara intensificadora progresiva color fucsia. Pigmenta, nutre e hidrata en profundidad. Con HRA Complex.',
        imagen: 'images/productos/cloe-color-magenta.jpg',
        destacado: false
    },
    {
        id: 'cloe-color-copper',
        nombre: 'Ooh My Color Copper Sunset (Cobrizo) 270gr',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$17.900',
        descripcion: 'Máscara intensificadora progresiva color cobrizo. Pigmenta, nutre e hidrata en profundidad. Con HRA Complex.',
        imagen: 'images/productos/cloe-color-copper.jpg',
        destacado: false
    },
    {
        id: 'cloe-color-purple',
        nombre: 'Ooh My Color Sweet Purple (Morado) 270gr',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$17.900',
        descripcion: 'Máscara intensificadora progresiva color morado. Pigmenta, nutre e hidrata en profundidad. Con HRA Complex.',
        imagen: 'images/productos/cloe-color-purple.jpg',
        destacado: false
    },
    {
        id: 'cloe-color-chocolate',
        nombre: 'Ooh My Color Chocolate 270gr',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$17.900',
        descripcion: 'Máscara intensificadora progresiva color chocolate. Pigmenta, nutre e hidrata en profundidad. Con HRA Complex.',
        imagen: 'images/productos/cloe-color-chocolate.jpg',
        destacado: false
    },
    {
        id: 'cloe-color-silver',
        nombre: 'Ooh My Color Silver Touch (Gris Plata) 270gr',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$17.900',
        descripcion: 'Máscara intensificadora progresiva color gris plata. Pigmenta, nutre e hidrata en profundidad. Con HRA Complex.',
        imagen: 'images/productos/cloe-color-silver.jpg',
        destacado: false
    },

    // ===== CLOE PROFESSIONAL - PROTECTORES Y FINALIZADORES =====
    {
        id: 'cloe-hotglow-exotic',
        nombre: 'Hot Glow Protector Térmico (aroma frutos rojos) 250ml',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$14.500',
        descripcion: 'Protector térmico capilar ultra liviano con efecto desenredante, Shield Active y Filtro UV. Protege del calor de herramientas y radiación solar.',
        imagen: 'images/productos/cloe-hotglow-exotic.jpg',
        destacado: false
    },
    {
        id: 'cloe-hotglow-sunny',
        nombre: 'Hot Glow Protector Térmico (aroma coco tostado) 250ml',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$14.500',
        descripcion: 'Protector térmico capilar ultra liviano con efecto desenredante, Shield Active y Filtro UV. Protege del calor de herramientas y radiación solar.',
        imagen: 'images/productos/cloe-hotglow-sunny.jpg',
        destacado: false
    },
    {
        id: 'cloe-hotglow-kiss',
        nombre: 'Hot Glow Protector Térmico (aroma piña y citricos) 250ml',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$14.500',
        descripcion: 'Protector térmico capilar ultra liviano con efecto desenredante, Shield Active y Filtro UV. Protege del calor de herramientas y radiación solar.',
        imagen: 'images/productos/cloe-hotglow-kiss.jpg',
        destacado: false
    },
    {
        id: 'cloe-shineon-gold',
        nombre: 'Shine On Spray de Brillo (aroma coco y naranja) 150ml',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$16.500',
        descripcion: 'Spray de brillo con acción antiquiebre para finalizar el peinado. Potenciador Amino-Coat protege del daño mecánico y disminuye el frizz.',
        imagen: 'images/productos/cloe-shineon-gold.jpg',
        destacado: false
    },
    {
        id: 'cloe-shineon-black',
        nombre: 'Shine On Spray de Brillo (aroma vainilla y flores) 150ml',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$16.500',
        descripcion: 'Spray de brillo con acción antiquiebre para finalizar el peinado. Potenciador Amino-Coat protege del daño mecánico y disminuye el frizz.',
        imagen: 'images/productos/cloe-shineon-black.jpg',
        destacado: false
    },
    {
        id: 'cloe-fascination-oil-tradi',
        nombre: 'Fascination Oil (aroma vainilla exotica) 50ml',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$14.500',
        descripcion: 'Sérum capilar altamente nutritivo, efecto no graso y sin alcohol. Contiene Argán, Macadamia y Palta. Aromas: Vainilla Exótica o Mandarina Playera.',
        imagen: 'images/productos/cloe-fascination-oil-tradi.jpg',
        destacado: false
    },
    {
        id: 'cloe-fascination-oil-pearl',
        nombre: 'Fascination Oil (aroma mandarina playera) 50ml',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$14.500',
        descripcion: 'Sérum capilar altamente nutritivo, efecto no graso y sin alcohol. Contiene Argán, Macadamia y Palta. Aromas: Vainilla Exótica o Mandarina Playera.',
        imagen: 'images/productos/cloe-fascination-oil-pearl.jpg',
        destacado: false
    },
    {
        id: 'cloe-butter-vainilla',
        nombre: 'Butter by Cloe Crema Manos y Cuerpo 170gr',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$11.900',
        descripcion: 'Crema de textura intensa, gran nutrición e hidratación. Tecnología Lipocire natural y Eco-Certificada. Con ácido hialurónico. Aromas variados.',
        imagen: 'images/productos/cloe-butter-vainilla.jpg',
        destacado: false
    },
    {
        id: 'cloe-butter-caramel',
        nombre: 'Butter by Cloe Crema Manos y Cuerpo 170gr',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$11.900',
        descripcion: 'Crema de textura intensa, gran nutrición e hidratación. Tecnología Lipocire natural y Eco-Certificada. Con ácido hialurónico. Aromas variados.',
        imagen: 'images/productos/cloe-butter-caramel.jpg',
        destacado: false
    },
    {
        id: 'cloe-butter-sweet',
        nombre: 'Butter by Cloe Crema Manos y Cuerpo 170gr',
        marca: 'Cloe Professional',
        categoria: 'cloe',
        precio: '$11.900',
        descripcion: 'Crema de textura intensa, gran nutrición e hidratación. Tecnología Lipocire natural y Eco-Certificada. Con ácido hialurónico. Aromas variados.',
        imagen: 'images/productos/cloe-butter-sweet.jpg',
        destacado: false
    },
    // ===== ROUVÉ PROFESSIONAL =====
    {
        id: 'rouve-magic-repair',
        nombre: 'Magic Repair Máscara 270gr',
        marca: 'Rouvé Professional',
        categoria: 'rouve',
        precio: '$18.900',
        descripcion: 'Máscara ultrahidratante sin parabenos con Aquaxil Eco-certificado. Para cabello seco. Retiene la humedad en el núcleo de la fibra capilar.',
        imagen: 'images/productos/rouve-magic-repair.jpg',
        destacado: true
    },
    {
        id: 'rouve-bond-recovery',
        nombre: 'Bond Recovery Máscara 270gr',
        marca: 'Rouvé Professional',
        categoria: 'rouve',
        precio: '$18.900',
        descripcion: 'Máscara de enlace reestructurante para cabellos muy sensibilizados o excesivamente dañados. Con Transcutol, Tego100 y CE-7080.',
        imagen: 'images/productos/rouve-bond-recovery.jpg',
        destacado: false
    },

    // ===== MEN'S WORK =====
    {
        id: 'mens-shampoo-mint',
        nombre: 'Full Mint Cleanser Shampoo 250ml',
        marca: "Men's Work",
        categoria: 'mens',
        precio: '$11.500',
        descripcion: 'Limpieza efectiva del cuero cabelludo con efecto refrescante y estimulante del folículo. Con Aloe Vera, Mentol y extractos vigorizantes.',
        imagen: 'images/productos/mens-shampoo-mint.jpg',
        destacado: true
    },
    {
        id: 'mens-acond-mint',
        nombre: 'Full Mint Daily Conditioner 250ml',
        marca: "Men's Work",
        categoria: 'mens',
        precio: '$11.500',
        descripcion: 'Acondicionador refrescante que fortalece la hebra capilar y evita su caída. Con Aloe Vera, Mentol y extractos naturales vigorizantes.',
        imagen: 'images/productos/mens-acond-mint.jpg',
        destacado: false
    },
    {
        id: 'mens-strong-paste',
        nombre: 'Strong Paste Cera para Peinar',
        marca: "Men's Work",
        categoria: 'mens',
        precio: '$12.000',
        descripcion: 'Cera de fijación fuerte y acabado mate, soluble en agua. No genera polvillo ni residuo. Sin parabenos, vegana y no testeada en animales.',
        imagen: 'images/productos/mens-strong-paste.jpg',
        destacado: false
    },
    {
        id: 'mens-beard-oil',
        nombre: 'Beard Oil 55ml',
        marca: "Men's Work",
        categoria: 'mens',
        precio: '$11.500',
        descripcion: 'Aceite de barba suave, ligero y no graso. Con aceite de Argán, Almendras y Oliva. Hidrata y nutre piel y barba. Apto para todo tipo de barbas.',
        imagen: 'images/productos/mens-beard-oil.jpg',
        destacado: true
    },
    {
        id: 'mens-beard-balm',
        nombre: 'Beard Balm 55ml',
        marca: "Men's Work",
        categoria: 'mens',
        precio: '$11.500',
        descripcion: 'Crema acondicionante para una barba dócil y saludable. Con Zinc Complex bactericida y fungicida. Calmante e hidratante, controla el sebo.',
        imagen: 'images/productos/mens-beard-balm.jpg',
        destacado: false
    },
    {
        id: 'mens-after-shave',
        nombre: 'After Shave 150ml',
        marca: "Men's Work",
        categoria: 'mens',
        precio: '$12.000',
        descripcion: 'Tratamiento post afeitado con Zinc Complex antibacterial y astringente. Textura ligera de rápida absorción. Con Aceite de Cannabis y Vitaminas A, C y E.',
        imagen: 'images/productos/mens-after-shave.jpg',
        destacado: false
    }
];
// Convierte "$16.300" -> 16300
function precioANumero(precioTexto) {
    return Number(String(precioTexto).replace(/[^0-9]/g, ''));
}

async function cargar() {
    let orden = 1;
    for (const p of PRODUCTOS) {
        const creado = await productosService.crearProducto({
            nombre: p.nombre,
            marca: p.marca,
            categoria: p.categoria,
            precio: precioANumero(p.precio),
            descripcion: p.descripcion,
            imagen: p.imagen,            // mantiene la ruta local actual; las fotos nuevas irán a Cloudinary
            destacado: p.destacado,
            orden: orden++
        });
        console.log('✓ Creado:', creado.nombre);
    }
    console.log(`Listo. ${PRODUCTOS.length} productos cargados.`);
    process.exit(0);
}

cargar().catch(err => { console.error(err); process.exit(1); });