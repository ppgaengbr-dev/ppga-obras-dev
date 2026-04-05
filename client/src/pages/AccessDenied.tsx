import React from 'react';

const AccessDenied = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 p-4">
      <h1 className="text-4xl font-bold mb-4">Acesso Negado</h1>
      <p className="text-lg text-center">Você não tem permissão para acessar esta página. Por favor, entre em contato com o administrador.</p>
      <img src="/images/access_denied.png" alt="Acesso Negado" className="mt-8 w-64 h-auto" />
    </div>
  );
};

export default AccessDenied;
