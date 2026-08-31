# OHMDAL · VISIÓN DE DISEÑO Y ARQUITECTURA TÉCNICA (v1.0)
**Estado:** PROPOSED (Branch Greenfield: `explore/ohmdal-3D`)  
**Paradigma:** *Outer Wilds* educativo · Mundo 3D continuo · El conocimiento es la progresión.

---

## 1. Declaración de Identidad

> **Ohmdal es un lugar 3D real que el jugador aprende a comprender. El conocimiento es la progresión.**

Ohmdal no es una colección de salas aisladas con puertas bloqueadas por llaves de color ni una serie de minijuegos educativos abstractos. Es una **civilización medieval que olvidó la ciencia de la electricidad** y construyó mitos, rituales y supersticiones alrededor de una infraestructura electromagnética milenaria que aún late bajo sus piedras.

---

## 2. Los Cuatro Pilares Fundamentales

```text
                           FARO
                            ▲
                 ┌──────────┴──────────┐
                 │                     │
            INFRAESTRUCTURA       FENÓMENO FÍSICO
                 │                     │
  CASTILLO ─── PLAZA ─── TALLER ─── MANANTIAL
     │           │          │             │
  HISTORIA    SÍNTOMAS   MEDICIÓN       ORIGEN
     │           │          │             │
     └──────────── CONOCIMIENTO ──────────┘
```

### Pilar I: Mundo 3D Continuo y Memoria Espacial
- **Sin pantallas negras ni cortes de sala:** La Cuenca de Ohmdal es un espacio tridimensional continuo. Los landmarks (el Faro en el acantilado, la Aguja del Castillo, los Acueductos y el Manantial) son visibles entre sí.
- **Densidad sobre extensión:** Un "Outer Wilds en miniatura". Cada 20 metros el jugador encuentra un síntoma, una reliquia o una contradicción física que despierta su curiosidad.

### Pilar II: La Red Eléctrica como Sistema Físico del Mundo
- Los circuitos no son puzzles abstractos; son los cables de cobre, relés, transformadores y baterías que alimentan las máquinas del mundo.
- **Simulación Determinista:** El motor calcula tensiones nodales ($V$), corrientes de rama ($I$), caídas de potencial y estados físicos reales (temperatura de conductores, fuerza magnética de solenoides, brillo de filamentos).

### Pilar III: Instrumento Diegético en Mano (El Galvanoscopio de Lumen)
- El jugador sostiene una herramienta de diagnóstico físico en primera persona desde el minuto cero:
  - Voltímetro de aguja analógica.
  - Comprobador de continuidad / resistencia.
  - Amperímetro / filamento de vacío incandescente.
  - Rastreador de líneas y caída de potencial.
- **Sin desbloqueos mágicos:** Todas las capacidades existen desde el inicio; el progreso radica en que el jugador **comprenda qué significan los números y las deflexiones de la aguja**.

### Pilar IV: Cuaderno de Edda (Grafo de Conocimiento)
- No es una lista de misiones (`[ ] Ve al taller y busca 220Ω`).
- Es una **red viva de deducciones, pistas y relaciones causales** (estilo *Ship Log* de *Outer Wilds*), que mapea cómo las supersticiones locales se conectan con las leyes físicas de Ohm, Kirchhoff y Joule.

---

## 3. Stack Tecnológico y Pipeline de Producción

| Capa | Elección Técnica | Justificación |
| :--- | :--- | :--- |
| **Engine 3D Web** | **PlayCanvas Engine v2** (TypeScript + Vite) | Rendimiento WebGPU con fallback WebGL2, PBR real, audio posicional, rigid bodies y carga de glTF 2.0 optimizado para web/móvil. |
| **Agentic Workflow** | **PlayCanvas Official Agent Skills** (`.agents/skills/`) | Skills portables para clientes compatibles con Agent Skills, incluido Codex (`assemble-scene`, `light-scene`, `build-hud`, `inspect-glb`). |
| **Modelado & DCC** | **Blender 5.1+; Blender MCP oficial opcional y gated** | Blender es la herramienta primaria de modelado; el MCP se habilita sólo cuando su estado vivo aporta valor y bajo las reglas de seguridad del harness. |
| **Asset Pipeline** | **glTF 2.0 + glTF-Transform + Meshopt + KTX2** | Formato universal compacto y optimización orientada a carga web. |
| **Kits Base CC0** | Quaternius, Kenney, Poly Haven, ambientCG | Prototipado rápido, modularidad y materiales/props con procedencia clara. |
| **Hero Assets** | **Blender + Meshy opcional** | Generación 3D asistida sólo para piezas propias donde ahorre trabajo; Blender conserva la versión canónica. |
| **Simulación Física** | `OhmdalCircuitEngine` (TypeScript) | Solucionador determinista validado contra referencia SPICE. |
| **Infraestructura** | Cloudflare Pages + Cloudflare R2 | Servido web y distribución de assets pesados/CDN cuando corresponda. |

Guía de recursos, skills y prueba de calidad de la Plaza:
[`production/OHMDAL_3D_PRODUCTION_GUIDE.md`](production/OHMDAL_3D_PRODUCTION_GUIDE.md).

---

## 4. El Slice Inicial (Milestone 1)

1. **Sector Inicial:** Portal del Instituto → Plaza Central → Taller de Lumen → Puerta al Manantial.
2. **Síntoma Inicial:** La Plaza está a oscuras; la Campana Sagrada no responde; el riel de retorno de cobre está cortado y sulfatado.
3. **Loop de Juego:** Curiosidad → Observación → Medición con Galvanoscopio → Hipótesis → Reparación física → Apertura de la Gran Puerta.
