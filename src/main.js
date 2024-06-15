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

// Создание экземпляра объекта ViewModal
let viewModal = new ViewModal();

// Модели
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// Текстуры
const textureLoader = new THREE.TextureLoader();


let bc = [
    '/textures/BaseColor/D2_wood2. DoorBase. BC.png',
    '/textures/BaseColor/D1_wood1. DoorBase. BC.png',
    '/textures/BaseColor/H1_Silver. Handle. BC.png',
    '/textures/BaseColor/W1_Glass. Window. BC.png',
    '/textures/BaseColor/D3_BlackPlastic. DoorBase. BC.png',
    '/textures/BaseColor/H2_Gold. Handle. BC.png',
    '/textures/BaseColor/H3_GlossyPlastic. Handle. BC.png',
    '/textures/BaseColor/W2_Mirror. Window. BC.png',
    '/textures/BaseColor/W3_MatteGlass. Window. BC.png'
];

let roughMet = [
    '/textures/RoughMet/D1_wood1. DoorBase. RM.png',
    '/textures/RoughMet/H1_Silver. Handle. RM.png',
    '/textures/RoughMet/D2_wood2. DoorBase. RM.png',
    '/textures/RoughMet/H2_Gold. Handle. RM.png',
    '/textures/RoughMet/D3_BlackPlastic. DoorBase. RM.png',
    '/textures/RoughMet/H3_GlossyPlastic. Handle. RM.png',
    '/textures/RoughMet/W1_Glass. Window. RM.png',
    '/textures/RoughMet/W2_Mirror. Window. RM.png',
    '/textures/RoughMet/W3_MatteGlass. Window. RM.png'
];
let nrm = [
    '/textures/NRM/D2_wood2. DoorBase. NRM.png' 
]
viewModal.processTextures(bc, roughMet, nrm);

// Создание материалов
const createMaterials = (textures) => {
    let materials = [];
    for (let key in textures) {
        if (textures.hasOwnProperty(key)) {
            let texture = textures[key];
            let material = new THREE.MeshPhysicalMaterial({
                map: new THREE.TextureLoader().load(texture.map),
                roughnessMap: new THREE.TextureLoader().load(texture.roughnessMap),
                normalMap: texture.normalMap ? new THREE.TextureLoader().load(texture.normalMap) : null,
            });
            materials.push(material);
        }
    }
    return materials;
};

const firstMaterials = createMaterials(viewModal.firstTextures);
const secondMaterials = createMaterials(viewModal.secondTextures);
const thirdMaterials = createMaterials(viewModal.thirdTextures);
console.log(firstMaterials)
console.log(secondMaterials)
console.log(thirdMaterials)

const addModel = [
    {id:1, nameModel:'/models/DoorSmall. Closed.glb'}
    // {id:2, nameModel:'/models/DoorSmall. Open1.glb'},
    // {id:3, nameModel:'/models/DoorBig. Closed.glb'},
    // {id:4, nameModel:'/models/DoorBig. Open1.glb'}
];

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
renderer.setClearColor('#00ff00', 1); // "#cfcfcf"

let one = document.getElementById("1")
let two = document.getElementById("2")
let three = document.getElementById("3")

let doorBaseMaterial, handleBaseMaterial, windowBaseMaterial;

one.addEventListener('click', replaceMaterials);

// Загрузка моделей и добавление в сцену
addModel.forEach(model => {
    viewModal.additionModel(gltfLoader, model)
        .then(loadedModel => {
            loadedModel.rotation.y = 1.58;
            loadedModel.position.y = -0.8;
            const materials = {};
            console.log(materials)

            loadedModel.traverse((node) => {
                if (node.isMesh) {
                    const material = node.material;
                    // Убедитесь, что имена материалов совпадают с ожидаемыми
                    if (material.name) {
                        materials[material.name] = material;
                    }
                }
            });

            // Извлечение конкретных материалов из объекта materials
            doorBaseMaterial = materials['M1_DoorBase'];
            handleBaseMaterial = materials['M2_Hanlde'];
            windowBaseMaterial = materials['M3_Window'];

            // Добавление загруженной модели в сцену
            scene.add(loadedModel);

        })
        .catch(error => {
            console.error(error);
        });
});


// Функция для замены материалов
function replaceMaterials(buttonId) {
    let index = 0;
    if (buttonId === 'one') {
        index = 0;
    } else if (buttonId === 'two') {
        index = 1;
    } else if (buttonId === 'three') {
        index = 2;
    }

    // Проверка наличия материала и наличия текстуры с заданным индексом
    if (doorBaseMaterial && firstMaterials.length > index) {
        doorBaseMaterial.map = firstMaterials[index].map;
        doorBaseMaterial.roughnessMap = firstMaterials[index].roughnessMap;
        doorBaseMaterial.normalMap = firstMaterials[index].normalMap;
        doorBaseMaterial.needsUpdate = true;
    }

    if (handleBaseMaterial && secondMaterials.length > index) {
        handleBaseMaterial.map = secondMaterials[index].map;
        handleBaseMaterial.roughnessMap = secondMaterials[index].roughnessMap;
        handleBaseMaterial.normalMap = secondMaterials[index].normalMap;
        handleBaseMaterial.needsUpdate = true;
    }

    if (windowBaseMaterial && thirdMaterials.length > index) {
        windowBaseMaterial.map = thirdMaterials[index].map;
        windowBaseMaterial.roughnessMap = thirdMaterials[index].roughnessMap;
        windowBaseMaterial.normalMap = thirdMaterials[index].normalMap;
        windowBaseMaterial.needsUpdate = true;
    }
}


// Назначение обработчиков событий для кнопок
one.addEventListener('click', () => replaceMaterials('one'));
two.addEventListener('click', () => replaceMaterials('two'));
three.addEventListener('click', () => replaceMaterials('three'));

// Назначение обработчика событий для кнопки one
// 
// Обновление сцены
const tick = () => {
    controls.update();
    renderer.render(scene, camera);
    firstLight.quaternion.copy(camera.quaternion);
    secondLight.quaternion.copy(camera.quaternion);
    window.requestAnimationFrame(tick);
};

tick();
