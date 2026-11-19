# ParkTap · NFC con el celular

Web NFC solo funciona en Chrome para Android y exige HTTPS. El puerto de la app es el **3000**. La laptop y el celular tienen que estar en el mismo hotspot: el wifi del evento suele impedir que se vean entre sí.

## 1. Probar primero la simulación

En la laptop:

```bash
npm install
npm run dev
```

En la ventana de ParkTap:

1. Elige un usuario y un cajón.
2. Pulsa **Simular tap**. El panel debe decir **Entrada registrada**, con nombre, placa y UID.
3. Pulsa otra vez el mismo usuario. Debe decir **Salida registrada**.
4. Escribe `FF:FF:FF:FF` en **UID manual** y pulsa **Simular tap**. Debe decir **Chip no registrado**.
5. Elige **Infractor** y el cajón **A-01**. La entrada queda marcada como cajón accesible sin permiso. **Lucía Blanco** en A-01 o A-02 no marca esa falta.

La página del celular, en la misma laptop, también sirve para el plan B: abre `http://127.0.0.1:3000` y usa un botón de cajón. El panel de la ventana de escritorio debe cambiar.

## 2. Certificado HTTPS

En CachyOS:

```bash
sudo pacman -S mkcert
mkcert -install
mkdir -p certs
ip -4 addr
mkcert -key-file certs/key.pem -cert-file certs/cert.pem localhost 127.0.0.1 LA-IP-DE-LA-LAPTOP
```

Sustituye `LA-IP-DE-LA-LAPTOP` por la IPv4 que imprime `npm run dev`, por ejemplo `192.168.43.12`. Reinicia `npm run dev`. La terminal debe decir `HTTPS` y mostrar `https://ESA-IP:3000`.

Los archivos `certs/*.pem` no se suben al repositorio.

En el celular hay que confiar en la autoridad de mkcert, si no Chrome no trata la página como sitio seguro y Web NFC no arranca:

```bash
mkcert -CAROOT
```

Copia el `rootCA.pem` de esa carpeta al celular e instálalo como certificado de CA (Ajustes → Seguridad → Instalar un certificado → Certificado de CA).

## 3. Hotspot y el chip

1. Enciende un hotspot propio y conecta la laptop y el celular.
2. En Chrome para Android abre `https://IP-DE-LA-LAPTOP:3000`.
3. Elige el usuario.
4. Pulsa **Leer chip NFC**, acepta el permiso y acerca el celular al chip del cajón.
5. La página muestra **Entrada registrada** o **Salida registrada**. El panel de la laptop muestra el UID, el nombre, la placa y si fue entrada o salida.

### Si Web NFC falla

Quédate con el plan B. En la página del celular usa el botón del cajón, o en la laptop usa **Simular tap**. La demo sigue.

### Modo Leer UID

En la página del celular pulsa **Modo Leer UID** y acerca cada chip. Anota el `serialNumber` y reemplaza el placeholder en `src/shared/cajones.ts`. Los UID de ejemplo son `04:00:00:00:00:A1` y similares. A-01 y A-02 son los accesibles. `04:00:00:00:00:R1` es el chip de repuesto, asignado a B-02.
