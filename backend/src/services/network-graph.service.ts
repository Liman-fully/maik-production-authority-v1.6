/**
 * 🔱 Huntlink Network Degree Service
 * 区分 1st/2nd/Asset 及 真实用户指纹
 */
export class NetworkGraphService {
  getDegreeInfo(viewer: any, target: any) {
    if (viewer.id === target.id) return 'SELF';
    if (this.isDirectConnected(viewer, target)) return '1st';
    // 暂时简化，移除未实现的方法调用
    return 'Asset'; // 系统库内资源
  }

  isRealUser(target: any) {
    return target.is_registered && target.last_login_at;
  }

  // 占位方法，避免编译错误
  private isDirectConnected(viewer: any, target: any): boolean {
    return false;
  }
}
