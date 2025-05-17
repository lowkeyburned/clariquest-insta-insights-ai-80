
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, ArrowLeft, Plus, RefreshCw, Trash2 } from "lucide-react";
import { BusinessData } from "@/components/business/BusinessForm";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface DatabaseRecord {
  id: string;
  name: string;
  created_at: string;
  data?: any;
}

const DatabasePage = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const { data: business } = useQuery({
    queryKey: ['business', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();
      
      if (error) throw error;
      return data as BusinessData;
    },
    enabled: !!businessId
  });

  const { data: tables = [], isLoading: tablesLoading } = useQuery({
    queryKey: ['database-tables', businessId],
    queryFn: async () => {
      // In a real app, you would fetch the actual tables available
      // For now, we'll return some mock data
      return [
        { id: 'customers', name: 'Customers', count: 24 },
        { id: 'orders', name: 'Orders', count: 156 },
        { id: 'products', name: 'Products', count: 78 },
        { id: 'transactions', name: 'Transactions', count: 389 }
      ];
    },
    enabled: !!businessId
  });

  const { data: records = [], isLoading: recordsLoading } = useQuery({
    queryKey: ['database-records', businessId, selectedTable],
    queryFn: async () => {
      // In a real app, you would fetch the actual records from the selected table
      // For now, we'll return some mock data based on the selected table
      const mockData: DatabaseRecord[] = [];
      
      for (let i = 1; i <= 10; i++) {
        const record: DatabaseRecord = {
          id: `${i}`,
          name: `${selectedTable?.charAt(0).toUpperCase()}${selectedTable?.slice(1)} ${i}`,
          created_at: new Date(Date.now() - i * 86400000).toISOString(),
        };
        
        if (selectedTable === 'customers') {
          record.data = { email: `customer${i}@example.com`, status: i % 3 === 0 ? 'Active' : 'Inactive' };
        } else if (selectedTable === 'orders') {
          record.data = { amount: 100 * i, status: i % 4 === 0 ? 'Completed' : i % 4 === 1 ? 'Processing' : 'Pending' };
        } else if (selectedTable === 'products') {
          record.data = { price: 19.99 * i, inventory: i * 5 };
        } else if (selectedTable === 'transactions') {
          record.data = { type: i % 2 === 0 ? 'Credit' : 'Debit', amount: 50 * i };
        }
        
        mockData.push(record);
      }
      
      return mockData;
    },
    enabled: !!businessId && !!selectedTable
  });

  return (
    <MainLayout>
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link to={`/business/${businessId}`} className="gap-2">
            <ArrowLeft size={16} />
            Back to Business
          </Link>
        </Button>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Database className="text-clari-gold" size={32} />
            <div>
              <h1 className="text-3xl font-bold">Database</h1>
              <p className="text-clari-muted mt-1">
                {business?.name}'s database management
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="gap-2">
              <Plus size={16} />
              Add Table
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <CardTitle>Tables</CardTitle>
            </CardHeader>
            <CardContent>
              {tablesLoading ? (
                <div className="text-center py-4">Loading tables...</div>
              ) : (
                <div className="space-y-2">
                  {tables.map((table) => (
                    <div
                      key={table.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors flex justify-between items-center ${
                        selectedTable === table.id
                          ? 'bg-clari-gold text-black'
                          : 'bg-clari-darkBg hover:bg-clari-darkAccent'
                      }`}
                      onClick={() => setSelectedTable(table.id)}
                    >
                      <span>{table.name}</span>
                      <span className="text-xs px-2 py-1 bg-black bg-opacity-20 rounded-full">
                        {table.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>
                {selectedTable
                  ? tables.find((t) => t.id === selectedTable)?.name || selectedTable
                  : 'Select a table'}
              </CardTitle>
              {selectedTable && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <RefreshCw size={14} />
                    Refresh
                  </Button>
                  <Button variant="default" size="sm" className="gap-1">
                    <Plus size={14} />
                    Add Record
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!selectedTable ? (
                <div className="text-center py-12 text-clari-muted">
                  Select a table to view its records
                </div>
              ) : recordsLoading ? (
                <div className="text-center py-12">Loading records...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-clari-darkAccent">
                        <th className="px-4 py-3 text-left text-clari-muted">ID</th>
                        <th className="px-4 py-3 text-left text-clari-muted">Name</th>
                        {selectedTable === 'customers' && (
                          <>
                            <th className="px-4 py-3 text-left text-clari-muted">Email</th>
                            <th className="px-4 py-3 text-left text-clari-muted">Status</th>
                          </>
                        )}
                        {selectedTable === 'orders' && (
                          <>
                            <th className="px-4 py-3 text-left text-clari-muted">Amount</th>
                            <th className="px-4 py-3 text-left text-clari-muted">Status</th>
                          </>
                        )}
                        {selectedTable === 'products' && (
                          <>
                            <th className="px-4 py-3 text-left text-clari-muted">Price</th>
                            <th className="px-4 py-3 text-left text-clari-muted">Inventory</th>
                          </>
                        )}
                        {selectedTable === 'transactions' && (
                          <>
                            <th className="px-4 py-3 text-left text-clari-muted">Type</th>
                            <th className="px-4 py-3 text-left text-clari-muted">Amount</th>
                          </>
                        )}
                        <th className="px-4 py-3 text-left text-clari-muted">Created At</th>
                        <th className="px-4 py-3 text-right text-clari-muted">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record) => (
                        <tr
                          key={record.id}
                          className="border-b border-clari-darkAccent hover:bg-clari-darkBg"
                        >
                          <td className="px-4 py-3">{record.id}</td>
                          <td className="px-4 py-3">{record.name}</td>
                          {selectedTable === 'customers' && (
                            <>
                              <td className="px-4 py-3">{record.data?.email}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    record.data?.status === 'Active'
                                      ? 'bg-green-900 text-green-200'
                                      : 'bg-gray-700 text-gray-300'
                                  }`}
                                >
                                  {record.data?.status}
                                </span>
                              </td>
                            </>
                          )}
                          {selectedTable === 'orders' && (
                            <>
                              <td className="px-4 py-3">${record.data?.amount.toFixed(2)}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    record.data?.status === 'Completed'
                                      ? 'bg-green-900 text-green-200'
                                      : record.data?.status === 'Processing'
                                      ? 'bg-blue-900 text-blue-200'
                                      : 'bg-yellow-900 text-yellow-200'
                                  }`}
                                >
                                  {record.data?.status}
                                </span>
                              </td>
                            </>
                          )}
                          {selectedTable === 'products' && (
                            <>
                              <td className="px-4 py-3">${record.data?.price.toFixed(2)}</td>
                              <td className="px-4 py-3">{record.data?.inventory}</td>
                            </>
                          )}
                          {selectedTable === 'transactions' && (
                            <>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    record.data?.type === 'Credit'
                                      ? 'bg-green-900 text-green-200'
                                      : 'bg-red-900 text-red-200'
                                  }`}
                                >
                                  {record.data?.type}
                                </span>
                              </td>
                              <td className="px-4 py-3">${record.data?.amount.toFixed(2)}</td>
                            </>
                          )}
                          <td className="px-4 py-3">
                            {new Date(record.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="sm" className="text-red-500">
                              <Trash2 size={14} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default DatabasePage;
