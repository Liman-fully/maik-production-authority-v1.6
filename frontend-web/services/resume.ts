import api from '../lib/api';

/**
 * 简历上传接口
 * 支持单文件上传、批量上传、邮箱拉取
 */
export interface UploadResponse {
  success: boolean;
  data: {
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    parseStatus: 'pending' | 'processing' | 'success' | 'failed';
    cosUrl?: string;
    createdAt: string;
  };
  message: string;
}

export interface Resume {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  parseStatus: string;
  parseError?: string;
  basicInfo?: any;
  score?: number;
  tier?: string;
  cosUrl?: string;
  createdAt: string;
}

export interface ResumeFilter {
  folderId?: string;
  keyword?: string;
  tier?: string;
  minScore?: number;
  maxScore?: number;
  page?: number;
  pageSize?: number;
}

export interface ResumeFolder {
  id: string;
  name: string;
  parentId?: string;
  order: number;
  createdAt: string;
}

export const resumeService = {
  /**
   * 上传简历文件（单文件）
   * @param file 文件对象
   * @param folderId 文件夹ID（可选）
   * @param onProgress 进度回调（可选）
   */
  uploadResume: (file: File, folderId?: string, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
      formData.append('folderId', folderId);
    }

    return api.post<UploadResponse>('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  },

  /**
   * 批量上传简历（多个文件）
   * @param files 文件列表
   * @param folderId 文件夹ID（可选）
   * @param onProgress 每个文件的上传进度回调
   */
  batchUploadResumes: async (
    files: File[],
    folderId?: string,
    onProgress?: (index: number, progress: number) => void
  ) => {
    const results = [];
    
    // 串行上传避免服务器压力（可配置为并行）
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await resumeService.uploadResume(files[i], folderId, (progress) => {
          onProgress?.(i, progress);
        });
        results.push({ success: true, data: result.data });
      } catch (error) {
        results.push({ 
          success: false, 
          error: error.response?.data?.message || error.message,
          fileName: files[i].name 
        });
      }
    }
    
    return results;
  },

  /**
   * 获取简历列表（支持筛选）
   */
  getResumes: (params?: ResumeFilter) => {
    return api.get<{ success: boolean; data: Resume[] }>('/resume/list', { params });
  },

  /**
   * 根据ID获取简历详情
   */
  getResumeById: (id: string) => {
    return api.get<{ success: boolean; data: Resume }>(`/resume/${id}`);
  },

  /**
   * 获取简历解析状态
   */
  getResumeStatus: (id: string) => {
    return api.get<{ success: boolean; data: { id: string; parseStatus: string; parseError?: string } }>(
      `/resume/${id}/status`
    );
  },

  /**
   * 轮询解析状态直到完成
   * @param id 简历ID
   * @param interval 轮询间隔（毫秒）
   * @param timeout 超时时间（毫秒）
   */
  waitForParsing: async (id: string, interval = 2000, timeout = 120000) => {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const { data } = await resumeService.getResumeStatus(id);
        
        if (data.parseStatus === 'success' || data.parseStatus === 'failed') {
          return data;
        }
        
        await new Promise(resolve => setTimeout(resolve, interval));
      } catch (error) {
        throw new Error(`获取解析状态失败: ${error.message}`);
      }
    }
    
    throw new Error('解析超时，请稍后重试');
  },

  /**
   * 删除简历
   */
  deleteResume: (id: string) => {
    return api.delete<{ success: boolean; message: string }>(`/resume/${id}`);
  },

  /**
   * 获取简历下载链接（预签名URL）
   */
  getDownloadUrl: (id: string) => {
    return api.get<{
      success: boolean;
      data: {
        url: string;
        fileName: string;
        fileSize: number;
      };
      message: string;
    }>(`/resume/${id}/download`);
  },

  /**
   * 创建文件夹
   */
  createFolder: (name: string, parentId?: string) => {
    return api.post<{ success: boolean; data: ResumeFolder }>('/resume/folder', {
      name,
      parentId,
    });
  },

  /**
   * 获取文件夹列表
   */
  getFolders: () => {
    return api.get<{ success: boolean; data: ResumeFolder[] }>('/resume/folders');
  },

  /**
   * 触发邮箱简历拉取
   */
  fetchFromEmail: () => {
    return api.post<{ success: boolean; message: string }>('/resume/fetch-from-email');
  },

  /**
   * 获取邮箱配置
   */
  getEmailConfig: () => {
    return api.get<{ success: boolean; data: any }>('/resume/email-config');
  },

  /**
   * 更新邮箱配置
   */
  updateEmailConfig: (config: {
    email: string;
    imapHost: string;
    imapPort: number;
    password: string;
  }) => {
    return api.post<{ success: boolean; data: any }>('/resume/email-config', config);
  },
};

export default resumeService;
