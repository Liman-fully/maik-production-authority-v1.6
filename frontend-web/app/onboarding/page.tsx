"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import {
  Briefcase, User, MapPin, FileText, CheckCircle2, Sparkles,
  UserCircle, Building2, CalendarDays, ChevronLeft, ChevronRight
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

// API 基础路径
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

// 中国城市列表
const CITIES = [
  "北京市", "上海市", "天津市", "重庆市",
  "广州市", "深圳市", "杭州市", "南京市", "苏州市", "武汉市",
  "成都市", "西安市", "长沙市", "郑州市", "青岛市", "大连市",
  "厦门市", "宁波市", "济南市", "哈尔滨市", "沈阳市", "长春市",
  "石家庄市", "太原市", "合肥市", "福州市", "南昌市", "济南市",
  "郑州市", "长沙市", "南宁市", "海口市", "成都市", "贵阳市",
  "昆明市", "拉萨市", "西安市", "兰州市", "西宁市", "银川市",
  "乌鲁木齐市", "香港", "澳门", "台北"
]

// 用户引导服务接口
interface OnboardingData {
  role?: "seeker" | "employer"
  name?: string
  gender?: string
  birthday?: string
  location?: string
  bio?: string
}

class OnboardingService {
  async submitOnboarding(data: OnboardingData): Promise<void> {
    const token = localStorage.getItem("token")

    if (!token) {
      throw new Error("请先登录")
    }

    const response = await fetch(`${API_BASE}/api/auth/onboarding`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "保存失败")
    }
  }

  async getOnboardingStatus(): Promise<OnboardingData> {
    const token = localStorage.getItem("token")

    if (!token) {
      throw new Error("请先登录")
    }

    const response = await fetch(`${API_BASE}/api/auth/onboarding-status`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      },
    })

    if (!response.ok) {
      throw new Error("获取状态失败")
    }

    return response.json()
  }
}

const onboardingService = new OnboardingService()

