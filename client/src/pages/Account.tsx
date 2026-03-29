import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { Mail, Lock, MessageCircle, LogOut, User, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";

export default function Account() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "As senhas não conferem" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "A nova senha deve ter pelo menos 6 caracteres" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/trpc/auth.changePassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Senha alterada com sucesso!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordForm(false);
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: "Erro ao alterar senha. Verifique sua senha atual." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao conectar ao servidor" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm("Tem certeza que deseja sair?")) {
      await logout();
      setLocation("/login");
    }
  };

  const handleContactSupport = () => {
    const phone = "5551994550588";
    const message = "Olá, preciso de suporte com minha conta.";
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrador";
      case "CLIENTE":
        return "Cliente";
      case "ARQUITETO":
        return "Arquiteto";
      case "PRESTADOR":
        return "Prestador";
      default:
        return "Usuário";
    }
  };

  return (
    <div className="space-y-6">
      {/* Perfil do Usuário */}
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <User size={24} className="text-sidebar-accent" />
            Meu Perfil
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar e Nome */}
          <div className="md:col-span-1 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-sidebar-accent to-secondary rounded-full flex items-center justify-center mb-4 shadow-lg">
              <span className="text-sidebar-accent-foreground font-display font-bold text-4xl">
                {user?.name?.substring(0, 2).toUpperCase() || "XX"}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-foreground">{user?.name || "Usuário"}</h3>
            <p className="text-sm text-muted-foreground mt-1">{getRoleLabel(user?.role)}</p>
          </div>

          {/* Informações */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border/50">
              <Mail size={20} className="text-sidebar-accent flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium">EMAIL</p>
                <p className="text-foreground break-all">{user?.email || "Não informado"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border/50">
              <Lock size={20} className="text-sidebar-accent flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium">FUNÇÃO</p>
                <p className="text-foreground">{getRoleLabel(user?.role)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Segurança - Alterar Senha */}
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Lock size={24} className="text-sidebar-accent" />
            Segurança
          </h2>
        </div>

        {!showPasswordForm ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Altere sua senha regularmente para manter sua conta segura.
            </p>
            <button
              onClick={() => setShowPasswordForm(true)}
              className="w-full bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Lock size={18} />
              Alterar Senha
            </button>
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-5">
            {/* Senha Atual */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Senha Atual
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-accent/50 focus:border-sidebar-accent transition-colors"
                  placeholder="Digite sua senha atual"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Nova Senha */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-accent/50 focus:border-sidebar-accent transition-colors"
                  placeholder="Digite a nova senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Mínimo de 6 caracteres</p>
            </div>

            {/* Confirmar Nova Senha */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-accent/50 focus:border-sidebar-accent transition-colors"
                  placeholder="Confirme a nova senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Mensagem */}
            {message && (
              <div
                className={`p-4 rounded-lg text-sm font-medium flex items-start gap-3 ${
                  message.type === "success"
                    ? "bg-green-500/10 text-green-700 border border-green-500/20"
                    : "bg-red-500/10 text-red-700 border border-red-500/20"
                }`}
              >
                <div className="flex-1">{message.text}</div>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Salvando..." : "Salvar Alterações"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setMessage(null);
                }}
                className="flex-1 bg-border hover:bg-border/80 text-foreground font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Suporte */}
      <div className="bg-card border border-border rounded-lg p-8">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <MessageCircle size={24} className="text-sidebar-accent" />
          Suporte
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Precisa de ajuda? Entre em contato conosco via WhatsApp.
        </p>
        <button
          onClick={handleContactSupport}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          <MessageCircle size={20} />
          Falar com Suporte via WhatsApp
        </button>
      </div>

      {/* Logout */}
      <div className="bg-card border border-border rounded-lg p-8">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <LogOut size={24} className="text-sidebar-accent" />
          Sessão
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Você será desconectado de sua conta.
        </p>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
        >
          <LogOut size={20} />
          Sair da Conta
        </button>
      </div>
    </div>
  );
}
