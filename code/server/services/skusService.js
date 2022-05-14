const Sku = require('../models/sku');
const { int } = require("../utilities");

const {
    OK,
    CREATED,
    NO_CONTENT,
    NOT_FOUND,
    UNPROCESSABLE_ENTITY,
    INTERNAL_SERVER_ERROR,
    SERVICE_UNAVAILABLE
} = require("../statusCodes");

class SkusService {
    #dao;

    constructor(dao) {
        this.#dao = dao;
    }

    // GET /api/skus
    async getAllSkus() {
        let allSkus;

        // retrieve all Sku objects
        try {
            allSkus = await this.#dao.getAllSkus();

            // fill each of them with its test descriptors
            for (let sku of allSkus) {
                const testDescriptors = await this.#dao.getTestDescriptorsOf(sku.getId());
                sku.setTestDescriptors(testDescriptors);
            }
        }
        catch (err) {
            console.log(err);
            return INTERNAL_SERVER_ERROR();
        }

        return OK(allSkus);
    };

    async getSkuById(skuId) {
        let sku;

        try {
            skuId = int(skuId);
            sku = await this.#dao.getSkuById(skuId);

            if (!sku) return NOT_FOUND();

            // fill sku's test descriptors
            const testDescriptors = await this.#dao.getTestDescriptorsOf(skuId);
            sku.setTestDescriptors(testDescriptors);
        }
        catch (err) {
            console.log(err);
            return INTERNAL_SERVER_ERROR();
        }

        return OK(sku);
    };

    async createSku(description, weight, volume, notes, price, availableQuantity) {
        const newSku = new Sku(description, weight, volume, notes, price, availableQuantity);
        const createdSku = await this.#dao.storeSku(newSku);

        if (!createdSku)  // generic error during creation
            return SERVICE_UNAVAILABLE();

        return CREATED();    // new Sku successfully created
    };

    async updateSku(skuId, newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity) {

        const sku = await this.#dao.getSkuById(skuId);
        if (!sku) return NOT_FOUND();

        // if a new available quantity is provided and if the sku is already assigned to a
        // position, the total weight and the total volume must not exceed those of the position
        if (newAvailableQuantity && sku.getPosition()) {
            const position = await this.#dao.getPosition(sku.getPosition());

            if (!position) return SERVICE_UNAVAILABLE(); // db inconsistency error
               
            // check exceeding capacities
            if (!position.canHold(newAvailableQuantity, newWeight, newVolume)) 
                return UNPROCESSABLE_ENTITY("Exceeding capacities");

            position.setOccupiedWeight(newAvailableQuantity * newWeight);
            position.setOccupiedVolume(newAvailableQuantity * newVolume);

            const positionWasUpdated = await this.#dao.updatePosition(sku.getPosition(), position);

            if (!positionWasUpdated) 
                return SERVICE_UNAVAILABLE(); // general error during update
        }

        const newSku = new Sku(newDescription, newWeight, newVolume, newNotes,
            newPrice, newAvailableQuantity, sku.getPosition(), [], skuId);

        const skuWasUpdated = await this.#dao.updateSku(newSku);

        if (!skuWasUpdated) return SERVICE_UNAVAILABLE();  // general error during update
        return OK();  // sku successfully updated
    };

    async updateSkuPosition(skuId, newPositionId) {
        // check sku existence
        const sku = await this.#dao.getSkuById(skuId);

        if (!sku) // sku not found
            return NOT_FOUND(`Sku ${skuId} not found`);   

        // check position existence
        const position = await this.#dao.getPosition(newPositionId);

        if (!position) // position not found
            return NOT_FOUND(`Position ${newPositionId} not found`);

        // check position availability
        const tempSku = await this.#dao.getSkuOfPosition(newPositionId);

        if (tempSku) // position is already occupied
            return UNPROCESSABLE_ENTITY(`Position ${newPositionId} is already occupied`);

        // check position capacities
        if (!position.canHold(sku.getAvailableQuantity(), sku.getWeight(), sku.getVolume())) 
            return UNPROCESSABLE_ENTITY("Exceeding capacities for that Position");

        const oldPositionId = sku.getPosition();

        if (oldPositionId) {
            // * empty old position *
            const oldPosition = await this.#dao.getPosition(oldPositionId);

            if (!oldPosition) 
                return SERVICE_UNAVAILABLE(); // db inconsistency error

            oldPosition.setOccupiedWeight(0);
            oldPosition.setOccupiedVolume(0);
            const oldPositionWasUpdated = await this.#dao.updatePosition(oldPositionId, oldPosition);

            if (!oldPositionWasUpdated) // generic error during update
                return SERVICE_UNAVAILABLE();
        }

        // * update sku position *
        sku.setPosition(newPositionId);
        const skuPositionWasUpdated = await this.#dao.updateSku(sku);

        if (!skuPositionWasUpdated) // generic error during sku update
            return SERVICE_UNAVAILABLE();

        // * update new Position's occupied weight and volume *
        position.setOccupiedWeight(sku.getAvailableQuantity() * sku.getWeight());
        position.setOccupiedVolume(sku.getAvailableQuantity() * sku.getVolume());
        const positionWasUpdated = await this.#dao.updatePosition(newPositionId, position);

        if (!positionWasUpdated) // generic error during position update
            return SERVICE_UNAVAILABLE();

        return OK(); // position successfully updated
    };

    async deleteSku(skuId) {
        // check sku existence
        const sku = await this.#dao.getSkuById(skuId);
        if (!sku) return NOT_FOUND();   // sku not found

        // check related SkuItems existence
        const relatedSkuItems = await this.#dao.getSkuItemsOf(skuId);

        if(relatedSkuItems?.length > 0) // there are still SkuItems
            return UNPROCESSABLE_ENTITY("related SkuItems still present");
            
        // * delete sku *
        const skuWasDeleted = await this.#dao.deleteSku(skuId);

        if (!skuWasDeleted)     // generic error during deletion
            return SERVICE_UNAVAILABLE();

        const oldPositionId = sku.getPosition();
        
        if(oldPositionId) {
            // * empty associated Position *
            const oldPosition = await this.#dao.getPosition(oldPositionId);

            if (!oldPosition) 
                return SERVICE_UNAVAILABLE(); // db inconsistency error

            oldPosition.setOccupiedWeight(0);
            oldPosition.setOccupiedVolume(0);
            const oldPositionWasUpdated = await this.#dao.updatePosition(oldPositionId, oldPosition);

            if (!oldPositionWasUpdated) // generic error during update
                return SERVICE_UNAVAILABLE();
        }

        return NO_CONTENT();    // sku successfully deleted
    };
}

module.exports = SkusService;