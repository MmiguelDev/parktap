# ParkTap

ParkTap es la demo de escritorio del hackathon Espacios Inteligentes, UTCH. Muestra en vivo el estacionamiento de la universidad: el estudiante se estaciona en un cajón libre, acerca su celular Android al chip NFC de ese cajón y la laptop marca el lugar para que los siguientes vean dónde hay espacio.

## Qué hace

- Mapa visto desde arriba, con 12 cajones. A-01 y A-02 son accesibles.
- Un tap registra la entrada. El mismo usuario, al volver a pasar el celular, registra la salida.
- Si alguien sin permiso ocupa un cajón accesible, el cajón parpadea y aparece en alertas.
- El panel muestra cuántos lugares quedan, el registro de entradas y salidas, y el último tap NFC.
- Si el chip no se puede leer, el celular tiene un botón por cajón y la laptop tiene **Simular tap**. Los dos usan la misma lógica.

## Cómo abrirlo

```bash
npm install
npm run dev
```

El boceto visual está en `docs/diseno.html`. Los colores, en `docs/paleta.md`. La conexión del celular, en `docs/nfc-setup.md`.
