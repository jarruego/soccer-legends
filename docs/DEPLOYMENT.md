# 🚀 Guía de Despliegue - Soccer Legends

Instrucciones paso a paso para desplegar la aplicación en producción.

---

## 📋 Resumen

| Componente | Plataforma | Zeit | Precio |
|------------|-----------|------|--------|
| Backend API | Render | 15 min | Gratis/pago |
| Base de Datos | Supabase | 10 min | Gratis/pago |
| Frontend Web | Vercel | 10 min | Gratis |
| App Android | Google Play | 1-2 horas | $25 único |

**Total estimado:** 2-3 horas

---

## ☁️ 1. Base de Datos (Supabase)

### 1.1 Crear Proyecto Supabase

1. Ir a https://supabase.com
2. Haz clic en "Start your project"
3. Sign in con GitHub (recomendado)
4. Clic en "New Project"

Completa:
```
Organization: Tu nombre/Company
Project Name: soccer-legends
Password: Genera contraseña fuerte
Region: Elige la más cercana (Europa: EU-West-1)
Pricing Plan: Free
```

### 1.2 Copiar Connection String

1. En Supabase dashboard, ve a Settings → Database
2. Copia la string de conexión en formato PostgreSQL:

```
postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

Guarda esta en un lugar seguro.

### 1.3 Ejecutar Migraciones

```bash
cd server

# Crea archivo .env.production
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Ejecuta migraciones
npx drizzle-kit migrate:pg
```

Verifica que las tablas se crearon en Supabase:
- https://supabase.com → SQL Editor
- `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`

---

## 🏃 2. Backend (Render)

### 2.1 Preparar Proyecto

```bash
cd server

# Asegúrate que package.json tenga este script
npm run build  # Genera dist/

# Verifica que funciona localmente
npm run start
```

### 2.2 Crear Render Web Service

1. Ir a https://render.com
2. Sign in con GitHub
3. Clic en "New +" → "Web Service"
4. Conecta tu repositorio GitHub
5. En settings:

```
Name: soccer-legends-api
Environment: Node
Build Command: npm install && npm run build
Start Command: npm run start
```

### 2.3 Configurar Variables de Entorno

En Render dashboard → Environment:

```env
NODE_ENV=production
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
JWT_SECRET=una_cadena_muy_larga_y_aleatoria_aqui_cambiar
JWT_EXPIRATION=24h
PORT=3000
CORS_ORIGIN=https://soccer-legends.vercel.app,https://soccer-legends-web.vercel.app
```

### 2.4 Deploy

1. Clic en "Deploy"
2. Espera a que termine (5-10 min)
3. Copia la URL: `https://soccer-legends-api.onrender.com`

**Nota:** El primer request toma ~30 segundos (cold start)

---

## 🌐 3. Frontend Web (Vercel)

### 3.1 Preparar .env.production

```bash
cd client

# Crea archivo .env.production
REACT_APP_API_URL=https://soccer-legends-api.onrender.com
```

### 3.2 Deploy a Vercel

**Opción A: Desde CLI**

```bash
npm install -g vercel

vercel
# Te pide:
# - Link existing project? → No (primera vez)
# - Project name → soccer-legends-web
# - Directory → ./
# - Build settings → Default

# En producción
vercel --prod
```

**Opción B: Desde Dashboard**

1. Ir a https://vercel.com
2. Sign in con GitHub
3. Clic en "Import Project"
4. Selecciona tu repositorio
5. En settings:
   - Root Directory: `./client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Environment Variables → Añade `.env.production`
7. Clic en "Deploy"

### 3.3 Verificar

Después de deployed (5 min):
```
https://soccer-legends-web.vercel.app
```

Prueba:
1. Registra usuario
2. Crea partida
3. Transacciones

---

## 📱 4. App Android (Google Play Store)

### 4.1 Crear Apk Firmado

```bash
cd client

# Generar clave de firma (una sola vez)
keytool -genkey-pair -v -keystore my-release-key.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias my-key-alias

# Usa password fuerte y responde preguntas

