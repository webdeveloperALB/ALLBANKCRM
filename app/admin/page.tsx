'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { UserWithBank } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, XCircle, Clock, FileText, Pencil, ChevronLeft, ChevronRight, Eye, LogOut, MapPin } from 'lucide-react';
import { UserEditDialog } from '@/components/user-edit-dialog';
import { KYCDocumentsDialog } from '@/components/kyc-documents-dialog';
import { UserDetailView } from '@/components/user-detail-view';

interface PaginationInfo {
  page: number;
  perPage: number;
  totalCount: number;
  totalPages: number;
}

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  const [users, setUsers] = useState<UserWithBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBank, setFilterBank] = useState<string>('all');
  const [filterKYC, setFilterKYC] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    perPage: 18,
    totalCount: 0,
    totalPages: 0
  });
  const [editingUser, setEditingUser] = useState<UserWithBank | null>(null);
  const [viewingKYC, setViewingKYC] = useState<{ user: UserWithBank } | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithBank | null>(null);
  const [ipInfo, setIpInfo] = useState<{ ip: string; city: string; country: string; region: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchIpInfo = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setIpInfo({
          ip: data.ip,
          city: data.city,
          country: data.country_name,
          region: data.region
        });
      } catch (error) {
        console.error('Failed to fetch IP info:', error);
      }
    };

    if (isAuthenticated) {
      fetchIpInfo();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        perPage: '18',
        bank: filterBank,
        kyc: filterKYC,
        search: debouncedSearch
      });

      const response = await fetch(`/api/users?${params}`);
      const data = await response.json();
      setUsers(data.users || []);
      setPagination(data.pagination || {
        page: 1,
        perPage: 18,
        totalCount: 0,
        totalPages: 0
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setPagination({
        page: 1,
        perPage: 18,
        totalCount: 0,
        totalPages: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filterBank, filterKYC, debouncedSearch]);

  const updateKYCStatus = async (user: UserWithBank, status: string) => {
    try {
      const response = await fetch('/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankKey: user.bank_key,
          userId: user.id,
          updates: { kyc_status: status }
        })
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating KYC status:', error);
    }
  };

  const handleFilterChange = (type: 'bank' | 'kyc', value: string) => {
    setCurrentPage(1);
    if (type === 'bank') {
      setFilterBank(value);
    } else {
      setFilterKYC(value);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (pagination.totalPages <= maxVisible) {
      for (let i = 1; i <= pagination.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(pagination.totalPages);
      } else if (currentPage >= pagination.totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = pagination.totalPages - 4; i <= pagination.totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(pagination.totalPages);
      }
    }

    return pages;
  };

  const getKYCBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (selectedUser) {
    return (
      <UserDetailView
        user={selectedUser}
        onBack={() => setSelectedUser(null)}
        onUpdate={() => {
          fetchUsers();
          setSelectedUser(null);
        }}
      />
    );
  }

  return (
    <div className="w-full py-8 px-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Multi-Bank CRM Admin Panel</h1>
            <p className="text-gray-600">Manage users across all three banks from one dashboard</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {ipInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Your Connection Details</p>
              <p className="text-sm text-blue-800">
                <span className="font-medium">IP Address:</span> {ipInfo.ip}
                {' • '}
                <span className="font-medium">Location:</span> {ipInfo.city}, {ipInfo.region}, {ipInfo.country}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-1/3"
          />

          <Select value={filterBank} onValueChange={(v) => handleFilterChange('bank', v)}>
            <SelectTrigger className="md:w-1/4">
              <SelectValue placeholder="Filter by bank" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Banks</SelectItem>
              <SelectItem value="cayman">Cayman Bank</SelectItem>
              <SelectItem value="lithuanian">Lithuanian Bank</SelectItem>
              <SelectItem value="digitalchain">Digital Chain Bank</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterKYC} onValueChange={(v) => handleFilterChange('kyc', v)}>
            <SelectTrigger className="md:w-1/4">
              <SelectValue placeholder="Filter by KYC" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not_started">Not Started</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={fetchUsers} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bank</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={`${user.bank_key}-${user.id}`}>
                    <TableCell>
                      <Badge variant="secondary">{user.bank_name}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.full_name || '-'}</TableCell>
                    <TableCell>{user.age || '-'}</TableCell>
                    <TableCell>{getKYCBadge(user.kyc_status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {user.is_admin && <Badge className="text-xs">Admin</Badge>}
                        {user.is_manager && <Badge className="text-xs" variant="outline">Manager</Badge>}
                        {user.is_superiormanager && <Badge className="text-xs" variant="outline">Superior</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {user.kyc_status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateKYCStatus(user, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateKYCStatus(user, 'rejected')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {user.kyc_status === 'not_started' && (
                          <Button
                            size="sm"
                            onClick={() => updateKYCStatus(user, 'approved')}
                            variant="outline"
                          >
                            Skip KYC
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingKYC({ user })}
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingUser(user)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {!loading && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-1">
            {getPageNumbers().map((pageNum, idx) => (
              pageNum === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-2 py-1">...</span>
              ) : (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => goToPage(pageNum as number)}
                  className="min-w-[40px]"
                >
                  {pageNum}
                </Button>
              )
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {editingUser && (
        <UserEditDialog
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            fetchUsers();
            setEditingUser(null);
          }}
        />
      )}

      {viewingKYC && (
        <KYCDocumentsDialog
          user={viewingKYC.user}
          onClose={() => setViewingKYC(null)}
        />
      )}
    </div>
  );
}
