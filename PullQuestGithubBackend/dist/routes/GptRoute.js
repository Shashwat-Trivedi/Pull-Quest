"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GptController_1 = require("../controllers/GptController");
const router = (0, express_1.Router)();
router.post("/code", GptController_1.handleCodeReview);
router.post("/full-review", GptController_1.fullReview);
exports.default = router;
//# sourceMappingURL=GptRoute.js.map