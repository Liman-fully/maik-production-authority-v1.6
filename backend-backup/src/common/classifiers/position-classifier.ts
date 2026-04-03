import * as fs from 'fs';
import * as path from 'path';

export interface ClassificationRule {
  code: string;
  name: string;
  keywords: string[];
  positions?: string[];
}

interface KeywordMatch {
  keyword: string;
  layer: number;
  weight: number;
}

interface WeightedKeyword {
  keyword: string;
  layer: 1|2|3|4|5;
  weight: number;  // 1.0, 0.9, 0.8, 0.7, -1.0
}

interface PositionKeywords {
  positionCode?: string;
  positionName: string;
  functionCode?: string;
  keywords: {
    layer1_core?: string[];
    layer2_framework?: string[];
    layer3_tool?: string[];
    layer4_skill?: string[];
    layer5_exclude?: string[];
  };
}

export interface ClassificationResult {
  industryCode?: string;
  industryName?: string;
  categoryCode?: string;
  categoryName?: string;
  positionName?: string;
  confidence: number;
  matchType: 'exact' | 'partial' | 'weighted' | 'keyword';
  matchedKeywords: string[];
  score?: number;  // 加权评分（0-1）
}

export class PositionClassifier {
  private industries: ClassificationRule[] = [];
  private functions: ClassificationRule[] = [];
  private positionMap: Map<string, ClassificationRule> = new Map();
  private positionKeywords: Map<string, PositionKeywords> = new Map();

  constructor() {
    this.loadRules();
    this.loadPositionKeywords();
  }

  /**
   * 加载职位关键词池
   */
  private loadPositionKeywords() {
    const keywordsDir = path.join(__dirname, '../../../../resume-classification-rules/keywords');
    
    if (!fs.existsSync(keywordsDir)) {
      console.warn('[PositionClassifier] Keywords directory not found:', keywordsDir);
      return;
    }

    // 遍历所有职能目录
    const functionCodes = fs.readdirSync(keywordsDir).filter(f => f.startsWith('F'));
    
    for (const funcCode of functionCodes) {
      const funcDir = path.join(keywordsDir, funcCode);
      if (!fs.statSync(funcDir).isDirectory()) continue;

      // 读取该职能下所有职位关键词文件
      const files = fs.readdirSync(funcDir).filter(f => f.endsWith('.json'));
      
      for (const file of files) {
        const filePath = path.join(funcDir, file);
        try {
          const pk: PositionKeywords = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          this.positionKeywords.set(pk.positionName, pk);
        } catch (e) {
          console.warn(`[PositionClassifier] Failed to load ${filePath}:`, e);
        }
      }
    }

    console.log(`[PositionClassifier] Loaded ${this.positionKeywords.size} position keyword files`);
  }

