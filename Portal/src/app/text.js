import * as THREE from "three";
import ThreeMeshUI from 'three-mesh-ui'
import FontJSON from 'three-mesh-ui/examples/assets/Roboto-msdf.json'
import FontImage from 'three-mesh-ui/examples/assets/Roboto-msdf.png'

// npm install three-mesh-ui
export function createUI() {
    ThreeMeshUI.update();
    const content = {
        header: "Portal System\n",
        main: "Press trigger to place portal",
        footer: "XR Demo"
    };

    const container = new ThreeMeshUI.Block({
        width: 1,
        height: 0.5,
        padding: 0.05,
        backgroundColor: new THREE.Color(0x000000),
        backgroundOpacity: 0.8

    });

    container.set({
        fontFamily: FontJSON,
        fontTexture: FontImage,
    });

    const header = new ThreeMeshUI.Text({
        content: content.header,
        fontSize: 0.1,
        fontColor: new THREE.Color(0xffffff)
    });

    const main = new ThreeMeshUI.Text({
        content: content.main,
        fontSize: 0.07,
        fontColor: new THREE.Color(0xffffff)
    });

    const footer = new ThreeMeshUI.Text({
        content: content.footer,
        fontSize: 0.05,
        fontColor: new THREE.Color(0xffffff)
    });

    container.add(header, main, footer);

    container.position.set(0, 0, -1.4);
    //camera.attach(ui.mesh);
    return container;
}