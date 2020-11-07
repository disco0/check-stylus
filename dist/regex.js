"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.escapeRegex = void 0;
exports.escapeRegex = (string) => string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
