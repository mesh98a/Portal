# 🌀Portal in die Geschichte
**Autoren/Mitwirkende**: Artur Meshalkin, Catharina Hoppensack
  

**Technologien**: JavaScript,  Three.js, WebXR, Vite

**Beschreibung**:
Entwicklung einer interaktiven Portalszene, die den Wechsel zwischen mehreren kurzen Story-Welten ermöglicht.

**Ziel**:
Verschiedene kulturelle Erlebnisgeschichten visuell und immersiv erlebbar zu machen.

#  Installationsbefehl
```bash
npm install vite vite-plugin-basic-ssl three three-mesh-ui
```
| Paket                    | Beschreibung                                                                 |
|--------------------------|------------------------------------------------------------------------------|
| `vite-plugin-basic-ssl`  | Plugin zum Testen über das lokale Netzwerk (mit Vorsicht zu verwenden). |
| `three-mesh-ui`          | Bibliothek zur Erstellung von Benutzeroberflächen im 3D-Raum mit Three.js. |
# Startbefehl:
```bash
npm run dev
```
# Code
| **JS-Datei** | **Beschreibung** |
|---------------|------------------|
| `main.js` | Zentrale Datei zur Verwaltung von Szene, Kamera und Renderer. |
| `StoryManager.js` | Verwaltung der Story-Elemente und Soundeffekte. |
| `ARPortalController.js` | Steuerung der AR-Funktionalitäten und Portal-Interaktion. |
| `controller.js` | Setup der VR-Controller und Tastatursteuerung. |
| `getParticleSystem.js` | Erstellung von Feuereffekten durch Partikelsystem. |
| `portal.js` | Erstellung und Darstellung des Portals. |
| `PortalTransitionManager.js` | Verwaltung des Ein- und Ausgehens durch das Portal. |
| `VRMovementController.js` | Bewegung des Spielers in der VR-Welt. |
| `vr-scene.js` | VR-Welt hinter dem Portal. |
| `xr-buttons.js` | AR-/VR-Buttons zum Starten der XR-Session. |
| `kinkakuji.js` | Erster Versuch eines Portals (obsolet). |
| `getStarfield.js` | Erzeugt einen Sternenhintergrund (obsolet). |
  

# Quellen
### Code
- [Code für Sterne](https://github.com/bobbyroe/3d-globe-with-threejs/blob/main/src/getStarfield.js)
- [Tutorial für Basiskonzepte des Portals und AR Debugging](https://www.youtube.com/watch?v=wmZxBMHWQAs)
- [RenderTarget Idee](https://medium.com/@petercoolen/breaking-down-the-portal-effect-how-to-create-an-immersive-ar-experience-9654aa882c13)
- [Stencil/Occlusion Idee](https://www.youtube.com/watch?v=8yie1UJWPFA&list=PLsaE__vWcRakUtxK6trly6dG5A3OGfeOi&index=4)
- [Partikelsystem](https://github.com/bobbyroe/Simple-Particle-Effects/blob/main/index.js)
### 3D-Objekte
- [Tempel (Kinkakuji)](https://sketchfab.com/3d-models/dp-2-hw-5-2-kinkaku-ji-a21f0f9e29524e299c49fd666c5112ea)
### Audios
- [Soundeffekt beim Betreten des Portals](https://pixabay.com/sound-effects/film-special-effects-whoosh-flanging-389754/)
- [Soundeffekt beim Verlassen des Portals](https://pixabay.com/sound-effects/film-special-effects-whoosh-motion-2-390709/)
- [Umgebungsgeräusche/Atmosphäre](https://pixabay.com/de/sound-effects/natur-mountain-forest-high-quality-sound-176826/)
### Texturen
- [Waldhintergrund/Skybox](https://polyhaven.com/a/forest_slope)
- [Waldboden](https://polyhaven.com/a/rocky_terrain_02)
### Weitere Hilfsmittel
- [Animationen von Mixamo](https://www.mixamo.com/#/)
- [Erzähler & Mönch mit ElevenLabs](https://elevenlabs.io/de)


