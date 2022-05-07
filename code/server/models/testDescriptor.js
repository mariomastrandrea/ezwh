class TestDescriptor{

    #id;
    #name;
    #procedureDescription;
    #skuId;

    constructor(id,name,procedureDescription,skuId){
        this.#id=id;
        this.#name=name;
        this.#procedureDescription=procedureDescription;
        this.#skuId=skuId;
    }

    getId = () => this.#id;
    getName = () => this.#name;
    getProcedureDescription = () => this.#procedureDescription;
    getSkuId = () => this.#skuId;

    setName = (name) => this.#name=name;
    setProcedureDescription = (procedureDescription) => this.#procedureDescription=procedureDescription;
    setSkuId = (skuId) => this.#skuId=skuId;

    toJSON = () => ({
        id: this.getId(),
        name: this.getName(),
        procedureDescription: this.getProcedureDescription(),
        skuId: this.getSkuId()
    });

}

module.exports = TestDescriptor;