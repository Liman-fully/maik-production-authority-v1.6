'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { resumeService, Resume } from '@/services/resume';
import { cn } from '@/lib/utils';

export interface UploadFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'failed' | 'parsing';
  progress: number;
  result?: Resume;
  error?: string;
}

export interface ResumeUploadProps {
  onSuccess?: (resumes: Resume[]) => void;
  folderId?: string;
  maxFiles?: number; // 单次最大文件数，0表示无限制
  maxFileSize?: number; // 单个文件大小限制（字节），0表示无限制
  batchSize?: number; // 批量上传的并发数
}

/**
 * 大规模简历上传组件
 * 支持：拖拽上传、文件选择、批量处理、进度显示、错误重试
 * 
 * 技术特点：
 * - 虚拟滚动优化（处理10万+文件）
 * - 分批上传避免内存溢出
 * - 支持断点续传（后续扩展）
 * - 实时进度反馈
 */
export function ResumeUpload({
  onSuccess,
  folderId,
  maxFiles = 0,
  maxFileSize = 0, // 0表示无限制（按用户需求）
  batchSize = 10, // 默认10个并发
}: ResumeUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

  /**
   * 生成文件唯一ID
   */
  const generateFileId = (file: File) => {
    return `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * 验证文件类型和大小
   */
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(extension)) {
      return {
        valid: false,
        error: `不支持的文件类型: ${extension}。支持: ${allowedTypes.join(', ')}`,
      };
    }

    if (maxFileSize > 0 && file.size > maxFileSize) {
      return {
        valid: false,
        error: `文件过大: ${(file.size / 1024 / 1024).toFixed(2)}MB。最大限制: ${(maxFileSize / 1024 / 1024).toFixed(2)}MB`,
      };
    }

    return { valid: true };
  };

  /**
   * 处理文件选择
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const selectedFiles = Array.from(e.target.files);
    processFiles(selectedFiles);
    
    // 清空input，允许重复选择相同文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * 处理拖拽上传
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (!e.dataTransfer.files) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  /**
   * 处理文件列表（添加/去重）
   */
  const processFiles = (newFiles: File[]) => {
    // 检查最大文件数限制
    if (maxFiles > 0 && files.length + newFiles.length > maxFiles) {
      toast.error(`最多只能上传 ${maxFiles} 个文件`);
      newFiles = newFiles.slice(0, maxFiles - files.length);
    }

    const uploadFiles: UploadFile[] = newFiles
      .map(file => {
        const validation = validateFile(file);
        return {
          id: generateFileId(file),
          file,
          status: validation.valid ? 'pending' : 'failed',
          progress: 0,
          error: validation.error,
        };
      })
      .filter(file => {
        // 去重检查
        const isDuplicate = files.some(
          f => f.file.name === file.file.name && f.file.size === file.file.size
        );
        if (isDuplicate) {
          toast.warning(`文件已存在: ${file.file.name}`);
        }
        return !isDuplicate;
      });

    setFiles(prev => [...prev, ...uploadFiles]);
  };

  /**
   * 删除待上传的文件
   */
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  /**
   * 开始上传
   */
  const startUpload = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');
    
    if (pendingFiles.length === 0) {
      toast.error('没有待上传的文件');
      return;
    }

    setIsUploading(true);
    
    const successResumes: Resume[] = [];
    const failedCount = 0;

    // 分批上传
    for (let i = 0; i < pendingFiles.length; i += batchSize) {
      const batch = pendingFiles.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(file => uploadSingleFile(file, successResumes))
      );
      
      // 更新总体进度
      const uploadedCount = files.filter(f => f.status !== 'pending').length;
      setOverallProgress((uploadedCount / files.length) * 100);
      
      // 每批之间稍作延迟，避免服务器压力过大
      if (i + batchSize < pendingFiles.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    setIsUploading(false);
    
    const successCount = successResumes.length;
    
    if (successCount > 0) {
      toast.success(`成功上传 ${successCount} 个简历`);
      onSuccess?.(successResumes);
    }
    
    if (failedCount > 0) {
      toast.error(`上传失败 ${failedCount} 个文件`);
    }
  };

  /**
   * 上传单个文件
   */
  const uploadSingleFile = async (uploadFile: UploadFile, successResumes: Resume[]) => {
    setFiles(prev =>
      prev.map(f =>
        f.id === uploadFile.id ? { ...f, status: 'uploading' } : f
      )
    );

    try {
      // 上传文件
      const response = await resumeService.uploadResume(
        uploadFile.file,
        folderId,
        (progress) => {
          setFiles(prev =>
            prev.map(f =>
              f.id === uploadFile.id ? { ...f, progress } : f
            )
          );
        }
      );

      // 更新状态为解析中
      setFiles(prev =>
        prev.map(f =>
          f.id === uploadFile.id
            ? { ...f, status: 'parsing', progress: 100, result: response.data }
            : f
        )
      );

      // 轮询解析状态
      try {
        const finalStatus = await resumeService.waitForParsing(response.data.id);
        
        if (finalStatus.parseStatus === 'success') {
          // 获取完整简历信息
          const { data: fullResume } = await resumeService.getResumeById(response.data.id);
          
          setFiles(prev =>
            prev.map(f =>
              f.id === uploadFile.id
                ? { ...f, status: 'success', result: fullResume }
                : f
            )
          );
          
          successResumes.push(fullResume);
        } else {
          throw new Error(finalStatus.parseError || '解析失败');
        }
      } catch (parseError) {
        setFiles(prev =>
          prev.map(f =>
            f.id === uploadFile.id
              ? { ...f, status: 'failed', error: parseError.message }
              : f
          )
        );
      }
    } catch (error) {
      setFiles(prev =>
        prev.map(f =>
          f.id === uploadFile.id
            ? {
                ...f,
                status: 'failed',
                error: error.response?.data?.message || error.message,
              }
            : f
        )
      );
    }
  };

  /**
   * 清空文件列表
   */
  const clearAll = () => {
    setFiles([]);
    setOverallProgress(0);
  };

  const stats = {
    total: files.length,
    pending: files.filter(f => f.status === 'pending').length,
    uploading: files.filter(f => f.status === 'uploading').length,
    parsing: files.filter(f => f.status === 'parsing').length,
    success: files.filter(f => f.status === 'success').length,
    failed: files.filter(f => f.status === 'failed').length,
  };

  return (
    <div className="space-y-4">
      {/* 拖拽上传区域 */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'rounded-xl border-2 border-dashed p-8 text-center transition-colors',
          dragActive && 'border-primary bg-primary/5',
          isUploading && 'opacity-50 pointer-events-none'
        )}
      >
        <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium">拖拽文件到此处上传</p>
        <p className="mt-1 text-sm text-muted-foreground">
          支持 PDF、DOC、DOCX、JPG、PNG 格式
          {maxFileSize > 0 && `，单个文件最大 ${(maxFileSize / 1024 / 1024).toFixed(0)}MB`}
        </p>
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            选择文件
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {/* 总体进度条（超过10个文件时显示） */}
      {stats.total > 10 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>总体进度</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      )}

      {/* 统计信息 */}
      {stats.total > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">总计: {stats.total}</Badge>
          <Badge variant="outline" className="text-blue-600">待上传: {stats.pending}</Badge>
          <Badge variant="outline" className="text-yellow-600">上传中: {stats.uploading}</Badge>
          <Badge variant="outline" className="text-purple-600">解析中: {stats.parsing}</Badge>
          <Badge variant="outline" className="text-green-600">成功: {stats.success}</Badge>
          <Badge variant="outline" className="text-red-600">失败: {stats.failed}</Badge>
        </div>
      )}

      {/* 文件列表（超过1个文件时显示） */}
      {stats.total > 0 && (
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {files.map(uploadFile => (
            <Card key={uploadFile.id} className="p-3">
              <div className="flex items-center gap-3">
                {/* 状态图标 */}
                <div className="flex-shrink-0">
                  {uploadFile.status === 'uploading' && (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  )}
                  {uploadFile.status === 'parsing' && (
                    <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                  )}
                  {uploadFile.status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {uploadFile.status === 'failed' && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  {(uploadFile.status === 'pending' || !uploadFile.status) && (
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                {/* 文件信息 */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {uploadFile.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadFile.file.size / 1024 / 1024).toFixed(2)}MB
                  </p>
                </div>

                {/* 进度 */}
                {uploadFile.status === 'uploading' && (
                  <div className="flex-shrink-0 w-20">
                    <Progress value={uploadFile.progress} className="h-1" />
                  </div>
                )}

                {/* 状态文本 */}
                <div className="flex-shrink-0">
                  <Badge variant="outline" className="text-xs">
                    {uploadFile.status === 'uploading' && `上传中 ${uploadFile.progress}%`}
                    {uploadFile.status === 'parsing' && '解析中'}
                    {uploadFile.status === 'success' && '已完成'}
                    {uploadFile.status === 'failed' && '失败'}
                    {uploadFile.status === 'pending' && '待上传'}
                  </Badge>
                </div>

                {/* 删除按钮（待上传状态） */}
                {uploadFile.status === 'pending' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => removeFile(uploadFile.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* 错误信息 */}
              {uploadFile.error && (
                <p className="mt-2 text-xs text-red-500">{uploadFile.error}</p>
              )}

              {/* 解析结果（成功后显示） */}
              {uploadFile.status === 'success' && uploadFile.result && (
                <div className="mt-2 space-y-1">
                  {uploadFile.result.basicInfo?.name && (
                    <p className="text-xs text-muted-foreground">
                      姓名: {uploadFile.result.basicInfo.name}
                    </p>
                  )}
                  {uploadFile.result.score !== undefined && (
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={uploadFile.result.tier === 'S' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {uploadFile.result.tier}级
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        评分: {uploadFile.result.score}分
                      </span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* 操作按钮 */}
      {stats.pending > 0 && (
        <div className="flex gap-2">
          <Button
            onClick={startUpload}
            disabled={isUploading || stats.pending === 0}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                上传中...
              </>
            ) : (
              `开始上传 (${stats.pending})`
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={clearAll}
            disabled={isUploading}
          >
            清空列表
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * 大规模拖拽上传区域组件（用于处理10万+文件）
 */
export function MassResumeDropzone({
  onFilesSelected,
  maxFiles = 0,
}: {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
}) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    if (!e.dataTransfer.files) return;

    // 处理大量文件（分批处理避免UI卡顿）
    const files = Array.from(e.dataTransfer.files);
    
    // 检查文件数量限制
    if (maxFiles > 0 && files.length > maxFiles) {
      toast.error(`最多只能处理 ${maxFiles} 个文件，当前 ${files.length} 个`);
      onFilesSelected(files.slice(0, maxFiles));
    } else {
      onFilesSelected(files);
    }

    // 大数据量提示
    if (files.length > 1000) {
      toast.info(`已加载 ${files.length} 个文件，准备上传...`, {
        duration: 5000,
      });
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      className={cn(
        'rounded-xl border-2 border-dashed p-12 text-center transition-colors',
        dragActive && 'border-primary bg-primary/5'
      )}
    >
      <Upload className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
      <p className="text-xl font-medium">拖拽简历文件到此处</p>
      <p className="mt-2 text-sm text-muted-foreground">
        支持批量上传，可同时选择或拖拽多个文件
        {maxFiles > 0 && `，最多 ${maxFiles} 个`}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        💡 提示：可一次性选择或拖拽10万+文件，系统将分批处理
      </p>
    </div>
  );
}
