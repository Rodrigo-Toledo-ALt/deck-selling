# Integración de Repositorios - Deck Selling + Cloudflare Block Page Generator

## Resumen de la Integración

Este proyecto integra dos repositorios de React:
1. **Repositorio principal**: `deck-selling` - Sistema de venta de mazos de cartas
2. **Repositorio integrado**: `cloudflare-block-page-generator` - Generador de páginas con visualización de cartas MTG

## Cambios Realizados

### 1. Estructura de Archivos Añadidos

```
src/
├── components/
│   └── DeckDetailCF/
│       ├── DeckDetailCF.tsx    # Componente principal integrado
│       └── CardList.tsx        # Componente de lista de cartas del segundo repo
├── utils/
│   └── deckAdapter.ts          # Adaptador para convertir datos de BD a formato esperado
├── data/
│   └── sampleProducts.ts       # Datos de ejemplo adaptados a estructura de BD
├── App.tsx                     # Actualizado para usar DeckDetailCF en ruta /deck/:id
├── index.css                   # Combinado con variables CSS MTG del segundo repo
└── tailwind.config.ts          # Actualizado con clases MTG específicas
```

### 2. Ruta Actualizada

- **Antes**: `<Route path="/deck/:id" element={<DeckDetail />} />`
- **Después**: `<Route path="/deck/:id" element={<DeckDetailCF />} />`

La nueva ruta `/deck/:id` ahora utiliza el componente integrado que combina:
- La funcionalidad de compra del primer repositorio
- La visualización avanzada de cartas del segundo repositorio

### 3. Estructura de Base de Datos Soportada

El adaptador (`deckAdapter.ts`) convierte datos de la estructura de BD:

```typescript
interface DatabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  deck_cards: any; // JSON con estructura de cartas
  main_image_url: string;
  colors: string[];
  format: string;
}
```

Al formato esperado por los componentes de visualización:

```typescript
interface DeckData {
  commander: CardItem[];
  planeswalkers: CardItem[];
  creatures: CardItem[];
  sorceries: CardItem[];
  instants: CardItem[];
  artifacts: CardItem[];
  lands: CardItem[];
  sideboard: CardItem[];
}
```

### 4. Clases Tailwind MTG Preservadas

Se mantuvieron las clases específicas de colores MTG del segundo repositorio:

```css
--mtg-blue: 218 100% 50%;
--mtg-white: 0 0% 95%;
--mtg-black: 0 0% 10%;
--mtg-red: 0 100% 50%;
--mtg-green: 142 76% 36%;
--mtg-colorless: 220 9% 60%;
```

### 5. Funcionalidades Integradas

#### Del Primer Repositorio (deck-selling):
- ✅ Sistema de navegación (Navbar/Footer)
- ✅ Funcionalidad de carrito de compras
- ✅ Integración con Supabase
- ✅ Sistema de toasts/notificaciones
- ✅ Estructura de rutas existente

#### Del Segundo Repositorio (cloudflare-block-page-generator):
- ✅ Visualización avanzada de cartas por categorías
- ✅ Hover interactivo para mostrar imágenes de cartas
- ✅ Símbolos de maná con colores específicos
- ✅ Layout responsivo de listas de cartas
- ✅ Clases Tailwind específicas para MTG

### 6. Datos de Ejemplo Eliminados

Se eliminaron los datos de ejemplo del primer repositorio y se reemplazaron con:
- Estructura compatible con la base de datos especificada
- Datos de ejemplo que demuestran la funcionalidad integrada
- Soporte para múltiples formatos (Commander, Standard, Modern)

## Instalación y Uso

1. **Instalar dependencias**:
```bash
npm install
```

2. **Ejecutar en desarrollo**:
```bash
npm run dev
```

3. **Acceder a la funcionalidad integrada**:
- Navegar a `/deck/1`, `/deck/2`, o `/deck/3` para ver los diferentes mazos de ejemplo
- La funcionalidad completa incluye visualización de cartas y compra

## Próximos Pasos

### Para Producción:
1. **Reemplazar datos de ejemplo**: Conectar `fetchProductById` en `DeckDetailCF.tsx` con la API real
2. **Configurar Supabase**: Asegurar que las tablas `products` tengan la estructura correcta
3. **Optimizar imágenes**: Implementar lazy loading para las imágenes de cartas
4. **Testing**: Añadir tests para los nuevos componentes integrados

### Estructura de BD Recomendada:
```sql
-- Tabla products ya existente, asegurar que tenga:
ALTER TABLE products ADD COLUMN IF NOT EXISTS deck_cards JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS main_image_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS format TEXT;
```

## Archivos Clave para Revisión

1. **`src/components/DeckDetailCF/DeckDetailCF.tsx`** - Componente principal integrado
2. **`src/utils/deckAdapter.ts`** - Lógica de adaptación de datos
3. **`src/App.tsx`** - Rutas actualizadas
4. **`tailwind.config.ts`** - Configuración de colores MTG
5. **`src/index.css`** - Variables CSS combinadas

La integración mantiene la funcionalidad completa de ambos repositorios mientras proporciona una experiencia de usuario mejorada para la visualización de mazos de cartas.