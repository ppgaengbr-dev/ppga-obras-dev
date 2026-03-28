import { useState } from "react";
import { Eye, EyeOff, MessageCircle, LogOut, Upload, X } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Account() {
  const { user, logout } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.photo || null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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
        headers: { "Content-Type": "application/json" },
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
      } else {
        setMessage({ type: "error", text: "Erro ao alterar senha" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao conectar ao servidor" });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setMessage({ type: "error", text: "Por favor, selecione uma imagem válida" });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "A imagem não pode ser maior que 5MB" });
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadPhoto = async () => {
    if (!photoFile) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append("photo", photoFile);

    try {
      const response = await fetch("/api/trpc/auth.uploadPhoto", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Foto de perfil atualizada com sucesso!" });
        setPhotoFile(null);
      } else {
        setMessage({ type: "error", text: "Erro ao fazer upload da foto" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erro ao conectar ao servidor" });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
  };

  const handleLogout = () => {
    if (confirm("Tem certeza que deseja sair?")) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Conta do usuário</h1>
          <p className="text-muted-foreground mt-2">Gerencie o seu perfil de usuário</p>
        </div>

        {/* User Info Card */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Foto de perfil"
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-sidebar-accent to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sidebar-accent-foreground font-display font-bold text-lg">
                    {user?.name?.substring(0, 2).toUpperCase() || "XX"}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{user?.name || "Usuário"}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Função: <span className="font-medium text-foreground">
                  {user?.role === "ADMIN" && "Administrador"}
                  {user?.role === "CLIENTE" && "Cliente"}
                  {user?.role === "ARQUITETO" && "Arquiteto"}
                  {user?.role === "PRESTADOR" && "Prestador"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Photo Upload Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Foto de Perfil</h3>
          <div className="space-y-4">
            {photoPreview && (
              <div className="flex justify-center">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-32 h-32 rounded-lg object-cover"
                />
              </div>
            )}
            <div className="flex gap-2">
              <label className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <div className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 cursor-pointer transition-colors">
                  <Upload size={18} />
                  Escolher Foto
                </div>
              </label>
              {photoPreview && (
                <button
                  onClick={handleRemovePhoto}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  <X size={18} />
                  Remover
                </button>
              )}
            </div>
            {photoFile && (
              <button
                onClick={handleUploadPhoto}
                disabled={uploadingPhoto}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploadingPhoto ? "Enviando..." : "Enviar Foto"}
              </button>
            )}
          </div>
        </div>

        {/* Change Password Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Alterar Senha</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Alterações de senha requerem aprovação do administrador.
          </p>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Senha Atual
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Digite sua senha atual"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Digite sua nova senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Confirme sua nova senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.type === "success"
                    ? "bg-green-500/10 text-green-600 border border-green-200"
                    : "bg-red-500/10 text-red-600 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Alterando..." : "Alterar Senha"}
            </button>
          </form>
        </div>

        {/* Support Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Suporte</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Precisa de ajuda? Entre em contato conosco pelo WhatsApp.
          </p>
          <a
            href="https://wa.me/5551994550588"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors w-fit"
          >
            <MessageCircle size={18} />
            Contatar Suporte
          </a>
        </div>

        {/* Logout Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Sair</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Clique no botão abaixo para fazer logout da sua conta.
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
