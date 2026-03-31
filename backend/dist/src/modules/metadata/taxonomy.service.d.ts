import { ClassificationResult } from '../../common/classifiers/position-classifier';
export declare class TaxonomyService {
    private readonly logger;
    private classifier;
    constructor();
    private initializeClassifier;
    classify(text: string): Promise<ClassificationResult>;
    private qwenCorrection;
    getHierarchy(): {
        L1: string;
        L2: string;
        L3: string;
    };
}
