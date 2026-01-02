import React from 'react';
import { QuotationConfig, QuoteLineItem } from '@prisma/client';

interface QuoteTemplateProps {
  quotation: QuotationConfig & {
    lineItems?: QuoteLineItem[];
  };
}

export const QuoteTemplate: React.FC<QuoteTemplateProps> = ({ quotation }) => {
  const {
    numero,
    fechaEmision,
    fechaVencimiento,
    empresa,
    emailCliente,
    whatsappCliente,
    moneda,
    subtotal,
    taxRate,
    taxTotal,
    discountTotal,
    total,
    lineItems = [],
  } = quotation;

  return (
    <div id="quote-template" className="p-8 bg-white text-gray-800 font-sans max-w-4xl mx-auto border shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">COTIZACIÓN</h1>
          <p className="text-gray-500 mt-1">#{numero}</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold">{quotation.empresaProveedor || 'DG TECNOVA'}</h2>
          <p className="text-sm text-gray-500">{quotation.ubicacionProveedor}</p>
          <p className="text-sm text-gray-500">{quotation.emailProveedor}</p>
        </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Cliente</h3>
          <p className="font-semibold text-lg">{empresa}</p>
          <p className="text-gray-600">{emailCliente}</p>
          <p className="text-gray-600">{whatsappCliente}</p>
        </div>
        <div className="text-right">
          <div className="mb-2">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mr-2">Fecha Emisión:</span>
            <span className="text-gray-700">{new Date(fechaEmision).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mr-2">Vence:</span>
            <span className="text-gray-700">{new Date(fechaVencimiento).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3 border-b font-bold text-sm">Descripción</th>
            <th className="p-3 border-b font-bold text-sm text-center">Cant.</th>
            <th className="p-3 border-b font-bold text-sm text-right">Precio Unit.</th>
            <th className="p-3 border-b font-bold text-sm text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.length > 0 ? (
            lineItems.map((item, index) => (
              <tr key={item.id || index} className="border-b">
                <td className="p-3 text-sm">{item.description}</td>
                <td className="p-3 text-sm text-center">{item.quantity}</td>
                <td className="p-3 text-sm text-right">
                  {moneda} {Number(item.unitPrice).toLocaleString()}
                </td>
                <td className="p-3 text-sm text-right font-medium">
                  {moneda} {Number(item.total).toLocaleString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="p-8 text-center text-gray-400 italic">
                No hay items en esta cotización
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">{moneda} {Number(subtotal || 0).toLocaleString()}</span>
          </div>
          {Number(discountTotal) > 0 && (
            <div className="flex justify-between py-2 border-b text-red-600">
              <span>Descuento:</span>
              <span>-{moneda} {Number(discountTotal).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b">
            <span>Impuestos ({Number(taxRate || 0)}%):</span>
            <span>{moneda} {Number(taxTotal || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-3 text-xl font-bold text-blue-600">
            <span>Total:</span>
            <span>{moneda} {Number(total || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer / Notes */}
      <div className="mt-12 pt-8 border-t text-sm text-gray-500">
        <h4 className="font-bold mb-2 text-gray-700">Notas y Condiciones:</h4>
        <p className="mb-2">1. Esta cotización tiene una validez de {quotation.tiempoValidez} días.</p>
        <p className="mb-2">2. Los precios están expresados en {moneda}.</p>
        <p>{quotation.notasPago || 'Gracias por su confianza.'}</p>
      </div>
    </div>
  );
};
