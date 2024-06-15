// viewModel.js
export default class ViewModal {
    constructor() {
        this.firstTextures = {};
        this.secondTextures = {};
        this.thirdTextures = {};
    }

    getKey(url) {
        const match = url.match(/\/([DHW])(\d)_/);
        if (match) {
            return { letter: match[1], number: match[2] };
        }
        return null;
    }

    accessRough(textures, textureKey, url) {
        if (textures[textureKey]) {
            textures[textureKey].roughnessMap = url;
        } else {
            textures[textureKey] = { roughnessMap: url };
        }
    }

    accessNRM(textures, textureKey, url) {
        if (textures[textureKey]) {
            textures[textureKey].normalMap = url;
        } else {
            textures[textureKey] = { normalMap: url };
        }
    }
//---------------------------------------------
    processTextures(bc, roughMet, nrm) {
        bc.forEach((url) => {
            const key = this.getKey(url);
            if (key) {
                const textureKey = `${key.letter.toLowerCase()}Texture${key.number}`;
                if (key.letter === 'D') {
                    this.firstTextures[textureKey] = { map: url };
                    
                } else if (key.letter === 'H') {
                    this.secondTextures[textureKey] = { map: url };
                } else if (key.letter === 'W') {
                    this.thirdTextures[textureKey] = { map: url };
                }
            }
        });

        roughMet.forEach((url) => {
            const key = this.getKey(url);
            if (key) {
                const textureKey = `${key.letter.toLowerCase()}Texture${key.number}`;
                if (key.letter === 'D') {
                    this.accessRough(this.firstTextures, textureKey, url);
                } else if (key.letter === 'H') {
                    this.accessRough(this.secondTextures, textureKey, url);
                } else if (key.letter === 'W') {
                    this.accessRough(this.thirdTextures, textureKey, url);
                }
            }
        });

        nrm.forEach((url) => {
            const key = this.getKey(url);
            if (key) {
                const textureKey = `${key.letter.toLowerCase()}Texture${key.number}`;
                if (key.letter === 'D') {
                    this.accessNRM(this.firstTextures, textureKey, url);
                } else if (key.letter === 'H') {
                    this.accessNRM(this.secondTextures, textureKey, url);
                } else if (key.letter === 'W') {
                    this.accessNRM(this.thirdTextures, textureKey, url);
                }
            }
        });
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
    accessMaterial(doorBaseMaterial,doorMaterial){
        if (doorBaseMaterial) {
            doorBaseMaterial.map = doorMaterial.map;
            doorBaseMaterial.roughnessMap = doorMaterial.roughnessMap;
            doorBaseMaterial.normalMap = doorMaterial.normalMap;
        }
    }
}
