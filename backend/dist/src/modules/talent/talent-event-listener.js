"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TalentEventListener = void 0;
const typeorm_1 = require("typeorm");
const talent_entity_1 = require("./talent.entity");
let TalentEventListener = class TalentEventListener {
    listenTo() {
        return talent_entity_1.Talent;
    }
    async afterInsert(event) {
        await this.clearSearchCache(event.connection);
    }
    async afterUpdate(event) {
        await this.clearSearchCache(event.connection);
    }
    async afterRemove(event) {
        await this.clearSearchCache(event.connection);
    }
    async clearSearchCache(connection) {
        try {
            const redis = connection.options.extra?.redisService;
            if (!redis) {
                console.warn('[TalentEventListener] RedisService not found in connection options');
                return;
            }
            const client = redis.getClient();
            const keys = await client.keys('talent:search:*');
            if (keys.length > 0) {
                await client.del(...keys);
                console.log(`[Cache] Cleared ${keys.length} search cache entries`);
            }
        }
        catch (error) {
            console.error('[TalentEventListener] Failed to clear cache:', error.message);
        }
    }
};
exports.TalentEventListener = TalentEventListener;
exports.TalentEventListener = TalentEventListener = __decorate([
    (0, typeorm_1.EventSubscriber)()
], TalentEventListener);
//# sourceMappingURL=talent-event-listener.js.map