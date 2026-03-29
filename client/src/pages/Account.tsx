import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { Mail, Lock, MessageCircle, LogOut } from "lucide-react";
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
        setMessage({ type: "success", text: "Senha alterada com sucesso! Aguardando aprovação do administrador." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordForm(false);
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

  return (
    <div className="space-y-6">
      {/* Dados do Usuário */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Informações da Conta</h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-sidebar-accent to-secondary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sidebar-accent-foreground font-display font-bold text-xl">
                {user?.name?.substring(0, 2).toUpperCase() || "XX"}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="text-lg font-semibold text-foreground">{user?.name || "Usuário"}</p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-3 mb-4">
              <Mail size={20} className="text-sidebar-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-foreground">{user?.email || "Não informado"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Lock size={20} className="text-sidebar-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Função</p>
                <p className="text-foreground">
                  {user?.role === "ADMIN" && "Administrador"}
                  {user?.role === "CLIENTE" && "Cliente"}
                  {user?.role === "ARQUITETO" && "Arquiteto"}
                  {user?.role === "PRESTADOR" && "Prestador"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alterar Senha */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Segurança</h2>
        </div>

        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="w-full bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Alterar Senha
          </button>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Senha Atual
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-accent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nova Senha
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-accent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-accent"
                required
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.type === "success"
                    ? "bg-green-500/20 text-green-700 border border-green-500/30"
                    : "bg-red-500/20 text-red-700 border border-red-500/30"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-sidebar hover:bg-sidebar/90 text-sidebar-foreground font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Salvar"}
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
                className="flex-1 bg-border hover:bg-border/80 text-foreground font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Suporte */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Suporte</h2>
        <button
          onClick={handleContactSupport}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <MessageCircle size={20} />
          Falar com Suporte via WhatsApp
        </button>
      </div>

      {/* Logout */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Sessão</h2>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </div>
  );
}
