import { EntitySubscriberInterface, UpdateEvent, RemoveEvent, InsertEvent } from 'typeorm';
import { Talent } from './talent.entity';
export declare class TalentEventListener implements EntitySubscriberInterface<Talent> {
    listenTo(): typeof Talent;
    afterInsert(event: InsertEvent<Talent>): Promise<void>;
    afterUpdate(event: UpdateEvent<Talent>): Promise<void>;
    afterRemove(event: RemoveEvent<Talent>): Promise<void>;
    private clearSearchCache;
}
