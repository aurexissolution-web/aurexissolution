

import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import type { Invoice, LineItem } from '../../types';
import { Plus, Edit, Trash2, X, Sparkles, Download } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { generateInvoiceCode } from '../../utils/uniqueCodeGenerator';

// Handle TypeScript errors for CDN-loaded libraries
declare global {
  interface Window {
    jspdf: any;
  }
}

const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
        case 'Paid': return 'bg-green-100 text-green-800';
        case 'Sent': return 'bg-blue-100 text-blue-800';
        case 'Overdue': return 'bg-red-100 text-red-800';
        case 'Draft': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const AdminInvoices: React.FC = () => {
    const { invoices, addInvoice, updateInvoice, deleteInvoice, generateLineItemsFromPrompt } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentInvoice, setCurrentInvoice] = useState<Invoice | Omit<Invoice, 'id'> | null>(null);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiError, setAiError] = useState('');

    const generateInvoicePDF = (invoice: Invoice) => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();

        // --- PDF CONTENT ---
        // 1. Header
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Aurexis Solution', 14, 20);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        let yPos = 30;
        const address = 'Amanjaya, Jalan Badlishah, Bandar Amanjaya, 08000 Sungai Petani, Kedah';
        const addressLines = doc.splitTextToSize(address, 80);
        doc.text(addressLines, 14, yPos);
        yPos += addressLines.length * 5;
        
        doc.text('Tel: +60 16-407 1129 (Mr. Jay) / +60 11-7111 3184 (Mr. Shan)', 14, yPos);
        yPos += 10;

        doc.setLineWidth(0.5);
        doc.line(14, yPos - 5, pageWidth - 14, yPos - 5);

        // 2. Customer and Invoice Details
        yPos += 8;
        const detailsX = 130;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('TO:', 14, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(invoice.customerName, 14, yPos + 6);
        const customerAddressLines = doc.splitTextToSize(invoice.customerAddress, 80);
        doc.text(customerAddressLines, 14, yPos + 12);
        let customerYPos = yPos + 12 + (customerAddressLines.length * 5);
        const customerContactLines = doc.splitTextToSize(invoice.customerContactPerson, 80);
        doc.text(customerContactLines, 14, customerYPos);

        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE', detailsX, yPos);
        
        doc.setFontSize(10);
        const detailsStartY = yPos + 8;
        const detailRow = (label: string, value: string, y: number) => {
            doc.setFont('helvetica', 'bold');
            doc.text(label, detailsX, y);
            doc.setFont('helvetica', 'normal');
            doc.text(`: ${value}`, detailsX + 30, y);
        };
        
        detailRow('Invoice No', invoice.invoiceNumber, detailsStartY);
        detailRow('Customer Code', invoice.customerCode, detailsStartY + 6);
        detailRow('Credit Term', invoice.creditTerm, detailsStartY + 12);
        detailRow('Date', formatDate(invoice.invoiceDate), detailsStartY + 18);
        detailRow('Page', '1 of 1', detailsStartY + 24);

        const tableStartY = Math.max(customerYPos + (customerContactLines.length * 5), detailsStartY + 24) + 15;

        // 3. Table
        const tableColumn = ["Item", "Description", "Quantity", "Unit", "Unit Price", "Disc (%)", "Amount"];
        const tableRows = invoice.items.map(item => {
            const amount = item.quantity * item.price * (1 - (item.discount / 100));
            return [
                item.itemCode,
                item.description,
                item.quantity.toFixed(2),
                item.unit,
                item.price.toFixed(2),
                item.discount.toFixed(2),
                formatCurrency(amount).replace('RM', '').trim()
            ];
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: tableStartY,
            theme: 'grid',
            headStyles: { fillColor: [230, 230, 230], textColor: 0, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 2, overflow: 'linebreak' },
            columnStyles: {
                0: { cellWidth: 20 }, 1: { cellWidth: 55 }, 2: { cellWidth: 15, halign: 'right' },
                3: { cellWidth: 15, halign: 'center' }, 4: { cellWidth: 25, halign: 'right' },
                5: { cellWidth: 15, halign: 'right' }, 6: { cellWidth: 25, halign: 'right' }
            }
        });

        // 4. Totals
        const finalY = doc.autoTable.previous.finalY;
        const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price * (1 - (item.discount / 100))), 0);
        const sstAmount = subtotal * (invoice.sstRate / 100);
        const total = subtotal + sstAmount;
        
        const totalsX = 140;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        
        doc.text('Total Excl. SST', totalsX, finalY + 8);
        doc.text(`SST @ ${invoice.sstRate}%`, totalsX, finalY + 14);
        doc.text('Total Amount Due', totalsX, finalY + 20);

        doc.setFont('helvetica', 'normal');
        doc.text(formatCurrency(subtotal), pageWidth - 14, finalY + 8, { align: 'right' });
        doc.text(formatCurrency(sstAmount), pageWidth - 14, finalY + 14, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.text(formatCurrency(total), pageWidth - 14, finalY + 20, { align: 'right' });

        let bottomY = finalY + 30;

        // 5. Footer Details
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Bank Details:', 14, bottomY);
        doc.setFont('helvetica', 'normal');
        const bankDetailsLines = doc.splitTextToSize(invoice.bankDetails, 80);
        doc.text(bankDetailsLines, 14, bottomY + 4);
        bottomY += (bankDetailsLines.length * 4) + 4;

        doc.setFont('helvetica', 'bold');
        doc.text('Note:', 14, bottomY);
        doc.setFont('helvetica', 'normal');
        const noteLines = doc.splitTextToSize(invoice.notes, 80);
        doc.text(noteLines, 14, bottomY + 4);
        bottomY += (noteLines.length * 4) + 10;
        
        doc.text('This is a computer-generated invoice. No signature is required.', 14, bottomY);

        doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
    };

    const openModal = async (invoice: Invoice | null = null) => {
        if (invoice) {
            setCurrentInvoice({ ...invoice, items: [...invoice.items] });
        } else {
            try {
                const uniqueInvoiceNumber = await generateInvoiceCode();
                const newInvoiceTemplate = {
                    invoiceNumber: uniqueInvoiceNumber,
                    customerName: '',
                    customerAddress: '',
                    customerCode: '',
                    customerContactPerson: '',
                    invoiceDate: new Date().toISOString().split('T')[0],
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    creditTerm: '30 Days',
                    items: [{ id: `item-${Date.now()}`, itemCode: '', description: '', quantity: 1, unit: 'UNIT', price: 0, discount: 0 }],
                    status: 'Draft' as Invoice['status'],
                    sstRate: 0,
                    deliveryDate: '',
                    deliveryAddress: '',
                    notes: 'Price are subjected to change without prior notice.',
                    bankDetails: 'PUBLIC BANK BERHAD - 3088 1277 17',
                };
                setCurrentInvoice(newInvoiceTemplate);
            } catch (error) {
                console.error('Error generating unique invoice code:', error);
                // Fallback to old method if unique code generation fails
                const fallbackInvoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;
                const newInvoiceTemplate = {
                    invoiceNumber: fallbackInvoiceNumber,
                    customerName: '',
                    customerAddress: '',
                    customerCode: '',
                    customerContactPerson: '',
                    invoiceDate: new Date().toISOString().split('T')[0],
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    creditTerm: '30 Days',
                    items: [{ id: `item-${Date.now()}`, itemCode: '', description: '', quantity: 1, unit: 'UNIT', price: 0, discount: 0 }],
                    status: 'Draft' as Invoice['status'],
                    sstRate: 0,
                    deliveryDate: '',
                    deliveryAddress: '',
                    notes: 'Price are subjected to change without prior notice.',
                    bankDetails: 'PUBLIC BANK BERHAD - 3088 1277 17',
                };
                setCurrentInvoice(newInvoiceTemplate);
            }
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentInvoice(null);
        setAiPrompt('');
        setAiError('');
        setIsGenerating(false);
    };

    const handleSave = () => {
        if (!currentInvoice) return;
        if ('id' in currentInvoice) {
            updateInvoice(currentInvoice as Invoice);
        } else {
            addInvoice(currentInvoice);
        }
        closeModal();
    };

    const handleGenerateItems = async () => {
        if (!aiPrompt.trim()) return;
        setIsGenerating(true);
        setAiError('');

        const generatedItems = await generateLineItemsFromPrompt(aiPrompt);

        if (generatedItems && currentInvoice) {
            setCurrentInvoice({ ...currentInvoice, items: generatedItems });
            setAiPrompt('');
        } else {
            setAiError('Failed to generate items. Please try a different prompt or add items manually.');
        }

        setIsGenerating(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!currentInvoice) return;
        const { name, value } = e.target;
        setCurrentInvoice({ ...currentInvoice, [name]: name === 'sstRate' ? Number(value) : value });
    };

    const handleItemChange = (itemId: string, field: keyof Omit<LineItem, 'id'>, value: string | number) => {
        if (!currentInvoice) return;
        const updatedItems = currentInvoice.items.map(item =>
            item.id === itemId ? { ...item, [field]: value } : item
        );
        setCurrentInvoice({ ...currentInvoice, items: updatedItems });
    };

    const addItem = () => {
        if (!currentInvoice) return;
        const newItem: LineItem = { id: `item-${Date.now()}`, itemCode: '', description: '', quantity: 1, unit: 'UNIT', price: 0, discount: 0 };
        setCurrentInvoice({ ...currentInvoice, items: [...currentInvoice.items, newItem] });
    };
    
    const removeItem = (itemId: string) => {
        if (!currentInvoice || currentInvoice.items.length <= 1) return;
        const updatedItems = currentInvoice.items.filter(item => item.id !== itemId);
        setCurrentInvoice({ ...currentInvoice, items: updatedItems });
    };

    const total = useMemo(() => {
        return currentInvoice?.items.reduce((sum, item) => sum + item.quantity * item.price * (1 - (item.discount / 100)), 0) || 0;
    }, [currentInvoice]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-neutral">Manage Invoices</h2>
                <button onClick={() => openModal()} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg flex items-center">
                    <Plus size={18} className="mr-2" /> Add Invoice
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-3">Invoice #</th>
                                <th className="text-left p-3">Customer</th>
                                <th className="text-left p-3">Date</th>
                                <th className="text-left p-3">Total</th>
                                <th className="text-left p-3">Status</th>
                                <th className="text-right p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map(invoice => (
                                <tr key={invoice.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-medium">{invoice.invoiceNumber}</td>
                                    <td className="p-3">{invoice.customerName}</td>
                                    <td className="p-3 text-neutral-light">{formatDate(invoice.invoiceDate)}</td>
                                    <td className="p-3 font-medium">{formatCurrency(invoice.items.reduce((acc, item) => acc + item.price * item.quantity, 0))}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => generateInvoicePDF(invoice)} className="text-green-600 hover:text-green-800 p-2" aria-label="Download PDF"><Download size={18} /></button>
                                        <button onClick={() => openModal(invoice)} className="text-blue-600 hover:text-blue-800 p-2"><Edit size={18} /></button>
                                        <button onClick={() => deleteInvoice(invoice.id)} className="text-red-600 hover:text-red-800 p-2"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && currentInvoice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-6">{'id' in currentInvoice ? 'Edit' : 'Create'} Invoice</h3>
                        
                        <div className="mb-6 p-4 border border-primary/20 rounded-lg bg-primary/5">
                            <label className="flex items-center text-md font-semibold text-text-primary mb-2"><Sparkles className="w-5 h-5 mr-2 text-primary" />Generate Items with AI</label>
                            <p className="text-sm text-text-secondary mb-3">Describe the billable items. E.g., "Monthly cloud services for $2000, a one-time setup fee of $500, and 5 hours of premium support at $200/hr".</p>
                            <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="Enter a prompt..." className="w-full p-2 border rounded-md mb-2" rows={2} disabled={isGenerating}/>
                             <button type="button" onClick={handleGenerateItems} disabled={isGenerating || !aiPrompt.trim()} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg flex items-center transition-opacity disabled:opacity-50">
                                {isGenerating ? 'Generating...' : 'Generate'}
                            </button>
                            {aiError && <p className="text-red-500 text-xs mt-2">{aiError}</p>}
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input name="invoiceNumber" placeholder="Invoice Number" value={currentInvoice.invoiceNumber} onChange={handleChange} className="w-full p-2 border rounded-md" />
                                <select name="status" value={currentInvoice.status} onChange={handleChange} className="w-full p-2 border rounded-md">
                                    <option>Draft</option><option>Sent</option><option>Paid</option><option>Overdue</option>
                                </select>
                                <input name="creditTerm" placeholder="Credit Term" value={currentInvoice.creditTerm} onChange={handleChange} className="w-full p-2 border rounded-md" />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-neutral-light">Customer Name</label>
                                    <input name="customerName" placeholder="Customer Name" value={currentInvoice.customerName} onChange={handleChange} className="w-full p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-light">Customer Code</label>
                                    <input name="customerCode" placeholder="Customer Code" value={currentInvoice.customerCode} onChange={handleChange} className="w-full p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-light">Customer Address</label>
                                    <textarea name="customerAddress" placeholder="Customer Address" value={currentInvoice.customerAddress} onChange={handleChange} className="w-full p-2 border rounded-md" rows={3}/>
                                </div>
                                 <div>
                                    <label className="text-xs text-neutral-light">Customer Contact</label>
                                    <textarea name="customerContactPerson" placeholder="Attn: Name, Tel: ..." value={currentInvoice.customerContactPerson} onChange={handleChange} className="w-full p-2 border rounded-md" rows={3}/>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                    <label className="text-xs text-neutral-light">Invoice Date</label>
                                    <input name="invoiceDate" type="date" value={currentInvoice.invoiceDate} onChange={handleChange} className="w-full p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-light">Due Date</label>
                                    <input name="dueDate" type="date" value={currentInvoice.dueDate} onChange={handleChange} className="w-full p-2 border rounded-md" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h4 className="font-bold mb-2">Items</h4>
                            <div className="hidden md:grid grid-cols-12 gap-2 mb-1 text-xs font-bold text-neutral-light">
                                <span className="col-span-2">Item Code</span><span className="col-span-4">Description</span><span className="col-span-1 text-center">Qty</span><span className="col-span-1">Unit</span><span className="col-span-1 text-right">Price</span><span className="col-span-1 text-right">Disc %</span><span className="col-span-1 text-right">Amount</span><span className="col-span-1"></span>
                            </div>
                            {currentInvoice.items.map((item) => (
                                <div key={item.id} className="grid grid-cols-12 gap-2 mb-2 items-center">
                                    <input placeholder="Code" value={item.itemCode} onChange={(e) => handleItemChange(item.id, 'itemCode', e.target.value)} className="col-span-12 md:col-span-2 p-2 border rounded-md text-sm" />
                                    <input placeholder="Description" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} className="col-span-12 md:col-span-4 p-2 border rounded-md text-sm" />
                                    <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))} className="col-span-3 md:col-span-1 p-2 border rounded-md text-sm" />
                                    <input placeholder="Unit" value={item.unit} onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)} className="col-span-3 md:col-span-1 p-2 border rounded-md text-sm" />
                                    <input type="number" placeholder="Price" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', Number(e.target.value))} className="col-span-3 md:col-span-1 p-2 border rounded-md text-sm" />
                                    <input type="number" placeholder="Discount" value={item.discount} onChange={(e) => handleItemChange(item.id, 'discount', Number(e.target.value))} className="col-span-3 md:col-span-1 p-2 border rounded-md text-sm" />
                                    <span className="hidden md:block col-span-1 text-right font-medium text-sm">{formatCurrency(item.quantity * item.price * (1 - (item.discount / 100)))}</span>
                                    <button onClick={() => removeItem(item.id)} className="col-span-12 md:col-span-1 text-red-500 hover:text-red-700 disabled:opacity-50 flex justify-center" disabled={currentInvoice.items.length <= 1}><X size={18} /></button>
                                </div>
                            ))}
                            <button onClick={addItem} className="text-sm text-primary hover:underline mt-2">+ Add Item</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="text-xs text-neutral-light">Bank Details</label>
                                    <textarea name="bankDetails" placeholder="Bank Name - Account Number" value={currentInvoice.bankDetails} onChange={handleChange} className="w-full p-2 border rounded-md" rows={3}/>
                                </div>
                                 <div>
                                    <label className="text-xs text-neutral-light">Notes</label>
                                    <textarea name="notes" placeholder="Notes..." value={currentInvoice.notes} onChange={handleChange} className="w-full p-2 border rounded-md" rows={3}/>
                                </div>
                                <div>
                                    <label className="text-xs text-neutral-light">SST Rate (%)</label>
                                    <input type="number" name="sstRate" placeholder="SST Rate" value={currentInvoice.sstRate} onChange={handleChange} className="w-full p-2 border rounded-md"/>
                                </div>
                        </div>


                        <div className="mt-6 flex justify-between items-center border-t pt-4">
                            <div className="text-xl font-bold">Total: {formatCurrency(total * (1 + currentInvoice.sstRate/100))}</div>
                            <div className="flex space-x-3">
                                <button onClick={closeModal} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                                <button onClick={handleSave} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg">Save</button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminInvoices;