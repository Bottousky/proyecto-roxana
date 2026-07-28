# Política Meshy

## Usos permitidos

- estatuas, personajes y criaturas;
- props hero irregulares;
- rocas, raíces y decoración orgánica;
- máquinas de silueta compleja sin despiece funcional;
- prototipos decorativos para impresión.

## Usos no permitidos

- pisos, paredes o plataformas modulares;
- rampas o colliders;
- engranajes, encastres o tolerancias funcionales;
- escenarios completos como una malla;
- objetos móviles sin partes y pivotes definidos.

## Créditos

```yaml
max_preview_variants_per_asset: 3
texture_only_after_shape_approval: true
human_approval_required_for_hero_assets: true
check_balance_before_batch: true
monthly_credit_reserve_percent: 30
background_prop_credit_cap: 40
hero_prop_credit_cap: 120
retry_same_prompt_limit: 1
```

- Sin balance verificable no se inicia un lote.
- Una consulta de balance es la única llamada permitida durante el setup.
- Un retry exige cambiar referencia, prompt o método.
- Registrar `taskId`, coste y fecha sin incluir credenciales.

## Secretos

- `MESHY_API_KEY` sólo vive en el entorno local.
- `.env.example` contiene el nombre vacío.
- `.env` y variantes quedan ignorados.
- La configuración MCP usa `env_vars = ["MESHY_API_KEY"]`.
- Vite, el navegador y el código cliente nunca reciben la clave.

## Impresión

Una malla imprimible no garantiza resistencia, tolerancias ni seguridad. Un producto funcional
separa capa estética Meshy, capa CAD, BOM, instrucciones y pruebas físicas.
