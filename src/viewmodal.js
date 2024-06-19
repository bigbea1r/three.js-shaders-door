export default class ViewModal {
    constructor(textureLoader) {
        this.textureLoader = textureLoader;
        this.firstTextures = [];
        this.secondTextures = [];
        this.thirdTextures = [];

        this.firstMaterials = [];
        this.secondMaterials = [];
        this.thirdMaterials = [];
    }

    getKey(url) {
        const match = url.match(/\/([DHW])(\d)_/);
        if (match) {
            return { letter: match[1], number: match[2] };
        }
        return null;
    }

    accessTexture(textures, textureKey, url, mapType) {
        if (textures[textureKey]) {
            textures[textureKey][mapType] = url;
        } else {
            textures[textureKey] = { [mapType]: url };
        }
    }
    
    addTexture(url, mapType) {
        const key = this.getKey(url);
        if (key) {
            const textureKey = `${key.letter.toLowerCase()}Texture${key.number}`;
            let targetTextures;
            if (key.letter === 'D') {
                targetTextures = this.firstTextures;
            } else if (key.letter === 'H') {
                targetTextures = this.secondTextures;
            } else if (key.letter === 'W') {
                targetTextures = this.thirdTextures;
            }
            if (targetTextures) {
                this.accessTexture(targetTextures, textureKey, url, mapType);
            }
        }
    }
    
    processTextures(bc, roughMet, nrm) {
        bc.forEach((url) => {
            this.addTexture(url, 'map');
        });
    
        roughMet.forEach((url) => {
            this.addTexture(url, 'roughnessMap');
        });
    
        nrm.forEach((url) => {
            this.addTexture(url, 'normalMap');
        });
    }    

    prepareMaterialData() {
        this.firstMaterials = this.prepareTexturesData(this.firstTextures);
        this.secondMaterials = this.prepareTexturesData(this.secondTextures);
        this.thirdMaterials = this.prepareTexturesData(this.thirdTextures);
    }

    prepareTexturesData(textures) {
        let materialDataList = [];
        for (let key in textures) {
            if (textures.hasOwnProperty(key)) {
                let texture = textures[key];
                let materialData = {
                    map: this.textureLoader.load(texture.map),
                    roughnessMap: this.textureLoader.load(texture.roughnessMap),
                    normalMap: texture.normalMap ? this.textureLoader.load(texture.normalMap) : null,
                };
                materialDataList.push(materialData);
            }
        }
        return materialDataList;
    }

    createButtonsModels(items, textPrefix, idPrefix, clickHandler, container) {
        items.forEach((item, index) => {
            let button = document.createElement("button");
            button.innerHTML = `${textPrefix} ${index + 1}`;
            button.id = `${idPrefix}${index + 1}`;
            button.onclick = function() {
                clickHandler(index);
            };
            container.appendChild(button);
        });
    }

    createButtonsMaterials(items, textPrefix, idPrefix, clickHandler, container) {
        items.forEach((item, index) => {
            let button = document.createElement("button");
            button.innerHTML = `${textPrefix} ${index + 1}`;
            button.id = `${idPrefix}${index + 1}`;
            button.onclick = function() {
                clickHandler(index);
            };
            container.appendChild(button);
        });
    }

    accessMaterial(baseMaterial, materials, index) {
        if (baseMaterial && materials.length > index) {
            baseMaterial.map = materials[index].map;
            baseMaterial.roughnessMap = materials[index].roughnessMap;
            baseMaterial.normalMap = materials[index].normalMap;
            baseMaterial.needsUpdate = true;
        }
    }

    additionModel(gltfLoader, model) {
        return new Promise((resolve, reject) => {
            gltfLoader.load(
                model.nameModel,
                (gltf) => {
                    const loadedModel = gltf.scene;
                    resolve(loadedModel);
                },
                undefined,
                (error) => {
                    reject(`An error happened while loading the model ${model.nameModel}: ${error}`);
                }
            );
        });
    }
}
