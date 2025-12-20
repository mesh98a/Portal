import { ARButton } from 'three/addons/webxr/ARButton.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

export function createARButton(renderer) {
    // Return Button Element
    const button = ARButton.createButton(renderer, { requiredFeatures: ['hand-tracking','hit-test'] });
    document.body.appendChild(button);
    return button;
}

export function createVRButton(renderer) {
    const button = VRButton.createButton(renderer);
    document.body.appendChild(button);
    return button;
}

