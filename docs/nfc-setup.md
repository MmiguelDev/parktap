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

## 2. Permitir el NFC en Chrome

Web NFC solo funciona en un **sitio seguro**. Hay dos caminos. **Usen el A**: es el más rápido y no necesita certificado.

### Opción A (recomendada): marcar la laptop como sitio seguro en Chrome

En el celular Android, con Chrome:

1. Abre `chrome://flags/#unsafely-treat-insecure-origin-as-secure`.
2. Pon **Enabled**.
3. En el cuadro de texto escribe la dirección que imprime `npm run dev`, con el puerto. Por ejemplo: `http://192.168.43.12:3000`.
4. Pulsa **Relaunch**.
5. Abre esa misma dirección. Ya no debe aparecer el aviso rojo de "no es un sitio seguro".

Si la IP cambia (otra red u otro hotspot), hay que volver a escribirla en el flag.

### Opción B: certificado HTTPS con mkcert

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

## 4. Registrar los chips (una sola vez)

Ya no hay que copiar los UID al código. Se registran desde el celular:

1. En la página del celular pulsa **Registrar chip**.
2. Elige el cajón (por ejemplo **A-01**) y pulsa **Activar lector NFC**.
3. Acerca el celular al chip pegado en ese cajón. Debe decir **Chip registrado en A-01** y vibrar.
4. El selector pasa solo al siguiente cajón. Acerca el siguiente chip, y así con los 8.
5. Abajo aparece la tabla **Chips registrados** con cada cajón y su UID.

El registro se guarda en `data/chips.json`, en la raíz del proyecto. Súbanlo a git para que todo el equipo use los mismos chips. Si un chip se registra otra vez en otro cajón, se mueve: un chip va en un solo cajón y un cajón tiene un solo chip.

Si `data/chips.json` no existe, la app usa los UID de ejemplo de `src/shared/cajones.ts` (`04:00:00:00:00:A1` y similares).

### Modo Leer UID

Pulsa **Leer UID** y acerca cualquier chip para ver su número sin registrar nada. Sirve para revisar si un chip funciona.
