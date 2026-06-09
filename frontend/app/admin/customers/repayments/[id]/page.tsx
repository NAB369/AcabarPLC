'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { 
  ArrowLeft, CheckCircle2, Clock, DollarSign, 
  Calendar, FileText, User, CreditCard, Loader2,
  CheckCircle, AlertCircle, X, ExternalLink,
  Eye, Printer, Download, QrCode, Upload
} from 'lucide-react';
import Link from 'next/link';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
export default function LoanRepaymentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loan, setLoan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'KHQR' | 'TRANSFER'>('CASH');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [inputAmount, setInputAmount] = useState<string>('');
  const [bankAccount, setBankAccount] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [khqrImage, setKhqrImage] = useState<string | null>(null);

  const [showCropModal, setShowCropModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 50, height: 50, x: 25, y: 25 });
  const [completedCrop, setCompletedCrop] = useState<any>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('company_khqr');
    if (saved) setKhqrImage(saved);
  }, []);

  const handleKhqrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempImageSrc(event.target?.result as string);
        setShowCropModal(true);
        setCrop({ unit: '%', width: 50, height: 50, x: 25, y: 25 });
        setCompletedCrop(null);
      };
      reader.readAsDataURL(e.target.files[0]);
      e.target.value = '';
    }
  };

  const getCroppedImg = async (): Promise<string> => {
    if (!completedCrop || !imgRef.current) return '';
    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    return canvas.toDataURL('image/jpeg');
  };

  const handleSaveCrop = async () => {
    if (!tempImageSrc || !completedCrop) return;
    try {
      const croppedImageBase64 = await getCroppedImg();
      setKhqrImage(croppedImageBase64);
      localStorage.setItem('company_khqr', croppedImageBase64);
      setShowCropModal(false);
      setTempImageSrc(null);
    } catch (e) {
      console.error(e);
      alert('Failed to crop image');
    }
  };

  const handleRemoveKhqr = () => {
    setKhqrImage(null);
    localStorage.removeItem('company_khqr');
  };

  const handleExportXLS = () => {
    if (!loan?.repaymentSchedules) return;
    
    const khmerDays = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
    
    // Prepare the schedules rows
    const rowsHtml = schedulesWithBalance.map((s: any) => {
      const date = new Date(s.dueDate);
      const khmerDay = khmerDays[date.getDay()];
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      const totalDue = s.amountDue + Number(loan.collectionFeeValue || 0) + Number(s.penaltyAmount || 0);
      
      return `
        <tr>
          <td style="border: 1px solid #000000; padding: 6px; text-align: center; font-size: 10pt;">${s.installmentNumber}</td>
          <td style="border: 1px solid #000000; padding: 6px; font-size: 10pt; text-align: left;">
            <table border="0" style="border-collapse: collapse; width: 100%; font-size: 10pt;">
              <tr>
                <td style="color: #1d4ed8; padding: 0; border: none;">${khmerDay}</td>
                <td style="text-align: right; padding: 0; border: none;">${formattedDate}</td>
              </tr>
            </table>
          </td>
          <td style="border: 1px solid #000000; padding: 6px; text-align: right; font-size: 10pt;">${s.principalComponent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="border: 1px solid #000000; padding: 6px; text-align: right; font-size: 10pt;">${s.interestComponent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="border: 1px solid #000000; padding: 6px; text-align: right; font-size: 10pt;">${Number(loan.collectionFeeValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="border: 1px solid #000000; padding: 6px; text-align: right; font-size: 10pt; font-weight: bold;">${totalDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="border: 1px solid #000000; padding: 6px; text-align: right; font-size: 10pt;">${s.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td style="border: 1px solid #000000; padding: 6px; text-align: right; font-size: 10pt; color: ${Number(s.penaltyAmount) > 0 ? '#ff0000' : '#000000'};">${Number(s.penaltyAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join('');

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const logoUrl = `${origin}/acabar-logo.png`;

    const htmlTable = `
      <html xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head>
        <meta http-equiv="content-type" content="text/plain; charset=UTF-8"/>
        <style>
          table { border-collapse: collapse; }
          td, th { border: none; font-family: 'Times New Roman', 'Khmer OS Battambang', serif; }
        </style>
      </head>
      <body>
        <!-- Header -->
        <table border="0" style="margin-bottom: 20px; width: 100%;">
          <tr>
            <td width="150" align="left" valign="middle">
              <img src="${logoUrl}" width="120" height="120" />
            </td>
            <td align="center" valign="middle" colspan="6">
              <font size="5"><b>អាខាបារ ម.ក</b></font><br/>
              <font size="4"><b>ACABAR .PLC</b></font><br/>
              <font size="5"><b>តារាងកាលវិភាគសងប្រាក់</b></font>
            </td>
            <td width="150" align="right" valign="middle">
              ${khqrImage ? `<img src="${khqrImage}" width="200" height="180" />` : ''}
            </td>
          </tr>
        </table>

        <!-- Metadata Grid -->
        <table border="0" style="margin-bottom: 20px; font-size: 11pt; width: 100%;">
          <tr>
            <td colspan="2"><b>លេខគណនី (AccNo)</b></td>
            <td colspan="2">${loan.lid || loan.id.substring(0, 8).toUpperCase()}</td>
            <td colspan="2"><b>ទំហំប្រាក់កម្ចី (Amount)</b></td>
            <td colspan="2">${loan.currency === 'KHR' ? '៛' : 'USD'} ${loan.principalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td colspan="2"><b>លេខអតិថិជន (CID)</b></td>
            <td colspan="2">${loan.customer.cid || loan.customerId.substring(0, 6).toUpperCase()}</td>
            <td colspan="2"><b>ថ្ងៃបើកប្រាក់ (Disb Date)</b></td>
            <td colspan="2">${loan.disbursementDate ? new Date(loan.disbursementDate).toLocaleDateString('en-GB') : new Date(loan.createdAt).toLocaleDateString('en-GB')}</td>
          </tr>
          <tr>
            <td colspan="2"><b>ឈ្មោះអតិថិជន (Name)</b></td>
            <td colspan="2" style="font-weight: bold; text-transform: uppercase;">
              ${loan.customer.khmerFirstName || loan.customer.khmerLastName 
                ? `${loan.customer.khmerLastName || ''} ${loan.customer.khmerFirstName || ''}`.trim()
                : `${loan.customer.firstName} ${loan.customer.lastName}`}
            </td>
            <td colspan="2"><b>អត្រាប្រាក់ (Rate)</b></td>
            <td colspan="2">${loan.interestRate?.toFixed(2) || '0.00'} %</td>
          </tr>
          <tr>
            <td colspan="2"><b>ភេទ (Sex)</b></td>
            <td colspan="2">${loan.customer.gender || 'N/A'}</td>
            <td colspan="2"><b>រយៈពេល (Period)</b></td>
            <td colspan="2">${loan.durationMonths || loan.numberOfInstallments} ${loan.repaymentType === 'MONTHLY' ? 'Monthly' : loan.repaymentType === 'WEEKLY' ? 'Weekly' : 'Installments'}</td>
          </tr>
          <tr>
            <td colspan="2"><b>ទូរស័ព្ទ (Tel)</b></td>
            <td colspan="2">${loan.customer.phone || 'N/A'}</td>
            <td colspan="2"><b>ជុំទី (Loan Seq)</b></td>
            <td colspan="2">${loan.loanCycle || 'New'}</td>
          </tr>
          <tr>
            <td colspan="2"><b>គោលបំណងកម្ចី</b></td>
            <td colspan="2">${loan.reasonOfCredit || '-'}</td>
            <td colspan="2"><b>សេវា (Admin Fee)</b></td>
            <td colspan="2">${loan.adminFeeRate ? `${loan.adminFeeRate.toFixed(2)} % = ${(loan.principalAmount * (loan.adminFeeRate / 100)).toFixed(2)}` : '0.00 % = 0.00'}</td>
          </tr>
          <tr>
            <td colspan="2"></td>
            <td colspan="2"></td>
            <td colspan="2"><b>Refinance Fee</b></td>
            <td colspan="2">${loan.refinanceFeeAmt ? loan.refinanceFeeAmt.toFixed(2) : '0.00'}</td>
          </tr>
          <tr>
            <td colspan="2"></td>
            <td colspan="2"></td>
            <td colspan="2"><b>ភ្នាក់ងារឥណទាន (CO)</b></td>
            <td colspan="2">${loan.loanOfficer ? `${loan.loanOfficer.firstName} ${loan.loanOfficer.lastName}` : 'N/A'}</td>
          </tr>
          <tr>
            <td colspan="2"><b>Address</b></td>
            <td colspan="6">${loan.customer.address || '-'}</td>
          </tr>
        </table>

        <!-- Main schedules table -->
        <table border="1" style="width: 100%; font-size: 10pt; text-align: center;">
          <thead>
            <tr style="background-color: #1d4ed8; color: #ffffff;">
              <th style="padding: 6px; color: #ffffff; background-color: #1d4ed8;"><b>លេខ<br/>No</b></th>
              <th style="padding: 6px; color: #ffffff; background-color: #1d4ed8;"><b>ថ្ងៃបង់ប្រាក់<br/>Repayment Date</b></th>
              <th style="padding: 6px; color: #ffffff; background-color: #1d4ed8;"><b>ប្រាក់ដើម<br/>Principle</b></th>
              <th style="padding: 6px; color: #ffffff; background-color: #1d4ed8;"><b>ការប្រាក់<br/>Interest</b></th>
              <th style="padding: 6px; color: #ffffff; background-color: #1d4ed8;"><b>សេវាប្រមូល<br/>Col Fee</b></th>
              <th style="padding: 6px; color: #ffffff; background-color: #1d4ed8;"><b>សរុប<br/>Total</b></th>
              <th style="padding: 6px; color: #ffffff; background-color: #1d4ed8;"><b>ប្រាក់ដើមនៅសល់<br/>Balance</b></th>
              <th style="padding: 6px; color: #ffffff; background-color: #1d4ed8;"><b>ប្រាក់ផាកពិន័យបង់យឺត<br/>Penalty Payoff</b></th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            <!-- Total Row -->
            <tr>
              <td colspan="2" style="border-left: 1px solid #000000; border-right: 1px solid #000000; border-top: 1px solid #000000; border-bottom: 1px solid #000000; padding: 6px; font-weight: bold;"></td>
              <td style="border: 1px solid #000000; padding: 6px; text-align: right; font-weight: bold;">${loan.principalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td colspan="5" style="border-left: 1px solid #000000; border-right: 1px solid #000000; border-top: 1px solid #000000; border-bottom: 1px solid #000000; padding: 6px;"></td>
            </tr>
          </tbody>
        </table>

        <!-- Signatures -->
        <table border="0" style="width: 100%; margin-top: 30px; font-size: 11pt;">
          <tr>
            <td colspan="4" width="50%" align="left">
              <b>កាលបរិច្ឆេទ (Date)</b>: ${new Date().toLocaleDateString('en-GB')}<br/>
              <b>រៀបចំដោយ (Prepare by)</b>:
            </td>
            <td colspan="4" width="50%" align="right">
              <b>កាលបរិច្ឆេទ (Date)</b>: ${new Date().toLocaleDateString('en-GB')}<br/>
              <b>ស្នាមមេដៃអតិថិជន (Customer's thumbprint)</b>:
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlTable], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Loan_${loan.id.substring(0, 8)}_Schedule.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenPayModal = (s: any) => {
    const penalty = Number(s.penaltyAmount || 0);
    const totalDue = Number(s.amountDue || 0) + penalty;
    setSelectedInstallment(s);
    setInputAmount(totalDue.toString());
    setBankAccount('');
    setPaymentProof(null);
    setPaymentMethod('CASH');
    setShowPayModal(true);
  };

  const fetchLoanDetail = async () => {
    try {
      // Re-using the LOS detail endpoint as it contains schedules
      const data = await api.get(`/los/${id}`);
      setLoan(data);
    } catch (err) {
      console.error('Failed to fetch loan details', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchLoanDetail();
    }
  }, [id]);

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    const penalty = Number(selectedInstallment?.penaltyAmount || 0);
    const totalDue = Number(selectedInstallment?.amountDue || 0) + penalty;
    const amountToPay = paymentMethod === 'CASH' ? inputAmount : totalDue;
    try {
      if (paymentProof || paymentMethod === 'TRANSFER') {
        const formData = new FormData();
        formData.append('loanId', id as string);
        formData.append('amount', amountToPay.toString());
        formData.append('paymentMethod', paymentMethod);
        if (paymentMethod === 'TRANSFER') formData.append('bankAccount', bankAccount);
        if (paymentProof) formData.append('file', paymentProof);
        await api.upload('/repayments/process', formData);
      } else {
        await api.post('/repayments/process', {
          loanId: id,
          amount: amountToPay,
          paymentMethod
        });
      }
      alert('Payment processed successfully!');
      setShowPayModal(false);
      fetchLoanDetail();
    } catch (err: any) {
      alert('Payment failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader2 className="animate-spin" size={40} color="var(--primary)" />
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="card animate-fade-in" style={{
        maxWidth: '500px',
        margin: '4rem auto',
        padding: '3rem 2rem',
        textAlign: 'center',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRadius: 'var(--radius-lg)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: 'var(--error-text)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2rem',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.05)'
        }}>
          <AlertCircle size={36} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--foreground)' }}>Loan Details Not Found</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2.5rem', maxWidth: '380px' }}>
          We couldn't locate the loan details you requested. The loan ID may be invalid, or the system database was recently reset.
        </p>
        <Link href="/admin/customers/repayments" className="btn btn-primary" style={{
          textDecoration: 'none',
          padding: '0.75rem 2rem',
          borderRadius: '10px',
          fontWeight: '700',
          fontSize: '0.95rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <ArrowLeft size={18} /> Back to Repayments List
        </Link>
      </div>
    );
  }

  const paidInstallments = loan.repaymentSchedules?.filter((s: any) => s.status === 'PAID').length || 0;
  const totalInstallments = loan.repaymentSchedules?.length || 0;
  const progress = (paidInstallments / totalInstallments) * 100;

  let runningBalance = loan.principalAmount || 0;
  const schedulesWithBalance = loan.repaymentSchedules?.map((s: any) => {
    runningBalance -= s.principalComponent;
    return { ...s, remainingBalance: Math.max(0, runningBalance) };
  }) || [];

  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={() => router.back()} style={{ border: '1px solid var(--border-color)', background: 'var(--card-bg)', padding: '0.6rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em', margin: 0 }}>Repayment <span className="text-gradient">Schedule</span></h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Full repayment trail for loan #{loan.id.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
           <button onClick={() => setShowPreview(true)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px' }}>
             <Eye size={16} /> Preview
           </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        {/* Main Schedule Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--background)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0 }}>Installment Breakdown</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Due Date</th>
                  <th>Principal</th>
                  <th>Interest</th>
                  <th>Col Fee</th>
                  <th>Total Due</th>
                  <th>Balance</th>
                  <th>Penalty Payoff</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {schedulesWithBalance.map((s: any) => (
                  <tr key={s.id} style={{ opacity: s.status === 'PAID' ? 0.7 : 1 }}>
                    <td style={{ fontWeight: '700', color: 'var(--text-muted)' }}>{s.installmentNumber.toString().padStart(2, '0')}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                        <Calendar size={14} color="var(--text-muted)" />
                        {new Date(s.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td>${s.principalComponent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>${s.interestComponent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ color: 'var(--text-muted)' }}>$0.00</td>
                    <td>
                      <div style={{ fontWeight: '700', color: s.status === 'PAID' ? 'var(--text-muted)' : 'var(--primary)' }}>
                        ${(Number(s.amountDue) + Number(s.penaltyAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--text-muted-dark)' }}>
                        ${s.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td style={{ color: Number(s.penaltyAmount) > 0 ? 'var(--error-text)' : 'var(--text-muted)', fontWeight: Number(s.penaltyAmount) > 0 ? '700' : '400' }}>
                      ${Number(s.penaltyAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td>
                      {s.status === 'PAID' ? (
                        <span style={{ color: 'var(--success-text)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '700' }}>
                          <CheckCircle2 size={14} /> Paid
                        </span>
                      ) : s.status === 'OVERPAID' ? (
                        <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '700' }}>
                          <CheckCircle2 size={14} /> Overpaid
                        </span>
                      ) : s.status === 'OVERDUE' ? (
                        <span style={{ color: 'var(--error-text)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '700' }}>
                          <AlertCircle size={14} /> Overdue
                        </span>
                      ) : s.status === 'PARTIALLY_PAID' || s.status === 'PARTIAL' ? (
                        <span style={{ color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '700' }}>
                          <Clock size={14} /> Partially paid
                        </span>
                      ) : (
                        <span style={{ color: 'var(--warning-text)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '700' }}>
                          <Clock size={14} /> Pending
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {s.status !== 'PAID' && (
                        <button 
                          onClick={() => handleOpenPayModal(s)}
                          className="btn btn-primary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', borderRadius: '8px' }}
                        >
                          Collect
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
             <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <User size={18} color="var(--primary)" /> Borrower Info
             </h3>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
               <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                 {loan.customer.firstName[0]}{loan.customer.lastName[0]}
               </div>
               <div>
                 <div style={{ fontWeight: '700' }}>{loan.customer.firstName} {loan.customer.lastName}</div>
                 <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{loan.customer.phone}</div>
               </div>
             </div>
             <div style={{ height: '1px', backgroundColor: 'var(--border-color)', marginBottom: '1.25rem' }} />
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Loan Amount</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: '700' }}>${loan.principalAmount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Interest Rate</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: '700' }}>{loan.interestRate}% p.a.</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Total Tenure</span>
                  <span style={{ fontSize: '0.8125rem', fontWeight: '700' }}>{loan.durationMonths} Months</span>
                </div>
             </div>
          </div>
          
          {/* KHQR Setup Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <QrCode size={18} color="var(--primary)" /> KHQR Setup
              </h3>
              {khqrImage && (
                <button onClick={handleRemoveKhqr} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error-text)', fontSize: '0.75rem', fontWeight: '600' }}>Remove</button>
              )}
            </div>
            
            {khqrImage ? (
              <div style={{ textAlign: 'center' }}>
                <img src={khqrImage} alt="KHQR" style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '8px', objectFit: 'contain' }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>This QR will be displayed on the printed statement.</p>
              </div>
            ) : (
              <div style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '1.5rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => document.getElementById('khqr-upload')?.click()} onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                <Upload size={24} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--foreground)' }}>Upload KHQR</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>For statement preview & print</div>
                <input id="khqr-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleKhqrUpload} />
              </div>
            )}
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.25rem' }}>Repayment Progress</h3>
            <div style={{ position: 'relative', height: '8px', backgroundColor: 'var(--bg-muted)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${progress}%`, backgroundColor: 'var(--primary)', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
               <div>
                 <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{paidInstallments} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500' }}>/ {totalInstallments}</span></div>
                 <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>INSTALLMENTS PAID</div>
               </div>
               <div style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary)' }}>{Math.round(progress)}%</div>
                 <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>COMPLETE</div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pay Modal */}
      {showPayModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s' }}>
          <div className="card" style={{ width: '400px', padding: '2rem', animation: 'slideUp 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Process Payment</h3>
              <button onClick={() => setShowPayModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ backgroundColor: 'var(--background)', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Installment #{selectedInstallment.installmentNumber} Amount</div>
              <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)' }}>${(Number(selectedInstallment.amountDue) + Number(selectedInstallment.penaltyAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              {Number(selectedInstallment.penaltyAmount) > 0 && (
                <div style={{ fontSize: '0.875rem', color: 'var(--error-text)', fontWeight: '600', marginTop: '0.5rem' }}>Includes ${Number(selectedInstallment.penaltyAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Late Penalty</div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted-dark)' }}>Payment Method</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <button 
                  onClick={() => setPaymentMethod('CASH')}
                  style={{ padding: '0.75rem 0.5rem', borderRadius: '12px', border: paymentMethod === 'CASH' ? '2px solid var(--primary)' : '1px solid var(--border-color)', backgroundColor: paymentMethod === 'CASH' ? 'var(--primary-light)' : 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                  <DollarSign size={18} color={paymentMethod === 'CASH' ? 'var(--primary)' : 'var(--text-muted)'} /> 
                  <span style={{ fontWeight: paymentMethod === 'CASH' ? '700' : '600', fontSize: '0.875rem', color: paymentMethod === 'CASH' ? 'var(--primary)' : 'var(--text-muted)' }}>Cash</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('KHQR')}
                  style={{ padding: '0.75rem 0.5rem', borderRadius: '12px', border: paymentMethod === 'KHQR' ? '2px solid var(--primary)' : '1px solid var(--border-color)', backgroundColor: paymentMethod === 'KHQR' ? 'var(--primary-light)' : 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                  <CreditCard size={18} color={paymentMethod === 'KHQR' ? 'var(--primary)' : 'var(--text-muted)'} /> 
                  <span style={{ fontWeight: paymentMethod === 'KHQR' ? '700' : '600', fontSize: '0.875rem', color: paymentMethod === 'KHQR' ? 'var(--primary)' : 'var(--text-muted)' }}>KHQR</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('TRANSFER')}
                  style={{ padding: '0.75rem 0.5rem', borderRadius: '12px', border: paymentMethod === 'TRANSFER' ? '2px solid var(--primary)' : '1px solid var(--border-color)', backgroundColor: paymentMethod === 'TRANSFER' ? 'var(--primary-light)' : 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                  <FileText size={18} color={paymentMethod === 'TRANSFER' ? 'var(--primary)' : 'var(--text-muted)'} /> 
                  <span style={{ fontWeight: paymentMethod === 'TRANSFER' ? '700' : '600', fontSize: '0.875rem', color: paymentMethod === 'TRANSFER' ? 'var(--primary)' : 'var(--text-muted)' }}>Transfer</span>
                </button>
              </div>

              {paymentMethod === 'CASH' && (
                <div style={{ marginTop: '0.5rem', animation: 'fadeIn 0.3s ease-out' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted-dark)', marginBottom: '0.5rem', textAlign: 'left' }}>Amount</div>
                  <input 
                    type="number" 
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', backgroundColor: 'var(--background)' }}
                    placeholder="Enter amount"
                  />
                </div>
              )}

              {paymentMethod === 'TRANSFER' && (
                <div style={{ marginTop: '0.5rem', animation: 'fadeIn 0.3s ease-out' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted-dark)', marginBottom: '0.5rem', textAlign: 'left' }}>Bank Account</div>
                  <input 
                    type="text" 
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', backgroundColor: 'var(--background)' }}
                    placeholder="Enter bank account details"
                  />
                </div>
              )}

              {(paymentMethod === 'KHQR' || paymentMethod === 'TRANSFER') && (
                <div style={{ marginTop: '0.5rem', animation: 'fadeIn 0.3s ease-out' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted-dark)', marginBottom: '0.5rem' }}>Upload Proof (Optional)</div>
                  <input 
                    type="file" 
                    onChange={(e) => setPaymentProof(e.target.files?.[0] || null)} 
                    style={{ width: '100%', padding: '0.5rem', border: '1px dashed var(--border-color)', borderRadius: '8px', fontSize: '0.875rem', backgroundColor: 'var(--background)', cursor: 'pointer' }}
                    accept="image/*,.pdf"
                  />
                  {paymentProof && paymentProof.type.startsWith('image/') && (
                    <div style={{ marginTop: '0.75rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center', backgroundColor: 'var(--bg-muted)' }}>
                      <img src={URL.createObjectURL(paymentProof)} alt="Payment Proof Preview" style={{ width: '100%', height: 'auto', maxHeight: '320px', objectFit: 'contain' }} />
                    </div>
                  )}
                  {paymentProof && !paymentProof.type.startsWith('image/') && (
                    <div style={{ marginTop: '0.75rem', padding: '0.5rem', borderRadius: '8px', backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary)', fontSize: '0.875rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={16} />
                      {paymentProof.name}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button 
              onClick={handleProcessPayment}
              disabled={isProcessing}
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '2rem', padding: '1rem', borderRadius: '12px', fontWeight: '700', fontSize: '1rem' }}
            >
              {isProcessing ? <Loader2 className="animate-spin" size={20} /> : 'Confirm Payment'}
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal / Print Area */}
      <div className={`print-overlay ${showPreview ? 'preview-active' : 'preview-hidden'}`} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s' }}>
          <div className="card print-statement" style={{ width: '800px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem', animation: 'slideUp 0.3s', backgroundColor: '#ffffff', color: '#000' }}>
            {/* Header: Logo, Title, Close Button */}
            <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
              <button onClick={() => setShowPreview(false)} style={{ position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', cursor: 'pointer', zIndex: 10 }} className="no-print"><X size={24} color="var(--text-muted)" /></button>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: '220px' }}>
                  <img src="/acabar-logo.png" alt="Logo" style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
                </div>
                <div style={{ flex: 1, textAlign: 'center', color: '#000' }}>
                  <div style={{ fontFamily: '"Khmer OS Muol Light", "Khmer OS Battambang", serif', fontSize: '1.30rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>អាខាបារ ម.ក</div>
                  <div style={{ fontSize: '1.20rem', fontWeight: 'bold', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>ACABAR .PLC</div>
                  <div style={{ fontFamily: '"Khmer OS Muol Light", "Khmer OS Battambang", serif', fontSize: '1.20rem', fontWeight: 'bold' }}>តារាងកាលវិភាគសងប្រាក់</div>
                </div>
                <div style={{ width: '220px', display: 'flex', justifyContent: 'flex-end' }}>
                  {khqrImage && <img src={khqrImage} alt="KHQR" style={{ width: '200px', height: '180px', objectFit: 'contain' }} />}
                </div>
              </div>
            </div>

            {/* Data Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1rem', fontSize: '0.9rem', fontFamily: '"Times New Roman", "Khmer OS Battambang", serif', color: '#000' }}>
              
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr' }}>
                  <div style={{ fontWeight: '600' }}>លេខគណនី (AccNo)</div>
                  <div>{loan.lid || loan.id.substring(0, 8).toUpperCase()}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr' }}>
                  <div style={{ fontWeight: '600' }}>លេខអតិថិជន (CID)</div>
                  <div>{loan.customer.cid || loan.customerId.substring(0, 6).toUpperCase()}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', alignItems: 'start' }}>
                  <div style={{ fontWeight: '600' }}>ឈ្មោះអតិថិជន<br/>(Name)</div>
                  <div style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {loan.customer.khmerFirstName || loan.customer.khmerLastName 
                      ? `${loan.customer.khmerLastName || ''} ${loan.customer.khmerFirstName || ''}`.trim()
                      : `${loan.customer.firstName} ${loan.customer.lastName}`}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr' }}>
                  <div style={{ fontWeight: '600' }}>ភេទ (Sex)</div>
                  <div>{loan.customer.gender || 'N/A'}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr' }}>
                  <div style={{ fontWeight: '600' }}>ទូរស័ព្ទ (Tel)</div>
                  <div>{loan.customer.phone || 'N/A'}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr' }}>
                  <div style={{ fontWeight: '600' }}>គោលបំណងកម្ចី</div>
                  <div>{loan.reasonOfCredit || '-'}</div>
                </div>
              </div>

              {/* Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr' }}>
                  <div style={{ fontWeight: '600' }}>ទំហំប្រាក់កម្ចី (Amount)</div>
                  <div>{loan.currency === 'KHR' ? '៛' : 'USD'} {loan.principalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr' }}>
                  <div style={{ fontWeight: '600' }}>ថ្ងៃបើកប្រាក់ (Disb Date)</div>
                  <div>{loan.disbursementDate ? new Date(loan.disbursementDate).toLocaleDateString('en-GB') : new Date(loan.createdAt).toLocaleDateString('en-GB')}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr' }}>
                  <div style={{ fontWeight: '600' }}>អត្រាប្រាក់ (Rate)</div>
                  <div>{loan.interestRate?.toFixed(2) || '0.00'} %</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr' }}>
                  <div style={{ fontWeight: '600' }}>រយៈពេល (Period)</div>
                  <div>{loan.durationMonths || loan.numberOfInstallments} {loan.repaymentType === 'MONTHLY' ? 'Monthly' : loan.repaymentType === 'WEEKLY' ? 'Weekly' : 'Installments'}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr' }}>
                  <div style={{ fontWeight: '600' }}>ជុំទី (Loan Seq)</div>
                  <div>{loan.loanCycle || 'New'}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr' }}>
                  <div style={{ fontWeight: '600' }}>សេវា (Admin Fee)</div>
                  <div>{loan.adminFeeRate ? `${loan.adminFeeRate.toFixed(2)} % = ${(loan.principalAmount * (loan.adminFeeRate / 100)).toFixed(2)}` : '0.00 % = 0.00'}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr' }}>
                  <div style={{ fontWeight: '600' }}>Refinance Fee</div>
                  <div>{loan.refinanceFeeAmt ? loan.refinanceFeeAmt.toFixed(2) : '0.00'}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr' }}>
                  <div style={{ fontWeight: '600' }}>ភ្នាក់ងារឥណទាន (CO)</div>
                  <div>{loan.loanOfficer ? `${loan.loanOfficer.firstName} ${loan.loanOfficer.lastName}` : 'N/A'}</div>
                </div>
              </div>
              
            </div>
            
            {/* Address Row spanning full width */}
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', fontSize: '0.9rem', fontFamily: '"Times New Roman", "Khmer OS Battambang", serif', marginBottom: '2.5rem', color: '#000' }}>
              <div style={{ fontWeight: '600' }}>Address</div>
              <div>{loan.customer.address || '-'}</div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', fontFamily: '"Times New Roman", "Khmer OS Battambang", serif', color: '#000' }}>
              <thead>
                <tr style={{ backgroundColor: '#1d4ed8', color: '#fff' }}>
                  <th style={{ border: '1px solid #000', padding: '0.25rem', textAlign: 'center', fontSize: '0.85rem' }}>
                    <div style={{ color: '#fff' }}>លេខ</div>
                    <div>No</div>
                  </th>
                  <th style={{ border: '1px solid #000', padding: '0.25rem', textAlign: 'center', fontSize: '0.85rem' }}>
                    <div style={{ color: '#fff' }}>ថ្ងៃបង់ប្រាក់</div>
                    <div>Repayment Date</div>
                  </th>
                  <th style={{ border: '1px solid #000', padding: '0.25rem', textAlign: 'center', fontSize: '0.85rem' }}>
                    <div style={{ color: '#fff' }}>ប្រាក់ដើម</div>
                    <div>Principle</div>
                  </th>
                  <th style={{ border: '1px solid #000', padding: '0.25rem', textAlign: 'center', fontSize: '0.85rem' }}>
                    <div style={{ color: '#fff' }}>ការប្រាក់</div>
                    <div>Interest</div>
                  </th>
                  <th style={{ border: '1px solid #000', padding: '0.25rem', textAlign: 'center', fontSize: '0.85rem' }}>
                    <div style={{ color: '#fff' }}>សេវាប្រមូល</div>
                    <div>Col Fee</div>
                  </th>
                  <th style={{ border: '1px solid #000', padding: '0.25rem', textAlign: 'center', fontSize: '0.85rem' }}>
                    <div style={{ color: '#fff' }}>សរុប</div>
                    <div>Total</div>
                  </th>
                  <th style={{ border: '1px solid #000', padding: '0.25rem', textAlign: 'center', fontSize: '0.85rem' }}>
                    <div style={{ color: '#fff' }}>ប្រាក់ដើមនៅសល់</div>
                    <div>Balance</div>
                  </th>
                  <th style={{ border: '1px solid #000', padding: '0.25rem', textAlign: 'center', fontSize: '0.85rem' }}>
                    <div style={{ color: '#fff' }}>ប្រាក់ផាកពិន័យបង់យឺត</div>
                    <div>Penalty Payoff</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {schedulesWithBalance.map((s: any) => {
                  const date = new Date(s.dueDate);
                  const khmerDays = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];
                  const khmerDay = khmerDays[date.getDay()];
                  const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                  
                  return (
                    <tr key={s.id}>
                      <td style={{ border: '1px solid #000', padding: '0.25rem 0.5rem', textAlign: 'center', fontSize: '0.85rem' }}>{s.installmentNumber}</td>
                      <td style={{ border: '1px solid #000', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <span style={{ color: '#1d4ed8' }}>{khmerDay}</span>
                          <span>{formattedDate}</span>
                        </div>
                      </td>
                      <td style={{ border: '1px solid #000', padding: '0.25rem 0.5rem', textAlign: 'right', fontSize: '0.85rem' }}>{s.principalComponent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ border: '1px solid #000', padding: '0.25rem 0.5rem', textAlign: 'right', fontSize: '0.85rem' }}>{s.interestComponent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ border: '1px solid #000', padding: '0.25rem 0.5rem', textAlign: 'right', fontSize: '0.85rem' }}>{Number(loan.collectionFeeValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ border: '1px solid #000', padding: '0.25rem 0.5rem', textAlign: 'right', fontSize: '0.85rem', fontWeight: 'bold' }}>{(s.amountDue + Number(loan.collectionFeeValue || 0) + Number(s.penaltyAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ border: '1px solid #000', padding: '0.25rem 0.5rem', textAlign: 'right', fontSize: '0.85rem' }}>{s.remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td style={{ border: '1px solid #000', padding: '0.25rem 0.5rem', textAlign: 'right', fontSize: '0.85rem', color: Number(s.penaltyAmount) > 0 ? 'var(--error-text)' : '#000' }}>{Number(s.penaltyAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  );
                })}
                {/* Total Row */}
                <tr>
                  <td colSpan={2} style={{ borderTop: '1px solid #000', borderBottom: '1px solid transparent', borderLeft: '1px solid transparent', borderRight: '1px solid #000' }}></td>
                  <td style={{ border: '1px solid #000', padding: '0.25rem 0.5rem', textAlign: 'right', fontSize: '0.85rem', fontWeight: 'bold' }}>{loan.principalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td colSpan={5} style={{ borderTop: '1px solid #000', borderBottom: '1px solid transparent', borderRight: '1px solid transparent', borderLeft: '1px solid #000' }}></td>
                </tr>
              </tbody>
            </table>

            {/* Signature Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontSize: '0.9rem', fontFamily: '"Times New Roman", "Khmer OS Battambang", serif', color: '#000', padding: '0 2rem' }}>
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '70px 50px 1fr', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <div style={{ fontWeight: 'bold' }}>កាលបរិច្ឆេទ</div>
                  <div>(Date)</div>
                  <div>{new Date().toLocaleDateString('en-GB')}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '70px 80px 1fr', gap: '0.5rem' }}>
                  <div style={{ fontWeight: 'bold' }}>រៀបចំដោយ</div>
                  <div>(Prepare by)</div>
                </div>
              </div>
              
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '70px 50px 1fr', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <div style={{ fontWeight: 'bold' }}>កាលបរិច្ឆេទ</div>
                  <div>(Date)</div>
                  <div>{new Date().toLocaleDateString('en-GB')}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 150px 1fr', gap: '0.5rem' }}>
                  <div style={{ fontWeight: 'bold' }}>ស្នាមមេដៃអតិថិជន</div>
                  <div>(Customer's thumbprint)</div>
                </div>
              </div>
            </div>
            
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowExportMenu(!showExportMenu)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Download size={16} /> Export Document
                </button>
                {showExportMenu && (
                  <div style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: '0.5rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden', minWidth: '160px', zIndex: 10 }}>
                    <button onClick={() => { setShowExportMenu(false); handleExportXLS(); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', textAlign: 'left', fontSize: '0.875rem', color: 'var(--foreground)' }}>
                      <Download size={16} /> Export as XLS
                    </button>
                     <button 
                      onClick={() => { 
                        setShowExportMenu(false); 
                        setShowPreview(true); 
                        setTimeout(() => {
                          window.print();
                        }, 150);
                      }} 
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem 1rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.875rem', color: 'var(--foreground)' }}
                    >
                      <Printer size={16} /> Export as PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      {/* Crop Modal */}
      {showCropModal && tempImageSrc && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s' }}>
          <div className="card" style={{ width: '800px', maxWidth: '90vw', padding: '2rem', backgroundColor: 'var(--card-bg)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontWeight: '800' }}>Crop Payment QR (Free Size)</h3>
              <button onClick={() => { setShowCropModal(false); setTempImageSrc(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="var(--text-muted)" /></button>
            </div>
            
            <div style={{ position: 'relative', width: '100%', maxHeight: '60vh', overflow: 'auto', backgroundColor: 'var(--bg-muted)', borderRadius: '8px', display: 'flex', justifyContent: 'center' }}>
              <ReactCrop 
                crop={crop} 
                onChange={c => setCrop(c)} 
                onComplete={c => setCompletedCrop(c)}
              >
                <img 
                  ref={imgRef} 
                  src={tempImageSrc} 
                  style={{ maxHeight: '60vh', objectFit: 'contain' }} 
                  alt="Upload preview" 
                />
              </ReactCrop>
            </div>
            
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowCropModal(false); setTempImageSrc(null); }} className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px' }}>
                Cancel
              </button>
              <button onClick={handleSaveCrop} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '8px' }}>
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .preview-hidden { display: none !important; }
        .preview-active { display: flex !important; }
        
        @media print {
          @page { margin: 10mm; }
          body * { visibility: hidden; }
          .print-overlay {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: none !important;
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
          .print-statement, .print-statement * { visibility: visible; }
          .print-statement { 
            position: relative !important;
            width: 100% !important; 
            max-width: 100% !important; 
            height: auto !important; 
            max-height: none !important; 
            overflow: visible !important; 
            margin: 0 !important; 
            padding: 0 !important; 
            box-shadow: none !important; 
            border: none !important; 
          }
          button { display: none !important; }
        }
      `}} />
    </div>
  );
}
