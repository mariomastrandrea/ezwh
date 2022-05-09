
class TestDescriptor {
    #id;
    #name;
    #procedureDescription;
    #skuId;

    constructor(id, name, procedureDescription, skuId) {
        this.#id = id;
        this.#name = name;
        this.#procedureDescription = procedureDescription;
        this.#skuId = skuId;
    }

    // getters
    getId = () => this.#id;
    getName = () => this.#name;
    getProcedureDescription = () => this.#procedureDescription;
    getSkuId = () => this.#skuId;

    // setters
    setName = (name) => this.#name = name;
    setProcedureDescription = (procedureDescription) => this.#procedureDescription = procedureDescription;
    setSkuId = (skuId) => this.#skuId = skuId;

    // to serialize object in JSON format
    toJSON = () => ({
        id: this.getId(),
        name: this.getName(),
        procedureDescription: this.getProcedureDescription(),
        skuId: this.getSkuId()
    });
}

module.exports = TestDescriptor;