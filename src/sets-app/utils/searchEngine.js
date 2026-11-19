// Motor de Búsqueda Inteligente para Productos Royal Prestige

// Normaliza texto eliminando acentos, tildes y caracteres especiales
export function normalizeText(text) {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// Búsqueda inteligente por palabras clave e inferencia de medidas
export function filterProductsSmart(items, query, selectedCategory = 'Todos') {
  const normalizedQuery = normalizeText(query);
  const tokens = normalizedQuery.split(/[\s,.-]+/).filter(Boolean);

  // Si no hay búsqueda, aplicar solo el filtro de sección
  if (tokens.length === 0) {
    if (selectedCategory === 'Todos') return items;
    return items.filter(
      p => p.category === selectedCategory || p.section === selectedCategory
    );
  }

  // Si hay búsqueda por texto, buscar en el catálogo completo o en la categoría
  return items.filter((p) => {
    // Si la categoría no es "Todos", solo restringir si no es una búsqueda global
    // Pero si el usuario busca algo específico, permitir encontrarlo
    const matchesCategory = 
      selectedCategory === 'Todos' || 
      p.category === selectedCategory || 
      p.section === selectedCategory;

    // Crear un string enriquecido de búsqueda para cada producto con sinónimos e inferencias
    let searchable = `${p.code} ${p.name} ${p.category} ${p.id} `;
    const nameLower = p.name.toLowerCase();

    // Inferencias de medidas en pulgadas <-> centímetros
    if (nameLower.includes('8"') || nameLower.includes('8 pulg')) {
      searchable += ' 20 20cm 20 cm sarten ';
    }
    if (nameLower.includes('10"') || nameLower.includes('10 pulg')) {
      searchable += ' 26 26cm 26 cm sarten ';
    }
    if (nameLower.includes('12"') || nameLower.includes('12 pulg')) {
      searchable += ' 30 30cm 30 cm sarten ';
    }

    // Inferencias de categorías y sinónimos comunes
    if (nameLower.includes('easy release')) {
      searchable += ' sarten sartenes antiadherente ';
    }
    if (nameLower.includes('efecto piedra')) {
      searchable += ' antiadherente piedra sarten olla ceramica ';
    }
    if (nameLower.includes('maxtractor')) {
      searchable += ' extractor jugos prensado en frio zumo ';
    }
    if (nameLower.includes('power blender')) {
      searchable += ' licuadora batidora jugos ';
    }
    if (nameLower.includes('fresca pure') || nameLower.includes('frescapure')) {
      searchable += ' filtro purificador de agua cartucho ';
    }
    if (nameLower.includes('royal cutter')) {
      searchable += ' procesador maquina de ensaladas cortador rallador ';
    }
    if (nameLower.includes('expertea')) {
      searchable += ' tetera te infusor agua hervidor ';
    }
    if (nameLower.includes('royal expreso')) {
      searchable += ' cafetera cafe moka express ';
    }
    if (nameLower.includes('aro')) {
      searchable += ' repuesto aros goma empaque silicona ';
    }
    if (nameLower.includes('multipan')) {
      searchable += ' sarten sartenes horno pan pastel torta ';
    }
    if (nameLower.includes('santoku') || nameLower.includes('hacha')) {
      searchable += ' cuchillo cuchillos corte filo ';
    }

    const normalizedTarget = normalizeText(searchable);

    // Cada palabra clave de la búsqueda debe coincidir con el producto
    const matchesAllTokens = tokens.every(token => normalizedTarget.includes(token));

    // Si coincide con todos los términos, mostrarlo (si además coincide con la categoría, mejor)
    if (selectedCategory !== 'Todos') {
      return matchesCategory && matchesAllTokens;
    }

    return matchesAllTokens;
  });
}
