import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Contracts() {
  const [, setLocation] = useLocation();

  return (
    <>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto flex items-center justify-center mb-4">
              <span className="text-2xl">🔨</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Em construção</h2>
            <p className="text-gray-600">
              Esta seção será implementada em breve.
            </p>
          </div>
          <Button
            onClick={() => setLocation("/")}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg"
          >
            Voltar ao Dashboard
          </Button>
        </Card>
      </div>
    </>
  );
}
