#!/bin/bash
# scripts/verificar-hito.sh
# Gate de calidad mecánico — corre antes de todo commit.
# Si cualquier check falla, sale con código 1 y bloquea el commit.

set -e

ROJO='\033[0;31m'
VERDE='\033[0;32m'
AMARILLO='\033[1;33m'
NC='\033[0m'

ok()   { echo -e "${VERDE}✓${NC} $1"; }
fail() { echo -e "${ROJO}✗${NC} $1"; exit 1; }
warn() { echo -e "${AMARILLO}⚠${NC} $1"; }

echo "=== Verificación de hito — Proyecto Roxana ==="
echo ""

# 1. BUILD
echo "--- Build ---"
if npm run build > /tmp/build-output.txt 2>&1; then
  ok "Build limpio"
else
  cat /tmp/build-output.txt
  fail "Build falló — corregir antes de continuar"
fi

# 2. TESTS
echo ""
echo "--- Tests ---"
TEST_FILES=$(find tests -name "*.test.ts" 2>/dev/null | wc -l | tr -d ' ')
if [ "$TEST_FILES" -eq 0 ]; then
  warn "No hay archivos de test en tests/ — agregar tests para el puzzle"
else
  FAILED=0
  for t in tests/*.test.ts; do
    if node --experimental-strip-types "$t" > /tmp/test-output.txt 2>&1; then
      ok "$(basename $t)"
    else
      cat /tmp/test-output.txt
      echo -e "${ROJO}✗${NC} $(basename $t)"
      FAILED=$((FAILED + 1))
    fi
  done
  if [ "$FAILED" -gt 0 ]; then
    fail "$FAILED test(s) fallaron"
  fi
fi

# 3. TODOs de guion pendientes
echo ""
echo "--- TODOs de guion ---"
TODOS=$(grep -rn "TODO(guion)" src/ 2>/dev/null | wc -l | tr -d ' ')
if [ "$TODOS" -gt 0 ]; then
  warn "$TODOS TODO(guion) pendientes:"
  grep -rn "TODO(guion)" src/ 2>/dev/null
  echo ""
  echo "  Los TODOs de guion no bloquean el commit pero deben registrarse."
  echo "  El Orquestador debe completarlos antes del siguiente hito."
else
  ok "Sin TODOs de guion pendientes"
fi

# 4. TODOs de implementación bloqueantes
echo ""
echo "--- TODOs de implementación ---"
TODOS_IMPL=$(grep -rn "TODO(M[0-9]" src/ 2>/dev/null | wc -l | tr -d ' ')
if [ "$TODOS_IMPL" -gt 0 ]; then
  grep -rn "TODO(M[0-9]" src/ 2>/dev/null
  fail "$TODOS_IMPL TODO(M_) de implementación sin resolver — no commitear"
else
  ok "Sin TODOs de implementación pendientes"
fi

# 5. VOSEO (bug de dialecto)
echo ""
echo "--- Dialecto (tuteo obligatorio) ---"
# Busca en archivos TS dentro de src/ cadenas de texto visibles con voseo
# Ignora comentarios y nombres de variables
VOSEO=$(grep -rn --include="*.ts" \
  -E "(\"[^\"]*\b(tenés|hacés|sabés|podés|venís|salís|vos eres|sos |estás)\b[^\"]*\")" \
  src/ 2>/dev/null | wc -l | tr -d ' ')
if [ "$VOSEO" -gt 0 ]; then
  grep -rn --include="*.ts" \
    -E "(\"[^\"]*\b(tenés|hacés|sabés|podés|venís|salís|vos eres|sos |estás)\b[^\"]*\")" \
    src/ 2>/dev/null
  fail "Voseo detectado en texto visible — usar tuteo (tú/tienes/haces)"
else
  ok "Dialecto correcto (tuteo)"
fi

# 6. VOCABULARIO SPOILER (advertencia, no bloqueo — requiere auditoría contextual)
echo ""
echo "--- Vocabulario técnico en texto visible ---"
SPOILER=$(grep -rn --include="*.ts" \
  -E "\"[^\"]*\b(serie|paralelo|nodo|Kirchhoff|voltaje|resistencia eléctrica|corriente eléctrica)\b[^\"]*\"" \
  src/ 2>/dev/null | grep -v "//.*\"" | wc -l | tr -d ' ')
if [ "$SPOILER" -gt 0 ]; then
  warn "$SPOILER ocurrencia(s) de vocabulario técnico en strings — verificar que estén gateadas por flag de formalización:"
  grep -rn --include="*.ts" \
    -E "\"[^\"]*\b(serie|paralelo|nodo|Kirchhoff|voltaje|resistencia eléctrica|corriente eléctrica)\b[^\"]*\"" \
    src/ 2>/dev/null | grep -v "//.*\""
  echo "  (Esto es una advertencia — el Auditor verifica el contexto de flags)"
else
  ok "Sin vocabulario técnico spoiler detectado"
fi

# RESUMEN
echo ""
echo "=== Resultado ==="
ok "Verificación mecánica completa"
echo ""
echo "Siguiente paso: auditoría narrativa (Auditor juega en preview)"
echo "Si la auditoría es ok → proponer commit al Director"