export default function OnboardingPage() {
  const router = useRouter()

  // 当前步骤 (0-3)
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // 步骤1: 角色选择
  const [role, setRole] = useState<"seeker" | "employer">("seeker")

  // 步骤2: 基本信息
  const [name, setName] = useState("")
  const [gender, setGender] = useState<string>("")
  const [birthday, setBirthday] = useState<Date | undefined>(undefined)

  // 步骤3: 位置
  const [location, setLocation] = useState<string>("")

  // 步骤4: 个人简介
  const [bio, setBio] = useState("")

  // 步骤名称
  const steps = [
    { title: "选择角色", icon: User },
    { title: "基本信息", icon: FileText },
    { title: "所在位置", icon: MapPin },
    { title: "个人简介", icon: UserCircle },
  ]

  // 计算进度
  const progress = ((currentStep + 1) / steps.length) * 100

  // 初始化加载已有数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await onboardingService.getOnboardingStatus()
        if (data.role) setRole(data.role)
        if (data.name) setName(data.name)
        if (data.gender) setGender(data.gender)
        if (data.birthday) setBirthday(new Date(data.birthday))
        if (data.location) setLocation(data.location)
        if (data.bio) setBio(data.bio)

        // 如果所有字段都已填写，跳转到首页
        if (data.role && data.name && data.gender && data.birthday && data.location && data.bio) {
          toast.info("您已完成引导，正在跳转...")
          setTimeout(() => router.push("/"), 1000)
        }
      } catch (error) {
        console.error("加载引导数据失败:", error)
      } finally {
        setIsInitialized(true)
      }
    }

    loadData()
  }, [router])

  // 验证当前步骤
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!role
      case 1:
        return !!name && !!gender && !!birthday
      case 2:
        return !!location
      case 3:
        return true // bio 是可选的
      default:
        return false
    }
  }

  // 提交当前步骤数据
  const submitCurrentStep = async () => {
    setIsLoading(true)
    try {
      const data: OnboardingData = {}

      switch (currentStep) {
        case 0:
          data.role = role
          break
        case 1:
          data.name = name
          data.gender = gender
          data.birthday = birthday ? format(birthday, "yyyy-MM-dd") : undefined
          break
        case 2:
          data.location = location
          break
        case 3:
          data.bio = bio
          break
      }

      await onboardingService.submitOnboarding(data)
      return true
    } catch (error: any) {
      toast.error(error.message || "保存失败")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // 下一步
  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      toast.error("请填写完整信息")
      return
    }

    const success = await submitCurrentStep()
    if (!success) return

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // 全部完成，跳转
      toast.success("引导完成！正在跳转...")
      setTimeout(() => router.push("/"), 1000)
    }
  }

  // 上一步
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // 跳过
  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      toast.success("引导完成！正在跳转...")
      setTimeout(() => router.push("/"), 1000)
    }
  }

  if (!isInitialized) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">加载中...</div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8">
      {/* Decorative Background Elements */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      <Card className="relative w-full max-w-[500px] border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-1.5 pb-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
              <Briefcase className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-center">
            欢迎加入脉刻
          </CardTitle>
          <CardDescription className="text-center text-base">
            完成以下步骤，开始您的招聘之旅
          </CardDescription>

          {/* 进度条 */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>步骤 {currentStep + 1} / {steps.length}</span>
              <span>{steps[currentStep].title}</span>
            </div>
            <Progress value={progress} className="h-2 rounded-full" />
          </div>

          {/* 步骤指示器 */}
          <div className="flex justify-center gap-2 mt-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isCompleted = index < currentStep

              return (
                <div
                  key={index}
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : isCompleted
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
              )
            })}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pb-4">
          {/* 步骤1: 选择角色 */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-semibold">请选择您的身份</h3>
                <p className="text-sm text-muted-foreground">
                  选择后将为您推荐相关内容
                </p>
              </div>

              <RadioGroup
                value={role}
                onValueChange={(value) => setRole(value as "seeker" | "employer")}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="seeker" id="seeker-role" className="peer sr-only" />
                  <Label
                    htmlFor="seeker-role"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-6 hover:bg-accent/50 hover:text-accent-foreground cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary"
                  >
                    <UserCircle className="mb-3 h-16 w-16 text-muted-foreground peer-data-[state=checked]:text-primary transition-colors" />
                    <span className="text-base font-medium">求职者</span>
                    <span className="text-xs text-muted-foreground mt-2 text-center">
                      寻找理想工作<br />展示个人能力
                    </span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="employer" id="employer-role" className="peer sr-only" />
                  <Label
                    htmlFor="employer-role"
                    className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-6 hover:bg-accent/50 hover:text-accent-foreground cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 [&:has([data-state=checked])]:border-primary"
                  >
                    <Building2 className="mb-3 h-16 w-16 text-muted-foreground peer-data-[state=checked]:text-primary transition-colors" />
                    <span className="text-base font-medium">招聘者</span>
                    <span className="text-xs text-muted-foreground mt-2 text-center">
                      发布职位信息<br />招募优秀人才
                    </span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* 步骤2: 基本信息 */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-semibold">填写基本信息</h3>
                <p className="text-sm text-muted-foreground">
                  让更多人了解真实的您
                </p>
              </div>

              {/* 姓名 */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">
                  姓名
                </Label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-primary">
                    <User className="h-4.5 w-4.5 text-muted-foreground" />
                  </div>
                  <Input
                    id="name"
                    type="text"
                    placeholder="请输入您的真实姓名"
                    className="pl-10 h-12 rounded-xl border-border/50 bg-background/50 focus-visible:ring-primary/30"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* 性别 */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">性别</Label>
                <RadioGroup
                  value={gender}
                  onValueChange={setGender}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="cursor-pointer font-normal">
                      男
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="cursor-pointer font-normal">
                      女
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="cursor-pointer font-normal">
                      其他
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* 生日 */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">生日</Label>
                <div className="relative">
                  <Calendar
                    mode="single"
                    selected={birthday}
                    onSelect={setBirthday}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    className="rounded-xl border border-border/50"
                    locale={zhCN}
                    fromYear={1950}
                    toYear={new Date().getFullYear()}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 步骤3: 位置 */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-semibold">选择所在城市</h3>
                <p className="text-sm text-muted-foreground">
                  我们将为您推荐当地的职位
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-semibold">
                  城市
                </Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="请选择您所在的城市" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* 步骤4: 个人简介 */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-semibold">自我介绍</h3>
                <p className="text-sm text-muted-foreground">
                  让招聘者更好地了解您的优势和特点（选填）
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-semibold">
                  个人简介
                </Label>
                <Textarea
                  id="bio"
                  placeholder="介绍一下您的专业背景、工作经验和个人优势..."
                  className="min-h-[150px] rounded-xl resize-none"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                />
                <div className="text-right text-xs text-muted-foreground">
                  {bio.length} / 500
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-2 pb-6">
          <div className="flex gap-3 w-full">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 rounded-xl"
                onClick={handlePrev}
                disabled={isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                上一步
              </Button>
            )}

            <Button
              type="button"
              className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
              onClick={handleNext}
              disabled={isLoading || !validateStep(currentStep)}
            >
              {isLoading ? (
                "保存中..."
              ) : currentStep < steps.length - 1 ? (
                <>
                  下一步
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  完成
                  <Sparkles className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>

          {currentStep < steps.length - 1 && (
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleSkip}
            >
              跳过此步骤
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
