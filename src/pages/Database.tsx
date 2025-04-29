
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Database, Table, Server, Shield, DatabaseZap, Check } from "lucide-react";
import { BusinessData } from "@/components/business/BusinessForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface DBConnection {
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  status: 'disconnected' | 'connected' | 'testing';
}

const DatabasePage = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [business, setBusiness] = useState<BusinessData | null>(null);
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false);
  const [dbConnection, setDbConnection] = useState<DBConnection>({
    host: "localhost",
    port: "5432",
    database: "n8ndb",
    username: "n8nuser",
    password: "",
    status: 'disconnected'
  });
  
  useEffect(() => {
    const loadBusinesses = () => {
      try {
        const storedBusinesses = localStorage.getItem('businesses');
        if (storedBusinesses) {
          const parsedBusinesses = JSON.parse(storedBusinesses);
          setBusinesses(parsedBusinesses);
          
          if (businessId) {
            const foundBusiness = parsedBusinesses.find((b: BusinessData) => b.id === Number(businessId));
            if (foundBusiness) {
              setBusiness(foundBusiness);
              
              // If we have saved connection for this business, load it
              const savedConnections = localStorage.getItem('dbConnections');
              if (savedConnections) {
                const connections = JSON.parse(savedConnections);
                const businessConnection = connections[businessId];
                if (businessConnection) {
                  setDbConnection({
                    ...businessConnection,
                    password: businessConnection.password || "", // For security, don't store actual password in local storage
                    status: businessConnection.status || 'disconnected'
                  });
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error loading businesses:", error);
      }
    };

    loadBusinesses();
  }, [businessId]);

  const handleConnectionChange = (field: keyof DBConnection, value: string) => {
    setDbConnection({
      ...dbConnection,
      [field]: value
    });
  };

  const testConnection = () => {
    // Set connection status to testing
    setDbConnection({
      ...dbConnection,
      status: 'testing'
    });
    
    // Simulate testing a connection
    setTimeout(() => {
      // In a real app, you would make an actual API call to test the connection
      const success = true; // Simulate success
      
      if (success) {
        setDbConnection({
          ...dbConnection,
          status: 'connected'
        });
        
        // Save the connection to localStorage (without the actual password for security)
        const savedConnections = localStorage.getItem('dbConnections') || '{}';
        const connections = JSON.parse(savedConnections);
        connections[businessId] = {
          ...dbConnection,
          password: dbConnection.password ? '********' : '', // Mask password in storage
          status: 'connected'
        };
        localStorage.setItem('dbConnections', JSON.stringify(connections));
        
        toast({
          title: "Connection Successful",
          description: "Connected to PostgreSQL database successfully.",
        });
        
        setIsConnectionDialogOpen(false);
      } else {
        setDbConnection({
          ...dbConnection,
          status: 'disconnected'
        });
        
        toast({
          title: "Connection Failed",
          description: "Could not connect to PostgreSQL database. Please check your credentials.",
          variant: "destructive"
        });
      }
    }, 2000);
  };

  // If no businessId is provided, show a business selector
  if (!businessId && businesses.length > 0) {
    return (
      <MainLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Select a Business</h1>
          <p className="text-clari-muted mt-1">
            Choose a business to access its database
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <div 
              key={business.id} 
              className="p-6 rounded-lg bg-clari-darkCard border border-clari-darkAccent hover:border-clari-gold cursor-pointer"
              onClick={() => navigate(`/database/${business.id}`)}
            >
              <div className="flex items-center gap-3 mb-2">
                <Database className="text-clari-gold" />
                <h3 className="text-xl font-medium">{business.name}</h3>
              </div>
              <p className="text-sm text-clari-muted">
                Access database for {business.name}
              </p>
            </div>
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-4">
          <Link to={businessId ? `/business/${businessId}` : "/businesses"} className="gap-2">
            <ArrowLeft size={16} />
            {businessId ? "Back to Business" : "Back to Businesses"}
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Database</h1>
          <p className="text-clari-muted mt-1">
            {business ? `Manage database for ${business.name}` : 'Manage your database'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="connect" className="w-full">
        <TabsList className="bg-clari-darkCard">
          <TabsTrigger value="connect">Connection</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="connect" className="mt-6">
          <div className="p-8 bg-clari-darkCard border border-clari-darkAccent rounded-lg text-center">
            <Database className="w-16 h-16 mx-auto mb-4 text-clari-gold" />
            <h2 className="text-2xl font-bold mb-2">Database Connection</h2>
            <p className="text-clari-muted max-w-md mx-auto mb-6">
              Connect to your PostgreSQL database to store and manage survey responses and other business data.
            </p>
            <div className="max-w-md mx-auto">
              {dbConnection.status === 'connected' ? (
                <div className="space-y-4">
                  <div className="p-3 bg-clari-darkBg rounded-md border border-green-600 flex items-center justify-center gap-2 text-green-500">
                    <Check size={16} />
                    <span>Connected to PostgreSQL at {dbConnection.host}:{dbConnection.port}</span>
                  </div>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setIsConnectionDialogOpen(true)}
                  >
                    Modify Connection
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full bg-clari-gold text-black hover:bg-clari-gold/90"
                  onClick={() => setIsConnectionDialogOpen(true)}
                >
                  Connect to PostgreSQL
                </Button>
              )}
            </div>
          </div>
          
          <Dialog open={isConnectionDialogOpen} onOpenChange={setIsConnectionDialogOpen}>
            <DialogContent className="sm:max-w-md bg-clari-darkCard border-clari-darkAccent">
              <DialogHeader>
                <DialogTitle>Connect to PostgreSQL</DialogTitle>
                <DialogDescription>
                  Enter your PostgreSQL database connection details. 
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="host">Host</Label>
                    <Input 
                      id="host"
                      value={dbConnection.host} 
                      onChange={(e) => handleConnectionChange('host', e.target.value)} 
                      placeholder="localhost"
                      className="bg-clari-darkBg border-clari-darkAccent"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input 
                      id="port"
                      value={dbConnection.port} 
                      onChange={(e) => handleConnectionChange('port', e.target.value)} 
                      placeholder="5432"
                      className="bg-clari-darkBg border-clari-darkAccent"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="database">Database</Label>
                  <Input 
                    id="database"
                    value={dbConnection.database} 
                    onChange={(e) => handleConnectionChange('database', e.target.value)} 
                    placeholder="n8ndb"
                    className="bg-clari-darkBg border-clari-darkAccent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username"
                    value={dbConnection.username} 
                    onChange={(e) => handleConnectionChange('username', e.target.value)} 
                    placeholder="n8nuser"
                    className="bg-clari-darkBg border-clari-darkAccent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    type="password"
                    value={dbConnection.password} 
                    onChange={(e) => handleConnectionChange('password', e.target.value)} 
                    placeholder="Enter your database password"
                    className="bg-clari-darkBg border-clari-darkAccent"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsConnectionDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={testConnection} 
                  className="bg-clari-gold text-black hover:bg-clari-gold/90"
                  disabled={dbConnection.status === 'testing'}
                >
                  {dbConnection.status === 'testing' ? 'Testing...' : 'Test Connection'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="tables" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-clari-darkCard border-clari-darkAccent">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Database Tables</CardTitle>
                  <Table size={20} className="text-clari-gold" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dbConnection.status === 'connected' ? (
                    ['surveys', 'survey_questions', 'survey_responses', 'response_answers'].map((table, i) => (
                      <div key={i} className="p-3 bg-clari-darkBg rounded-md border border-clari-darkAccent flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <DatabaseZap size={16} className="text-clari-gold" />
                          <span className="font-medium">{table}</span>
                        </div>
                        <div className="text-sm text-clari-muted">
                          {Math.floor(Math.random() * 500)} rows
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-clari-muted">
                      Connect to your database to view tables
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-clari-darkCard border-clari-darkAccent">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Server Info</CardTitle>
                  <Server size={20} className="text-clari-gold" />
                </div>
              </CardHeader>
              <CardContent>
                {dbConnection.status === 'connected' ? (
                  <div className="space-y-3">
                    <div className="flex justify-between pb-2 border-b border-clari-darkAccent">
                      <span className="text-clari-muted">Host</span>
                      <span>{dbConnection.host}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-clari-darkAccent">
                      <span className="text-clari-muted">Port</span>
                      <span>{dbConnection.port}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-clari-darkAccent">
                      <span className="text-clari-muted">Database</span>
                      <span>{dbConnection.database}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-clari-darkAccent">
                      <span className="text-clari-muted">Status</span>
                      <span className="text-green-500">Connected</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-clari-muted">
                    Connect to your database to view server info
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="security" className="mt-6">
          <Card className="bg-clari-darkCard border-clari-darkAccent">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Security Settings</CardTitle>
                <Shield size={20} className="text-clari-gold" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">Database Access Credentials</div>
                    <Button variant="outline" size="sm"
                      disabled={dbConnection.status !== 'connected'}>
                      Manage
                    </Button>
                  </div>
                  <p className="text-sm text-clari-muted">
                    Set up and manage access credentials for your database.
                  </p>
                </div>
                
                <div className="p-4 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">Row Level Security (RLS)</div>
                    <Button variant="outline" size="sm"
                      disabled={dbConnection.status !== 'connected'}>
                      Configure
                    </Button>
                  </div>
                  <p className="text-sm text-clari-muted">
                    Apply fine-grained access control to your database tables.
                  </p>
                </div>
                
                <div className="p-4 bg-clari-darkBg rounded-md border border-clari-darkAccent">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">Data Encryption</div>
                    <Button variant="outline" size="sm"
                      disabled={dbConnection.status !== 'connected'}>
                      Setup
                    </Button>
                  </div>
                  <p className="text-sm text-clari-muted">
                    Configure encryption for sensitive data stored in your database.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default DatabasePage;
