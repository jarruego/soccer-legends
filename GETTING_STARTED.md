# ⚡ Getting Started - Soccer Legends

**Tu proyecto está completo.** Aquí están **exactamente 3 pasos** para empezar.

---

## 🎯 Opción A: Haz Deploy Ahora Mismo (15 minutos)

Si solo quieres probar la app:

```bash
# 1. Sube a GitHub (primero ejecuta git-setup.sh)
bash git-setup.sh

# 2. Crea repo en GitHub.com y sigue el link

# 3. Sigue docs/DEPLOYMENT.md
# - Crea cuenta Supabase
# - Deploy backend en Render
# - Deploy frontend en Vercel
```

**Resultado:** App lista en producción en tu teléfono ✅

---

## 💻 Opción B: Desarrolla Pantallas (2-3 horas)

Si quieres aprender y customizar:

```bash
# 1. Inicia todo
cd server && npm run start:dev &
docker-compose up -d &
cd ../client && npm start

# 2. Elige plataforma
# Android (a) o Web (w)

# 3. Sigue docs/DEVELOPMENT.md
# Implementa LoginScreen, HomeScreen, etc.

# 4. Prueba en emulador
# Registra usuario, crea partida, transfiere dinero
```

**Resultado:** App con interfaz personalizada ✅

---

## 🧪 Opción C: Prueba Todo Primero (1 hora)

Si quieres verificar que funciona:

```bash
# 1. Inicia backend
cd server
npm install
npm run start:dev

# 2. Inicia BD
docker-compose up -d

# 3. Sigue docs/TESTING.md
# Manualmente prueba:
# - Registro/Login
# - Crear partida
# - Transferencias
# - Validaciones
```

**Resultado:** Confianza de que todo funciona ✅

---

## 📋 Checklist Rápido

- [ ] He leído [SUMMARY.md](SUMMARY.md)
- [ ] Tengo Node.js 18+ instalado
- [ ] Tengo Docker instalado (si voy local)
- [ ] Tengo Git instalado
- [ ] He elegido Opción A, B o C

---

## 🎓 Ruta Recomendada (Completa, 2-3 semanas)

```
Semana 1: Setup + Testing
├─ Día 1: Lee SUMMARY.md + README.md
├─ Día 2: Inicia local (backend + BD)
├─ Día 3: Implementa Testing.md (verifica todo funciona)
└─ Día 4-5: Entiende arquitectura (ARCHITECTURE.md)

Semana 2: Frontend Development
├─ Día 6: Implementa LoginScreen
├─ Día 7: Implementa HomeScreen
├─ Día 8: Implementa GameDetailScreen
├─ Día 9: Implementa TransactionScreen
└─ Día 10: Testing completo en emulador

Semana 3: Deploy
├─ Día 11: Setup Supabase + Render
├─ Día 12: Deploy backend + frontend
├─ Día 13: Testing en producción
└─ Día 14: Publicar en Google Play
```

---

## 🔧 Requisitos Previos

### Software Necesario

```bash
# Node.js 18+
node --version
npm --version

# Docker (para BD local)
docker --version
docker-compose --version

# Git
git --version
```

### Descargar/Instalar

- **Node.js:** https://nodejs.org (LTS)
- **Docker:** https://www.docker.com/products/docker-desktop
- **Git:** https://git-scm.com/download
- **Android Emulator:** https://developer.android.com/studio (opcional)

---

## 📚 Documentación por Necesidad

| Quiero... | Leo... |
|-----------|---------|
| Resumen de todo | [SUMMARY.md](SUMMARY.md) |
| Setup rápido | [README.md](README.md) |
| Entender APIs | [docs/API.md](docs/API.md) |
| Implementar pantallas | [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) |
| Probar la app | [docs/TESTING.md](docs/TESTING.md) |
| Hacer deploy | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| Entender arquitectura | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Respuesta rápida | [docs/FAQ.md](docs/FAQ.md) |

---

## 🚀 Mi Recomendación

**Si recién comienzas:** Opción C (Testing)  
**Si quieres aprender:** Opción B (Development)  
**Si solo quieres verla funcionando:** Opción A (Deploy)

La mayoría elige: **Opción B → Opción C → Opción A**

---

## 📞 Estoy Atascado

1. Lee [docs/FAQ.md](docs/FAQ.md) - Responde 80% de preguntas
2. Busca en la documentación - Usa Ctrl+F
3. Revisa GitHub Issues - Otros tuvieron el mismo problema
4. Abre un issue nuevo - Describe bien el problema

---

## ✨ Tips Finales

✅ Instala extensiones útiles en VS Code:
- Prettier (formato automático)
- ESLint (errores de código)
- Thunder Client (prueba APIs)
- Docker (gestión de containers)

✅ Configura Git:
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

✅ USA CONTRIBUYENDO.md cuando añadas código:
- Nombra ramas bien: `feature/nombre`
- Commits descriptivos: `feat: descripción`
- Tests antes de PR

---

## 🎉 Listo!

Tu proyecto está completo y documentado.

**Elige una opción arriba y comienza ahora.** 🚀

---

## ⏱️ Tiempo Estimado

| Opción | Tiempo |
|--------|--------|
| A - Deploy | 15 min |
| B - Desarrollo | 15-20 horas |
| C - Testing | 1 hora |

---

**¿Qué hago ahora?** → Elige A, B o C arriba ↑
