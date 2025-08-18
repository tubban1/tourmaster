"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewUserPage() {
  const router = useRouter();
  const [agencies, setAgencies] = useState([]);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
    agencyId: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 权限校验（假设有/me接口或全局auth context，这里用fetch）
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.role === "platform_super_admin") {
          setIsSuperAdmin(true);
        } else {
          setIsSuperAdmin(false);
        }
      })
      .catch(() => setIsSuperAdmin(false));
  }, []);

  // 获取旅行社列表
  useEffect(() => {
    fetch("/api/agencies")
      .then((res) => res.json())
      .then((data) => setAgencies(data))
      .catch(() => setAgencies([]));
  }, []);

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-lg">无权限访问</div>
      </div>
    );
  }

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const body: any = {
        username: form.username,
        email: form.email,
        password: form.password,
        role: form.role
      };
      if (form.agencyId) body.agencyId = form.agencyId;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) headers['Authorization'] = 'Bearer ' + token;
      }
      const res = await fetch("/api/users", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "创建失败");
      setSuccess("用户创建成功");
      setForm({ username: "", email: "", password: "", role: "", agencyId: "" });
    } catch (err: any) {
      setError(err.message || "创建失败");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = form.username && form.email && form.password && form.role;

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">新建用户</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded shadow">
        <div>
          <label className="block text-sm font-medium mb-1">用户名 *</label>
          <input name="username" value={form.username} onChange={handleChange} className="w-full border rounded p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">邮箱 *</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border rounded p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">密码 *</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded p-2 pr-10"
              required
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "隐藏密码" : "显示密码"}
            >
              {showPassword ? (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.364-2.364A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.636-1.364" /></svg>
              ) : (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.828-2.828A9.956 9.956 0 0122 12c0 5.523-4.477 10-10 10S2 17.523 2 12c0-1.657.403-3.22 1.125-4.575" /></svg>
              )}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">角色 *</label>
          <select name="role" value={form.role} onChange={handleChange} className="w-full border rounded p-2" required>
            <option value="">请选择角色</option>
            <option value="platform_super_admin">平台超级管理员</option>
            <option value="agency_admin">旅行社管理员</option>
            <option value="guide">导游</option>
            <option value="sales">销售</option>
            <option value="scheduler">调度员</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">旅行社（可选）</label>
          <select name="agencyId" value={form.agencyId} onChange={handleChange} className="w-full border rounded p-2">
            <option value="">不绑定旅行社</option>
            {agencies.map((a: any) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <div className="flex gap-4">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={!isFormValid || loading}>
            {loading ? "创建中..." : "创建用户"}
          </button>
          <button type="button" className="bg-gray-200 px-4 py-2 rounded" onClick={() => setForm({ username: "", email: "", password: "", role: "", agencyId: "" })}>
            重置
          </button>
        </div>
      </form>
    </div>
  );
}