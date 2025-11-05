'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Shield, Search, Filter, Calendar, User, Database, FileText, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  user_email: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  table_name: string;
  record_id: string;
  old_data: any;
  new_data: any;
  changes_summary: string;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
  bank_origin: string;
}

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [bankFilter, setBankFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 50;

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, searchTerm, actionFilter, tableFilter, bankFilter]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);

      console.log('[Audit Log Viewer] Fetching audit logs...');

      const response = await fetch('/api/audit-logs');

      if (!response.ok) {
        console.error('[Audit Log Viewer] Failed to fetch audit logs:', response.status);
        return;
      }

      const data = await response.json();
      console.log('[Audit Log Viewer] Fetched logs:', data.length);

      setLogs(data);
    } catch (error) {
      console.error('[Audit Log Viewer] Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.changes_summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.record_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    if (tableFilter !== 'all') {
      filtered = filtered.filter(log => log.table_name === tableFilter);
    }

    if (bankFilter !== 'all') {
      filtered = filtered.filter(log => log.bank_origin === bankFilter);
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800 border-green-300';
      case 'UPDATE': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const uniqueTables = Array.from(new Set(logs.map(log => log.table_name))).sort();
  const uniqueBanks = Array.from(new Set(logs.map(log => log.bank_origin))).sort();

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const endIndex = startIndex + logsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Audit Log History
              </CardTitle>
              <CardDescription>
                Complete audit trail of all system changes. Read-only access for true administrators.
              </CardDescription>
            </div>
            <Button onClick={fetchAuditLogs} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by email, summary, or record ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tableFilter} onValueChange={setTableFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by table" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tables</SelectItem>
                {uniqueTables.map(table => (
                  <SelectItem key={table} value={table}>
                    {table.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={bankFilter} onValueChange={setBankFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by bank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Banks</SelectItem>
                {uniqueBanks.map(bank => (
                  <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Database className="w-4 h-4" />
              <span>
                Showing {currentLogs.length} of {filteredLogs.length} audit logs
                {filteredLogs.length !== logs.length && ` (${logs.length} total)`}
              </span>
            </div>
          </div>

          <div className="border rounded-lg">
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="w-[180px]">Timestamp</TableHead>
                    <TableHead className="w-[200px]">Admin Email</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                    <TableHead className="w-[150px]">Table</TableHead>
                    <TableHead className="w-[180px]">Bank</TableHead>
                    <TableHead>Changes Summary</TableHead>
                    <TableHead className="w-[100px]">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        <div>{format(new Date(log.timestamp), 'MMM dd, yyyy')}</div>
                        <div className="text-gray-500">{format(new Date(log.timestamp), 'HH:mm:ss')}</div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{log.user_email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionBadgeColor(log.action)} variant="outline">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.table_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </TableCell>
                      <TableCell className="text-sm">
                        <Badge variant="secondary">{log.bank_origin}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.changes_summary}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={selectedLog !== null} onOpenChange={() => setSelectedLog(null)}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          {selectedLog && (
            <>
              <SheetHeader>
                <SheetTitle>Audit Log Details</SheetTitle>
                <SheetDescription>
                  Complete information about this audit entry
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Timestamp</label>
                    <p className="mt-1 font-mono text-sm">
                      {format(new Date(selectedLog.timestamp), 'PPpp')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Action</label>
                    <div className="mt-1">
                      <Badge className={getActionBadgeColor(selectedLog.action)} variant="outline">
                        {selectedLog.action}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Admin Email</label>
                    <p className="mt-1 text-sm">{selectedLog.user_email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Bank</label>
                    <p className="mt-1 text-sm">{selectedLog.bank_origin}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Table</label>
                    <p className="mt-1 text-sm">
                      {selectedLog.table_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Record ID</label>
                    <p className="mt-1 text-sm font-mono truncate">{selectedLog.record_id}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Changes Summary</label>
                  <p className="mt-1 text-sm">{selectedLog.changes_summary}</p>
                </div>

                {selectedLog.old_data && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Old Data</label>
                    <pre className="mt-1 p-3 bg-gray-50 border rounded text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.old_data, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.new_data && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">New Data</label>
                    <pre className="mt-1 p-3 bg-gray-50 border rounded text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.new_data, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.ip_address && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">IP Address</label>
                    <p className="mt-1 text-sm font-mono">{selectedLog.ip_address}</p>
                  </div>
                )}

                {selectedLog.user_agent && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">User Agent</label>
                    <p className="mt-1 text-sm break-all">{selectedLog.user_agent}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
