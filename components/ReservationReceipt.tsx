"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer, Recycle } from "lucide-react";
import type { Product } from "@/db/schema"; // Import do schema Drizzle

interface ReceiptProps {
  items: Product[];
  total: number;
  name: string;
  email: string;
  date: string;
}

export function ReservationReceipt({ items, total, name, email, date }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = receiptRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Injetando CSS com a paleta Verde/Verde Água no comprovante impresso
    printWindow.document.write(`
      <html>
        <head>
          <title>Comprovante de Reserva - Bazar Sustentável</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; max-width: 380px; margin: 0 auto; color: #064e3b; }
            .header { text-align: center; border-bottom: 2px dashed #10b981; padding-bottom: 16px; margin-bottom: 16px; }
            .header h1 { font-size: 20px; margin: 0 0 4px; color: #064e3b; }
            .header p { font-size: 12px; color: #059669; margin: 2px 0; }
            .info { margin-bottom: 16px; font-size: 13px; border-left: 3px solid #14b8a6; padding-left: 10px; }
            .info p { margin: 4px 0; }
            .items { border-top: 1px solid #ecfdf5; border-bottom: 1px solid #ecfdf5; padding: 8px 0; }
            .item { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
            .total { display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; padding: 12px 0; color: #0d9488; }
            .footer { text-align: center; margin-top: 16px; font-size: 11px; color: #059669; border-top: 2px dashed #10b981; padding-top: 16px; }
            @media print { body { padding: 0; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌱 Bazar Sustentável</h1>
            <p>Escola Salesiana · 6º Ano</p>
            <p>Comprovante Oficial de Reserva</p>
          </div>
          <div class="info">
            <p><strong>Nome:</strong> ${name}</p>
            <p><strong>E-mail:</strong> ${email}</p>
            <p><strong>Data:</strong> ${date}</p>
          </div>
          <div class="items">
            ${items.map((item) => `
              <div class="item">
                <span>${item.name}</span>
                <span>R$ ${Number(item.price).toFixed(2).replace(".", ",")}</span>
              </div>
            `).join("")}
          </div>
          <div class="total">
            <span>Total a Pagar</span>
            <span>R$ ${total.toFixed(2).replace(".", ",")}</span>
          </div>
          <div class="footer">
            <p>Retire e pague seus itens no dia <strong>30/05</strong></p>
            <p>no estande do <strong>6º Ano</strong></p>
            <p style="margin-top:8px; font-style: italic;">Apresente este comprovante (digital ou impresso) no balcão.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-4">
      {/* Visual do Comprovante na Tela */}
      <div ref={receiptRef} className="bg-white border border-green-100 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="text-center border-b border-dashed border-green-200 pb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Recycle className="h-5 w-5 text-teal-500" />
            <h3 className="font-bold text-green-900">Bazar Sustentável</h3>
          </div>
          <p className="text-xs text-green-600">Comprovante de Reserva</p>
        </div>

        <div className="text-sm space-y-1">
          <p><span className="text-green-600/70">Nome:</span> <strong className="text-green-900">{name}</strong></p>
          <p><span className="text-green-600/70">E-mail:</span> <span className="text-green-800">{email}</span></p>
          <p><span className="text-green-600/70">Data:</span> <span className="text-green-800">{date}</span></p>
        </div>

        <div className="border-t border-dashed border-green-200 pt-3 space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-green-800">{item.name}</span>
              <span className="font-medium text-green-900">R$ {Number(item.price).toFixed(2).replace(".", ",")}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-green-200 pt-3 flex justify-between items-center">
          <span className="font-semibold text-green-900">Total</span>
          <span className="text-xl font-bold text-teal-600">R$ {total.toFixed(2).replace(".", ",")}</span>
        </div>

        <div className="bg-green-50 rounded-lg p-3 text-center text-xs text-green-700 border border-green-100">
          <p>Retire e pague no dia <strong className="text-green-900">30/05</strong> no estande do <strong className="text-green-900">6º Ano</strong></p>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="w-full gap-2 border-teal-500 text-teal-600 hover:bg-teal-50 hover:text-teal-700" 
        onClick={handlePrint}
      >
        <Printer className="h-4 w-4" />
        Imprimir Comprovante
      </Button>
    </div>
  );
}