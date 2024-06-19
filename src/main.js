// Импорты
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import ViewModal from './viewmodal.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Модели
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Текстуры
const textureLoader = new THREE.TextureLoader();

// Создание экземпляра объекта ViewModal
let viewModal = new ViewModal(textureLoader);

// Создание группы для источников света
const lightHolder = new THREE.Group();

// Создание и добавление освещения
const firstLight = new THREE.PointLight(0xffffff, 1);
firstLight.position.set(-1, 1, 3);
lightHolder.add(firstLight);
const secondLight = new THREE.PointLight(0xffffff, 1);
secondLight.position.set(1, 1, -3);

lightHolder.add(secondLight);

scene.add(lightHolder);

// Размеры
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Камера
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 1, 6);
scene.add(camera);

// Управление
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Рендерер
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
});
renderer.localClippingEnabled = true;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor('#4287f5', 1); // "#cfcfcf"

let bc = [
    '/textures/BaseColor/D1_wood1. DoorBase. BC.png',
    '/textures/BaseColor/D2_wood2. DoorBase. BC.png',
    '/textures/BaseColor/D3_BlackPlastic. DoorBase. BC.png',
    '/textures/BaseColor/H1_Silver. Handle. BC.png',
    '/textures/BaseColor/H2_Gold. Handle. BC.png',
    '/textures/BaseColor/H3_GlossyPlastic. Handle. BC.png',
    '/textures/BaseColor/W1_Glass. Window. BC.png',
    '/textures/BaseColor/W2_Mirror. Window. BC.png',
    '/textures/BaseColor/W3_MatteGlass. Window. BC.png'
];

let roughMet = [
    '/textures/RoughMet/D1_wood1. DoorBase. RM.png',
    '/textures/RoughMet/D2_wood2. DoorBase. RM.png',
    '/textures/RoughMet/D3_BlackPlastic. DoorBase. RM.png',
    '/textures/RoughMet/H1_Silver. Handle. RM.png',
    '/textures/RoughMet/H2_Gold. Handle. RM.png',
    '/textures/RoughMet/H3_GlossyPlastic. Handle. RM.png',
    '/textures/RoughMet/W1_Glass. Window. RM.png',
    '/textures/RoughMet/W2_Mirror. Window. RM.png',
    '/textures/RoughMet/W3_MatteGlass. Window. RM.png'
];
let nrm = [
    '/textures/NRM/D2_wood2. DoorBase. NRM.png' 
]

const addModel = [
    '/models/DoorSmall. Closed.glb',
    '/models/DoorSmall. Open1.glb',
    '/models/DoorBig. Closed.glb',
    '/models/DoorBig. Open1.glb',
];

let currentModel;

let firstBaseMaterial, secondBaseMaterial, thirdBaseMaterial;

viewModal.processTextures(bc, roughMet, nrm);

// Prepare all material data
viewModal.prepareMaterialData();

console.log(viewModal.firstTextures);
console.log(viewModal.secondTextures);
console.log(viewModal.thirdTextures);     

// Загрузка и замена модели
function switchModel(index) {
    let modelsDiv = document.getElementById("models");
    modelsDiv.innerHTML = '';
    // Пример использования для моделей
    viewModal.createButtonsModels(
        addModel,
        "Модель №",
        "modelButton",
        function(idx) {
            switchModel(idx);
        },
        modelsDiv
    );
    // Удаляем текущую модель, если она существует
    if (currentModel) {
        scene.remove(currentModel);
    }

// Загружаем новую модель
gltfLoader.load(addModel[index], (gltf) => {
    currentModel = gltf.scene;
    currentModel.rotation.y = 1.58;
    currentModel.position.y = -0.8;

    const materials = [];
    currentModel.traverse((node) => {
        if (node.isMesh) {
            const material = node.material;
            if (material) {
                materials.push(material);
            }
        }
    });

    // Пример обращения к материалам по индексу
    firstBaseMaterial = materials[0];
    secondBaseMaterial = materials[1];
    thirdBaseMaterial = materials[2];

    // Добавляем новую модель в сцену
    scene.add(currentModel);
}, undefined, (error) => {
    console.error('An error happened', error);
});

}

// Инициализация интерфейса и загрузка первой модели
switchModel(0);

// Функция для замены материалов
document.addEventListener('DOMContentLoaded', (event) => {
    let materialsDiv = document.getElementById("materials");
    materialsDiv.innerHTML = '';

    viewModal.createButtonsMaterials(
        viewModal.firstMaterials,
        "Полотно",
        "button",
        function(index) {
            viewModal.accessMaterial(firstBaseMaterial, viewModal.firstMaterials, index);
        },
        materialsDiv
    );

    viewModal.createButtonsMaterials(
        viewModal.secondMaterials,
        "Ручка",
        "button",
        function(index) {
            viewModal.accessMaterial(secondBaseMaterial, viewModal.secondMaterials, index);
        },
        materialsDiv
    );

    viewModal.createButtonsMaterials(
        viewModal.thirdMaterials,
        "Окно",
        "button",
        function(index) {
            viewModal.accessMaterial(thirdBaseMaterial, viewModal.thirdMaterials, index);
        },
        materialsDiv
    );
});

// Обновление сцены
const tick = () => {
    controls.update();
    renderer.render(scene, camera);
    firstLight.quaternion.copy(camera.quaternion);
    secondLight.quaternion.copy(camera.quaternion);
    window.requestAnimationFrame(tick);
};

tick();
