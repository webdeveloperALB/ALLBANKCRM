'use client';

import { useState, useEffect } from 'react';
import { UserWithBank, KYCVerification } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Image as ImageIcon, File, User, Calendar, MapPin, CreditCard, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface KYCDocument {
  name: string;
  path: string;
  url: string;
  type: string;
}

interface KYCResponse {
  verification: KYCVerification | null;
  documents: KYCDocument[];
  error?: string;
}

interface KYCDocumentsDialogProps {
  user: UserWithBank;
  onClose: () => void;
}

export function KYCDocumentsDialog({ user, onClose }: KYCDocumentsDialogProps) {
  const [data, setData] = useState<KYCResponse>({ verification: null, documents: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchKYCData();
  }, []);

  const fetchKYCData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/kyc-documents?bankKey=${user.bank_key}&userId=${user.id}`
      );
      const responseData = await response.json();

      if (!response.ok) {
        setError(responseData.error || 'Failed to fetch KYC data');
        setData({ verification: null, documents: [] });
      } else {
        setData(responseData);
        if (responseData.error) {
          setError(responseData.error);
        }
      }
    } catch (error) {
      console.error('Error fetching KYC data:', error);
      setError('Network error while fetching KYC data');
      setData({ verification: null, documents: [] });
    } finally {
      setLoading(false);
    }
  };

  const isImage = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext || '');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>KYC Verification Details</DialogTitle>
          <DialogDescription>
            Complete verification information for {user.full_name || user.email} from {user.bank_name}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-red-400 mb-4" />
            <p className="text-red-600 font-medium mb-2">Error Loading KYC Data</p>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        ) : !data.verification ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No KYC verification found for this user</p>
            <p className="text-gray-500 text-sm mt-2">The user has not submitted KYC verification yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Verification Status</h3>
                {getStatusBadge(data.verification.status)}
              </div>

              {data.verification.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                  <p className="text-sm font-medium text-red-800 mb-1">Rejection Reason:</p>
                  <p className="text-sm text-red-700">{data.verification.rejection_reason}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Submitted At</p>
                  <p className="font-medium">
                    {data.verification.submitted_at
                      ? new Date(data.verification.submitted_at).toLocaleString()
                      : '-'}
                  </p>
                </div>
                {data.verification.reviewed_at && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Reviewed At</p>
                    <p className="font-medium">
                      {new Date(data.verification.reviewed_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Full Name</p>
                  <p className="font-medium">{data.verification.full_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
                  <p className="font-medium">
                    {data.verification.date_of_birth
                      ? new Date(data.verification.date_of_birth).toLocaleDateString()
                      : '-'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Address</p>
                  <p className="font-medium">{data.verification.address || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">City</p>
                  <p className="font-medium">{data.verification.city || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Country</p>
                  <p className="font-medium">{data.verification.country || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Postal Code</p>
                  <p className="font-medium">{data.verification.postal_code || '-'}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Document Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Document Type</p>
                  <p className="font-medium capitalize">
                    {data.verification.document_type?.replace('_', ' ') || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Document Number</p>
                  <p className="font-medium">{data.verification.document_number || '-'}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Uploaded Documents</h3>
              </div>

              {data.documents.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FileText className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">No documents uploaded</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.documents.map((doc, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {isImage(doc.path) ? (
                            <ImageIcon className="w-6 h-6 text-blue-500" />
                          ) : (
                            <File className="w-6 h-6 text-gray-500" />
                          )}
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-gray-500">{doc.path.split('/').pop()}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>

                      {isImage(doc.path) && (
                        <div className="mt-3 border rounded overflow-hidden">
                          <img
                            src={doc.url}
                            alt={doc.name}
                            className="w-full h-48 object-cover bg-gray-50"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
