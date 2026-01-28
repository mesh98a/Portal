# 🌀Portal in die Geschichte
**Technologien**: JavaScript,  Three.js, WebXR, Vite

**Beschreibung**:
Entwicklung einer interaktiven Portalszene, die den Wechsel zwischen mehreren kurzen Story-Welten ermöglicht.

**Ziel**:
Verschiedene kulturelle Erlebnisgeschichten visuell erlebbar zu machen.

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
| `getStarfield.js` | Erzeugt den Sternenhintergrund. |
| `controller.js` | Setup der VR-Controller und Tastatursteuerung. |
| `getParticleSystem.js` | Erstellung von Partikel- und Feuereffekten. |
| `portal.js` | Erstellung und Darstellung des Portals. |
| `PortalTransitionManager.js` | Verwaltung des Ein- und Ausgehens durch das Portal. |
| `VRMovementController.js` | Bewegung des Spielers in der VR-Welt. |
| `vr-scene.js` | VR-Welt hinter dem Portal. |
| `xr-buttons.js` | AR-/VR-Buttons zum Starten der XR-Erfahrung. |

# Quellen:
- [Code für Sterne](https://github.com/bobbyroe/3d-globe-with-threejs/blob/main/src/getStarfield.js)
- [Tutorial für Basiskonzepte des Portals und AR Debugging](https://www.youtube.com/watch?v=wmZxBMHWQAs)
- 



