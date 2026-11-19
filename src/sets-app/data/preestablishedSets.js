// Catálogo Oficial Royal Prestige 2026
// Sets oficiales conservados, Combos Especiales Personalizados y selección exacta de productos con fotografía oficial 2026.
// Cada combo se carga de forma detallada (producto por producto) en el armador para permitir modificaciones personalizadas.

export const PREESTABLISHED_SETS = [
  // --- COMBOS PERSONALIZADOS VITALITY (DESGLOSABLES PIEZA POR PIEZA) ---
  {
    id: "combo-deluxe",
    name: "Combo Deluxe",
    category: "Combos Especiales",
    price: 32960,
    code: "COMBO-DELUXE",
    image: "/assets/sets/A_Combo_Deluxe.jpg",
    description: "Set 15 pzas + Maxtractor y Fresca Pure 3500",
    items: [
      { productId: "co4672", name: "Set de 15 Piezas", code: "CO4672", qty: 1, price: 19950, category: "Utensilios de Cocina" },
      { productId: "ju0060", name: "Maxtractor", code: "JU0060", qty: 1, price: 8170, category: "Accesorios Eléctricos" },
      { productId: "wf0412", name: "Fresca Pure 3500", code: "WF0412", qty: 1, price: 4840, category: "Piezas Individuales" }
    ]
  },
  {
    id: "set-completo-11",
    name: "Set Completo 11 pzs",
    category: "Combos Especiales",
    price: 24310,
    code: "SET-COMP-11",
    image: "/assets/sets/A_Set_Completo_11_pzs.png",
    description: "Frescapure, olla presión 6L, easy 12', easy 8', olla 6L, olla 4L, Expertea",
    items: [
      { productId: "wf0412", name: "Fresca Pure 3500", code: "WF0412", qty: 1, price: 4840, category: "Piezas Individuales" },
      { productId: "co1253", name: "Olla de Presión 6 Litros", code: "CO1253", qty: 1, price: 4390, category: "Ollas a Presión" },
      { productId: "co9734", name: 'Easy Release 12" C/Tapa', code: "CO9734", qty: 1, price: 3280, category: "Sartenes & Planchas" },
      { productId: "co9732", name: 'Easy Release 8" C/Tapa', code: "CO9732", qty: 1, price: 2180, category: "Sartenes & Planchas" },
      { productId: "co4720-co4802", name: "Olla de 6 Cuartos con Tapa (5.7 L)", code: "CO4720-CO4802", qty: 1, price: 3530, category: "Piezas Individuales" },
      { productId: "co4715", name: "Olla de 4 Cuartos con Tapa (3.8 L)", code: "CO4715", qty: 1, price: 3010, category: "Piezas Individuales" },
      { productId: "co0801", name: "Expertea", code: "CO0801", qty: 1, price: 3080, category: "Piezas Individuales" }
    ]
  },
  {
    id: "set-8-pzs-combo",
    name: "Set de 8 pzs",
    category: "Combos Especiales",
    price: 11660,
    code: "SET-8-PZS-CUSTOM",
    image: "/assets/sets/B_Set_de_8_pzs.png",
    description: "Olla 3L, Olla 6L, easy 12', easy 8'",
    items: [
      { productId: "co4710-co4801", name: "Olla de 3 Cuartos con Tapa (2.8 L)", code: "CO4710-CO4801", qty: 1, price: 2670, category: "Piezas Individuales" },
      { productId: "co4720-co4802", name: "Olla de 6 Cuartos con Tapa (5.7 L)", code: "CO4720-CO4802", qty: 1, price: 3530, category: "Piezas Individuales" },
      { productId: "co9734", name: 'Easy Release 12" C/Tapa', code: "CO9734", qty: 1, price: 3280, category: "Sartenes & Planchas" },
      { productId: "co9732", name: 'Easy Release 8" C/Tapa', code: "CO9732", qty: 1, price: 2180, category: "Sartenes & Planchas" }
    ]
  },
  {
    id: "set-4-pzs-easy8",
    name: "Set 4 pzs + Easy 8\"",
    category: "Combos Especiales",
    price: 7710,
    code: "SET-4PZS-EASY8",
    image: "/assets/sets/C_SET_4_PZS_EASY_8.png",
    description: "Olla 4L, sartén 20 cm, easy 8'",
    items: [
      { productId: "co4715", name: "Olla de 4 Cuartos con Tapa (3.8 L)", code: "CO4715", qty: 1, price: 3010, category: "Piezas Individuales" },
      { productId: "co4730-co4801", name: "Sartén de 20 cm + Tapa", code: "CO4730-CO4801", qty: 1, price: 2520, category: "Sartenes & Planchas" },
      { productId: "co9732", name: 'Easy Release 8" C/Tapa', code: "CO9732", qty: 1, price: 2180, category: "Sartenes & Planchas" }
    ]
  },

  // --- SISTEMAS DE COCINA OFICIALES (CATÁLOGO PÁG 6 A 11) ---
  {
    id: "co4672",
    name: "Set de 15 Piezas",
    category: "Sistemas de Cocina",
    price: 19950,
    code: "CO4672",
    image: "/assets/products_2026/CO4672.webp",
    items: [
      { productId: "co4672", name: "Set de 15 Piezas", code: "CO4672", qty: 1, price: 19950, category: "Utensilios de Cocina" }
    ]
  },
  {
    id: "co4642",
    name: "Set de 10 Piezas",
    category: "Sistemas de Cocina",
    price: 13750,
    code: "CO4642",
    image: "/assets/products_2026/CO4642.webp",
    items: [
      { productId: "co4642", name: "Set de 10 Piezas", code: "CO4642", qty: 1, price: 13750, category: "Utensilios de Cocina" }
    ]
  },
  {
    id: "co4632",
    name: "Set de 8 Piezas",
    category: "Sistemas de Cocina",
    price: 12550,
    code: "CO4632",
    image: "/assets/products_2026/CO4632.webp",
    items: [
      { productId: "co4632", name: "Set de 8 Piezas", code: "CO4632", qty: 1, price: 12550, category: "Utensilios de Cocina" }
    ]
  },
  {
    id: "co4622",
    name: "Set de 7 Piezas",
    category: "Sistemas de Cocina",
    price: 9450,
    code: "CO4622",
    image: "/assets/products_2026/CO4622.webp",
    items: [
      { productId: "co4622", name: "Set de 7 Piezas", code: "CO4622", qty: 1, price: 9450, category: "Utensilios de Cocina" }
    ]
  },
  {
    id: "co4612",
    name: "Set de 5 Complementario",
    category: "Sistemas de Cocina",
    price: 7950,
    code: "CO4612",
    image: "/assets/products_2026/CO4612.webp",
    items: [
      { productId: "co4612", name: "Set de 5 Complementario", code: "CO4612", qty: 1, price: 7950, category: "Utensilios de Cocina" }
    ]
  },
  {
    id: "co4602",
    name: "Set de 5 Esencial",
    category: "Sistemas de Cocina",
    price: 6750,
    code: "CO4602",
    image: "/assets/products_2026/CO4602.webp",
    items: [
      { productId: "co4602", name: "Set de 5 Esencial", code: "CO4602", qty: 1, price: 6750, category: "Utensilios de Cocina" }
    ]
  },

  // --- JUEGOS CULINARIOS OFICIALES ---
  {
    id: "set-ollas-grandes",
    name: "Set de Ollas Grandes",
    category: "Juegos Culinarios",
    price: 15190,
    code: "SET-OLLAS-GR",
    image: "/assets/products_2026/SET-OLLAS-GRANDES.webp",
    items: [
      { productId: "set-ollas-grandes", name: "Set de Ollas Grandes", code: "SET-OLLAS-GR", qty: 1, price: 15190, category: "Piezas Individuales" }
    ]
  },
  {
    id: "cu-set-18",
    name: "Set 18 Piezas Cuchillos",
    category: "Juegos Culinarios",
    price: 8350,
    code: "CU-SET-18",
    image: "/assets/products_2026/SET-18-CUCH.webp?v=33",
    items: [
      { productId: "cu-set-18", name: "Set 18 Piezas Cuchillos", code: "CU-SET-18", qty: 1, price: 8350, category: "Cuchillos" }
    ]
  },
  {
    id: "co9726",
    name: "Juego Easy Release 6 Piezas",
    category: "Juegos Culinarios",
    price: 8110,
    code: "CO9726",
    image: "/assets/products_2026/CO9726.webp",
    items: [
      { productId: "co9726", name: "Juego Easy Release 6 Piezas", code: "CO9726", qty: 1, price: 8110, category: "Sartenes & Planchas" }
    ]
  },
  {
    id: "juego-de-planchas",
    name: "Juego de Planchas",
    category: "Juegos Culinarios",
    price: 7300,
    code: "JGO-PLANCHAS",
    image: "/assets/products_2026/JUEGO-PLANCHAS.webp",
    items: [
      { productId: "juego-de-planchas", name: "Juego de Planchas", code: "JGO-PLANCHAS", qty: 1, price: 7300, category: "Sartenes & Planchas" }
    ]
  },
  {
    id: "co4650",
    name: "Juego Gourmet 20 y 24 cm",
    category: "Juegos Culinarios",
    price: 4850,
    code: "CO4650",
    image: "/assets/products_2026/CO4650.webp",
    items: [
      { productId: "co4650", name: "Juego Gourmet 20 y 24 cm", code: "CO4650", qty: 1, price: 4850, category: "Sartenes & Planchas" }
    ]
  },

  // --- EQUIPOS Y ACCESORIOS ESTRELLA ---
  {
    id: "es0008",
    name: "Power Blender",
    category: "Equipos y Accesorios",
    price: 7130,
    code: "ES0008",
    image: "/assets/products_2026/power_blender.webp?v=29",
    items: [
      { productId: "es0008", name: "Power Blender", code: "ES0008", qty: 1, price: 7130, category: "Accesorios Eléctricos" }
    ]
  },
  {
    id: "ju0060",
    name: "maXtractor™",
    category: "Equipos y Accesorios",
    price: 8170,
    code: "JU0060",
    image: "/assets/products_2026/maxtractor.webp?v=30",
    items: [
      { productId: "ju0060", name: "maXtractor", code: "JU0060", qty: 1, price: 8170, category: "Accesorios Eléctricos" }
    ]
  },
  {
    id: "pr2614",
    name: "Royal Cutter",
    category: "Equipos y Accesorios",
    price: 3310,
    code: "PR2614",
    image: "/assets/products_2026/PR2614.webp?v=56",
    items: [
      { productId: "pr2614", name: "Royal Cutter", code: "PR2614", qty: 1, price: 3310, category: "Premiums & Accesorios" }
    ]
  },
  {
    id: "kit-barista",
    name: "Kit Barista",
    category: "Equipos y Accesorios",
    price: 2415,
    code: "KIT-BARISTA",
    image: "/assets/products_2026/KIT-BARISTA.webp?v=48",
    items: [
      { productId: "kit-barista", name: "Kit Barista", code: "KIT-BARISTA", qty: 1, price: 2415, category: "Accesorios Eléctricos" }
    ]
  },
  {
    id: "co0101",
    name: "Chocolatera",
    category: "Equipos y Accesorios",
    price: 1780,
    code: "CO0101",
    image: "/assets/products_2026/CO0101.webp?v=49",
    items: [
      { productId: "co0101", name: "Chocolatera", code: "CO0101", qty: 1, price: 1780, category: "Piezas Individuales" }
    ]
  }
];

export const SET_CATEGORIES = [
  "Todos",
  "Combos Especiales",
  "Sistemas de Cocina",
  "Juegos Culinarios",
  "Equipos y Accesorios"
];
