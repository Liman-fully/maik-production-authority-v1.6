/**
 * 🔱 Huntlink Level Calibration Service
 * 针对大厂保密协议：将具体职级转换为标准势能标签
 */
export class LevelCalibration {
  private levelMapping = {
    'BYTEDANCE': { 'P7': '高级/总监级', 'P8': '资深专家' },
    'ALIBABA': { 'P7': '高级专家', 'P8': '资深专家' }
  };

  standardize(company: string, rawLevel: string) {
    // 将保密职级转化为公众可见的“势能头衔”
    return this.levelMapping[company]?.[rawLevel] || '资深职场人';
  }

  isLogicPlausible(years: number, reportedLevel: string) {
    // 逻辑判定：如 2 年经验报 P8 自动限流
    if (years < 5 && reportedLevel === 'P8') return false;
    return true;
  }
}
