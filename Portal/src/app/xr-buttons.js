import { ARButton } from 'three/addons/webxr/ARButton.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

export function createARButton(renderer) {
    const button = ARButton.createButton(renderer, {
        requiredFeatures: ["hit-test"],
        optionalFeatures: ["dom-overlay", "light-estimation", "local-floor",'bounded-floor', 'plane-detection'],
        domOverlay: { root: document.body }
    });
    //button.style.position = 'relative';
    button.style.cssText = `
    position: absolute;
    bottom: 100px;
    padding: 12px 24px;
    background: #00ff00;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    z-index: 1000;
  `;

    document.body.appendChild(button);
    return button;
}

export function createVRButton(renderer) {
    const button = VRButton.createButton(renderer,{
      optionalFeatures: ["local-floor", "bounded-floor", "hand-tracking"]
    });
    button.style.cssText = `
    position: absolute;
    bottom: 20px;
    padding: 12px 24px;
    background: #ff0000;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    z-index: 1000;
  `;


    document.body.appendChild(button);
    return button;
}