  /**
   * 加载规则（从 JSON 文件）
   */
  private loadRules() {
    const rulesPath = path.join(
      __dirname,
      '../../../../resume-classification-rules/rules/classification_rules.json'
    );

    if (!fs.existsSync(rulesPath)) {
      console.error('[PositionClassifier] Rules file not found:', rulesPath);
      console.error('[PositionClassifier] Current dir:', process.cwd());
      console.error('[PositionClassifier] Trying alternate path...');
      
      // 尝试备用路径
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

    // 加载行业规则
    this.industries = rules.industries.data;

    // 加载职能规则
    this.functions = rules.functions.data;

    // 构建职位映射（职位名 → 职能规则）
    for (const func of this.functions) {
      if (func.positions) {
        for (const position of func.positions) {
          this.positionMap.set(position.toLowerCase(), func);
        }
      }
    }

    console.log(`[PositionClassifier] Loaded ${this.industries} industries, ${this.functions.length} functions, ${this.positionMap.size} positions`);
  }

  /**
   * 分类职位名称（加权评分优化版）
   */
  classify(positionText: string): ClassificationResult {
    const result: ClassificationResult = {
      confidence: 0,
      matchType: 'keyword',
      matchedKeywords: [],
    };

    const textLower = positionText.toLowerCase();

    // 1. 精确匹配职位（最高优先级，confidence=1.0）
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

    // 2. 包含匹配职位（confidence=0.9-0.95）
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

    // 3. 加权评分匹配（优化版，confidence=0.5-0.9）
    const weightedResult = this.classifyWithWeights(positionText);
    if (weightedResult.confidence > 0.5) {
      return weightedResult;
    }

    // 4. 降级：简单关键词匹配
    return this.classifyByKeywords(positionText);
  }

  /**
   * 加权评分分类（5 层关键词）
   */
  private classifyWithWeights(text: string): ClassificationResult {
    const result: ClassificationResult = {
      confidence: 0,
      matchType: 'weighted',
      matchedKeywords: [],
    };

    // 为每个职能计算加权评分
    const scores: { func: ClassificationRule; score: number; keywords: string[] }[] = [];

    for (const func of this.functions) {
      // 加载该职能下所有职位的关键词池
      const keywords = this.getWeightedKeywords(func.code);
      const score = this.calculateWeightedScore(text, keywords);
      
      if (score > 0.3) {  // 降低阈值
        scores.push({ func, score, keywords: [] });
      }
    }

    if (scores.length > 0) {
      // 取最高分
      scores.sort((a, b) => b.score - a.score);
      const best = scores[0];
      
      result.categoryCode = best.func.code;
      result.categoryName = best.func.name;
      result.positionName = text;
      result.confidence = Math.min(0.9, best.score);  // 上限 0.9
      result.matchType = 'weighted';
      
      return result;
    }

    return result;
  }

  /**
   * 获取加权关键词列表
   */
  private getWeightedKeywords(functionCode: string): WeightedKeyword[] {
    const keywords: WeightedKeyword[] = [];
    
    // 从职位关键词池加载
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

    // 如果职位关键词池为空，使用职能的通用关键词
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

  /**
   * 计算加权评分（参考 Python 实现，添加词频和位置加分）
   */
  private calculateWeightedScore(text: string, keywords: WeightedKeyword[]): number {
    let score = 0;
    let maxPositiveScore = 0;
    const matchedKeywords: string[] = [];
    const textLower = text.toLowerCase();

    for (const kw of keywords) {
      const kwLower = kw.keyword.toLowerCase();
      // 转义正则表达式特殊字符（如 C++ 中的 +）
      const escapedKw = kwLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const count = (textLower.match(new RegExp(escapedKw, 'g')) || []).length;
      
      if (count > 0) {
        matchedKeywords.push(kw.keyword);
        
        if (kw.weight > 0) {
          // 基础权重
          score += kw.weight;
          maxPositiveScore += kw.weight;
          
          // 词频加分（上限 0.3，参考 Python 实现）
          const freqBonus = Math.min((count - 1) * 0.1, 0.3);
          score += freqBonus;
          
          // 位置加分（前 200 字符内 +0.2，参考 Python 实现）
          const position = textLower.indexOf(kwLower);
          if (position >= 0 && position < 200) {
            score += 0.2;
          }
        } else {
          // 排除词：直接降低评分
          score += kw.weight;
        }
      } else {
        maxPositiveScore += Math.max(0, kw.weight);
      }
    }

    // 如果有排除词匹配，大幅降低置信度
    const hasExcludeMatch = keywords.some(kw => 
      kw.layer === 5 && textLower.includes(kw.keyword.toLowerCase())
    );
    
    if (hasExcludeMatch) {
      // 有排除词时，置信度上限 0.5
      score = Math.min(score, 0.5);
    }

    // 归一化到 0-1
    const normalizedScore = maxPositiveScore > 0 ? Math.max(0, Math.min(1, score / maxPositiveScore)) : 0;
    
    // 置信度分级
    if (normalizedScore >= 0.8) {
      return Math.min(0.9, normalizedScore);  // 强匹配上限 0.9
    } else if (normalizedScore >= 0.6) {
      return normalizedScore;  // 良好匹配
    } else if (normalizedScore >= 0.4) {
      return normalizedScore;  // 一般匹配
    } else {
      return normalizedScore;  // 弱匹配
    }
  }

  /**
   * 简单关键词匹配（降级方案）
   */
  private classifyByKeywords(positionText: string): ClassificationResult {
    const result: ClassificationResult = {
      confidence: 0,
      matchType: 'keyword',
      matchedKeywords: [],
    };

    const matchedKeywords: { keyword: string; weight: number }[] = [];
    
    for (const func of this.functions) {
      for (const keyword of func.keywords) {
        if (positionText.toLowerCase().includes(keyword.toLowerCase())) {
          matchedKeywords.push({ keyword, weight: 0.8 });
        }
      }
    }

    if (matchedKeywords.length > 0) {
      matchedKeywords.sort((a, b) => b.weight - a.weight);
      const bestMatch = this.functions.find(f => 
        f.keywords.some(k => k.toLowerCase() === matchedKeywords[0].keyword.toLowerCase())
      );
      
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

  /**
   * 批量分类
   */
  batchClassify(positions: string[]): ClassificationResult[] {
    return positions.map(p => this.classify(p));
  }

  /**
   * 获取所有行业
   */
  getIndustries(): ClassificationRule[] {
    return this.industries;
  }

  /**
   * 获取所有职能
   */
  getFunctions(): ClassificationRule[] {
    return this.functions;
  }

  /**
   * 根据职能编码获取职位列表
   */
  getPositionsByFunction(functionCode: string): string[] {
    const func = this.functions.find(f => f.code === functionCode);
    return func?.positions || [];
  }
}
