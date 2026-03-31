"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  Users, 
  Search, 
  FolderOpen, 
  MessageCircle, 
  Briefcase,
  Settings,
  Bell,
  HelpCircle,
  LogOut,
  Crown,
  ChevronRight,
  FileText,
  Eye,
  Star,
  Zap,
  Shield,
  X,
  Upload,
  LogIn
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

const navItems = [
  {
    name: "人才广场",
    href: "/",
    icon: Users,
  },
  {
    name: "搜索简历",
    href: "/search",
    icon: Search,
  },
  {
    name: "简历库",
    href: "/resumes",
    icon: FolderOpen,
  },
  {
    name: "消息",
    href: "/messages",
    icon: MessageCircle,
  },
]

const vipBenefits = [
  { icon: Eye, name: "无限查看简历", desc: "不限次数查看完整简历" },
  { icon: Zap, name: "智能推荐加速", desc: "优先获取AI精准匹配" },
  { icon: Star, name: "候选人标记", desc: "无限收藏与分类管理" },
  { icon: Shield, name: "专属客服", desc: "7x24小时VIP服务" },
]

const menuItems = [
  { icon: FileText, name: "个人简介", href: "/profile/intro" },
  { icon: Star, name: "我的收藏", href: "/resumes" },
  { icon: Eye, name: "浏览记录", href: "/resumes?tab=history" },
  { icon: Bell, name: "消息通知", href: "/messages" },
  { icon: Settings, name: "账号设置", href: "/profile/settings" },
  { icon: HelpCircle, name: "帮助中心", href: "/help" },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [profileOpen, setProfileOpen] = useState(false)
  const [vipOpen, setVipOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/login")
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">
              猎脉
            </span>
          </Link>

          {/* Desktop Navigation - Increased spacing */}
          <nav className="hidden md:flex md:items-center md:gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* User Actions - Increased spacing */}
          <div className="flex items-center gap-3">
            {user && (
              <button 
                onClick={() => setUploadOpen(true)}
                className="hidden items-center gap-1.5 rounded-full border border-border/60 bg-card px-3.5 py-1.5 text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary/50 hover:bg-accent sm:flex"
              >
                <Upload className="h-3.5 w-3.5" />
                上传简历
              </button>
            )}
            
            {user ? (
              <Popover open={profileOpen} onOpenChange={setProfileOpen}>
                <PopoverTrigger asChild>
                  <button className="relative h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-primary/30 to-primary/10 ring-2 ring-transparent transition-all hover:ring-primary/30">
                    <img 
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                      alt="用户头像"
                      className="h-full w-full object-cover"
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent 
                  align="end" 
                  className="w-72 p-0 shadow-xl"
                  sideOffset={8}
                >
                  <div className="relative border-b border-border/40 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-primary/30 to-primary/10">
                        <img 
                          src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                          alt="用户头像"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground truncate">{user.name}</span>
                          <Popover open={vipOpen} onOpenChange={setVipOpen}>
                            <PopoverTrigger asChild>
                              <button className="flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-1.5 py-0.5 text-[10px] font-medium text-white transition-transform hover:scale-105">
                                <Crown className="h-2.5 w-2.5" />
                                VIP
                              </button>
                            </PopoverTrigger>
                            <PopoverContent side="bottom" align="start" className="w-64 p-0" sideOffset={4}>
                              <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 text-white">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <Crown className="h-4 w-4" />
                                    <span className="font-semibold">VIP会员权益</span>
                                  </div>
                                </div>
                              </div>
                              <div className="p-2">
                                {vipBenefits.map((benefit) => (
                                  <div key={benefit.name} className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-accent/50">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                                      <benefit.icon className="h-3.5 w-3.5 text-amber-600" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-medium text-foreground">{benefit.name}</p>
                                      <p className="text-[10px] text-muted-foreground">{benefit.desc}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <p className="text-xs text-muted-foreground">{user.role === 'hr' ? '招聘者' : '求职者'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-1.5">
                    {menuItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                      >
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                        {item.name}
                        <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground/50" />
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-border/40 p-1.5">
                    <button 
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      退出登录
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <Button size="sm" className="rounded-full px-4" onClick={() => router.push("/login")}>
                <LogIn className="mr-1.5 h-4 w-4" />
                登录 / 注册
              </Button>
            )}
          </div>
        </div>
      </header>

                {/* Menu Items */}
                <div className="p-1.5">
                  {menuItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent"
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      {item.name}
                      <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground/50" />
                    </Link>
                  ))}
                </div>

                {/* Quick Settings */}
                <div className="border-t border-border/40 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">显示人才数量</span>
                    <Switch defaultChecked={false} />
                  </div>
                </div>

                {/* Logout */}
                <div className="border-t border-border/40 p-1.5">
                  <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10">
                    <LogOut className="h-4 w-4" />
                    退出登录
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex md:hidden border-t border-border/40">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                {item.name}
              </Link>
            )
          })}
          {/* Profile in Mobile Nav */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-muted-foreground">
                <div className="h-5 w-5 overflow-hidden rounded-full">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=recruiter" 
                    alt="我的"
                    className="h-full w-full object-cover"
                  />
                </div>
                我的
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-2">
              <div className="flex items-center gap-2 border-b border-border/40 pb-2 mb-2">
                <div className="h-10 w-10 overflow-hidden rounded-full">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=recruiter" 
                    alt="用户头像"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-sm">李明</span>
                    <Badge className="h-4 bg-gradient-to-r from-amber-500 to-orange-500 px-1 text-[8px]">VIP</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">HR总监</p>
                </div>
              </div>
              {menuItems.slice(0, 4).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  {item.name}
                </Link>
              ))}
            </PopoverContent>
          </Popover>
        </nav>
      </header>

      {/* Upload Resume Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Upload className="h-4 w-4 text-primary" />
              上传简历
            </DialogTitle>
            <DialogDescription className="text-xs">
              上传候选人简历，系统将自动解析信息
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-accent/30 p-8 transition-colors hover:border-primary/50">
              <Upload className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-3 text-sm font-medium text-foreground">点击或拖拽上传</p>
              <p className="mt-1 text-xs text-muted-foreground">支持 PDF、Word、图片格式</p>
              <Button size="sm" className="mt-4 rounded-full">
                选择文件
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
