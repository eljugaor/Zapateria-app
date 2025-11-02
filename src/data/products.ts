const products = [
    // --- Originales (solo cambia la descripción) ---
    { id: 1, name: "Runner Azul", price: 199999, image: "/img/shoe_1.png",
        description: "Ligera y reactiva: malla aireada, soporte suave en el talón y tracción confiable para sumar kilómetros con frescura.",
        stock: 12
    },
    { id: 2, name: "Classic Rojo", price: 149999, image: "/img/shoe_2.png",
        description: "Icono urbano: silueta clásica, acabados limpios y comodidad diaria que combina con todo tu guardarropa.",
        stock: 24
    },
    { id: 3, name: "Eco Verde", price: 179999, image: "/img/shoe_3.png",
        description: "Hecha con materiales reciclados: pisada estable, plantilla confortable y un look sustentable sin sacrificar estilo.",
        stock: 8
    },
    { id: 4, name: "Urban Naranja", price: 159999, image: "/img/shoe_4.png",
        description: "Actitud de ciudad: suela de alta tracción, capellada flexible y color vibrante para marcar presencia al andar.",
        stock: 16
    },
    { id: 5, name: "Sport Morado", price: 189999, image: "/img/shoe_5.png",
        description: "Entrenamiento intenso: ajuste firme, amortiguación equilibrada y respirabilidad para sesiones largas.",
        stock: 10
    },
    { id: 6, name: "Trail Gris", price: 209999, image: "/img/shoe_6.png",
        description: "Listas para la montaña: agarre agresivo, refuerzos laterales y empeine resistente a la intemperie.",
        stock: 7
    },
    // --- Nuevos (9 adicionales) ---
    {
        id: 7,
        name: "Nimbus Negro",
        price: 219999,
        image: "/img/shoe_7.png",
        description: "Amortiguación sedosa con retorno de energía y upper de punto que envuelve el pie: versátil para ritmos medios.",
        stock: 14
    },
    {
        id: 8,
        name: "Street Latte",
        price: 169999,
        image: "/img/shoe_8.png",
        description: "Tono café urbano con acabados premium; plantilla memory-foam y flexibilidad para jornadas completas.",
        stock: 20
    },
    {
        id: 9,
        name: "Aqua Sky",
        price: 199999,
        image: "/img/shoe_9.png",
        description: "Liviana y ventilada, con protección ante salpicaduras: ideal para climas variables y velocidad en ciudad.",
        stock: 11
    },
    {
        id: 10,
        name: "Pulse Carbón",
        price: 189999,
        image: "/img/shoe_10.png",
        description: "Perfil bajo y respuesta rápida: suela con patrón geométrico para tracción eficiente en asfalto.",
        stock: 18
    },
    {
        id: 11,
        name: "Terra Olive",
        price: 174999,
        image: "/img/shoe_11.png",
        description: "Estética outdoor con confort urbano: upper robusto y mediasuela estable para paseos y travesías ligeras.",
        stock: 13
    },
    {
        id: 12,
        name: "Wave Coral",
        price: 164999,
        image: "/img/shoe_12.png",
        description: "Capellada elástica y transpirable con toque coral; pisada suave que invita a moverte sin esfuerzo.",
        stock: 22
    },
    {
        id: 13,
        name: "Volt Lima",
        price: 199999,
        image: "/img/shoe_13.png",
        description: "Energía fluorescente: agarre seguro y estructura estable para cambios de dirección veloces.",
        stock: 9
    },
    {
        id: 14,
        name: "Minimal Blanco",
        price: 139999,
        image: "/img/shoe_14.png",
        description: "Diseño minimalista, líneas limpias y ligereza total: combina con todo sin perder comodidad.",
        stock: 30
    },
    {
        id: 15,
        name: "Forge Cobre",
        price: 229999,
        image: "/img/shoe_15.png",
        description: "Construcción premium con detalles metálicos; soporte firme y amortiguación densa para pisadas seguras.",
        stock: 6
    }
];

export { products };