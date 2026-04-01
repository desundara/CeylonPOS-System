import React, { useRef } from 'react';
import { X, Printer, Download, Check, Star } from 'lucide-react';

const PRINT_STYLES = `
@media print {
  body * { visibility: hidden !important; }
    #ceylonpos-receipt, #ceylonpos-receipt * { visibility: visible !important; }
    #ceylonpos-receipt {
        position: fixed !important;
        top: 0; left: 0;
        width: 80mm;
        padding: 8px;
        font-family: 'Courier New', monospace;
        font-size: 11px;
        color: #000 !important;
        background: #fff !important;
    }
    .no-print { display: none !important; }
    }
    `;

    export default function ReceiptModal({ saleData, cart, onClose, onConfirm }) {
    const receiptRef = useRef(null);

    const {
        invoiceId, customerName, payment, discount, discountAmt,
        redeemPoints, pointsDiscount, tax, grandTotal, pointsEarned,
        cashierName, storeName, receiptHeader, receiptFooter, taxRatePercent,
    } = saleData;

    const handlePrint = () => {
        if (!document.getElementById('ceylonpos-print-style')) {
        const style = document.createElement('style');
        style.id = 'ceylonpos-print-style';
        style.innerHTML = PRINT_STYLES;
        document.head.appendChild(style);
        }
        window.print();
    };

    const handleDownload = () => {
        const lines = [
        '================================',
        `        ${(storeName || 'CEYLON POS').substring(0, 24)}`,
        `  ${(receiptHeader || 'Software Solutions (Pvt) Ltd').substring(0, 28)}`,
        '================================',
        `Invoice : ${invoiceId}`,
        `Date    : ${new Date().toLocaleString('en-LK')}`,
        `Cashier : ${cashierName}`,
        customerName !== 'Walk-in Customer' ? `Customer: ${customerName}` : '',
        '--------------------------------',
        ...cart.map(i =>
            `${i.name.substring(0, 20).padEnd(20)} x${i.qty}\n` +
            `  @ Rs.${i.price.toLocaleString()} = Rs.${(i.price * i.qty).toLocaleString()}`
        ),
        '--------------------------------',
        `Subtotal        Rs. ${cart.reduce((s,i) => s + i.price * i.qty, 0).toLocaleString()}`,
        discountAmt > 0 ? `Discount(${discount}%) -Rs. ${discountAmt.toLocaleString()}` : '',
        pointsDiscount > 0 ? `Points Redeem  -Rs. ${pointsDiscount.toLocaleString()}` : '',
        `Tax (${taxRatePercent || 0}%)      Rs. ${tax.toLocaleString()}`,
        '================================',
        `TOTAL           Rs. ${grandTotal.toLocaleString()}`,
        `Payment         ${payment}`,
        '================================',
        pointsEarned > 0 ? `Points Earned: +${pointsEarned} pts` : '',
        '',
        `  ${(receiptFooter || 'Thank you for shopping with us!').substring(0, 30)}`,
        '================================',
        ].filter(Boolean).join('\n');

        const blob = new Blob([lines], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${invoiceId}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const now = new Date();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
        <div className="w-full max-w-sm overflow-hidden glass rounded-2xl animate-slide-up">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b no-print"
            style={{ borderColor: 'var(--border-color)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Receipt Preview</h2>
            <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            {/* Receipt — this section gets printed */}
            <div id="ceylonpos-receipt" ref={receiptRef}
            className="p-5 overflow-y-auto max-h-[60vh]"
            style={{ background: 'var(--card-bg)', fontFamily: '"Courier New", monospace' }}>

            {/* Store header */}
            <div className="mb-4 text-center">
                <div className="text-lg font-bold tracking-widest"
                style={{ color: 'var(--text-primary)', fontFamily: '"Bebas Neue", cursive' }}>
                {(storeName || 'CEYLON')} <span style={{ color: '#42A5F5' }}>POS</span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {receiptHeader || 'Software Solutions (Pvt) Ltd'}
                </p>
                <div className="mt-3 border-t border-dashed" style={{ borderColor: 'var(--border-color)' }} />
            </div>

            {/* Invoice details */}
            <div className="mb-3 space-y-1 text-xs">
                {[
                ['Invoice',  invoiceId],
                ['Date',     now.toLocaleDateString('en-LK')],
                ['Time',     now.toLocaleTimeString('en-LK', { hour: '2-digit', minute: '2-digit' })],
                ['Cashier',  cashierName],
                ...(customerName !== 'Walk-in Customer' ? [['Customer', customerName]] : []),
                ['Payment',  payment],
                ].map(([label, val], i) => (
                <div key={i} className="flex justify-between">
                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{val}</span>
                </div>
                ))}
            </div>

            <div className="my-3 border-t border-dashed" style={{ borderColor: 'var(--border-color)' }} />

            {/* Items */}
            <div className="mb-3 space-y-2">
                {cart.map((item, i) => (
                <div key={i} className="text-xs">
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{item.name}</div>
                    <div className="flex justify-between mt-0.5">
                    <span style={{ color: 'var(--text-muted)' }}>{item.qty} x Rs. {item.price.toLocaleString()}</span>
                    <span className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Rs. {(item.qty * item.price).toLocaleString()}
                    </span>
                    </div>
                </div>
                ))}
            </div>

            <div className="my-3 border-t border-dashed" style={{ borderColor: 'var(--border-color)' }} />

            {/* Totals */}
            <div className="text-xs space-y-1.5 mb-3">
                <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
                <span>Subtotal ({cart.length} items)</span>
                <span className="font-mono">Rs. {cart.reduce((s,i) => s + i.price * i.qty, 0).toLocaleString()}</span>
                </div>
                {discountAmt > 0 && (
                <div className="flex justify-between" style={{ color: '#34d399' }}>
                    <span>Discount ({discount}%)</span>
                    <span className="font-mono">-Rs. {discountAmt.toLocaleString()}</span>
                </div>
                )}
                {pointsDiscount > 0 && (
                <div className="flex justify-between" style={{ color: '#fbbf24' }}>
                    <span>Points ({redeemPoints}pt)</span>
                    <span className="font-mono">-Rs. {pointsDiscount.toLocaleString()}</span>
                </div>
                )}
                <div className="flex justify-between" style={{ color: 'var(--text-muted)' }}>
                <span>Tax ({taxRatePercent || 0}%)</span>
                <span className="font-mono">Rs. {tax.toLocaleString()}</span>
                </div>
                <div className="border-t border-dashed pt-1.5 flex justify-between font-bold text-sm"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                <span>TOTAL</span>
                <span className="font-mono" style={{ color: '#42A5F5' }}>Rs. {grandTotal.toLocaleString()}</span>
                </div>
            </div>

            {/* Loyalty points earned */}
            {pointsEarned > 0 && (
                <div className="py-2 mb-3 text-xs text-center rounded-lg"
                style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                <Star size={11} className="inline mr-1" fill="currentColor" />
                You earned <strong>+{pointsEarned} loyalty points!</strong>
                </div>
            )}

            {/* Footer */}
            <div className="pt-3 text-center border-t border-dashed" style={{ borderColor: 'var(--border-color)' }}>
                <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                {receiptFooter || 'Thank you for shopping with us!'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Powered by Ceylon POS</p>
            </div>
            </div>

            {/* Action buttons */}
            <div className="p-4 border-t no-print" style={{ borderColor: 'var(--border-color)' }}>
            <div className="grid grid-cols-3 gap-2 mb-3">
                <button onClick={onClose}
                className="py-2.5 rounded-xl text-xs font-medium transition-all"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                Cancel
                </button>
                <button onClick={handleDownload}
                className="py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5"
                style={{ background: 'rgba(21,101,192,0.15)', border: '1px solid rgba(21,101,192,0.3)', color: '#42A5F5' }}>
                <Download size={13} /> Save
                </button>
                <button onClick={handlePrint}
                className="py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 text-white"
                style={{ background: 'rgba(21,101,192,0.8)' }}>
                <Printer size={13} /> Print
                </button>
            </div>
            <button onClick={onConfirm}
                className="flex items-center justify-center w-full gap-2 py-3 text-sm font-semibold text-white rounded-xl"
                style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5)', boxShadow: '0 4px 16px rgba(21,101,192,0.3)' }}>
                <Check size={16} /> Complete Sale
            </button>
            </div>
        </div>
        </div>
    );
}
