"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyController = void 0;
const property_service_1 = require("./property.service");
class PropertyController {
    constructor() {
        this.searchProperties = async (req, res, next) => {
            try {
                const { city, checkIn, checkOut, guests, sortBy, minPrice, maxPrice, amenities, page, limit } = req.query;
                const searchParams = {
                    city: city,
                    checkIn: checkIn,
                    checkOut: checkOut,
                    guests: guests ? parseInt(guests) : undefined,
                    sortBy: sortBy,
                    minPrice: minPrice,
                    maxPrice: maxPrice,
                    amenities: amenities ? amenities.split(',').filter(Boolean) : undefined,
                    page: page ? parseInt(page) : undefined,
                    limit: limit ? parseInt(limit) : undefined
                };
                const result = await this.propertyService.searchProperties(searchParams);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getPropertyById = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                const result = await this.propertyService.getPropertyById(id);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.getPropertyPrices = async (req, res, next) => {
            try {
                const id = parseInt(req.params.id);
                const roomId = parseInt(req.query.roomId);
                const month = req.query.month;
                const result = await this.propertyService.getPropertyPrices(id, roomId, month);
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        };
        this.propertyService = new property_service_1.PropertyService();
    }
}
exports.PropertyController = PropertyController;
