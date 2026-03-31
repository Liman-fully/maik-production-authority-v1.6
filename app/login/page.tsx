"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Briefcase, Lock, Phone, MessageSquare, ArrowRight, ShieldCheck, Sparkles } from "lucide-react"
import { authService } from "@/services/talent"
import { toast } from "sonner"

export default function LoginPage() {
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()

  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      toast.error("请输入正确的手机号")
      return
    }
    setIsSending(true)
    try {
      await authService.sendSmsCode(phone)
      toast.success("验证码已发送，请注意查收")
      startCountdown()
    } catch (error) {
      toast.error("验证码发送失败，请稍后重试")
    } finally {
      setIsSending(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) {
      toast.error("请输入验证码")
      return
    }
    setIsLoading(true)
    try {
      const res: any = await authService.login(phone, code)
      localStorage.setItem("token", res.token)
      localStorage.setItem("user", JSON.stringify(res.userInfo))
      toast.success("登录成功，正在为您跳转")
      router.push("/")
    } catch (error) {
      toast.error("登录失败，验证码错误或已过期")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Decorative Background Elements */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      
      <Card className="relative w-full max-w-[400px] border-0 shadow-2xl bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-1.5 pb-8 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
            <Briefcase className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">猎脉 HuntLink</CardTitle>
          <CardDescription className="text-base">极致简约的社交招聘体验</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold ml-1">手机号</Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-primary">
                  <Phone className="h-4.5 w-4.5 text-muted-foreground" />
                </div>
                <Input 
                  id="phone" 
                  type="tel"
                  placeholder="请输入手机号" 
                  className="pl-10 h-12 rounded-xl border-border/50 bg-background/50 focus-visible:ring-primary/30" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-semibold ml-1">验证码</Label>
              <div className="flex gap-3">
                <div className="relative flex-1 group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-primary">
                    <MessageSquare className="h-4.5 w-4.5 text-muted-foreground" />
                  </div>
                  <Input 
                    id="code" 
                    type="number"
                    placeholder="6位验证码" 
                    className="pl-10 h-12 rounded-xl border-border/50 bg-background/50 focus-visible:ring-primary/30" 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required 
                  />
                </div>
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="h-12 px-4 rounded-xl font-medium min-w-[120px]"
                  disabled={isSending || countdown > 0 || !phone}
                  onClick={handleSendCode}
                >
                  {countdown > 0 ? `${countdown}s` : isSending ? "发送中..." : "获取验证码"}
                </Button>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-6 pt-2 pb-8">
            <Button className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-[0.98]" type="submit" disabled={isLoading}>
              {isLoading ? "登录中..." : "立即进入"}
              {!isLoading && <ArrowRight className="ml-2 h-4.5 w-4.5" />}
            </Button>
            
            <div className="flex items-center justify-center gap-6 text-[11px] text-muted-foreground/60 uppercase tracking-widest font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3" />
                安全加密
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                AI 匹配
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
      
      <p className="absolute bottom-8 text-xs text-muted-foreground/40">
        登录即代表同意 <span className="underline hover:text-primary cursor-pointer">用户协议</span> 与 <span className="underline hover:text-primary cursor-pointer">隐私政策</span>
      </p>
    </div>
  )
}