# Compilar apk
eas build --platform android --release
```

### 4.2 Crear Cuenta Google Play

1. Ir a https://play.google.com/console
2. Clic en "Create app"
3. App name: "Soccer Legends"
4. App type: Gaming
5. Paga $25 (onetime fee)
6. Acepta términos

### 4.3 Completar Listing

En Google Play Console:

**App details:**
- Categoría: Games → Card & Casino
- Descripción: "Gestiona dinero en partidas de fútbol"
- Screenshots: Mínimo 2-5 (emulator screenshots)
- Icono: 512x512px PNG
- Nombre largo: "Soccer Legends - Money Manager"

**Pricing & distribution:**
- Gratis
- Dispositivos: Android phones & tablets
- Edad: Everyone

### 4.4 Upload APK

1. Ir a "Release" → Production
2. Clic en "Create new release"
3. Upload tu APK
4. Revisa cambios (Release notes)
5. Clic en "Review"
6. Clic en "Publish"

**Espera:** Google revisa (24-48 horas típicamente)

### 4.5 Verificar en Play Store

Después de aprobación (1-2 días):
```
https://play.google.com/store/apps/details?id=com.soccerlegends
```

---

## 🔐 5. Configuración de Seguridad

### 5.1 JWT Secret

Genera un JWT Secret fuerte:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Usa este en Render environment variables.

### 5.2 CORS Configuration

Backend solo acepta requests desde:
```
https://soccer-legends-web.vercel.app
https://soccer-legends.vercel.app (alternativo)
```

### 5.3 Database Backup

En Supabase:
1. Settings → Backups
2. Habilita automatic backups
3. Recomendado: Point-in-time recovery

### 5.4 Monitoreo

**Render Dashboard:**
- Ve a Metrics
- Monitorea CPU, Memory, Requests

**Supabase:**
- Database → Usage
- Revisa conexiones activas y queries lentas

---

## 🧪 6. Testing en Producción

```bash
# Test API
curl https://soccer-legends-api.onrender.com/health

# Test Frontend
open https://soccer-legends-web.vercel.app

# Test Android
# Descarga desde Play Store en dispositivo Android
```

**Checklist:**
- [ ] Registro funciona
- [ ] Login funciona
- [ ] Crear partida
- [ ] Unirse a partida
- [ ] Transferencias
- [ ] Datos persisten

---

## 📊 Costos Estimados (Mensual)

| Servicio | Free | Pago |
|----------|------|------|
| Render API | $0 (después de trial) | $7+ |
| Supabase DB | $0 (hasta 500MB) | $25+ |
| Vercel Web | $0 | $20+ |
| Google Play | N/A | $25 (único) |
| **Total** | **$0** | **$50+** |

---

## 🔧 7. Actualizar en Producción

### Backend

```bash
cd server

# 1. Haz commit y push a GitHub
git add .
git commit -m "feat: nueva feature"
git push origin main

# 2. Render auto-redeploya
# (o manualmente: Dashboard → Manual Deploy)

# 3. Migraciones (si necesario)
DATABASE_URL=<production> npm run db:migrate
```

### Frontend

```bash
cd client

# 1. Push a GitHub
git push origin main

# 2. Vercel auto-redeploya
# (o manualmente: Dashboard → Deployments → Redeploy)
```

### Android

```bash
# Cada update necesita nuevo build
eas build --platform android --release

# Upload a Google Play en sección "Release"
# Espera nuevo review (usualmente < 2 horas para updates)
```

---

## 🆘 Troubleshooting

### "Connection Refused" en Producción

```bash
# Verifica DATABASE_URL en Render
curl https://soccer-legends-api.onrender.com/health

# Si error: reinicia servicio
# Render Dashboard → Restart Instance
```

### Frontend no conecta a Backend

1. Verifica `REACT_APP_API_URL` en Vercel
2. Asegúrate que URL es correcta
3. Verifica CORS en backend

```bash
# Backend .env debe tener
CORS_ORIGIN=https://soccer-legends-web.vercel.app
```

### APK crash en Android

1. Revisa logs en Google Play Console → Crashes
2. Descarga APK y test en emulador
3. Revisa console errors en Vercel/Render

### Play Store rechaza app

Razones comunes:
- Contenido inapropiado
- Violación de políticas de publicidad
- Permisos sospechosos

**Solución:** Revisa policy Google Play completa

---

## ✅ Checklist Final

- [ ] Supabase DB creada y funcionando
- [ ] Migraciones ejecutadas en producción
- [ ] Backend deployed en Render
- [ ] Variables de entorno configuradas
- [ ] Frontend deployed en Vercel
- [ ] CORS configurado correctamente
- [ ] Tests manuales pasados
- [ ] APK generado y signed
- [ ] Google Play app publicada
- [ ] Monitoreo configurado

---

## 🎉 ¡Desplegado!

Tu app está ahora en:

🌐 **Web:** https://soccer-legends-web.vercel.app  
📱 **Android:** Google Play Store  
🏃 **API:** https://soccer-legends-api.onrender.com  
🗄️ **BD:** Supabase (PostgreSQL)

### Compartir con amigos:

1. **Web:** Envía link de Vercel
2. **Android:** Envía link de Play Store
3. **Invita amigos:** Pueden crear cuenta y jugar

---

## 📈 Próximos Pasos

1. **Monitorear performance:**
   - CPU/Memory en Render
   - Response times
   - Error rates

2. **Recopilar feedback:**
   - Encuesta a usuarios
   - Mejora UI/UX

3. **Nuevas features:**
   - Sistema ELO de jugadores
   - Estadísticas históricas
   - Invitaciones por email
   - Modo offline

4. **Marketing:**
   - Comparte en redes sociales
   - Pide reviews en Play Store
   - Optimiza SEO para web

---

¡Felicitaciones por lanzar tu app! 🚀
