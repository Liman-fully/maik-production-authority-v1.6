"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionClassifier = void 0;
const fs = require("fs");
const path = require("path");
class PositionClassifier {
    constructor() {
        this.industries = [];
        this.functions = [];
        this.positionMap = new Map();
        this.positionKeywords = new Map();
        this.loadRules();
        this.loadPositionKeywords();
    }
    loadPositionKeywords() {
        const keywordsDir = path.join(__dirname, '../../../../resume-classification-rules/keywords');
        if (!fs.existsSync(keywordsDir)) {
            console.warn('[PositionClassifier] Keywords directory not found:', keywordsDir);
            return;
        }
        const functionCodes = fs.readdirSync(keywordsDir).filter(f => f.startsWith('F'));
        for (const funcCode of functionCodes) {
            const funcDir = path.join(keywordsDir, funcCode);
            if (!fs.statSync(funcDir).isDirectory())
                continue;
            const files = fs.readdirSync(funcDir).filter(f => f.endsWith('.json'));
            for (const file of files) {
                const filePath = path.join(funcDir, file);
                try {
                    const pk = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                    this.positionKeywords.set(pk.positionName, pk);
                }
                catch (e) {
                    console.warn(`[PositionClassifier] Failed to load ${filePath}:`, e);
                }
            }
        }
        console.log(`[PositionClassifier] Loaded ${this.positionKeywords.size} position keyword files`);
    }
    loadRules() {
        const rulesPath = path.join(__dirname, '../../../../resume-classification-rules/rules/classification_rules.json');
        if (!fs.existsSync(rulesPath)) {
            console.error('[PositionClassifier] Rules file not found:', rulesPath);
            console.error('[PositionClassifier] Current dir:', process.cwd());
            console.error('[PositionClassifier] Trying alternate path...');
            const altPath = path.join(process.cwd(), 'resume-classification-rules/rules/classification_rules.json');
            if (fs.existsSync(altPath)) {
                console.log('[PositionClassifier] Found rules at alternate path');
                const rules = JSON.parse(fs.readFileSync(altPath, 'utf-8'));
                this.industries = rules.industries.data;
                this.functions = rules.functions.data;
                for (const func of this.functions) {
                    if (func.positions) {
                        for (const position of func.positions) {
                            this.positionMap.set(position.toLowerCase(), func);
                        }
                    }
                }
                console.log(`[PositionClassifier] Loaded ${this.industries.length} industries, ${this.functions.length} functions, ${this.positionMap.size} positions`);
                return;
            }
            return;
        }
        const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));
        this.industries = rules.industries.data;
        this.functions = rules.functions.data;
        for (const func of this.functions) {
            if (func.positions) {
                for (const position of func.positions) {
                    this.positionMap.set(position.toLowerCase(), func);
                }
            }
        }
        console.log(`[PositionClassifier] Loaded ${this.industries} industries, ${this.functions.length} functions, ${this.positionMap.size} positions`);
    }
    classify(positionText) {
        const result = {
            confidence: 0,
            matchType: 'keyword',
            matchedKeywords: [],
        };
        const textLower = positionText.toLowerCase();
        const exactMatch = this.positionMap.get(textLower);
        if (exactMatch) {
            result.categoryCode = exactMatch.code;
            result.categoryName = exactMatch.name;
            result.positionName = positionText;
            result.confidence = 1.0;
            result.matchType = 'exact';
            result.matchedKeywords = [positionText];
            return result;
        }
        for (const [positionName, func] of this.positionMap.entries()) {
            if (textLower.includes(positionName)) {
                result.categoryCode = func.code;
                result.categoryName = func.name;
                result.positionName = positionName;
                result.confidence = 0.95;
                result.matchType = 'partial';
                result.matchedKeywords = [positionName];
                return result;
            }
        }
        const weightedResult = this.classifyWithWeights(positionText);
        if (weightedResult.confidence > 0.5) {
            return weightedResult;
        }
        return this.classifyByKeywords(positionText);
    }
    classifyWithWeights(text) {
        const result = {
            confidence: 0,
            matchType: 'weighted',
            matchedKeywords: [],
        };
        const scores = [];
        for (const func of this.functions) {
            const keywords = this.getWeightedKeywords(func.code);
            const score = this.calculateWeightedScore(text, keywords);
            if (score > 0.3) {
                scores.push({ func, score, keywords: [] });
            }
        }
        if (scores.length > 0) {
            scores.sort((a, b) => b.score - a.score);
            const best = scores[0];
            result.categoryCode = best.func.code;
            result.categoryName = best.func.name;
            result.positionName = text;
            result.confidence = Math.min(0.9, best.score);
            result.matchType = 'weighted';
            return result;
        }
        return result;
    }
    getWeightedKeywords(functionCode) {
        const keywords = [];
        for (const [positionName, pk] of this.positionKeywords.entries()) {
            if (pk.functionCode === functionCode && pk.keywords) {
                if (pk.keywords.layer1_core) {
                    for (const kw of pk.keywords.layer1_core) {
                        keywords.push({ keyword: kw, layer: 1, weight: 1.0 });
                    }
                }
                if (pk.keywords.layer2_framework) {
                    for (const kw of pk.keywords.layer2_framework) {
                        keywords.push({ keyword: kw, layer: 2, weight: 0.9 });
                    }
                }
                if (pk.keywords.layer3_tool) {
                    for (const kw of pk.keywords.layer3_tool) {
                        keywords.push({ keyword: kw, layer: 3, weight: 0.8 });
                    }
                }
                if (pk.keywords.layer4_skill) {
                    for (const kw of pk.keywords.layer4_skill) {
                        keywords.push({ keyword: kw, layer: 4, weight: 0.7 });
                    }
                }
                if (pk.keywords.layer5_exclude) {
                    for (const kw of pk.keywords.layer5_exclude) {
                        keywords.push({ keyword: kw, layer: 5, weight: -1.0 });
                    }
                }
            }
        }
        if (keywords.length === 0) {
            const func = this.functions.find(f => f.code === functionCode);
            if (func) {
                for (const kw of func.keywords) {
                    keywords.push({ keyword: kw, layer: 2, weight: 0.8 });
                }
            }
        }
        return keywords;
    }
    calculateWeightedScore(text, keywords) {
        let score = 0;
        let maxPositiveScore = 0;
        const matchedKeywords = [];
        const textLower = text.toLowerCase();
        for (const kw of keywords) {
            const kwLower = kw.keyword.toLowerCase();
            const escapedKw = kwLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const count = (textLower.match(new RegExp(escapedKw, 'g')) || []).length;
            if (count > 0) {
                matchedKeywords.push(kw.keyword);
                if (kw.weight > 0) {
                    score += kw.weight;
                    maxPositiveScore += kw.weight;
                    const freqBonus = Math.min((count - 1) * 0.1, 0.3);
                    score += freqBonus;
                    const position = textLower.indexOf(kwLower);
                    if (position >= 0 && position < 200) {
                        score += 0.2;
                    }
                }
                else {
                    score += kw.weight;
                }
            }
            else {
                maxPositiveScore += Math.max(0, kw.weight);
            }
        }
        const hasExcludeMatch = keywords.some(kw => kw.layer === 5 && textLower.includes(kw.keyword.toLowerCase()));
        if (hasExcludeMatch) {
            score = Math.min(score, 0.5);
        }
        const normalizedScore = maxPositiveScore > 0 ? Math.max(0, Math.min(1, score / maxPositiveScore)) : 0;
        if (normalizedScore >= 0.8) {
            return Math.min(0.9, normalizedScore);
        }
        else if (normalizedScore >= 0.6) {
            return normalizedScore;
        }
        else if (normalizedScore >= 0.4) {
            return normalizedScore;
        }
        else {
            return normalizedScore;
        }
    }
    classifyByKeywords(positionText) {
        const result = {
            confidence: 0,
            matchType: 'keyword',
            matchedKeywords: [],
        };
        const matchedKeywords = [];
        for (const func of this.functions) {
            for (const keyword of func.keywords) {
                if (positionText.toLowerCase().includes(keyword.toLowerCase())) {
                    matchedKeywords.push({ keyword, weight: 0.8 });
                }
            }
        }
        if (matchedKeywords.length > 0) {
            matchedKeywords.sort((a, b) => b.weight - a.weight);
            const bestMatch = this.functions.find(f => f.keywords.some(k => k.toLowerCase() === matchedKeywords[0].keyword.toLowerCase()));
            if (bestMatch) {
                result.categoryCode = bestMatch.code;
                result.categoryName = bestMatch.name;
                result.positionName = positionText;
                result.confidence = Math.min(0.8, 0.5 + matchedKeywords.length * 0.1);
                result.matchType = 'keyword';
                result.matchedKeywords = matchedKeywords.map(m => m.keyword);
                return result;
            }
        }
        result.confidence = 0;
        result.positionName = positionText;
        return result;
    }
    batchClassify(positions) {
        return positions.map(p => this.classify(p));
    }
    getIndustries() {
        return this.industries;
    }
    getFunctions() {
        return this.functions;
    }
    getPositionsByFunction(functionCode) {
        const func = this.functions.find(f => f.code === functionCode);
        return func?.positions || [];
    }
}
exports.PositionClassifier = PositionClassifier;
//# sourceMappingURL=position-classifier.js.map